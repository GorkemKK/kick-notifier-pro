import { contextBridge, ipcRenderer } from 'electron'

const ALLOWED_SEND_CHANNELS = [
    'window-minimize',
    'window-close',
    'kick-login-sync',
    'check-for-updates',
    'install-update',
    'notification-ready',
];

const ALLOWED_INVOKE_CHANNELS = [
    'get-settings',
    'set-settings',
    'get-streamers',
    'add-streamer',
    'remove-streamer',
    'update-streamers',
    'get-streamer-info',
    'search-streamers',
    'show-notification',
    'open-external',
    'kick-logout',
    'download-update',
    'install-update',
];

const ALLOWED_RECEIVE_CHANNELS = [
    'kick-sync-results',
    'update-available',
    'update-not-available',
    'download-progress',
    'update-downloaded',
    'update-error',
    'notification-data',
];

contextBridge.exposeInMainWorld('ipcRenderer', {
    on(channel: string, listener: (...args: any[]) => void) {
        if (ALLOWED_RECEIVE_CHANNELS.includes(channel)) {
            return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
        }
    },
    off(channel: string, listener: (...args: any[]) => void) {
        if (ALLOWED_RECEIVE_CHANNELS.includes(channel)) {
            return ipcRenderer.off(channel, listener)
        }
    },
    send(channel: string, ...args: any[]) {
        if (ALLOWED_SEND_CHANNELS.includes(channel)) {
            return ipcRenderer.send(channel, ...args)
        }
    },
    invoke(channel: string, ...args: any[]) {
        if (ALLOWED_INVOKE_CHANNELS.includes(channel)) {
            return ipcRenderer.invoke(channel, ...args)
        }
        return Promise.reject(new Error(`IPC channel "${channel}" is not allowed`));
    },
})
