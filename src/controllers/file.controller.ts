import path from 'path';
import fse from 'fs-extra'

class FileController {
  constructor() {

  }

  getQuickLinkData(dir: string) {
    fse.ensureFileSync(dir)
    const fileData = fse.readJSONSync(dir)
    return fileData
  }

  initQuickLinkDatabase() {
    const list = ['default']
    try {
      for(let v of list) {
        let dir = path.join(QUICK_LINK_DATA_PATH, `quickLinkData_${v}.json`)
        fse.ensureFileSync(dir)
      }
      return true
    }catch(err) {
      console.error('初始化数据存储文件异常: ', err)
      return false
    }
  }
}

export default FileController