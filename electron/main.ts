
import { app, BrowserWindow, ipcMain, Notification, shell, Tray, Menu, nativeImage, session } from 'electron'
import { join } from 'node:path'
import { autoUpdater } from 'electron-updater';
import { getStreamerInfo } from './api';


ipcMain.on('window-minimize', () => {
    win?.minimize();
});

ipcMain.on('window-close', () => {
    
    if (tray) {
        win?.hide();
    } else {
        if (!app.isQuitting) {
            app.isQuitting = true;
            app.quit();
        }
    }
});

process.env.DIST = join(__dirname, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST, '../public')

let win: BrowserWindow | null = null
let tray: Tray | null = null 

const preload = join(__dirname, 'preload.js')
const url = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5185'
const indexHtml = join(process.env.DIST, 'index.html')

function getIconPath() {
    return join(process.env.PUBLIC || '', 'favicon.ico');
}

function createWindow() {
    const iconPath = getIconPath();
    const iconImage = nativeImage.createFromPath(iconPath);
    console.log('[Main] Icon Path:', iconPath);

    win = new BrowserWindow({
        title: 'Kick Notifier Pro',
        icon: iconImage, 
        frame: false,
        width: 1000,
        height: 700,
        backgroundColor: '#0B0E0F',
        webPreferences: {
            preload,
            nodeIntegration: false,
            contextIsolation: true,
            backgroundThrottling: false, 
        },
        skipTaskbar: false, 
        autoHideMenuBar: true,
    })

    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(url)
    } else {
        win.loadFile(indexHtml)
    }

    
    win.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            win?.hide();
            return false;
        }
        return true;
    });

    win.webContents.setWindowOpenHandler(({ url }) => {
        
        if (url.startsWith('https:')) {
            shell.openExternal(url);
        }
        return { action: 'deny' };
    });
}

function createTray() {
    const iconPath = getIconPath();
    const iconImage = nativeImage.createFromPath(iconPath);

    
    
    try {
        tray = new Tray(iconImage);

        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Show',
                click: () => win?.show()
            },
            { type: 'separator' },
            {
                label: 'Quit',
                click: () => {
                    app.isQuitting = true;
                    
                    app.quit();
                }
            }
        ]);

        tray.setToolTip('Kick Notifier Pro');
        tray.setContextMenu(contextMenu);

        tray.on('click', () => {
            if (win?.isVisible()) {
                win?.hide();
            } else {
                win?.show();
            }
        });
    } catch (e) {
        console.error('[Main] Failed to create tray:', e);
    }
}


declare global {
    namespace Electron {
        interface App {
            isQuitting?: boolean;
        }
    }
}


app.isQuitting = false;

app.whenReady().then(() => {
    
    app.setAppUserModelId('com.kicknotifier.pro');
    
    createWindow();
    createTray();

    if (app.isPackaged) {
        autoUpdater.autoDownload = true;
        
        autoUpdater.on('update-available', (info) => {
            win?.webContents.send('update-available', info);
        });
        
        autoUpdater.on('update-not-available', (info) => {
            win?.webContents.send('update-not-available', info);
        });
        
        autoUpdater.on('download-progress', (progressObj) => {
            win?.webContents.send('download-progress', progressObj);
        });
        
        autoUpdater.on('update-downloaded', (info) => {
            win?.webContents.send('update-downloaded', info);
        });
        
        autoUpdater.on('error', (err) => {
            win?.webContents.send('update-error', err.message);
        });

        
        autoUpdater.checkForUpdatesAndNotify();
    }
});

ipcMain.on('check-for-updates', () => {
    if (app.isPackaged) {
        autoUpdater.checkForUpdates();
    } else {
        win?.webContents.send('update-not-available', { version: 'Dev Mode' });
    }
});

ipcMain.on('download-update', () => {
    if (app.isPackaged) {
        autoUpdater.downloadUpdate();
    }
});

ipcMain.on('install-update', () => {
    if (app.isPackaged) {
        autoUpdater.quitAndInstall();
    }
});

