import { dialog } from 'electron';
import {fileTypeFromFile} from 'file-type';
import { iterationStep, encodeById } from '../utils/tool';
import fs from 'fs';
import fse from 'fs-extra';
import path from 'path'

function formatTime(time: Date) {
  try {
    return (new Date(time)).getFullYear()
  }catch(err) {
    console.log('时间格式化异常：', err)
    return null
  }
}

class DialogController {
  constructor(private readonly properties: Array<any>=['multiSelections', 'openFile', 'openDirectory']) {}

  /**
   * 
   * @param {*} pathname 
   * @param {string} selfFileType -文件类型  all: 任何文件 ｜ exe ｜ image
   * @returns 
   */
  async #getOneFileMessage(pathname: string, selfFileType: string): Promise<ResponseParam.getOneFileMessage> {
    if(selfFileType === 'all') {
      return {
        status: {
          code: 0
        },
        result: {
          path: pathname,
          fName: path.basename(pathname),
          cTime: fs.statSync(pathname).ctime,
          mTime: fs.statSync(pathname).mtime
        }
      }
    }
    let type = await fileTypeFromFile(pathname)
    if(type?.mime?.includes(selfFileType) || type?.ext === selfFileType) {
      return {
        status: {
          code: 0
        },
        result: {
          path: pathname,
          fName: path.basename(pathname),
          cTime: fs.statSync(pathname).ctime,
          mTime: fs.statSync(pathname).mtime
        }
      }
    }else {
      // 提示：请选择正确的文件
      return {
        status: {
          code: -1,
          message: '所选文件类型错误，请重新选择'
        },
        result: null
      }
    }
  }

  /**
   * 
   * @param {*} pathname 
   * @param {string} selfFileType -文件类型  exe ｜ image
   * @returns 
   */
  async #getMoreFileMessage(pathname: string, selfFileType: string): Promise<ResponseParam.getMoreFileMessage> {
    // TODO: 同一个文件夹下，程序&图片 加载？
    const filePaths = iterationStep(pathname)
    const selfFiles = []

    for(let item of filePaths) {
      let type = await fileTypeFromFile(item)
      if(type?.mime?.includes(selfFileType) || type?.ext === selfFileType) {
        selfFiles.push({
          path: item,
          fName: path.basename(pathname),
          cTime: fs.statSync(item).ctime,
          mTime: fs.statSync(item).mtime,
        })
      }
    }
    return {
      status: {
        code: 0
      },
      result: selfFiles
    }
  }

  /**
   * 
   * @param {*} pathname 
   * @param {string} selfFileType -文件类型  exe ｜ image
   * @returns 
   */
  async #getDirMessage(pathname: string): Promise<ResponseParam.getDirMessage> {
    return {
      status: {
        code: 0
      },
      result: pathname
    }
  }

  /**
   * 唤起系统文件选择弹窗
   * @param selfFileType -文件类型
   * @param type -文件or目录 file | dir
   * @returns 
   */
  async handleFileOpen(selfFileType:string, type: string): Promise<ResponseParam.getMoreFileMessage | ResponseParam.getOneFileMessage | ResponseParam.getDirMessage> {
    let { filePaths: dir, canceled } = await dialog.showOpenDialog({ properties: this.properties})
    if(canceled) {
      return {
        status: {
          code: 0,
        },
        result: null
      }
    }
    const pathname = dir[0]
    if(type === 'file') {
      return this.#getOneFileMessage(pathname, selfFileType)
    }else if (type === 'dir') {
      return this.#getMoreFileMessage(pathname, selfFileType)
      // return this.#getDirMessage(pathname, selfFileType)
    }
    return {
      status: {
        code: 0,
      },
      result: null
    }
  }

  /**
   * 唤起系统目录选择弹窗
   * @param selfFileType -文件类型
   * @param type -文件or目录 file | dir
   * @returns 
   */
  async handleDirOpen(): Promise<ResponseParam.getDirMessage> {
    let { filePaths: dir, canceled } = await dialog.showOpenDialog({ properties: this.properties})
    const pathname = dir[0]
    return this.#getDirMessage(pathname)
  }

}

export default DialogController