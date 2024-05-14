import { BrowserWindow, screen, globalShortcut, ipcMain } from 'electron';
import path from 'path'
// import Client from './capture.js'
import fse from 'fs-extra'
import toast from '../toast/index'
import WebSocket from 'ws';
var addon;
if(process.platform === 'win32') {

}else {
  addon = require('./screen_capture.node');
}

interface OKParams {
  x: number;
  y: number;
  width: number;
  height: number;
}
class Capture {
  wins: BrowserWindow[];
  source: string;
  constructor({source=""}) {
    this.wins = []
    this.source = source
    
    ipcMain.handle('capture-ok', (event, params: OKParams)=>{
      const point = screen.getCursorScreenPoint()
      console.log(point,'??>>>----')
      const d = screen.getDisplayNearestPoint(point)
      // console.log(d,'???nnbbbbb')
      const {x, y, width, height} = params
      // Client.SayHello({name: 'WORLD'}, function(err, response) {
      //   console.log('Greeting2:', response.message);
      // });
      console.log(x, y, width, height,'???;;;;---', typeof x)
      // Client.CaptureDesktop({x, y, width, height, target: `${Date.now()}.png`}, function(err, response) {
      //   if(err) console.log(err,'???--')
      //   console.log('Greeting1:', response);
      // });
      const res = addon.captureScreen(x,y,width,height)
      console.log(res,'???;;;;')
      if(res.code === 1) {
        const url = res.url
        const file = path.join(url, 'screenshot.png')
        if(fse.existsSync(file)) {
          const date = this.#formatTime(new Date())
          const target = path.join(ASSETS_PATH, `${date}.png`)
          fse.move(file, target, err => {
            if (err) return console.error(err)
            console.log('success!')
          })
          const result = {
            code: res.code,
            url: target,
          }
          this.sendMessage(result)
        }else {
          console.error('截图异常，未查询到图片文件')
        }
        this.close()
      }else {
        toast('截图失败！')
      }
      return { x, y }
    })

    ipcMain.handle('capture-close', (event)=> {
      this.close()
    })
  }
  capture() {
    const displays = screen.getAllDisplays()
    globalShortcut.register('Esc', ()=> {
      console.log('退出截屏')
      this.close()
    })

    // console.log(displays,'displays')
    
    for(let display of displays) {
      let win = new BrowserWindow({
        x: display.bounds.x,
        y: display.bounds.y,
        width: display.bounds.width,
        height: display.bounds.height,
        transparent : true,
        frame: false,
        skipTaskbar: true,
        autoHideMenuBar: true,
        movable: false,
        resizable: false,
        enableLargerThanScreen: true,
        hasShadow: false,
        webPreferences: {
          preload: path.join(CAPTURE_ROOT_PATH, 'preload.capture.js')
        }
      })
      win.loadFile(path.join(CAPTURE_ROOT_PATH, 'capture.html'));
      this.wins.push(win)
    }
  }
  close() {
    ipcMain.removeHandler('capture-ok')
    ipcMain.removeHandler('capture-close')
    globalShortcut.unregister('Esc')
    for(let win of this.wins) {
      win.close()
    }
    this.wins = []
  }
  sendMessage(params) {
    const ws = new WebSocket('ws://localhost:56743/capture');

    ws.on('error', console.error);

    ws.on('open', () => {
      params.source = this.source
      console.log(params,'???>>>>')
      ws.send(JSON.stringify(params));
    });

    ws.on('message', function message(data) {
      console.log('received: %s', data);
    });

    ws.on('close', () => {
      console.log('客户端已断开连接');
    });
  }
  #formatTime(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}

export default Capture