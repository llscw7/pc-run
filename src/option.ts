import { app, Menu, BrowserWindow, MenuItemConstructorOptions, MenuItem, PopupOptions, clipboard } from 'electron'
import toast from './module/toast/index'

/**
 * 鼠标右键菜单栏
 * @param {*} event 
 * {https://www.electronjs.org/zh/docs/latest/api/structures/ipc-main-event
 *  sender 网络会议 - 返回发送消息的 webContents
 * }
 */
function showContextMenu(event: Electron.IpcMainEvent) {
  const template: (MenuItemConstructorOptions | MenuItem)[] = [
    {
      label: '重新加载',
      click: () => {
        event.sender.reload()
      }
    },
    {
      label: '返回',
      click: () => {
        if(event.sender.canGoBack()) {
          event.sender.goBack()
        }
      }
    },
    { label: 'Menu Item 2', type: 'checkbox', checked: true }
  ]
  const menu = Menu.buildFromTemplate(template)
  menu.popup(BrowserWindow.fromWebContents(event.sender) as PopupOptions)
}

function setApplicationMenu() {
  const template: (MenuItemConstructorOptions | MenuItem)[] = [
    {
      label: app.name,
      submenu: [
        { role: 'about', label: `关于 ${app.name}` },
        { type: 'separator' },
        { role: 'quit', label: `退出 ${app.name}` }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '恢复' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { type: 'separator' },
        { role: 'selectAll', label: '全选' }
      ]
    },
    {
      label: '查看',
      submenu: [
        { role: 'reload', label: '刷新' },
        { role: 'forceReload', label: '强制刷新' },
        { type: 'separator' },
        { role: 'resetZoom', label: '重置' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '缩小' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全屏' },
      ]
    },
    {
      label: '窗口',
      submenu: [
        { role: 'minimize', label: '最小化' },
        { role: 'zoom', label: '缩放' },
      ]
    },
    {
      role: 'help',
      label: '帮助',
      submenu: [
        {
          label: '联系我们',
          click: async () => {
            clipboard.writeText('123456789')
            toast('复制成功')
          }
        },
        { role: 'toggleDevTools', label: '切换开发人员工具'}
      ]
    }
  ]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

export {
  showContextMenu,
  setApplicationMenu
}