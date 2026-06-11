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
}

let sharedWin: BrowserWindow | null = null;
const queue: Array<{ slug: string, resolve: (val: StreamerInfo | null) => void }> = [];
let isProcessing = false;

/**
 * Creates or retrieves the singleton hidden BrowserWindow.
 * This prevents memory leaks that would occur if a new window was spawned for each request.
 */
function getSharedWindow() {
    if (!sharedWin) {
        sharedWin = new BrowserWindow({
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
        sharedWin.webContents.setUserAgent(userAgent);
    }
    return sharedWin;
}

/**
 * Processes the queue of streamer API requests sequentially.
 * This guarantees we only use one hidden window at a time to reduce CPU/RAM usage.
 */
async function processQueue() {
    if (isProcessing || queue.length === 0) return;
    isProcessing = true;

    while (queue.length > 0) {
        const item = queue.shift();
        if (!item) continue;

        try {
            await new Promise<void>((taskResolve) => {
                const win = getSharedWindow();
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

                // Overall timeout ensures the queue doesn't get stuck on a bad request
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
                            // Verify JSON payload structure
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
                                });
                                cleanup();
                                return;
                            }
                        } catch (e) {
                            // JSON parsing failed, page might still be loading or challenged by Cloudflare
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
        }
    }

    isProcessing = false;
}

/**
 * Fetches streamer info by slug. 
 * Adds the request to a singleton processing queue to avoid memory leaks.
 */
export function getStreamerInfo(slug: string): Promise<StreamerInfo | null> {
    return new Promise((resolve) => {
        queue.push({ slug, resolve });
        processQueue();
    });
}
