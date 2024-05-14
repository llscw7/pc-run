import fs from 'fs'
import BaseController from './base.controller'

class DataController extends BaseController {
  
  constructor(private readonly id?: string) { 
    super()
  }

  /**
   * 处理 quickLinkData_default.json 中数据；新增 ｜ 编辑
   * @param content -文件的整体数据
   * @param newData -新数据
   * @returns 
   */
  #defaultData(content: QuickLinkData, newData: QuickLinkDataItem) {
    if(content['default']) {
      content['default'][newData.id] = newData
    }else {
      content['default'] = {[newData.id]: newData}
    }
    return content
  }

  /**
   * 私有方法：新增
   * @param newData -新数据
   * @param pathname -数据存储文件路径
   * @param type -匹配类型
   */
  #create(newData: QuickLinkDataItem, pathname: string, type: string) {
    let content = JSON.parse(fs.readFileSync(pathname,{encoding: 'utf8'}) || '{}')
    const result = this.#defaultData(content, newData)
    fs.writeFileSync(pathname, JSON.stringify(result), {encoding: 'utf8'})
  }

  /**
   * 私有方法：更新
   * @param newData -新数据
   * @param pathname -数据存储文件路径
   * @param type -匹配类型
   * @returns 
   */
  #update(newData: QuickLinkDataItem, pathname: string, type: string) {
    let content = JSON.parse(fs.readFileSync(pathname,{encoding: 'utf8'}))
    const result = this.#defaultData(content, newData)
    fs.writeFileSync(pathname, JSON.stringify(result), {encoding: 'utf8'})
  }

  /**
   * 私有方法：删除
   * @param pathname -数据存储文件路径
   * @param id -新数据id
   */
  #delete(pathname: string, id: string) {
    const content = JSON.parse(fs.readFileSync(pathname,{encoding: 'utf8'}))
    let keys = Object.keys(content)
    for(let v of keys) {
      if(content[v][id]) {
        delete content[v][id]
        break;
      }
    }
    fs.writeFileSync(pathname, JSON.stringify(content), {encoding: 'utf8'})
  }

  /**
   * 公共方法：新增数据
   * @param newData 
   */
  addQuickLinkData(newData: QuickLinkDataItem) {
    this.queryAllQuickLinkData((pathname: string, type: string)=>{
      this.#create(newData, pathname, type)
    })
  }

  /**
   * 公共方法：更新数据
   * @param newData 
   */
  updateQuickLinkData(newData: QuickLinkDataItem) {
    this.queryAllQuickLinkData((pathname: string, type: string)=>{
      this.#update(newData, pathname, type)
    })
  }

  /**
   * 公共方法：删除
   */
  deleteQuickLinkData() {
    const self = this
    this.queryAllQuickLinkData((pathname: string)=> {
      this.#delete(pathname, self.id)
    })
  }
}

export default DataController