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

##  Features

- **Auto-Updater System:** Built-in seamless background updating engine. Just click "Check for Updates" and watch the app upgrade itself effortlessly.
- **Glassmorphism UI & Sorting:** Next-gen animated, frosted-glass dropdown menu to sort your list by *Most Viewers*, *Least Viewers*, and *Most Followers*.
- **Verified Channel Badges:** Streamers officially verified on Kick get a glowing neon-green tick next to their names!
- **Instant Native Notifications:** Get native Windows toast notifications the second a streamer goes live.
- **Detailed Streamer Cards:** See live viewers, total followers, and dynamic game categories straight from the dashboard.
- **Bilingual Support:** Fully localized in English and Turkish. Change the language instantly from settings.
- **Ultra Lightweight Engine:** Built with a custom singleton queue architecture. It consumes minimal RAM and CPU, avoiding Cloudflare blocks.
- **Customizable Polling & Sounds:** Choose checking intervals (1 to 15 minutes) with a sleek slider, and enjoy minimal custom sound effects.
- **System Tray Integration:** Closes to the system tray and runs silently in the background so you never miss a stream.

##  Screenshots
<img width="992" height="693" alt="image" src="https://github.com/user-attachments/assets/2f1db52d-df22-4fbf-8d0a-628c21868024" />
<img width="986" height="696" alt="image" src="https://github.com/user-attachments/assets/c6e499dc-a856-406c-a793-345e5ac01ef9" />
<img width="404" height="909" alt="image" src="https://github.com/user-attachments/assets/6904045c-67b2-4e5d-97ee-1159163b3eb8" />
<img width="332" height="291" alt="image" src="https://github.com/user-attachments/assets/31fdad5c-0562-4973-8095-cc3abe0ade8e" /> <img width="333" height="290" alt="image" src="https://github.com/user-attachments/assets/aa3380ee-8e52-46ee-848e-6ea331bb274c" /> <img width="309" height="87" alt="image" src="https://github.com/user-attachments/assets/046b2243-a2f5-4f77-840e-dad37c4c529e" />






##  Installation (For Users)

Check out the [Releases](https://github.com/GorkemKK/kick-notifier-pro/releases) tab to download the latest `.exe` installer.

1. Download `Kick-Notifier-Pro-Setup.exe`
2. Run the application.
3. Add your favorite Kick streamers by typing their username!

> [!NOTE]
> **Windows SmartScreen Warning**
> Since this is an open-source project without a paid code signing certificate, Windows Defender SmartScreen might show a blue warning saying "Windows protected your PC" on the first launch. Simply click **More info** -> **Run anyway**. This is completely normal for indie open-source apps.

##  Development (For Developers)

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
npm run dev
```

### Building for Production

To create the final Windows executable (`.exe`):

```bash
npm run build
```
The compiled setup file will be located inside the `release/` folder.

##  Architecture Notes

This app is designed to be completely safe against out-of-memory (OOM) errors. It utilizes a **Singleton `BrowserWindow` Queue Mechanism** to fetch data from Kick's API securely without triggering Cloudflare blocks, all while reusing a single background window instance.

##  License

This project is open-source and available for everyone. Feel free to fork, modify, and improve it!
