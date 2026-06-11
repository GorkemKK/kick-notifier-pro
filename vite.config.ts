import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [
        react(),
    ],
    base: './', // Göreceli yollar
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
    server: {
        port: 5185,
        strictPort: true,
    }
})
