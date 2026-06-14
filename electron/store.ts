import Store from 'electron-store';


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
    is_muted?: boolean;
}


interface StoreSchema {
    streamers: Streamer[];
    settings: {
        checkInterval: number; 
        notificationsEnabled: boolean;
        notificationStyle: string;
        soundEnabled: boolean;
        startAtLogin: boolean;
        language: 'en' | 'tr';
    };
}


const store = new Store<StoreSchema>({
    defaults: {
        streamers: [],
        settings: {
            checkInterval: 2,
            notificationsEnabled: true,
            notificationStyle: 'transient', 
            soundEnabled: true,
            startAtLogin: false,
            language: 'en'
        }
    }
});

export default store;
