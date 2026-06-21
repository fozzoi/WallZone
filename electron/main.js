const { app, BrowserWindow, ipcMain, protocol, net } = require('electron');
const path = require('path');
const url = require('url');
const { exec } = require('child_process');
const fs = require('fs');
const https = require('https');
const os = require('os');

// Register privileged scheme for app protocol so it supports fetch, assets routing
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }
]);

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, '../assets/images/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Remove default window menu bar (File, Edit, View, Window)
  win.setMenu(null);

  // Block visual zoom level scaling
  win.webContents.on('did-finish-load', () => {
    win.webContents.setVisualZoomLevelLimits(1, 1);
  });

  // In development, load the local Next.js dev server
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    win.loadURL('http://localhost:3000');
    // Open the DevTools.
    win.webContents.openDevTools();
  } else {
    // In production, load the built static files via custom app:// protocol
    win.loadURL('app://app/index.html');
  }
}

// IPC handler to download and set wallpaper on Windows via PowerShell
ipcMain.handle('set-wallpaper', async (event, imageUrl) => {
  return new Promise((resolve, reject) => {
    try {
      const tempDir = os.tmpdir();
      const tempPath = path.join(tempDir, `wallzone_temp_${Date.now()}.jpg`);
      const file = fs.createWriteStream(tempPath);
      
      https.get(imageUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: status code ${response.statusCode}`));
          return;
        }
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close(() => {
            // PowerShell wrapper to execute Windows DLL SystemParametersInfo
            const psScript = `
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class Wallpaper {
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
"@
[Wallpaper]::SystemParametersInfo(20, 0, "${tempPath.replace(/\\/g, '\\\\')}", 3)
`;
            // Execute the powershell command
            const command = `powershell -NoProfile -ExecutionPolicy Bypass -Command "${psScript.replace(/\r?\n/g, ' ')}"`;
            exec(command, (error, stdout, stderr) => {
              if (error) {
                console.error('[PowerShell Error]', stderr || error.message);
                reject(error);
              } else {
                resolve(true);
              }
            });
          });
        });
      }).on('error', (err) => {
        console.error('[HTTP Download Error]', err);
        reject(err);
      });
    } catch (err) {
      console.error('[IPC Handler Error]', err);
      reject(err);
    }
  });
});

app.whenReady().then(() => {
  // Register custom protocol handler for serving Next.js build
  protocol.handle('app', (request) => {
    try {
      const parsedUrl = new URL(request.url);
      let pathname = parsedUrl.pathname;
      
      // Default to index.html for root path
      if (pathname === '/' || pathname === '') {
        pathname = '/index.html';
      }

      let filePath = path.join(__dirname, '../out', pathname);
      
      // Check if file exists, if not try appending .html (e.g. /discover -> /discover.html)
      if (!fs.existsSync(filePath)) {
        const htmlPath = filePath + '.html';
        if (fs.existsSync(htmlPath)) {
          filePath = htmlPath;
        } else {
          // Fallback to index.html for client-side routing
          filePath = path.join(__dirname, '../out/index.html');
        }
      }

      return net.fetch(url.pathToFileURL(filePath).toString());
    } catch (err) {
      console.error('[Protocol Handler Error]', err);
      // Fallback
      return net.fetch(url.pathToFileURL(path.join(__dirname, '../out/index.html')).toString());
    }
  });

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
