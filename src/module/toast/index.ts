import { BrowserWindow } from 'electron';
import path from 'path'

function showToast(message: string, delay: number = 1500) {
  const toastWindow = new BrowserWindow({
    width: 200,
    height: 100,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  toastWindow.loadFile(path.join(TOAST_ROOR_PATH, 'toast.html'));
  
  // 向 toast.html 页面发送消息
  toastWindow.webContents.on('did-finish-load', () => {
    toastWindow.webContents.send('toast-message', message, delay);
  });
  
  setTimeout(() => {
    toastWindow.close();
  }, delay);
}

export default showToast