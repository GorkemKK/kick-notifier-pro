<div align="center">
  <img src="public/logo.png" alt="Kick Notifier Pro Logo" width="120" />

  # Kick Notifier Pro
  
  *A premium, lightweight, and bilingual desktop application to track your favorite Kick streamers and get instant live notifications.*

  ![Electron](https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=Electron&logoColor=white)
  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
  ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
</div>

---

## Features

- **Instant Notifications:** Get native Windows toast notifications the second a streamer goes live.
- **Bilingual Support:** Fully localized in English and Turkish. Change the language instantly from settings.
- **Ultra Lightweight:** Built with a custom singleton queue architecture. It consumes minimal RAM and CPU, unlike other Electron wrappers.
- **Customizable Polling:** Choose how often the app checks for live status (1 to 15 minutes) using a sleek slider.
- **Smart Sounds:** Custom minimal sound effects for adding, removing, and live notifications.
- **Premium UI:** Glassmorphism, smooth micro-animations powered by Framer Motion, and a modern dark theme.
- **Background Running:** Closes to the system tray and runs silently in the background.

## Screenshots
<img width="997" height="696" alt="image" src="https://github.com/user-attachments/assets/09b18f3a-4604-4559-bd8d-a1f5c05daf7a" />
<img width="996" height="697" alt="image" src="https://github.com/user-attachments/assets/611f667a-da1f-42a1-b5e4-02b9813f6683" />
<img width="994" height="693" alt="image" src="https://github.com/user-attachments/assets/2ea5cb33-ee53-457e-b382-05126c23e74e" />
<img width="333" height="309" alt="image" src="https://github.com/user-attachments/assets/1e8bd3bd-4a8f-437c-8162-b7d064ded721" /> <img width="331" height="311" alt="image" src="https://github.com/user-attachments/assets/364a3004-23b5-4cb9-b81f-daf2b20e54e4" />

## Installation (For Users)

Check out the [Releases](../../releases) tab to download the latest `.exe` installer.

1. Download `Kick Notifier Pro Setup.exe`
2. Run the application.
3. Add your favorite Kick streamers by typing their username!

> [!NOTE]
> **Windows SmartScreen Warning**
> Since this is an open-source project without a paid code signing certificate, Windows Defender SmartScreen might show a blue warning saying "Windows protected your PC" on the first launch. Simply click **More info** -> **Run anyway**. This is completely normal for indie open-source apps.

## Development (For Developers)

If you want to contribute or build the app yourself, follow these steps:

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- Git

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/GorkemKK/kick-notifier-pro.git

# 2. Enter the directory
cd kick-notifier-pro

# 3. Install dependencies
npm install

# 4. Run in development mode
npm start
```

### Building for Production

To create the final Windows executable (`.exe`):

```bash
npm run build
```
The compiled setup file will be located inside the `release/` folder.

## Architecture Notes

This app is designed to be completely safe against out-of-memory (OOM) errors. It utilizes a **Singleton `BrowserWindow` Queue Mechanism** to fetch data from Kick's API securely without triggering Cloudflare blocks, all while reusing a single background window instance.

## License

This project is open-source and available for everyone. Feel free to fork, modify, and improve it!
