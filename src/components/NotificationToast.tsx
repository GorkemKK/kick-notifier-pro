import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MonitorPlay, X } from 'lucide-react';

export default function NotificationToast() {
    const [notification, setNotification] = useState<{ title: string; body: string; icon: string } | null>(null);

    useEffect(() => {
        const handleData = (_event: any, data: any) => {
            setNotification(data);
        };
        
        // Listen for notification data from main process
        window.ipcRenderer.on('notification-data', handleData);
        
        // Let the main process know we are ready to receive data
        window.ipcRenderer.send('notification-ready');
        
        return () => {
            window.ipcRenderer.off('notification-data', handleData);
        };
    }, []);

    if (!notification) return null;

    return (
        <div className="flex h-screen w-screen bg-transparent p-2 overflow-hidden selection:bg-[#00E701] selection:text-black font-sans">
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, x: 50, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 50, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 w-full h-full shadow-2xl relative overflow-hidden flex items-center"
                    style={{ WebkitAppRegion: 'drag' } as any}
                >
                    {/* Glowing effect */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E701]/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    {/* Content */}
                    <div className="flex items-center gap-4 w-full z-10" style={{ WebkitAppRegion: 'no-drag' } as any}>
                        <div className="relative shrink-0">
                            <img 
                                src={notification.icon} 
                                alt="Avatar" 
                                className="w-14 h-14 rounded-full border-2 border-[#00E701] object-cover bg-gray-900" 
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <div className="absolute -bottom-1 -right-1 bg-[#00E701] rounded-md px-1.5 py-0.5 text-[9px] font-bold text-black border border-black uppercase tracking-wider">
                                LIVE
                            </div>
                        </div>

                        <div className="flex-1 min-w-0 pr-6">
                            <h3 className="text-white font-bold text-sm truncate">{notification.title}</h3>
                            <p className="text-gray-400 text-xs truncate mt-0.5 leading-snug">{notification.body}</p>
                        </div>
                    </div>

                    {/* Logo Watermark */}
                    <MonitorPlay className="absolute -bottom-2 -right-2 w-16 h-16 text-white/5 rotate-[-15deg] pointer-events-none z-0" />
                    
                    {/* Close Button (if persistent) */}
                    <button 
                        onClick={() => window.close()} 
                        className="absolute top-2 right-2 p-1 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors z-20"
                        style={{ WebkitAppRegion: 'no-drag' } as any}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
