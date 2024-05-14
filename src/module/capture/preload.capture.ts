import { contextBridge, ipcRenderer } from 'electron'


// window.addEventListener('click', () => {
//   ipcRenderer.invoke('capture-ok').then(res=>{
//     console.log(res,'???>>><<<')
//   })
// })

contextBridge.exposeInMainWorld('electronAPI', {
  captureOk: (x: number, y: number, width: number, height: number) => ipcRenderer.invoke('capture-ok', { x, y, width, height }),
  captureClose: () => ipcRenderer.invoke('capture-close')
})