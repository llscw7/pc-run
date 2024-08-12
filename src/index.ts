import { app, BrowserWindow, ipcMain, shell, globalShortcut } from 'electron';
import { showContextMenu, setApplicationMenu } from './option';
import DialogController from './controllers/dialog.controller';
import DataController from './controllers/data.controller';
import FileController from './controllers/file.controller';
import { encodeById, pathJoin, pathBasename, pathDirname, uploadImage } from './utils/tool';
import Capture from './module/capture/index'
import { showPicture } from './module/picture/index'
import MyDatabase from './database/db'
import fse from 'fs-extra'
import path from 'path';
import WebSocket, { WebSocketServer } from 'ws';
import express from 'express'
import { glob } from 'glob'

let wss;

const se = express();

const staticPath = VIEW_PATH;
// 配置静态文件服务
se.use(express.static(staticPath));

const port = 54367;
se.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const db = new MyDatabase()

app.setName('llscw')

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    height: 400,
    width: 1000,
    webPreferences: {
      preload: path.join(__dirname, './preload.js'),
      webSecurity: false
    },
  });

  ipcMain.on('show-context-menu', (event) => showContextMenu(event))

  mainWindow.loadFile(path.join(__dirname, 'view/index.html'));
  // mainWindow.loadURL(`http://localhost:${port}`)

  // Open the DevTools.
  mainWindow.webContents.once('dom-ready', () => {
    mainWindow.webContents.openDevTools();
  });

  setApplicationMenu()

  // createWebSocketServer()

  // globalShortcut.register('Esc', ()=>{
  //   console.log('点击退出')
  // })
};

