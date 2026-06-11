export type Language = 'en' | 'tr';

export const translations = {
    en: {
        liveStreamers: 'Live Now',
        allStreamers: 'All Streamers',
        addPlaceholder: 'Kick Username...',
        addButton: 'Add',
        refreshing: 'Refreshing...',
        liveViewers: 'viewers',
        liveBadge: 'LIVE',
        justChatting: 'Just Chatting',
        offline: 'Offline right now',
        deletePrompt: 'Delete Streamer?',
        cancel: 'Cancel',
        delete: 'Delete',
        noStreamers: 'No streamers found.',
        noStreamersDesc: 'Add your favorite streamers from the left menu.',
        settings: 'Settings',
        notifications: 'Notifications',
        notificationsDesc: 'Notify when a streamer goes live',
        sound: 'Sound Effects',
        soundDesc: 'Play sound on notification',
        startup: 'Start at Login',
        startupDesc: 'Launch when Windows starts',
        checkInterval: 'Check Interval',
        checkIntervalDesc: 'How often to check for status?',
        minutes: 'Min',
        language: 'Language',
        languageDesc: 'Choose interface language'
    },
    tr: {
        liveStreamers: 'Şu An Canlı',
        allStreamers: 'Tüm Yayıncılar',
        addPlaceholder: 'Kick Kullanıcı Adı...',
        addButton: 'Ekle',
        refreshing: 'Yenileniyor...',
        liveViewers: 'izleyici',
        liveBadge: 'CANLI',
        justChatting: 'Sadece Sohbet',
        offline: 'Şu an çevrimdışı',
        deletePrompt: 'Silinsin mi?',
        cancel: 'İptal',
        delete: 'Sil',
        noStreamers: 'Hiç yayıncı yok.',
        noStreamersDesc: 'Sol menüden sevdiklerini ekle.',
        settings: 'Ayarlar',
        notifications: 'Bildirimler',
        notificationsDesc: 'Yayıncı online olduğunda bildir',
        sound: 'Ses Efekti',
        soundDesc: 'Bildirim geldiğinde ses çal',
        startup: 'Açılışta Başlat',
        startupDesc: 'Windows başladığında açıl',
        checkInterval: 'Kontrol Aralığı',
        checkIntervalDesc: 'Kaç dakikada bir kontrol edilsin?',
        minutes: 'Dk',
        language: 'Dil',
        languageDesc: 'Arayüz dilini seçin'
    }
};

export const t = (lang: Language, key: keyof typeof translations.en) => {
    return translations[lang][key] || translations.en[key];
};
