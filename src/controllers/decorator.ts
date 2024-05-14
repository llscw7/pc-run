import { iterationStep } from '../utils/tool';
import FileController from './file.controller';

/**
 * 遍历目录下的 quickLinkData_xxx.json 文件
 */
function QueryAllQuickLinkData() {
  return function decorator(target, name, descriptor) {
    const func = descriptor.value
    if(typeof func === 'function') {
      descriptor.value = function(...args) {
        const filePaths = iterationStep(QUICK_LINK_DATA_PATH)
        const file = new FileController()
        file.initQuickLinkDatabase()
        for(let pathname of filePaths) {
          const s = pathname.match(/quickLinkData_((.)*)\.json/)
          if(s) {
            const callback = func.apply(this, args)
            callback(pathname, s[1])
          }
        }
        return
      }
    }
    return descriptor
  }
}

function validateConfig() {
  return function decorator(target, name, descriptor) {
    const func = descriptor.value
    if(typeof func === 'function') {
      descriptor.value = function(...args) {
        const filePaths = iterationStep(QUICK_LINK_DATA_PATH)
        const file = new FileController()
        const flag = file.initQuickLinkDatabase()
        if(flag) {
          func.apply(this, args)
        }else {
          file.initQuickLinkDatabase()
          func.apply(this, args)
        }
      }
    }
    return descriptor
  }
}

export {
  QueryAllQuickLinkData,
  validateConfig
}