import { BrowserWindow } from 'electron';

const KICK_BASE_URL = 'https://kick.com/api/v2/channels';

export interface StreamerInfo {
    slug: string;
    username: string;
    is_live: boolean;
    viewers: number;
    profile_pic: string;
    category: string;
    title: string;
    followers: number;
    is_verified: boolean;
}

const queue: Array<{ slug: string, resolve: (val: StreamerInfo | null) => void }> = [];
const MAX_WORKERS = 3;
const workers: { win: BrowserWindow, busy: boolean }[] = [];

function getAvailableWorker() {
    let worker = workers.find(w => !w.busy);
    if (!worker && workers.length < MAX_WORKERS) {
        const win = new BrowserWindow({
            show: false,
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                backgroundThrottling: false,
                partition: 'persist:kick',
            }
        });
        const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
        win.webContents.setUserAgent(userAgent);
        worker = { win, busy: false };
        workers.push(worker);
    }
    return worker;
}

async function processQueue() {
    if (queue.length === 0) return;

    const worker = getAvailableWorker();
    if (!worker) return;

    const item = queue.shift();
    if (!item) return;

    worker.busy = true;

    try {
        await new Promise<void>((taskResolve) => {
            const win = worker.win;
            let resolved = false;
            let checkTimeout: NodeJS.Timeout;
            
            const cleanup = () => {
                if (resolved) return;
                resolved = true;
                clearTimeout(overallTimeout);
                clearTimeout(checkTimeout);
                win.webContents.removeAllListeners('did-finish-load');
                taskResolve();
            };

            const overallTimeout = setTimeout(() => {
                if (!resolved) {
                    item.resolve(null);
                    cleanup();
                }
            }, 15000);

            const checkContent = async () => {
                if (resolved) return;
                try {
                    const text = await win.webContents.executeJavaScript('document.body.innerText');
                    try {
                        const data = JSON.parse(text);
                        
                        if (data && data.slug && data.user) {
                            const livestream = data.livestream;
                            item.resolve({
                                slug: data.slug,
                                username: data.user.username,
                                is_live: !!livestream,
                                viewers: livestream ? livestream.viewer_count : 0,
                                profile_pic: data.user.profile_pic,
                                category: livestream ? livestream.categories[0]?.name : '',
                                title: livestream ? livestream.session_title : '',
                                followers: data.followers_count || data.followersCount || (data.user && data.user.followers_count) || 0,
                                is_verified: !!(data.verified?.status === 'approved' || data.is_verified || data.verified?.id || data.verified || data.user?.is_verified)
                            });
                            cleanup();
                            return;
                        }
                    } catch (e) {
                    }
                } catch (err) { }

                if (!resolved) {
                    checkTimeout = setTimeout(checkContent, 1000);
                }
            };

            win.webContents.on('did-finish-load', () => checkContent());
            win.loadURL(`${KICK_BASE_URL}/${item.slug}`);
            checkContent();
        });
    } catch (e) {
        item.resolve(null);
    } finally {
        worker.busy = false;
        processQueue(); 
    }

    processQueue(); 
}


export function getStreamerInfo(slug: string): Promise<StreamerInfo | null> {
    return new Promise((resolve) => {
        queue.push({ slug, resolve });
        processQueue();
    });
}

export async function searchStreamers(query: string): Promise<any[]> {
    if (!query) return [];
    
    const worker = getAvailableWorker();
    if (!worker) return [];
    
    const win = worker.win;
    const currentUrl = win.webContents.getURL();
    
    if (!currentUrl.includes('kick.com')) {
        await win.loadURL('https://kick.com');
    }

    try {
        const result = await win.webContents.executeJavaScript(`
            fetch('https://kick.com/api/search?searched_word=${encodeURIComponent(query)}')
                .then(r => r.json())
        `);
        
        if (result && result.channels) {
            return result.channels.map((c: any) => ({
                slug: c.channel?.slug || c.slug,
                username: c.channel?.user?.username || c.user?.username || c.slug,
                profile_pic: c.channel?.user?.profile_pic || c.channel?.user?.profilePic || c.user?.profile_pic || c.user?.profilePic || ''
            }));
        }
        return [];
    } catch (e) {
        console.error('Search failed:', e);
        return [];
    }
}
