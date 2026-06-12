// ... (imports)
import { app, BrowserWindow, ipcMain, Notification, shell, Tray, Menu, nativeImage } from 'electron'
import { join } from 'node:path'
import { autoUpdater } from 'electron-updater';
import { getStreamerInfo } from './api';

// Window Controls
ipcMain.on('window-minimize', () => {
    win?.minimize();
});

ipcMain.on('window-close', () => {
    // Hide to tray if tray exists, otherwise quit
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
let tray: Tray | null = null // Tray reference

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
        icon: iconImage, // Use nativeImage for crisp scaling
        frame: false,
        width: 1000,
        height: 700,
        backgroundColor: '#0B0E0F',
        webPreferences: {
            preload,
            nodeIntegration: false,
            contextIsolation: true,
            backgroundThrottling: false, // Prevent timer throttling when minimized
        },
        skipTaskbar: false, // Ensure visibility in taskbar
        autoHideMenuBar: true,
    })

    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(url)
    } else {
        win.loadFile(indexHtml)
    }

    // Hide window on close (e.g., Alt+F4 or Taskbar close) instead of quitting
    win.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            win?.hide();
            return false;
        }
        return true;
    });

    win.webContents.setWindowOpenHandler(({ url }) => {
        // Open external links securely in the default browser
        if (url.startsWith('https:')) {
            shell.openExternal(url);
        }
        return { action: 'deny' };
    });
}

function createTray() {
    const iconPath = getIconPath();
    const iconImage = nativeImage.createFromPath(iconPath);

    // Remove existsSync check as createFromPath handles missing files gracefully
    // If the icon is missing, the tray will be blank but the app won't crash
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
                    // Force close all windows and exit
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

// Global variable to track quitting state
declare global {
    namespace Electron {
        interface App {
            isQuitting?: boolean;
        }
    }
}

// Initialize quitting state
app.isQuitting = false;

app.whenReady().then(() => {
    // AppUserModelId is required for Windows Toast notifications to work
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

        // Trigger first check
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

app.on('window-all-closed', () => {
    // Do not quit on window close; keep running in tray
    if (process.platform !== 'darwin') {
        // app.quit() is removed so it stays in the background
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// IPC handlers (API'den gelenler)
import store from './store';

ipcMain.handle('get-streamers', () => {
    return store.get('streamers') || [];
});

ipcMain.handle('add-streamer', async (_, slug: string) => {
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
            is_verified: info.is_verified
        });
        store.set('streamers', streamers);
    }
    return info;
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

ipcMain.handle('get-settings', () => {
    return store.get('settings');
});

ipcMain.handle('set-settings', (_, settings) => {
    store.set('settings', settings);
    
    // İşletim sisteminde Başlangıçta Çalıştır ayarını uygula
    if (settings.startAtLogin !== undefined) {
        app.setLoginItemSettings({
            openAtLogin: settings.startAtLogin,
            path: app.getPath('exe')
        });
    }
    
    return settings;
});

ipcMain.handle('open-external', (_, url: string) => {
    shell.openExternal(url);
});

let notificationWin: BrowserWindow | null = null;

ipcMain.handle('show-notification', (_, { title, body, icon, silent, style }) => {
    // Determine style, default to transient if not provided
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
        notificationWin.close();
        notificationWin = null;
    }

    const { screen } = require('electron');
    const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
    const { x, y, width, height } = display.workArea;

    notificationWin = new BrowserWindow({
        width: 320,
        height: 100,
        x: x + width - 320 - 20, // 20px padding from right on the active monitor
        y: y + height - 100 - 20, // 20px padding from bottom on the active monitor
        frame: false,
        transparent: true,
        alwaysOnTop: notifStyle === 'transient', // On top if transient, behind if persistent (desktop mode)
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
    
    // Pass data once ready
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