app.whenReady().then(()=>{

  /**
   * TODO: 目录树
   */
  ipcMain.handle('tools:readdir', async (event, dir) => {
    if(!dir) {
      if(process.platform === 'win32') {
        dir = process.env.SystemDrive + '\\'
      }else {
        dir = '/'
      }
    }
    console.log(dir,'----')
    
    const files = fse.readdirSync(dir)
    // const jsfiles = await glob('H:\\lesson/**', { ignore: 'node_modules/**' })
    console.log(files)

    /**区分 文件 与 目录 */
    const result = {file: [], dir: []}
    for(let f of files) {
      const p = path.join(dir, f)
      
      /**过滤系统文件 */
      if (p.includes('$RECYCLE.BIN')) {  
        console.log('访问被拒绝: 系统文件');  
        continue;
      }
      /**过滤系统文件 */

      try {
        const stat = fse.statSync(p)
        if(stat.isFile()) {
          result.file.push(f)
        }
        if(stat.isDirectory()) {
          result.dir.push(f)
        }
      }catch(err) {
        // 捕获权限错误  
        if (err.code === 'EPERM') {  
          console.error('错误: 没有权限访问该路径', p);  
        } else {  
          console.error('读取路径出错:', err);  
        }  
      }
    }
    /**区分 文件 与 目录 */

    return result
  })

  ipcMain.handle('dialog:selectImage', async ()=>{
    const dialog = new DialogController(['multiSelections', 'openFile'])
    let file = await dialog.handleFileOpen('image', 'file')
    if(file.result) {
      const src = (file.result as FileMessage).path
      const fName = (file.result as FileMessage).fName

      const data = await uploadImage(src, fName)
      return data
    }
    return {
      status: { message: '文件上传失败', code: -1 },     
      result: null
    }
  })

  ipcMain.handle('dialog:selectFile', async (event, type="all")=>{
    const dialog = new DialogController(['multiSelections', 'openFile'])
    let file = await dialog.handleFileOpen(type, 'file')
    return file
  })

  ipcMain.handle('action:getQuickLinkData', (event) => {
    let dir = path.join(QUICK_LINK_DATA_PATH,`./quickLinkData_default.json`)
    const file = new FileController()
    return file.getQuickLinkData(dir)
  })

  ipcMain.handle('action:deleteQuickLinkData', (event, id)=>{
    const data = new DataController(id)
    return data.deleteQuickLinkData()
  })

  ipcMain.handle('action:updateQuickLinkData', (event, id, newData)=>{
    const data = new DataController(id)
    return data.updateQuickLinkData(newData)
  })

  // ipcMain.handle('action:addQuickLinkData', (event, newData)=>{
  //   // TODO: 需要透出id加密方法到渲染层，在渲染层对newData进行数据处理
  //   const data = new DataController()
  //   return data.addQuickLinkData(newData)
  // })

  ipcMain.handle('tools:copy', (event, src, dest)=>{
    if(fse.existsSync(dest)) return
    return fse.copy(src, dest)
  })

  /**
   * 工具：加密，生成唯一id
   */
  ipcMain.handle('tools:encodeById', (event, id)=>{
    return encodeById(id)
  })

  ipcMain.handle('tools:pathJoin', (event, ...target) => {
    return pathJoin(...target)
  })

  ipcMain.handle('tools:pathBasename', (event, pathname, ext?: string)=>{
    return pathBasename(pathname, ext)
  })

  ipcMain.handle('tools:pathDirname', (event, pathname)=>{
    return pathDirname(pathname)
  })


  /**
   * 打开本地程序or文件
   */
  ipcMain.handle('action:open-app', async (event, link)=>{
    return shell.openPath(link)
  })

  ipcMain.handle('action:showItemInFolder', (event, link) => {
    return shell.showItemInFolder(link)
  })

  ipcMain.handle('action:showPicture', (event, data) => {
    showPicture(data)
  })

  ipcMain.handle('screen-capture', (event) => {
    // console.log('niahdlfahslkdf---', os.platform())
    // const capture = new Capture()
    // capture.capture()
    return true
  })

  ipcMain.handle('db:createTable', (event, tableName)=>{
    return db.createTable(tableName)
  })

  ipcMain.handle('db:find', (event, table, key, value, options: Database.findOptions)=>{
    return db.find(table, key, value, options)
  })

  ipcMain.handle('db:findAll', (event, table, options: Database.findOptions)=>{
    return db.findAll(table, options)
  })

  ipcMain.handle('db:insertOne', (event, table, data)=> {
    return db.insertOne(table, data)
  })

  ipcMain.handle('db:insert', (event, table, data)=> {
    return db.insert(table, data)
  })

  ipcMain.handle('db:insertData', (event, data)=> {
    return db.insertData(data)
  })

  ipcMain.handle('db:updateOne', (event, table, id, rule)=>{
    return db.updateOne(table, id, rule)
  })

  ipcMain.handle('db:updateAll', (event, table, data)=> {
    const newData = JSON.parse(data)
    return db.updateAll(table, newData)
  })

  ipcMain.handle('db:updateData', (event, id, newData)=>{
    return db.updateData(id, newData)
  })

  ipcMain.handle('db:deleteOne', (event, id)=>{
    return db.deleteOne(id)
  })

  ipcMain.handle('db:delete', (event, table, id)=>{
    return db.delete(table, id)
  })

  ipcMain.handle('db:deleteAll', (event, table)=>{
    return db.deleteAll(table)
  })

  ipcMain.handle('db:deleteClassify', (event, id, tb_name) => {
    return db.deleteClassify(id, tb_name)
  })

  ipcMain.handle('db:cancelCollect', async (event, table, id) => {
    return db.cancelCollect(table, id)
  })

  ipcMain.handle('db:collect', (event, table, id)=>{
    return db.collect(table, id)
  })

  ipcMain.on('db:import', (event, filePath)=>{
    return db.import(filePath)
  })

  ipcMain.handle('db:export', (event) => {
    return db.export()
  })

  createWindow()

  app.on('activate', () => {
    // 在 macOS 系统内, 如果没有已开启的应用窗口
    // 点击托盘图标时通常会重新创建一个新窗口
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if(wss) {
    wss.close((err) => {
      if (err) {
        console.error('关闭服务器时发生错误:', err);
      } else {
        console.log(`端口 56743 已关闭`);
      }
    });
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * 自主实现截图功能，c++调用系统api截图
 * TODO: win截图待完善，暂时搁置，优先采用方案二：系统截图，剪切板里拿数据
 * @returns 
 */
function createWebSocketServer() {
  wss = new WebSocketServer({ port: 56743});
  const clients = new Map();
  wss.on('connection', (ws, req) => {
    const url = req.url;
    console.log('客户端已连接', url);
    ws.on('message', (message)=>{
      const data = JSON.parse(message)
      if (data.clientId) {
        clients.set(data.clientId, ws);
      }
      ws.send('初始化完成')
    })

    const map = {
      '/capture': () => {
        ws.on('message', (data, isBinary) => {
          const client = clients.get('capture_view');
          if (client) {
            console.log(JSON.parse(data),'???----')
            client.send(data,{ binary: isBinary });
          }
        })
      },
      '/capture_view': () => {
        ws.on('message', (message, isBinary) => {
          const { data } = JSON.parse(message)
          const source = data?.source || ""
          console.log(source,'???---yyy',data)
          if(source) {
            const capture = new Capture({source: source})
            capture.capture()
          }
        })
      },
      'default': () => {

      }
    }

    typeof map[url] === 'function' ? map[url]() : map['default']()

    ws.on('close', () => {
      console.log('客户端已断开连接');
    });
  });
  return wss;
}
