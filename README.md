# WallZone Desktop Client 🌌

WallZone is a premium desktop wallpaper application built with **Next.js App Router**, **TypeScript**, and **Tailwind CSS/Vanilla CSS**, packaged as a native Windows desktop application using **Electron**. It interfaces with a custom wallpapers API backend to browse, search, and download high-resolution landscape wallpapers.

---

## ✨ Features

- **Glassmorphic Topbar & Global Search**: A sleek, horizontal top bar featuring a centered search box with smooth focus animations (expands from `280px` to `340px`) and debounced search parameter synchronization.
- **Dynamic Landscape Filtering**: Configured to query only high-resolution landscape wallpapers (width > height) for desktop displays, keeping layout integrity pristine.
- **Responsive Explore Carousel**: A large 16:9 featured wallpaper carousel with animated slide indicator dots that transition width and opacity on scroll or click.
- **Persistent Metadata & Interactive Hover States**: Wallpaper titles and uploaders are permanently visible on cards. Cards lift (`translateY(-4px)`), images zoom, and glass wrappers shift on hover.
- **Locked Visual Zoom**: The application blocks user zoom (e.g. `Ctrl` + mouse wheel, `Ctrl +/-`) to ensure the design remains visually consistent and pixel-perfect.
- **Fast Static Site Generation (SSG)**: Built using Next.js static exports (`out/`) and loaded via a custom privileged protocol (`app://`) in Electron for native-speed rendering.

---

## 🛠️ Tech Stack

- **Frontend Framework**: Next.js 14+ (App Router, Static Export)
- **Desktop Runtime**: Electron 30+
- **Styling**: Vanilla CSS (Global variables, glassmorphism, animations)
- **Language**: TypeScript
- **Bundler/Packager**: `electron-builder`

---

## 🚀 Get Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org) installed.

### 1. Install Dependencies

```bash
npm install
```

### 2. Run in Development Mode

To start the Next.js development server and open the Electron window simultaneously:

```bash
npm run dev
```

### 3. Build & Package (Windows Installer)

To compile the static Next.js pages and generate a production-ready `.exe` installer (NSIS-based):

```bash
# Compile Next.js to static out/ folder
npm run build

# Package using electron-builder
npm run dist
```

The compiled installer will be available at:
`dist/WallZone Setup 1.0.0.exe` (or `WallZone Setup 1.0.0 x86 .exe` depending on architecture settings).

---

## 📂 Project Structure

- `/app` — Next.js pages, routing, layouts, and global styling.
- `/components` — Reusable React UI elements (Topbar, Grid, Carousel, etc.).
- `/electron` — Electron main process (`main.js`) and preload script (`preload.js`).
- `/public` — Static assets (logo icons, local images).
- `/services` — API connection client and caching middleware.
- `/scripts` — Utility scripts for release packaging.

---

## 🔒 License

This project is licensed under the MIT License.
