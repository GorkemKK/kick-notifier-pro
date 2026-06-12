import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Settings, Users, MonitorPlay, Wifi, RefreshCw, X, ExternalLink, ChevronDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { t, Language } from './locales';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Streamer {
    slug: string;
    username: string;
    profile_pic: string;
    is_live: boolean;
    viewers: number;
    title: string;
    category: string;
    followers?: number;
    is_verified?: boolean;
}

import SettingsModal from './components/SettingsModal';

export default function App() {
    const [streamers, setStreamers] = useState<Streamer[]>([]);
    const [newSlug, setNewSlug] = useState('');
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'live' | 'all'>('live');
    const [error, setError] = useState<string | null>(null);
    const [streamerToDelete, setStreamerToDelete] = useState<string | null>(null);
    const [lang, setLang] = useState<Language>('en');
    const [sortBy, setSortBy] = useState<'default' | 'viewers_desc' | 'viewers_asc' | 'followers_desc'>('default');
    const [sortOpen, setSortOpen] = useState(false);

    const sortOptions = [
        { id: 'default', label: lang === 'tr' ? 'Eklenme Sırası' : 'Default Sort' },
        { id: 'viewers_desc', label: lang === 'tr' ? 'En Çok İzlenen' : 'Most Viewers' },
        { id: 'viewers_asc', label: lang === 'tr' ? 'En Az İzlenen' : 'Least Viewers' },
        { id: 'followers_desc', label: lang === 'tr' ? 'En Çok Takipçi' : 'Most Followers' }
    ];

    const handleOpenStream = (slug: string) => {
        window.ipcRenderer.invoke('open-external', `https://kick.com/${slug}`);
    };

    /**
     * Plays the selected notification sound.
     */
    const playNotificationSound = (soundFile: string = '1.mp3') => {
        try {
            const audio = new Audio(`assets/sounds/${soundFile}`);
            audio.play().catch(e => console.error("Error playing sound:", e));
        } catch (e) {}
    };

    /**
     * Plays a sound when adding a streamer.
     */
    const playAddSound = (soundFile: string = '1.mp3') => {
        try {
            const audio = new Audio(`assets/sounds/${soundFile}`);
            audio.play().catch(e => console.error("Error playing sound:", e));
        } catch (e) {}
    };

    /**
     * Plays the trash sound when removing a streamer.
     */
    const playRemoveSound = () => {
        try {
            const audio = new Audio(`assets/sounds/macemptytrash.mp3`);
            audio.play().catch(e => console.error("Error playing sound:", e));
        } catch (e) {}
    };

    // Reload language when settings modal is closed
    useEffect(() => {
        const fetchLang = async () => {
            const settings = await window.ipcRenderer.invoke('get-settings');
            if (settings?.language) {
                setLang(settings.language as Language);
            }
        };
        fetchLang();
    }, [settingsOpen]);

    useEffect(() => {
        let isMounted = true;
        let intervalId: NodeJS.Timeout;

        const initPolling = async () => {
            if (!isMounted) return;
            await loadStreamers();
            
            const settings = await window.ipcRenderer.invoke('get-settings');
            const checkIntervalMs = (settings?.checkInterval || 1) * 60000;
            
            if (isMounted) {
                intervalId = setInterval(loadStreamers, checkIntervalMs);
            }
        };

        initPolling();

        return () => {
            isMounted = false;
            if (intervalId) clearInterval(intervalId);
        };
    }, []);

    const loadStreamers = async () => {
        try {
            setLoading(true);
            const list = await window.ipcRenderer.invoke('get-streamers');
            const updatedList = await Promise.all(list.map(async (s: Streamer) => {
                const info = await window.ipcRenderer.invoke('get-streamer-info', s.slug);

                if (info && info.is_live && !s.is_live) {
                    const settings = await window.ipcRenderer.invoke('get-settings');
                    const notificationsEnabled = settings?.notificationsEnabled !== false;
                    const soundEnabled = settings?.soundEnabled !== false;

                    if (notificationsEnabled) {
                        // Use Main Process Native Notification for Windows reliability
                        window.ipcRenderer.invoke('show-notification', {
                            title: `${info.username} ${lang === 'tr' ? 'Yayında!' : 'is Live!'}`,
                            body: `${info.title} - ${info.category}`,
                            icon: info.profile_pic,
                            silent: true,
                            style: settings?.notificationStyle || 'transient'
                        });

                        if (soundEnabled) {
                            playNotificationSound(settings?.notificationSound);
                        }
                    }
                }

                return info || s;
            }));

            setStreamers(updatedList);
            await window.ipcRenderer.invoke('update-streamers', updatedList);
        } catch (error) {
            console.error('Failed to load streamers', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStreamer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSlug) return;

        // Kullanıcı zaten ekliyse uyarı ver ve işlemi iptal et
        const isAlreadyAdded = streamers.some(s => 
            s.slug.toLowerCase() === newSlug.trim().toLowerCase() || 
            s.username.toLowerCase() === newSlug.trim().toLowerCase()
        );

        if (isAlreadyAdded) {
            setError(lang === 'tr' ? 'Bu yayıncı zaten listenizde ekli!' : 'This streamer is already in your list!');
            setTimeout(() => setError(null), 3000);
            return;
        }

        setAdding(true);
        setError(null);
        try {
            const addedInfo = await window.ipcRenderer.invoke('add-streamer', newSlug);
            setNewSlug('');
            
            const settings = await window.ipcRenderer.invoke('get-settings');
            
            // Eğer eklenen kişi o an yayındaysa direkt bildirim gönder (Testleri kolaylaştırmak ve bilgi vermek için)
            if (addedInfo.is_live) {
                if (settings?.notificationsEnabled !== false) {
                    window.ipcRenderer.invoke('show-notification', {
                        title: `${addedInfo.username} ${lang === 'tr' ? 'Yayında!' : 'is Live!'}`,
                        body: `${addedInfo.title} - ${addedInfo.category}`,
                        icon: addedInfo.profile_pic,
                        silent: true,
                        style: settings?.notificationStyle || 'transient'
                    }).catch(console.error);

                    if (settings?.soundEnabled !== false) {
                        playNotificationSound(settings?.notificationSound);
                    }
                }
            } else {
                if (settings?.soundEnabled !== false) playAddSound(settings?.notificationSound);
            }

            setStreamers(prev => {
                if (prev.find(s => s.slug === addedInfo.slug)) return prev;
                return [...prev, addedInfo];
            });
        } catch (error) {
            console.error('Failed to add streamer', error);
            setError(lang === 'tr' ? 'Yayıncı bulunamadı!' : 'Streamer not found!');
            setTimeout(() => setError(null), 3000);
        } finally {
            setAdding(false);
        }
    };

    const handleRemove = async (slug: string) => {
        setStreamerToDelete(null);
        await window.ipcRenderer.invoke('remove-streamer', slug);
        
        const settings = await window.ipcRenderer.invoke('get-settings');
        if (settings?.soundEnabled !== false) playRemoveSound();
        
        setStreamers(prev => prev.filter(s => s.slug !== slug));
    };

    const filteredStreamers = [...(activeTab === 'live'
        ? streamers.filter(s => s.is_live)
        : streamers)].sort((a, b) => {
            if (sortBy === 'viewers_desc' || sortBy === 'viewers_asc') {
                if (a.is_live && !b.is_live) return -1;
                if (!a.is_live && b.is_live) return 1;
            }

            if (sortBy === 'viewers_desc') return (b.viewers || 0) - (a.viewers || 0);
            if (sortBy === 'viewers_asc') return (a.viewers || 0) - (b.viewers || 0);
            if (sortBy === 'followers_desc') return (b.followers || 0) - (a.followers || 0);
            return 0;
        });

    return (
        <div className="flex h-screen bg-[#0B0E0F] text-white overflow-hidden selection:bg-[#00E701] selection:text-black font-sans">
            <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

            {/* Sidebar */}
            <div className="w-64 bg-[#14171A] border-r border-white/5 flex flex-col pt-8 pb-4">
                <div className="px-6 mb-8">
                    <h1 className="text-2xl font-bold tracking-tighter text-[#00E701] flex items-center gap-2">
                        <MonitorPlay className="w-8 h-8" />
                        KICK<span className="text-white">PRO</span>
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <button
                        onClick={() => setActiveTab('live')}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                            activeTab === 'live'
                                ? "bg-[#00E701]/10 text-[#00E701]"
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <div className="relative">
                            <Wifi className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        </div>
                        {t(lang, 'liveStreamers')}
                        <span className="ml-auto text-xs bg-[#00E701]/20 px-2 py-0.5 rounded text-[#00E701]">
                            {streamers.filter(s => s.is_live).length}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('all')}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                            activeTab === 'all'
                                ? "bg-white/10 text-white"
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <Users className="w-5 h-5" />
                        {t(lang, 'allStreamers')}
                        <span className="ml-auto text-xs bg-white/10 px-2 py-0.5 rounded text-gray-300">
                            {streamers.length}
                        </span>
                    </button>
                </nav>

                <div className="px-4 mt-auto">
                    <form onSubmit={handleAddStreamer} className="mb-4 relative">
                        <div className="relative group">
                            <input
                                type="text"
                                value={newSlug}
                                onChange={(e) => { setNewSlug(e.target.value); setError(null); }}
                                placeholder={t(lang, 'addPlaceholder')}
                                className={cn(
                                    "w-full bg-[#0B0E0F] border rounded-lg py-2.5 pl-3 pr-10 text-sm focus:outline-none transition-all placeholder:text-gray-600",
                                    error
                                        ? "border-red-500/50 focus:border-red-500 animate-shake"
                                        : "border-white/10 focus:border-[#00E701]"
                                )}
                            />
                            <button
                                disabled={adding || !newSlug}
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#00E701] hover:bg-[#00E701]/10 rounded transition-colors disabled:opacity-50"
                            >
                                {adding ? <div className="w-4 h-4 border-2 border-[#00E701] border-t-transparent rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                            </button>
                        </div>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute -bottom-6 left-1 text-xs text-red-400 font-medium"
                            >
                                {error}
                            </motion.div>
                        )}
                    </form>

                    <button
                        onClick={() => setSettingsOpen(true)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white transition-colors text-sm font-medium w-full rounded-xl hover:bg-white/5"
                    >
                        <Settings className="w-5 h-5" />
                        {t(lang, 'settings')}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8 relative">
                {/* Title Bar Drag Region & Controls */}
                <div className="fixed top-0 left-0 w-full h-10 draggable z-50 flex justify-end items-center pr-2">
                    <div className="flex gap-2 no-drag">
                        <button
                            onClick={() => window.ipcRenderer.send('window-minimize')}
                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                        <button
                            onClick={() => window.ipcRenderer.send('window-close')}
                            className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-lg text-gray-400 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <header className="flex items-center justify-between mb-8 mt-4 pt-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-white">
                            {activeTab === 'live' ? t(lang, 'liveStreamers') : t(lang, 'allStreamers')}
                        </h2>
                        
                        <div className="relative">
                            <button
                                onClick={() => setSortOpen(!sortOpen)}
                                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md text-white text-sm rounded-xl px-4 py-2 transition-all"
                            >
                                {sortOptions.find(o => o.id === sortBy)?.label}
                                <ChevronDown className={cn("w-4 h-4 transition-transform", sortOpen && "rotate-180")} />
                            </button>
                            <AnimatePresence>
                                {sortOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-2 w-48 bg-[#0B0E0F]/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.5)] z-50"
                                    >
                                        {sortOptions.map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => { setSortBy(opt.id as any); setSortOpen(false); }}
                                                className={cn(
                                                    "w-full text-left px-4 py-2.5 text-sm transition-colors",
                                                    sortBy === opt.id 
                                                        ? "bg-[#00E701]/20 text-[#00E701] font-medium" 
                                                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                                                )}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                    <button onClick={loadStreamers} className="p-2 hover:bg-white/5 rounded-full transition-colors group" title={t(lang, 'refreshing')}>
                        <RefreshCw className={cn("w-5 h-5 text-gray-500 group-hover:text-white transition-all", loading && "animate-spin text-[#00E701]")} />
                    </button>
                </header>

                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    <AnimatePresence mode='popLayout'>
                        {filteredStreamers.map((streamer) => (
                            <motion.div
                                layout
                                key={streamer.slug}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                className={cn(
                                    "group relative overflow-hidden rounded-2xl border transition-all duration-300",
                                    streamer.is_live
                                        ? "bg-[#14171A] border-[#00E701]/30 shadow-[0_0_30px_-10px_rgba(0,231,1,0.2)] hover:border-[#00E701] hover:shadow-[0_0_40px_-5px_rgba(0,231,1,0.3)]"
                                        : "bg-[#14171A]/50 border-white/5 hover:border-white/10 opacity-70 hover:opacity-100"
                                )}
                            >
                                {/* Background Gradient/Image Placeholder */}
                                <div className="h-28 bg-gradient-to-br from-gray-800 to-black relative">
                                    {streamer.is_live && (
                                        <div className="absolute inset-0 bg-[#00E701]/5" />
                                    )}

                                    {/* Live Badge */}
                                    {streamer.is_live && (
                                        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#00E701] text-black text-[10px] font-bold px-2 py-1 rounded-md shadow-lg shadow-[#00E701]/20 z-10">
                                            <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                                            {t(lang, 'liveBadge')}
                                        </div>
                                    )}

                                    <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleOpenStream(streamer.slug); }}
                                            className="p-1.5 bg-black/80 hover:bg-[#00E701] hover:text-black text-white rounded-md transition-all backdrop-blur-sm"
                                            title="Yayına Git"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setStreamerToDelete(streamer.slug); }}
                                            className="p-1.5 bg-black/80 hover:bg-red-500 text-white rounded-md transition-all backdrop-blur-sm"
                                            title="Listeden Çıkar"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Profile Info */}
                                <div className="px-5 pb-5 pt-0 relative">
                                    <div className="flex justify-between items-end -mt-8 mb-3">
                                        <img
                                            src={streamer.profile_pic}
                                            alt={streamer.username}
                                            className={cn(
                                                "w-16 h-16 rounded-2xl border-4 object-cover shadow-2xl",
                                                streamer.is_live
                                                    ? "border-[#14171A] outline outline-2 outline-[#00E701]"
                                                    : "border-[#14171A] grayscale group-hover:grayscale-0 transition-all"
                                            )}
                                        />
                                        {streamer.is_live && (
                                            <div className="text-right mb-1">
                                                <div className="text-[#00E701] font-bold text-lg tabular-nums tracking-tight">
                                                    {streamer.viewers.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-gray-500 font-medium">{t(lang, 'liveViewers')}</div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <h3 className="text-lg font-bold text-white truncate">{streamer.username}</h3>
                                        {streamer.is_verified && (
                                            <div title={lang === 'tr' ? 'Onaylı Kanal' : 'Verified Channel'} className="bg-[#00E701] rounded-full p-0.5 flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(0,231,1,0.5)]">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <p className="text-sm text-gray-400 truncate">{streamer.category || t(lang, 'justChatting')}</p>
                                        {streamer.followers !== undefined && (
                                            <>
                                                <span className="text-gray-600 text-xs">•</span>
                                                <p className="text-xs text-gray-400 font-medium whitespace-nowrap">{(streamer.followers).toLocaleString()} {lang === 'tr' ? 'Takipçi' : 'Followers'}</p>
                                            </>
                                        )}
                                    </div>

                                    {streamer.is_live ? (
                                        <div className="bg-[#0B0E0F] rounded-lg p-3 border border-white/5">
                                            <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                                                {streamer.title}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="h-10 flex items-center text-xs text-gray-600 italic">
                                            {t(lang, 'offline')}
                                        </div>
                                    )}
                                </div>

                                {/* Delete Overlay */}
                                <AnimatePresence>
                                    {streamerToDelete === streamer.slug && (
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-20"
                                        >
                                            <p className="text-white font-bold mb-4">{t(lang, 'deletePrompt')}</p>
                                            <div className="flex gap-3">
                                                <button 
                                                    onClick={() => setStreamerToDelete(null)}
                                                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                                                >
                                                    {t(lang, 'cancel')}
                                                </button>
                                                <button 
                                                    onClick={() => handleRemove(streamer.slug)}
                                                    className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white font-medium transition-colors"
                                                >
                                                    {t(lang, 'delete')}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {filteredStreamers.length === 0 && !loading && (
                    <div className="text-center mt-20 opacity-50">
                        <div className="w-48 h-48 bg-white/5 rounded-full mx-auto flex items-center justify-center">
                            <Users className="w-16 h-16 text-gray-600" />
                        </div>
                        <p className="text-xl text-gray-500 mt-4">{t(lang, 'noStreamers')}</p>
                        <p className="text-sm text-gray-600">{t(lang, 'noStreamersDesc')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
