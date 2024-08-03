import { BrowserWindow } from 'electron';
import path from 'path'

/**
 * TODO: 无边框的窗口拖拽事件
 */

function showPicture(data: PicturePreviewData) {
  
    const pictureWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        movable: true,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
        },
        // alwaysOnTop: true,
    });

    pictureWindow.loadFile(path.join(PICTURE_ROOR_PATH, 'picture.html'));
  
    console.log(data,'----')
  // 向 toast.html 页面发送消息
  pictureWindow.webContents.on('did-finish-load', () => {
    pictureWindow.webContents.send('data', data);
  });
  
//   setTimeout(() => {
//     pictureWindow.close();
//   }, delay);
}

export {
  showPicture
}