import { iterationStep } from '../utils/tool';
import { validateConfig } from './decorator'

class BaseController {
  constructor(){
    
  }
  /**
   * 遍历目录下的 quickLinkData_xxx.json 文件
   * @param {*} callback 
   */
  @validateConfig()
  queryAllQuickLinkData(callback: Function) {
    const filePaths = iterationStep(QUICK_LINK_DATA_PATH)
    for(let pathname of filePaths) {
      const s = pathname.match(/quickLinkData_((.)*)\.json/)
      if(s) {
        callback(pathname, s[1])
      }
    }
  }
}

export default BaseController