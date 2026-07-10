import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Settings, Users, MonitorPlay, Wifi, RefreshCw, X, ExternalLink, ChevronDown, Bell, BellOff, Info } from 'lucide-react';
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
    is_muted?: boolean;
}

import React from 'react';
import SettingsModal from './components/SettingsModal';

interface StreamerCardProps {
    streamer: Streamer;
    lang: Language;
    t: typeof t;
    handleOpenStream: (slug: string) => void;
    handleToggleMute: (slug: string) => void;
    streamerToDelete: string | null;
    setStreamerToDelete: (slug: string | null) => void;
    handleRemove: (slug: string) => void;
}

const StreamerCard = React.memo(({ streamer, lang, t, handleOpenStream, handleToggleMute, streamerToDelete, setStreamerToDelete, handleRemove }: StreamerCardProps) => {
    return (
        <motion.div
            layout
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
            
            <div className="h-28 bg-gradient-to-br from-gray-800 to-black relative">
                {streamer.is_live && (
                    <div className="absolute inset-0 bg-[#00E701]/5" />
                )}

                
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
                        title={lang === 'tr' ? "Yayına Git" : "Go to Stream"}
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleToggleMute(streamer.slug); }}
                        className={cn("p-1.5 bg-black/80 text-white rounded-md transition-all backdrop-blur-sm", streamer.is_muted ? "hover:bg-yellow-500 hover:text-black" : "hover:bg-blue-500")}
                        title={streamer.is_muted ? (lang === 'tr' ? "Bildirimleri Aç" : "Unmute") : (lang === 'tr' ? "Sustur" : "Mute")}
                    >
                        {streamer.is_muted ? <BellOff className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setStreamerToDelete(streamer.slug); }}
                        className="p-1.5 bg-black/80 hover:bg-red-500 text-white rounded-md transition-all backdrop-blur-sm"
                        title={lang === 'tr' ? "Listeden Çıkar" : "Remove from List"}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            
            <div className="px-5 pb-5 pt-0 relative">
                <div className="flex justify-between items-end -mt-8 mb-3">
                    <img
                        src={streamer.profile_pic}
                        alt={streamer.username}
                        loading="lazy"
                        decoding="async"
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

            
            <AnimatePresence>
                {streamerToDelete === streamer.slug && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#1A1D20]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center"
                    >
                        <Trash2 className="w-10 h-10 text-red-500 mb-3" />
                        <h4 className="text-white font-bold mb-1">{streamer.username}</h4>
                        <p className="text-sm text-gray-400 mb-6">{t(lang, 'deletePrompt')}</p>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setStreamerToDelete(null)}
                                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm font-medium border border-white/10"
                            >
                                {t(lang, 'cancel')}
                            </button>
                            <button
                                onClick={() => handleRemove(streamer.slug)}
                                className="flex-1 px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-colors text-sm font-medium border border-red-500/20"
                            >
                                {t(lang, 'delete')}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
});

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
    
    const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [syncResults, setSyncResults] = useState<any[] | null>(null);
    const [selectedSyncStreamers, setSelectedSyncStreamers] = useState<string[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [addMuted, setAddMuted] = useState(false);
    const [kickProfile, setKickProfile] = useState<{username: string, profile_pic: string} | null>(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const sortOptions = [
        { id: 'default', label: lang === 'tr' ? 'Eklenme Sırası' : 'Default Sort' },
        { id: 'viewers_desc', label: lang === 'tr' ? 'En Çok İzlenen' : 'Most Viewers' },
        { id: 'viewers_asc', label: lang === 'tr' ? 'En Az İzlenen' : 'Least Viewers' },
        { id: 'followers_desc', label: lang === 'tr' ? 'En Çok Takipçi' : 'Most Followers' }
    ];

    const handleOpenStream = useCallback((slug: string) => {
        window.ipcRenderer.invoke('open-external', `https://kick.com/${slug}`);
    }, []);

    
    const playNotificationSound = (soundFile: string = '1.mp3') => {
        try {
            const audio = new Audio(`assets/sounds/${soundFile}`);
            audio.play().catch(e => console.error("Error playing sound:", e));
        } catch (e) {}
    };



    
    const playRemoveSound = () => {
        try {
            const audio = new Audio(`assets/sounds/macemptytrash.mp3`);
            audio.play().catch(e => console.error("Error playing sound:", e));
        } catch (e) {}
    };

    
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
    }, [settingsOpen]);

    useEffect(() => {
        if (!newSlug || newSlug.trim() === '') {
            setSearchSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            try {
                const results = await window.ipcRenderer.invoke('search-streamers', newSlug);
                setSearchSuggestions(results);
                setShowSuggestions(true);
            } catch (err) {
                console.error(err);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [newSlug]);

    useEffect(() => {
        const handleSyncResults = async (e: any, result: any) => {
            setIsSyncing(false); 
            if (result && result.channels && result.channels.length > 0) {
                const results = result.channels;
                const filtered = results.filter((r: any) => !streamers.some(s => s.slug === r.slug));
                setSyncResults(filtered);
                setSelectedSyncStreamers(filtered.map((r: any) => r.slug));
                
                if (result.user && result.user.username) {
                    setKickProfile(result.user);
                    const settings = await window.ipcRenderer.invoke('get-settings');
                    await window.ipcRenderer.invoke('set-settings', { ...settings, kickProfile: result.user });
                }
            } else {
                setSyncResults(null);
            }
        };
        window.ipcRenderer.on('kick-sync-results', handleSyncResults);
        return () => window.ipcRenderer.off('kick-sync-results', handleSyncResults);
    }, [streamers]);

    useEffect(() => {
        const fetchProfile = async () => {
            const settings = await window.ipcRenderer.invoke('get-settings');
            if (settings?.kickProfile) {
                setKickProfile(settings.kickProfile);
            }
        };
        fetchProfile();
    }, []);

    const loadStreamers = async () => {
        try {
            setLoading(true);
            const list = await window.ipcRenderer.invoke('get-streamers');
            const settings = await window.ipcRenderer.invoke('get-settings');
            const updatedList = await Promise.all(list.map(async (s: Streamer) => {
                if (s.is_muted) {
                    return s; 
                }
                const info = await window.ipcRenderer.invoke('get-streamer-info', s.slug);

                if (info && info.is_live && !s.is_live && !s.is_muted) {
                    const notificationsEnabled = settings?.notificationsEnabled !== false;
                    const soundEnabled = settings?.soundEnabled !== false;

                    if (notificationsEnabled) {
                        
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

                return info ? { ...info, is_muted: s.is_muted } : s;
            }));

            setStreamers(updatedList);
            await window.ipcRenderer.invoke('update-streamers', updatedList);
        } catch (error) {
            console.error('Failed to load streamers', error);
        } finally {
            setLoading(false);
        }
    };

    const executeAddStreamer = async (targetSlug: string, isMuted: boolean = false, isBulk: boolean = false) => {
        if (!targetSlug) return;

        const isAlreadyAdded = streamers.some(s => 
            s.slug.toLowerCase() === targetSlug.trim().toLowerCase() || 
            s.username.toLowerCase() === targetSlug.trim().toLowerCase()
        );

        if (isAlreadyAdded) {
            setError(lang === 'tr' ? 'Bu yayıncı zaten listenizde ekli!' : 'This streamer is already in your list!');
            setTimeout(() => setError(null), 3000);
            return;
        }

        setAdding(true);
        setError(null);
        try {
            const settings = await window.ipcRenderer.invoke('get-settings');
            
            
            let finalMuted = isMuted;
            if (!finalMuted && settings?.mutedHistory?.includes(targetSlug.trim().toLowerCase())) {
                finalMuted = true;
            }

            const addedInfo = await window.ipcRenderer.invoke('add-streamer', targetSlug, finalMuted);
            setNewSlug('');
            setShowSuggestions(false);
            
            if (!isBulk) {
                if (addedInfo.is_live && !finalMuted) {
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
                    if (settings?.soundEnabled !== false) playNotificationSound(settings?.notificationSound);
                }
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

    const handleAddStreamer = async (e: React.FormEvent) => {
        e.preventDefault();
        await executeAddStreamer(newSlug);
    };

    const handleSyncSubmit = async () => {
        if (!syncResults || syncResults.length === 0) {
            setSyncResults(null);
            return;
        }
        setIsSyncing(true);
        for (const slug of selectedSyncStreamers) {
            try {
                await executeAddStreamer(slug, addMuted, true);
            } catch (e) { console.error(e); }
        }
        
        const settings = await window.ipcRenderer.invoke('get-settings');
        if (settings?.soundEnabled !== false) playNotificationSound(settings?.notificationSound);
        
        setIsSyncing(false);
        setSyncResults(null);
    };

    const handleToggleMute = useCallback(async (slug: string) => {
        const streamer = streamers.find(s => s.slug === slug);
        const newMutedState = !streamer?.is_muted;
        const updated = streamers.map(s => s.slug === slug ? { ...s, is_muted: newMutedState } : s);
        setStreamers(updated);
        await window.ipcRenderer.invoke('update-streamers', updated);
        
        
        const settings = await window.ipcRenderer.invoke('get-settings');
        const mutedHistory = settings?.mutedHistory || [];
        if (newMutedState && !mutedHistory.includes(slug.toLowerCase())) {
            await window.ipcRenderer.invoke('set-settings', { ...settings, mutedHistory: [...mutedHistory, slug.toLowerCase()] });
        } else if (!newMutedState && mutedHistory.includes(slug.toLowerCase())) {
            await window.ipcRenderer.invoke('set-settings', { ...settings, mutedHistory: mutedHistory.filter((m: string) => m !== slug.toLowerCase()) });
        }
    }, [streamers]);

    const handleRemove = useCallback(async (slug: string) => {
        setStreamerToDelete(null);
        await window.ipcRenderer.invoke('remove-streamer', slug);
        
        const settings = await window.ipcRenderer.invoke('get-settings');
        if (settings?.soundEnabled !== false) playRemoveSound();
        
        setStreamers(prev => prev.filter(s => s.slug !== slug));
    }, []);

    const filteredStreamers = useMemo(() => [...(activeTab === 'live'
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
        }), [streamers, activeTab, sortBy]);

    return (
        <div className="flex h-screen bg-[#0B0E0F] text-white overflow-hidden selection:bg-[#00E701] selection:text-black font-sans">
            <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

            {syncResults !== null && (
                <div className="fixed inset-0 flex items-center justify-center z-[200]">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSyncResults(null)} />
                    <div className="bg-[#1A1D20]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 w-[650px] shadow-2xl relative z-[201] flex flex-col max-h-[85vh]">
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {lang === 'tr' ? 'Takip Edilen Kanallar' : 'Followed Channels'}
                        </h2>
                        <p className="text-sm text-gray-400 mb-4">
                            {lang === 'tr' ? 'Aşağıdaki kanallar Kick hesabınızdan bulundu. Eklemek istediklerinizi seçin.' : 'The following channels were found. Select the ones you want to add.'}
                        </p>

                        <div className="mb-4 px-4 py-3 bg-[#00E701]/10 rounded-xl border border-[#00E701]/20 flex items-start gap-3">
                            <Info className="w-5 h-5 text-[#00E701] shrink-0 mt-0.5" />
                            <p className="text-xs text-[#00E701]/90 leading-relaxed font-medium">
                                {lang === 'tr' 
                                    ? 'Kick altyapısı tüm takip ettiklerinizi tek seferde vermeyebilir. Eğer eksik yayıncı olduğunu düşünüyorsanız bu pencereyi kapatıp profilinize tıklayarak "Tekrar Tarama Yap" seçeneğini kullanın.' 
                                    : 'Kick may not return all followed channels at once. If you think some are missing, close this, click your profile and select "Check Again".'}
                            </p>
                        </div>
                        
                        {syncResults.length === 0 ? (
                            <div className="py-8 text-center text-gray-500">
                                {lang === 'tr' ? 'Yeni bir kanal bulunamadı veya hepsi zaten ekli.' : 'No new channels found or all are already added.'}
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-3 px-1">
                                    <span className="text-sm font-medium text-gray-400">
                                        <span className="text-[#00E701] font-bold">{selectedSyncStreamers.length}</span> / {syncResults.length} {lang === 'tr' ? 'seçildi' : 'selected'}
                                    </span>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setSelectedSyncStreamers(syncResults.map(s => s.slug))}
                                            className="text-xs font-bold bg-[#00E701]/10 hover:bg-[#00E701]/20 text-[#00E701] px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            {lang === 'tr' ? 'Tümünü Seç' : 'Select All'}
                                        </button>
                                        <button 
                                            onClick={() => setSelectedSyncStreamers([])}
                                            className="text-xs font-medium bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            {lang === 'tr' ? 'Hiçbiri' : 'Deselect All'}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pr-3 custom-scrollbar">
                                {syncResults.map(s => {
                                    const isSelected = selectedSyncStreamers.includes(s.slug);
                                    return (
                                        <div 
                                            key={s.slug} 
                                            onClick={() => {
                                                if (!isSelected) setSelectedSyncStreamers(p => [...p, s.slug]);
                                                else setSelectedSyncStreamers(p => p.filter(x => x !== s.slug));
                                            }}
                                            className={cn(
                                                "group relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl cursor-pointer transition-all border",
                                                isSelected 
                                                    ? "bg-[#00E701]/10 border-[#00E701]/30" 
                                                    : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10"
                                            )}
                                        >
                                            <div className="relative">
                                                <img 
                                                    src={s.profile_pic || 'https://kick.com/assets/images/avatar-default.webp'} 
                                                    onError={(e) => { 
                                                        e.currentTarget.onerror = null; 
                                                        e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + s.username + '&background=random'; 
                                                    }}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className={cn(
                                                        "w-12 h-12 rounded-full object-cover transition-transform group-hover:scale-105",
                                                        isSelected ? "ring-2 ring-[#00E701] ring-offset-2 ring-offset-[#1A1D20]" : "ring-1 ring-white/10"
                                                    )} 
                                                />
                                                {isSelected && (
                                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#00E701] rounded-full flex items-center justify-center shadow-sm">
                                                        <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </motion.svg>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <span className={cn(
                                                "text-[11px] font-bold text-center w-full truncate transition-colors",
                                                isSelected ? "text-white" : "text-gray-400 group-hover:text-white"
                                            )}>
                                                {s.username}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            </>
                        )}
                        
                        {syncResults.length > 0 && (
                            <div 
                                onClick={() => setAddMuted(!addMuted)}
                                className="flex items-center gap-3 mt-5 text-sm text-gray-400 hover:text-white cursor-pointer transition-colors w-fit mx-auto select-none bg-[#14171A] hover:bg-[#1A1D20] px-5 py-3.5 rounded-xl border border-white/5 shadow-sm"
                            >
                                <div className={cn(
                                    "w-10 h-5 rounded-full p-1 transition-colors duration-300 ease-in-out flex items-center relative",
                                    addMuted ? "bg-[#00E701]" : "bg-black/80"
                                )}>
                                    <div className={cn(
                                        "w-3 h-3 rounded-full bg-white transition-transform duration-300 ease-in-out shadow-sm absolute left-1",
                                        addMuted ? "translate-x-5" : "translate-x-0"
                                    )} />
                                </div>
                                <span className="font-medium">{lang === 'tr' ? 'Eklenenleri sessize al (Hızlı Tarama)' : 'Mute added streamers (Fast Scan)'}</span>
                            </div>
                        )}
                        
                        <div className="mt-6 flex gap-3 pt-5 border-t border-white/5">
                            <button 
                                onClick={() => setSyncResults(null)}
                                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                            >
                                {lang === 'tr' ? 'İptal' : 'Cancel'}
                            </button>
                            <button 
                                onClick={handleSyncSubmit}
                                disabled={isSyncing || syncResults.length === 0}
                                className="flex-1 py-2.5 rounded-xl bg-[#00E701] text-black font-bold hover:bg-[#00E701]/90 transition-colors disabled:opacity-50"
                            >
                                {isSyncing ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" /> : (lang === 'tr' ? `Seçilenleri Ekle (${selectedSyncStreamers.length})` : `Add Selected (${selectedSyncStreamers.length})`)}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            
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
                                onFocus={() => { if (searchSuggestions.length > 0) setShowSuggestions(true); }}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
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
                                {adding || isSearching ? <div className="w-4 h-4 border-2 border-[#00E701] border-t-transparent rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                            </button>
                        </div>
                        
                        <AnimatePresence>
                            {showSuggestions && searchSuggestions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="absolute bottom-full left-0 right-0 mb-2 bg-[#1A1D20] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100] max-h-48 overflow-y-auto custom-scrollbar"
                                >
                                    {searchSuggestions.map((s, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => {
                                                setNewSlug(s.slug);
                                                setShowSuggestions(false);
                                                executeAddStreamer(s.slug);
                                            }}
                                            className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                                        >
                                            <img 
                                                src={s.profile_pic || 'https://kick.com/assets/images/avatar-default.webp'} 
                                                onError={(e) => { 
                                                    e.currentTarget.onerror = null; 
                                                    e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + s.username + '&background=random'; 
                                                }}
                                                className="w-8 h-8 rounded-full bg-black object-cover" 
                                            />
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <span className="text-white font-bold truncate">{s.username}</span>
                                                <span className="text-xs text-gray-500 truncate">kick.com/{s.slug}</span>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
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

                    <div className="relative mb-2">
                        <button
                            onClick={() => {
                                if (kickProfile) {
                                    setShowProfileMenu(!showProfileMenu);
                                } else {
                                    setIsSyncing(true);
                                    window.ipcRenderer.send('kick-login-sync');
                                }
                            }}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 border transition-colors text-sm font-bold w-full rounded-xl",
                                kickProfile 
                                    ? "bg-white/5 hover:bg-white/10 border-white/10 text-white" 
                                    : "text-[#00E701] bg-[#00E701]/10 hover:bg-[#00E701]/20 border-[#00E701]/20"
                            )}
                        >
                            {kickProfile ? (
                                <>
                                <img 
                                    src={kickProfile.profile_pic || (kickProfile as any).profilePic || 'https://kick.com/assets/images/avatar-default.webp'} 
                                    onError={(e) => { 
                                        e.currentTarget.onerror = null; 
                                        e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + kickProfile.username + '&background=random'; 
                                    }}
                                    className="w-8 h-8 rounded-full bg-black object-cover shadow-sm border border-black/20" 
                                />
                                <div className="flex flex-col items-start leading-tight min-w-0">
                                        <span className="text-white truncate max-w-[120px] font-bold text-sm tracking-tight">{kickProfile.username}</span>
                                        <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                                            {lang === 'tr' ? 'Hesap Bağlandı' : 'Account Linked'} <ChevronDown className={cn("w-3 h-3 transition-transform", showProfileMenu && "rotate-180")} />
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-5 h-5" />
                                    {lang === 'tr' ? 'Kick Senkronizasyonu' : 'Kick Sync'}
                                </>
                            )}
                        </button>

                        <AnimatePresence>
                            {showProfileMenu && kickProfile && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute bottom-full left-0 right-0 mb-2 bg-[#1A1D20]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.5)] z-[100]"
                                >
                                    <button
                                        onClick={() => {
                                            setShowProfileMenu(false);
                                            setIsSyncing(true);
                                            window.ipcRenderer.send('kick-login-sync');
                                        }}
                                        className="w-full flex items-center gap-2 text-left px-4 py-3 text-sm transition-colors text-white hover:bg-white/10 border-b border-white/5 font-medium"
                                    >
                                        <RefreshCw className="w-4 h-4 text-[#00E701]" />
                                        {lang === 'tr' ? 'Tekrar Tarama Yap' : 'Check Again'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowProfileMenu(false);
                                            setKickProfile(null);
                                            window.ipcRenderer.invoke('get-settings').then(settings => {
                                                window.ipcRenderer.invoke('set-settings', { ...settings, kickProfile: null });
                                            });
                                            window.ipcRenderer.invoke('kick-logout');
                                        }}
                                        className="w-full flex items-center gap-2 text-left px-4 py-3 text-sm transition-colors text-red-400 hover:bg-red-500/10 font-medium"
                                    >
                                        <X className="w-4 h-4" />
                                        {lang === 'tr' ? 'Hesaptan Çıkış Yap' : 'Log Out'}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={() => setSettingsOpen(true)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white transition-colors text-sm font-medium w-full rounded-xl hover:bg-white/5"
                    >
                        <Settings className="w-5 h-5" />
                        {t(lang, 'settings')}
                    </button>
                </div>
            </div>

            
            <div className="flex-1 overflow-y-auto p-8 relative">
                
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
                            <StreamerCard
                                key={streamer.slug}
                                streamer={streamer}
                                lang={lang}
                                t={t}
                                handleOpenStream={handleOpenStream}
                                handleToggleMute={handleToggleMute}
                                streamerToDelete={streamerToDelete}
                                setStreamerToDelete={setStreamerToDelete}
                                handleRemove={handleRemove}
                            />
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

            <AnimatePresence>
                {isSyncing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B0E14]/80 backdrop-blur-sm"
                    >
                        <div className="flex flex-col items-center bg-[#191F28] p-8 rounded-2xl border border-white/5 shadow-2xl max-w-[300px] text-center">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-[#00E701]/20 rounded-full blur-xl animate-pulse"></div>
                                <RefreshCw className="w-12 h-12 text-[#00E701] animate-spin relative z-10" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">
                                {lang === 'tr' ? 'Takip Listeniz Taranıyor...' : 'Scanning Following List...'}
                            </h3>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                {lang === 'tr' 
                                    ? 'Bu işlem takip ettiğiniz kişi sayısına göre biraz sürebilir. Lütfen bekleyin.' 
                                    : 'This may take a while depending on how many people you follow. Please wait.'}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
