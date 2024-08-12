import { contextBridge, ipcRenderer } from 'electron'
import download from 'downloadjs'

/**
 * 显示鼠标右键菜单
 */
window.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  ipcRenderer.send('show-context-menu')
})

window.addEventListener('click', () => {
  // ipcRenderer.invoke('screen-capture')
})

contextBridge.exposeInMainWorld('electronAPI', {

  exportDatabase: async () => {
    const data = await ipcRenderer.invoke('db:export')
    download(new Blob([JSON.stringify(data)]), "database-export.json", "application/json;charset=utf-8")
  },

  importDatabase: (file: File) => ipcRenderer.send('db:import', file.path),

  /**分类操作 */
  createTable: async (tableName: string, schema: string) => {
    return ipcRenderer.invoke('db:createTable', tableName)
  },

  getClassify: () => ipcRenderer.invoke('db:findAll', 'tb_name', {sort: {sort: 1}}),

  updateClassify: (table: string, data: string) => ipcRenderer.invoke('db:updateAll', table, data),

  deleteClassify: (id: string, tb_name: string) => ipcRenderer.invoke('db:deleteClassify', id, tb_name),
  /**分类操作 */
  
  getCollectList: () => ipcRenderer.invoke('db:findAll', 'tb_name', {rule: { $not: {value: 'tb_list'}}}),

  openApp: (link: string) => ipcRenderer.invoke('action:open-app', link),
  getQuickLinkData: async (table: string = 'tb_list', sort: string)=>{
    const data = await ipcRenderer.invoke('db:findAll', table, {sort: {createTime: -1}})
    return {
      status: {
        code: 0,
      },
      result: data
    }
  },
  deleteQuickLinkData: (id: string) => ipcRenderer.invoke('db:deleteOne', id),
  cancelCollect: async (id: string, table: string) => ipcRenderer.invoke('db:cancelCollect', table, id),
  collect: async (id: string, table: string) => ipcRenderer.invoke('db:collect', table, id),
  updateQuickLinkData: async (id: string, newData: string) => {
    const _newData = JSON.parse(newData)
    console.log('你好呀',_newData)
    return ipcRenderer.invoke('db:updateData', id, _newData)
  },
  searchQuickLinkData: async (keywords: string) => {
    const data = await ipcRenderer.invoke('db:find', 'tb_list', 'title_cn', keywords)

    return {
      status: {
        code: 0,
      },
      result: data
    }
  },
  capture: () => ipcRenderer.invoke('screen-capture'),
  selectImage: () => ipcRenderer.invoke('dialog:selectImage'),
  selectFile: () => ipcRenderer.invoke('dialog:selectFile'),
  pathBasename: (pathname: string, ext?: string) => ipcRenderer.invoke('tools:pathBasename', pathname, ext),
  encodeById: (id: string) => ipcRenderer.invoke('tools:encodeById', id),
  pathJoin: (...target: string[]) => ipcRenderer.invoke('tools:pathJoin', ...target),
  addQuickLinkData: (newData: string) => {
    const _newData = JSON.parse(newData)
    return ipcRenderer.invoke('db:insertData', _newData)
  },
  showItemInFolder: (link: string) => ipcRenderer.invoke('action:showItemInFolder', link),
  previewPicture: (data: PicturePreviewData) => ipcRenderer.invoke('action:showPicture', data),
  readdir: (pathname: string) => ipcRenderer.invoke('tools:readdir', pathname),
})