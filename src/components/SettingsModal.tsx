import { useState, useEffect } from 'react';
import { X, Globe, RefreshCw, Play, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { t, Language } from '../locales';
import { cn } from '../utils/cn';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Settings {
    notificationsEnabled: boolean;
    soundEnabled: boolean;
    startAtLogin: boolean;
    checkInterval: number;
    language: Language;
    notificationStyle?: 'transient' | 'persistent';
    notificationSound?: string;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [soundDropdownOpen, setSoundDropdownOpen] = useState(false);
    const [settings, setSettings] = useState<Settings>({
        notificationsEnabled: true,
        soundEnabled: true,
        startAtLogin: false,
        checkInterval: 1,
        language: 'en',
        notificationStyle: 'transient',
        notificationSound: '1.mp3'
    });
    
    const [updateStatus, setUpdateStatus] = useState<string | null>(null);
    const [updateProgress, setUpdateProgress] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadSettings();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleAvailable = () => setUpdateStatus(settings.language === 'tr' ? 'Güncelleme bulundu. İndiriliyor...' : 'Update found. Downloading...');
        const handleNotAvailable = () => { setUpdateStatus(settings.language === 'tr' ? 'Uygulama güncel.' : 'App is up to date.'); setTimeout(() => setUpdateStatus(null), 3000); };
        const handleProgress = (e: any, prog: any) => setUpdateProgress(prog.percent);
        const handleDownloaded = () => { setUpdateStatus('Ready'); setUpdateProgress(null); };
        const handleError = (e: any, err: any) => {
            console.error('Update error:', err);
            const errStr = String(err);
            if (errStr.includes('latest.yml')) {
                setUpdateStatus(settings.language === 'tr' ? 'Hata: GitHub üzerinde latest.yml eksik!' : 'Error: latest.yml missing on GitHub!');
            } else if (errStr.includes('404')) {
                setUpdateStatus(settings.language === 'tr' ? 'Hata: Güncelleme dosyası (.exe) GitHub üzerinde bulunamadı!' : 'Error: Update file (.exe) not found on GitHub!');
            } else {
                setUpdateStatus(settings.language === 'tr' ? 'Güncelleme hatası oluştu.' : 'Update error occurred.');
            }
            setTimeout(() => setUpdateStatus(null), 5000);
        };

        window.ipcRenderer.on('update-available', handleAvailable);
        window.ipcRenderer.on('update-not-available', handleNotAvailable);
        window.ipcRenderer.on('download-progress', handleProgress);
        window.ipcRenderer.on('update-downloaded', handleDownloaded);
        window.ipcRenderer.on('update-error', handleError);

        return () => {
            window.ipcRenderer.off('update-available', handleAvailable);
            window.ipcRenderer.off('update-not-available', handleNotAvailable);
            window.ipcRenderer.off('download-progress', handleProgress);
            window.ipcRenderer.off('update-downloaded', handleDownloaded);
            window.ipcRenderer.off('update-error', handleError);
        }
    }, [settings.language]);

    const loadSettings = async () => {
        const stored = await window.ipcRenderer.invoke('get-settings');
        if (stored) {
            setSettings(prev => ({ ...prev, ...stored }));
        }
    }

    const saveSettings = async (newSettings: Settings) => {
        setSettings(newSettings);
        await window.ipcRenderer.invoke('set-settings', newSettings);
        // Refresh page to apply language change globally immediately if needed,
        // or let React state handle it if passed down (for this simple app, we just reload or rely on state)
    }

    const lang = settings.language;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-[100]">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-[#14171A]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 w-[800px] max-w-[95vw] shadow-2xl relative z-[101] flex flex-col max-h-[90vh]"
                    >
                        <div className="p-4 flex flex-col flex-1 min-h-0">
                            <div className="flex justify-between items-center mb-4 shrink-0">
                                <h2 className="text-xl font-bold text-white">{t(lang, 'settings')}</h2>
                                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors shrink-0">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2 flex-1 min-h-0 custom-scrollbar">
                                {/* Language Toggle */}
                                <label className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/5 cursor-pointer hover:border-[#00E701]/30 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <Globe className="w-5 h-5 text-gray-400 group-hover:text-[#00E701] transition-colors" />
                                        <div>
                                            <div className="font-medium text-white group-hover:text-[#00E701] transition-colors">{t(lang, 'language')}</div>
                                            <div className="text-xs text-gray-500">{t(lang, 'languageDesc')}</div>
                                        </div>
                                    </div>
                                    <div className="flex bg-gray-800 rounded-lg p-1">
                                        <button
                                            onClick={() => saveSettings({ ...settings, language: 'en' })}
                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${settings.language === 'en' ? 'bg-[#00E701] text-black' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            EN
                                        </button>
                                        <button
                                            onClick={() => saveSettings({ ...settings, language: 'tr' })}
                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${settings.language === 'tr' ? 'bg-[#00E701] text-black' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            TR
                                        </button>
                                    </div>
                                </label>

                                <label className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/5 cursor-pointer hover:border-[#00E701]/30 transition-colors group">
                                    <div>
                                        <div className="font-medium text-white group-hover:text-[#00E701] transition-colors">{t(lang, 'notifications')}</div>
                                        <div className="text-xs text-gray-500">{t(lang, 'notificationsDesc')}</div>
                                    </div>
                                    <div
                                        onClick={() => saveSettings({ ...settings, notificationsEnabled: !settings.notificationsEnabled })}
                                        className={`w-12 h-6 rounded-full relative transition-colors ${settings.notificationsEnabled ? 'bg-[#00E701]' : 'bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </div>
                                </label>

                                {settings.notificationsEnabled && (
                                    <label className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/5 cursor-pointer hover:border-[#00E701]/30 transition-colors group border-l-2 border-l-[#00E701]/30">
                                        <div className="pr-4">
                                            <div className="font-medium text-white group-hover:text-[#00E701] transition-colors">{t(lang, 'notifStyle')}</div>
                                            <div className="text-xs text-gray-500">{t(lang, 'notifStyleDesc')}</div>
                                        </div>
                                        <div className="flex flex-col gap-1 min-w-[140px]">
                                            <button
                                                onClick={() => saveSettings({ ...settings, notificationStyle: 'transient' })}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${settings.notificationStyle !== 'persistent' ? 'bg-[#00E701] text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                                            >
                                                {t(lang, 'styleTransient')}
                                            </button>
                                            <button
                                                onClick={() => saveSettings({ ...settings, notificationStyle: 'persistent' })}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${settings.notificationStyle === 'persistent' ? 'bg-[#00E701] text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                                            >
                                                {t(lang, 'stylePersistent')}
                                            </button>
                                        </div>
                                    </label>
                                )}

                                <label className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/5 cursor-pointer hover:border-[#00E701]/30 transition-colors group">
                                    <div>
                                        <div className="font-medium text-white group-hover:text-[#00E701] transition-colors">{t(lang, 'sound')}</div>
                                        <div className="text-xs text-gray-500">{t(lang, 'soundDesc')}</div>
                                    </div>
                                    <div
                                        onClick={() => saveSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
                                        className={`w-12 h-6 rounded-full relative transition-colors ${settings.soundEnabled ? 'bg-[#00E701]' : 'bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </div>
                                </label>

                                {settings.soundEnabled && (
                                    <div className={cn("flex items-center justify-between p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/5 group border-l-2 border-l-[#00E701]/30", soundDropdownOpen ? "relative z-50" : "")}>
                                        <div className="pr-4">
                                            <div className="font-medium text-white group-hover:text-[#00E701] transition-colors">{t(lang, 'notifSound')}</div>
                                            <div className="text-xs text-gray-500">{t(lang, 'notifSoundDesc')}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <button
                                                    onClick={() => setSoundDropdownOpen(!soundDropdownOpen)}
                                                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs rounded-md px-2 py-1.5 transition-all outline-none"
                                                >
                                                    {`Sound ${settings.notificationSound ? settings.notificationSound.replace('.mp3', '') : '1'}`}
                                                    <ChevronDown className={cn("w-3 h-3 transition-transform", soundDropdownOpen && "rotate-180")} />
                                                </button>
                                                <AnimatePresence>
                                                    {soundDropdownOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                                            className="absolute right-0 top-full mt-1 w-32 bg-[#1A1D20]/90 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.5)] z-[999]"
                                                        >
                                                            <div className="max-h-48 overflow-y-auto custom-scrollbar flex flex-col py-1">
                                                                {Array.from({ length: 10 }).map((_, i) => (
                                                                    <button
                                                                        key={i}
                                                                        onClick={() => {
                                                                            saveSettings({ ...settings, notificationSound: `${i + 1}.mp3` });
                                                                            setSoundDropdownOpen(false);
                                                                            const audio = new Audio(`assets/sounds/${i + 1}.mp3`);
                                                                            audio.play().catch(e => console.error("Error playing sound:", e));
                                                                        }}
                                                                        className={cn(
                                                                            "px-3 py-1.5 text-xs text-left transition-colors hover:bg-white/10",
                                                                            settings.notificationSound === `${i + 1}.mp3` ? "text-[#00E701] font-bold bg-white/5" : "text-gray-300"
                                                                        )}
                                                                    >
                                                                        Sound {i + 1}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const audio = new Audio(`assets/sounds/${settings.notificationSound || '1.mp3'}`);
                                                    audio.play().catch(e => console.error("Error playing sound:", e));
                                                }}
                                                className="p-1.5 bg-[#00E701]/10 text-[#00E701] hover:bg-[#00E701] hover:text-black rounded-md transition-colors flex items-center gap-1"
                                                title={t(lang, 'testSound')}
                                            >
                                                <Play className="w-4 h-4 fill-current" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <label className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/5 cursor-pointer hover:border-[#00E701]/30 transition-colors group">
                                    <div>
                                        <div className="font-medium text-white group-hover:text-[#00E701] transition-colors">{t(lang, 'startup')}</div>
                                        <div className="text-xs text-gray-500">{t(lang, 'startupDesc')}</div>
                                    </div>
                                    <div
                                        onClick={() => saveSettings({ ...settings, startAtLogin: !settings.startAtLogin })}
                                        className={`w-12 h-6 rounded-full relative transition-colors ${settings.startAtLogin ? 'bg-[#00E701]' : 'bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.startAtLogin ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </div>
                                </label>

                                {/* Check Interval */}
                                <div className="col-span-2 flex items-center justify-between p-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/5 hover:border-[#00E701]/30 transition-colors group">
                                    <div>
                                        <div className="font-medium text-white group-hover:text-[#00E701] transition-colors">{t(lang, 'checkInterval')}</div>
                                        <div className="text-xs text-gray-500">{t(lang, 'checkIntervalDesc')}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            min="1"
                                            max="60"
                                            value={settings.checkInterval}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                if (!isNaN(val) && val > 0) saveSettings({ ...settings, checkInterval: val });
                                            }}
                                            className="w-16 px-3 py-1.5 bg-black/50 border border-white/10 rounded-lg text-white text-center focus:outline-none focus:border-[#00E701]/50 transition-colors"
                                        />
                                        <span className="text-sm font-medium text-[#00E701]">{t(lang, 'minutes')}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-4 flex gap-3 pt-4 border-t border-white/5 shrink-0">
                                {updateStatus !== 'Ready' ? (
                                    <button
                                        onClick={() => window.ipcRenderer.send('check-for-updates')}
                                        className="flex-1 p-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw className={cn("w-4 h-4", updateStatus?.includes('ndiriliyor') || updateStatus?.includes('ownloading') ? "animate-spin text-[#00E701]" : "")} />
                                        {updateStatus || (lang === 'tr' ? 'Güncellemeleri Kontrol Et' : 'Check for Updates')}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => window.ipcRenderer.send('install-update')}
                                        className="w-full p-3 bg-[#00E701] hover:bg-[#00E701]/90 text-black rounded-xl transition-colors text-sm font-bold flex items-center justify-center gap-2 animate-pulse"
                                    >
                                        {lang === 'tr' ? 'Güncelle ve Yeniden Başlat' : 'Update & Restart'}
                                    </button>
                                )}
                                {updateProgress !== null && (
                                    <div className="mt-2 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#00E701] transition-all duration-300" style={{ width: `${updateProgress}%` }} />
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 text-center text-xs text-gray-600 shrink-0">
                                Kick Notifier Pro v1.1.8
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