app.on('before-quit', () => {
    app.isQuitting = true;
    if (tray) {
        tray.destroy();
        tray = null;
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});


import store from './store';

ipcMain.handle('get-streamers', () => {
    return store.get('streamers') || [];
});

ipcMain.handle('add-streamer', async (_, slug: string, isMuted: boolean = false) => {
    const info = await getStreamerInfo(slug);
    if (!info) {
        throw new Error('Yayıncı bulunamadı');
    }

    const streamers = store.get('streamers') || [];
    if (!streamers.find(s => s.slug === info.slug)) {
        streamers.push({
            slug: info.slug,
            username: info.username,
            profile_pic: info.profile_pic,
            is_live: info.is_live,
            viewers: info.viewers,
            title: info.title,
            category: info.category,
            followers: info.followers,
            is_verified: info.is_verified,
            is_muted: isMuted
        });
        store.set('streamers', streamers);
    }
    return { ...info, is_muted: isMuted };
});

ipcMain.handle('remove-streamer', (_, slug: string) => {
    const streamers = store.get('streamers') || [];
    const filtered = streamers.filter(s => s.slug !== slug);
    store.set('streamers', filtered);
    return filtered;
});

ipcMain.handle('update-streamers', (_, streamers) => {
    store.set('streamers', streamers);
    return true;
});

ipcMain.handle('get-streamer-info', async (_, slug: string) => {
    return await getStreamerInfo(slug);
});

import { searchStreamers } from './api';

ipcMain.handle('search-streamers', async (_, query: string) => {
    return await searchStreamers(query);
});

let syncInProgress = false;

ipcMain.on('kick-login-sync', (event) => {
    if (syncInProgress) return;
    syncInProgress = true;

    const loginWin = new BrowserWindow({
        width: 600,
        height: 800,
        show: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            partition: 'persist:kick'
        }
    });

    
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:115.0) Gecko/20100101 Firefox/115.0';
    loginWin.webContents.setUserAgent(userAgent);
    
    loginWin.loadURL('https://kick.com/login');

    const fullChannels: any[] = [];
    const seen = new Set<string>();
    let interceptedUserProfile: { username: string, profile_pic: string } | null = null;

    
    try {
        loginWin.webContents.debugger.attach('1.3');
        loginWin.webContents.debugger.sendCommand('Network.enable');
        
        loginWin.webContents.debugger.on('message', async (debuggerEvent, method, params) => {
            if (method === 'Network.responseReceived') {
                const responseUrl = params.response.url;
                
                
                if (responseUrl.includes('/api/v1/user') && !responseUrl.includes('users/')) {
                    try {
                        const responseBody = await loginWin.webContents.debugger.sendCommand('Network.getResponseBody', { requestId: params.requestId });
                        if (responseBody && responseBody.body) {
                            const data = JSON.parse(responseBody.body);
                            if (data && data.username) {
                                interceptedUserProfile = {
                                    username: data.username,
                                    profile_pic: data.profile_pic || data.profilePic || data.profile_image_url || data.avatar || ''
                                };
                            }
                        }
                    } catch(e) {}
                } else if (responseUrl.includes('/api/') && (responseUrl.includes('channel') || responseUrl.includes('following') || responseUrl.includes('users'))) {
                    try {
                        const responseBody = await loginWin.webContents.debugger.sendCommand('Network.getResponseBody', { requestId: params.requestId });
                        if (responseBody && responseBody.body) {
                            const text = responseBody.body;
                            if (text.includes('slug')) {
                                const data = JSON.parse(text);
                                
                                let items = [];
                                if (Array.isArray(data)) items = data;
                                else if (data.data && Array.isArray(data.data)) items = data.data;
                                else if (data.channels && Array.isArray(data.channels)) items = data.channels;
                                
                                for (const item of items) {
                                    const slug = item.slug || (item.channel && item.channel.slug);
                                    if (slug && !seen.has(slug)) {
                                        seen.add(slug);
                                        
                                        const channelObj = item.channel || item;
                                        const userObj = channelObj.user || item.user || channelObj;
                                        const livestream = channelObj.livestream || item.livestream;
                                        
                                        fullChannels.push({
                                            slug: slug,
                                            username: userObj.username || slug,
                                            is_live: !!livestream,
                                            viewers: livestream ? livestream.viewer_count : 0,
                                            profile_pic: userObj.profile_pic || userObj.profilePic || '',
                                            category: livestream?.categories?.[0]?.name || 'Offline',
                                            title: livestream?.session_title || '',
                                            followers: channelObj.followers_count || channelObj.followersCount || userObj.followers_count || 0,
                                            is_verified: !!(channelObj.verified?.status === 'approved' || channelObj.is_verified || userObj.is_verified)
                                        });
                                    }
                                }
                            }
                        }
                    } catch (err) {}
                }
            }
        });
    } catch (err) {
        console.error('Debugger attach failed', err);
    }

    const cleanupSync = () => {
        syncInProgress = false;
        try {
            if (!loginWin.isDestroyed() && loginWin.webContents.debugger.isAttached()) {
                loginWin.webContents.debugger.detach();
            }
        } catch (e) {}
    };

    let syncDone = false;
    let checkLogin: ReturnType<typeof setInterval>;

    loginWin.on('closed', () => {
        clearInterval(checkLogin);
        cleanupSync();
    });

    checkLogin = setInterval(async () => {
        if (loginWin.isDestroyed()) {
            clearInterval(checkLogin);
            if (!syncDone) event.reply('kick-sync-results', null);
            return;
        }

        try {
            const result = await loginWin.webContents.executeJavaScript(`
                (function() {
                    const avatar = document.querySelector('img.rounded-full');
                    const isFollowingPage = window.location.href.includes('kick.com/following/channels');
                    return { hasAvatar: !!avatar, isFollowingPage };
                })();
            `);

            if (result.hasAvatar && !result.isFollowingPage && !syncDone) {
                loginWin.loadURL('https://kick.com/following/channels');
                return;
            }

            if (result.isFollowingPage && !syncDone) {
                syncDone = true;
                clearInterval(checkLogin);
                
                
                
                
                loginWin.setOpacity(0.01);
                loginWin.setIgnoreMouseEvents(true);
                
                setTimeout(async () => {
                    if (loginWin.isDestroyed()) return;
                    try {
                        const result = await loginWin.webContents.executeJavaScript(`
                            (async function() {
                                
                                let myUsername = 'User';
                                let myProfilePic = '';
                                
                                try {
                                    
                                    const avatar = document.querySelector('button[id^="user-menu"] img') || document.querySelector('img.rounded-full');
                                    if (avatar) {
                                        myProfilePic = avatar.src || '';
                                        myUsername = avatar.alt || 'User';
                                    }
                                } catch(e) {}

                                
                                await new Promise(r => setTimeout(r, 2000)); 
                                return {
                                    myUsername,
                                    myProfilePic,
                                };
                            })();
                        `);

                        
                        
                        let domChannels: any[] = [];
                        try {
                            const domResult = await loginWin.webContents.executeJavaScript(`
                                (async function() {
                                    const collectedData = new Map();
                                    
                                    const harvestSlugs = () => {
                                        const cards = Array.from(document.querySelectorAll('a[href^="/"]'));
                                        for (const a of cards) {
                                            const href = a.getAttribute('href');
                                            if (href && href.startsWith('/') && href.lastIndexOf('/') === 0) {
                                                const slug = href.substring(1);
                                                const blacklist = ['following', 'browse', 'dashboard', 'login', 'signup', 'categories', 'leaderboards', 'about', 'help', 'terms-of-service', 'privacy-policy', 'network'];
                                                if (slug && !slug.includes('?') && !slug.includes('#') && !blacklist.includes(slug.toLowerCase())) {
                                                    const img = a.querySelector('img');
                                                    if (img || a.querySelector('.avatar') || a.closest('.grid')) {
                                                        if (!collectedData.has(slug)) {
                                                            collectedData.set(slug, {
                                                                slug: slug,
                                                                username: img ? (img.alt || slug) : slug,
                                                                profile_pic: img ? img.src : '',
                                                                is_live: false, 
                                                                viewers: 0
                                                            });
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    };

                                    const triggerScroll = () => {
                                        try {
                                            
                                            
                                            document.documentElement.scrollTop += 800;
                                            document.body.scrollTop += 800;
                                            window.scrollBy(0, 800);
                                            
                                            
                                            const divs = document.querySelectorAll('div');
                                            for (let i = 0; i < divs.length; i++) {
                                                const el = divs[i];
                                                if (el.scrollHeight > el.clientHeight + 10) {
                                                    el.scrollTop += 800;
                                                }
                                            }
                                        } catch (e) {}
                                    };

                                    for(let i=0; i<30; i++) {
                                        harvestSlugs();
                                        triggerScroll();
                                        
                                        try {
                                            const cards = Array.from(document.querySelectorAll('a[href^="/"]')).filter(a => {
                                                const href = a.getAttribute('href');
                                                if (!href || href.split('/').length > 2) return false;
                                                return a.querySelector('img') || a.querySelector('.avatar') || a.closest('.grid');
                                            });
                                            if (cards.length > 0) {
                                                const lastCard = cards[cards.length - 1];
                                                
                                                lastCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                
                                                
                                                lastCard.focus();
                                                lastCard.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', code: 'End', keyCode: 35, which: 35, bubbles: true }));
                                            }
                                        } catch(e) {}
                                        
                                        await new Promise(r => setTimeout(r, 800));
                                    }
                                    
                                    harvestSlugs();
                                    return Array.from(collectedData.values());
                                })();
                            `);
                            if (Array.isArray(domResult)) {
                                domChannels = domResult;
                            }
                        } catch(e) {}

                        
                        await new Promise(r => setTimeout(r, 1500));

                        
                        
                        const finalChannels = [...fullChannels.filter(c => c && c.slug), ...domChannels.filter(c => c && c.slug)];
                        
                        
                        const safeCloseWin = () => {
                            if (loginWin && !loginWin.isDestroyed()) {
                                loginWin.close();
                            }
                        };
                        
                        
                        if (finalChannels.length === 0) {
                            safeCloseWin();
                            if (result && result.myUsername) {
                                event.reply('kick-sync-results', {
                                    channels: [],
                                    user: { username: result.myUsername, profilePic: result.myProfilePic }
                                });
                                return;
                            }
                            event.reply('kick-sync-results', { error: 'Takip edilen kanal bulunamadı.' });
                            return;
                        }

                        
                        const uniqueMap = new Map();
                        
                        
                        domChannels.forEach(c => {
                            if (c && c.slug) uniqueMap.set(c.slug, c);
                        });
                        
                        
                        fullChannels.forEach(c => {
                            if (c && c.slug) uniqueMap.set(c.slug, c);
                        });
                        
                        const uniqueChannels = Array.from(uniqueMap.values());
                        
                        safeCloseWin();
                        event.reply('kick-sync-results', { 
                            channels: uniqueChannels,
                            user: interceptedUserProfile || { username: result?.myUsername || '', profile_pic: result?.myProfilePic || '' }
                        });
                    } catch (e) {
                        if (loginWin && !loginWin.isDestroyed()) loginWin.close();
                        event.reply('kick-sync-results', { user: null, channels: [] });
                    }
                }, 4000);
            }
        } catch (err) {}
    }, 1000);
});

