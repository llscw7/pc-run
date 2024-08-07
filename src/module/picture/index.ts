import { BrowserWindow, ipcMain } from 'electron';
import path from 'path'

let pictureWindow;

function showPicture(data: PicturePreviewData) {

    if(pictureWindow) {
      return
    }
  
    pictureWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        movable: true,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
        },
    });

    pictureWindow.loadFile(path.join(PICTURE_ROOR_PATH, 'picture.html'));
  
  if(pictureWindow?.webContents) {
    pictureWindow.webContents.on('did-finish-load', () => {
      pictureWindow.webContents.send('data', data);
    });
  }

  ipcMain.once('close-win', (event) => {
    pictureWindow.close()
    pictureWindow = null;
  })
  
}

export {
  showPicture
}