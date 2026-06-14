<div align="center">
  <img src="public/logo.png" alt="Kick Notifier Pro Logo" width="120" />

  # Kick Notifier Pro
  
  *Desktop application that monitors Kick streamers and sends instant native notifications when they go live.*

  [Download Latest Release](https://github.com/GorkemKK/kick-notifier-pro/releases/latest) | [Report Bug](https://github.com/GorkemKK/kick-notifier-pro/issues) | [Request Feature](https://github.com/GorkemKK/kick-notifier-pro/issues)

  <br />

  ![Electron](https://img.shields.io/badge/Electron-Desktop-191970?style=for-the-badge&logo=Electron&logoColor=white)
  ![Platform](https://img.shields.io/badge/Platform-Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white)
  ![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)
</div>

---

## Statistics & Highlights

- Built with **TypeScript**, **React 18** and **Electron**
- Native Windows desktop notifications
- Background auto-update system
- Concurrent Web Worker Pool architecture for blazingly fast API polling

---

## Why?

Many Kick users miss streams from their favorite creators because they either forget to check or don't want to rely on bloated browser extensions. 

**Kick Notifier Pro** was built to solve this problem. It provides lightweight, real-time desktop notifications without requiring a browser to be open. It sits quietly in your system tray and alerts you the exact moment your favorite streamer goes live.

---

## Features

| Feature | Status |
| :--- | :---: |
| **Live Stream Detection** | ✅ |
| **Native Windows Desktop Notifications** | ✅ |
| **Custom Notification Sounds** | ✅ |
| **Auto-Updater System (Background)** | ✅ |
| **System Tray Integration** | ✅ |
| **Glassmorphism UI & Dynamic Sorting** | ✅ |
| **Precise Custom Polling Intervals** | ✅ |
| **Verified Channel Badges & Follower Counts** | ✅ |
| **Kick Account Synchronization** | ✅ |
| **Live Search Auto-Suggestions** | ✅ |
| **Streamer Muting & Memory List** | ✅ |
| **Bilingual Support** | EN / TR |

---

## Download

Get the latest version and start tracking your favorite streamers immediately!

[**Download Latest Windows Release (.exe)**](https://github.com/GorkemKK/kick-notifier-pro/releases/latest)

> [!NOTE]
> **Windows SmartScreen Warning**
> Since this is an open-source project without a paid code signing certificate, Windows Defender SmartScreen might show a blue warning saying "Windows protected your PC" on the first launch. Simply click **More info** -> **Run anyway**. This is completely normal for indie open-source apps.

---

## Screenshots

<div align="center">
  <img width="986" height="686" alt="image" src="https://github.com/user-attachments/assets/0b73f43d-7e9f-4cb2-a199-b6cdeee2534b" />
</div>

<details>
<summary>Click to see more screenshots</summary>
<br>
  <img width="990" height="689" alt="image" src="https://github.com/user-attachments/assets/219dc7ce-89e4-4cc6-a180-4d5fc4659362" />
  <img width="989" height="686" alt="image" src="https://github.com/user-attachments/assets/ae23fbbc-c6cd-4e20-8657-f773aca0e354" />
  <img width="991" height="695" alt="image" src="https://github.com/user-attachments/assets/abaa5a3e-eff4-457d-bb39-d152abf070df" /> 
  <img width="994" height="689" alt="image" src="https://github.com/user-attachments/assets/9091fc3d-721a-4fcd-963e-fe9d9c41e0e5" />
  <br />
  <img width="315" height="276" alt="image" src="https://github.com/user-attachments/assets/e4e9254c-3a32-4a33-ad96-4d077303d948" />
  <img width="338" height="302" alt="image" src="https://github.com/user-attachments/assets/9bf9cf43-91e3-4f19-b002-4b5b399465c4" />
  <img width="241" height="368" alt="image" src="https://github.com/user-attachments/assets/2733b04f-f8b3-4378-82cd-34b7f8207ad3" />
  <img width="227" height="155" alt="image" src="https://github.com/user-attachments/assets/124abc33-60ad-4e8d-9738-2714ea6f2130" />
  <img width="309" height="86" alt="image" src="https://github.com/user-attachments/assets/4427d4b1-64c5-4827-902c-3a90368cc103" />
</details>

---

## Architecture

The app uses a **Concurrent Web Worker Pool Mechanism** to fetch data from Kick's API securely without triggering Cloudflare blocks, while reusing a limited pool of background windows to prevent out-of-memory (OOM) errors and drastically speed up synchronization.

```mermaid
graph TD;
    Kick_API[Kick.com API] --> |Fetches Status| Background_Window[Hidden Electron Window];
    Background_Window --> |Parses JSON| Main_Process[Electron Main Process];
    Main_Process --> |Checks Rules| Notification_Engine[Native Windows Toast];
    Main_Process --> |Sends IPC| React_UI[React / Vite Frontend];
```

---

## Tech Stack

**Frontend:**
- HTML, CSS, TypeScript
- React 18
- TailwindCSS (Styling)
- Framer Motion (Animations)

**Desktop Core:**
- Electron
- Node.js

**Build & Deployment:**
- Vite
- Electron-Builder
- Electron-Updater

---

## Project Structure

```text
kick-notifier-pro/
├── electron/
│   ├── main.ts        # Main Electron process & Auto-Updater
│   └── preload.ts     # IPC bridge
├── public/
│   └── assets/        # Icons and sounds
├── src/
│   ├── components/    # React components (Modals, Toasts)
│   ├── App.tsx        # Main React Entry
│   └── index.css      # Tailwind config & styling
└── package.json       # Dependencies & Build config
```

---

## Roadmap

- [x] Initial release with stream monitoring
- [x] Glassmorphism UI & sorting features
- [x] Auto-updater background engine
- [x] Verified channel badges & follower counts
- [x] Launch on startup option
- [x] Kick account integration to automatically sync followed channels
- [ ] Notification history log
- [ ] Discord Webhook support for automatic server announcements
- [ ] Cross-platform support (macOS & Linux binaries)

---

## Development (For Developers)

Want to build it yourself? 

```bash
# 1. Clone the repository
git clone https://github.com/GorkemKK/kick-notifier-pro.git

# 2. Install dependencies
npm install

# 3. Run in development mode
npm run dev

# 4. Build executable
npm run build
```

---

## License

This project is open-source and available under the [MIT License](LICENSE). Feel free to fork, modify, and improve it!