ipcMain.handle('kick-logout', async () => {
    try {
        const kickSession = session.fromPartition('persist:kick');
        await kickSession.clearStorageData({ origin: 'https://kick.com' });
        return true;
    } catch (e) {
        console.error('Logout failed:', e);
        return false;
    }
});
ipcMain.handle('get-settings', () => {
    return store.get('settings');
});

ipcMain.handle('set-settings', (_, settings) => {
    store.set('settings', settings);
    
    
    if (settings.startAtLogin !== undefined) {
        app.setLoginItemSettings({
            openAtLogin: settings.startAtLogin,
            path: app.getPath('exe')
        });
    }
    
    return settings;
});

ipcMain.handle('open-external', (_, url: string) => {
    if (typeof url === 'string' && url.startsWith('https://')) {
        shell.openExternal(url);
    }
});

let notificationWin: BrowserWindow | null = null;

ipcMain.handle('show-notification', (_, { title, body, icon, silent, style }) => {
    
    const notifStyle = style || 'transient';

    if (notifStyle === 'native') {
        new Notification({
            title,
            body,
            icon: getIconPath(),
            silent: silent !== undefined ? silent : false
        }).show();
        return;
    }

    if (notificationWin) {
        if (!notificationWin.isDestroyed()) {
            notificationWin.close();
        }
        notificationWin = null;
    }

    ipcMain.removeAllListeners('notification-ready');

    const { screen: electronScreen } = require('electron');
    const display = electronScreen.getDisplayNearestPoint(electronScreen.getCursorScreenPoint());
    const { x, y, width, height } = display.workArea;

    notificationWin = new BrowserWindow({
        width: 320,
        height: 100,
        x: x + width - 320 - 20, 
        y: y + height - 100 - 20, 
        frame: false,
        transparent: true,
        alwaysOnTop: notifStyle === 'transient', 
        skipTaskbar: true,
        resizable: false,
        focusable: false,
        webPreferences: {
            preload: join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    if (process.env.VITE_DEV_SERVER_URL) {
        notificationWin.loadURL(`${process.env.VITE_DEV_SERVER_URL}#/notification`);
    } else {
        notificationWin.loadFile(join(process.env.DIST || '', 'index.html'), { search: 'mode=notification' });
    }
    
    
    ipcMain.once('notification-ready', () => {
        notificationWin?.webContents.send('notification-data', { title, body, icon });
    });

    const currentWin = notificationWin;
    if (notifStyle === 'transient') {
        setTimeout(() => {
            if (currentWin && !currentWin.isDestroyed()) {
                currentWin.close();
            }
            if (notificationWin === currentWin) {
                notificationWin = null;
            }
        }, 5000);
    }
});
