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
  <img width="992" height="693" alt="image" src="https://github.com/user-attachments/assets/2f1db52d-df22-4fbf-8d0a-628c21868024" />
</div>

<details>
<summary>Click to see more screenshots</summary>
<br>
  <img width="986" height="696" alt="image" src="https://github.com/user-attachments/assets/c6e499dc-a856-406c-a793-345e5ac01ef9" />
  <img width="404" height="909" alt="image" src="https://github.com/user-attachments/assets/6904045c-67b2-4e5d-97ee-1159163b3eb8" />
  <br />
  <img width="332" height="291" alt="image" src="https://github.com/user-attachments/assets/31fdad5c-0562-4973-8095-cc3abe0ade8e" /> 
  <img width="333" height="290" alt="image" src="https://github.com/user-attachments/assets/aa3380ee-8e52-46ee-848e-6ea331bb274c" /> 
  <img width="309" height="87" alt="image" src="https://github.com/user-attachments/assets/046b2243-a2f5-4f77-840e-dad37c4c529e" />
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
- [ ] Kick account integration to automatically sync followed channels
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
