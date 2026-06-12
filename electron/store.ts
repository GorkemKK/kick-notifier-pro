import Store from 'electron-store';

/**
 * Interface representing a Streamer object stored in the application.
 */
interface Streamer {
    slug: string;
    username: string;
    profile_pic: string;
    is_live: boolean;
    last_online?: number;
    viewers?: number;
    title?: string;
    category?: string;
    followers?: number;
    is_verified?: boolean;
}

/**
 * Schema definition for the local electron-store config.
 */
interface StoreSchema {
    streamers: Streamer[];
    settings: {
        checkInterval: number; // Polling interval in minutes
        notificationsEnabled: boolean;
        notificationStyle: string;
        soundEnabled: boolean;
        startAtLogin: boolean;
        language: 'en' | 'tr';
    };
}

// Initialize the store with default English language
const store = new Store<StoreSchema>({
    defaults: {
        streamers: [],
        settings: {
            checkInterval: 2,
            notificationsEnabled: true,
            notificationStyle: 'transient', // 'transient' (auto-close) or 'persistent' (stays until clicked)
            soundEnabled: true,
            startAtLogin: false,
            language: 'en'
        }
    }
});

export default store;
