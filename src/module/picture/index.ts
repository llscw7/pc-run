import { BrowserWindow } from 'electron';
import path from 'path'

/**
 * TODO: 无边框的窗口拖拽事件
 */

function showPicture() {
  
    const pictureWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        movable: true,
        // alwaysOnTop: true,
    });

    pictureWindow.loadFile(path.join(PICTURE_ROOR_PATH, 'picture.html'));
  
  // 向 toast.html 页面发送消息
//   pictureWindow.webContents.on('did-finish-load', () => {
//     pictureWindow.webContents.send('toast-message', message, delay);
//   });
  
//   setTimeout(() => {
//     pictureWindow.close();
//   }, delay);
}

export default showPicture