import Datastore from 'nedb';
import path from 'path';
import fse from 'fs-extra'
import { Find, FindAll } from './decorator'
const root = DATABASE_PATH

class MyDatabase {
  tb_collect: Datastore<any>;
  tb_name: Datastore<any>;
  tb_list: Datastore<any>;

  constructor() {
    this.tb_collect = new Datastore(path.join(root, 'tb_collect.db'));
    this.tb_list = new Datastore(path.join(root, 'tb_list.db'));
    this.tb_name = new Datastore(path.join(root, 'tb_name.db'));
    this.tb_collect.loadDatabase();
    this.tb_list.loadDatabase();
    this.tb_name.loadDatabase();

    this.initData()
    // this.updatePathInAllTables(['img', 'banner'])
  }

  @Find('tb_name')
  initData() {
    return (docs: CollectItem[]) => {
      if (docs.length === 0) {
        const data = [
          { value: 'tb_list', name: '全部' },
          { value: 'tb_collect', name: '收藏夹' },
        ]
        this.tb_name.insert(data, (err, insertedData) => {
          if (err) {
            console.error('Error inserting data:', err);
          } else {
            console.log('Data inserted successfully');
            console.log('Inserted data:', insertedData);
          }
        });
      } else {
        docs.forEach(doc=>{
          const table = doc.value
          this[table] = new Datastore({filename: path.join(root, `${table}.db`), autoload: true});
        })
      }
    }
  }

  async createTable(tableName: string) {
    try {
      const res = await this.find('tb_name', 'name', tableName)
      if(res.length > 0) {
        console.error('表已存在');
        return false
      }
      const table = 'tb_' + Date.now()
      this[table] = new Datastore({filename: path.join(root, `${table}.db`), autoload: true});
      const status = await this.insertOne('tb_name', { value: table, name: tableName})
      return Boolean(status)
    }catch(err) {
      console.error(err)
      return  false
    }
  }

  find(table: string, key: string, value: string, options: Database.findOptions = {}): Promise<QuickLinkDataItem[]> {
    const regex = new RegExp(value, 'i');
    const { sort, skip, limit } = options;
  
    const query = this[table].find({ [key]: regex });
  
    if (sort) {
      query.sort(sort);
    }
  
    if (skip) {
      query.skip(skip);
    }
  
    if (limit) {
      query.limit(limit);
    }
  
    return new Promise((resolve, reject)=> {
      query.exec(function (err, docs) {
        if(err) console.error(err)
        resolve(docs)
      });
    }) 
  }

  findFirst(table: string): Promise<QuickLinkDataItem> {
    return new Promise((resolve, reject)=>{
      this[table].findOne({}, function (err, docs: QuickLinkDataItem) {
        if(err) console.error(err)
        return resolve(docs)
      });
    })
  }

  findAll(table: string, options: Database.findOptions = {}) {
    const { sort, skip, limit, rule } = options;
    if(!this[table]) return []
    const query = this[table].find(rule || {});
  
    if (sort) {
      query.sort(sort);
    }
  
    if (skip) {
      query.skip(skip);
    }
  
    if (limit) {
      query.limit(limit);
    }
  
    return new Promise((resolve, reject)=> {
      query.exec(function (err, docs) {
        if(err) console.error(err)
        resolve(docs)
      });
    }) 
  }

  async count(table: string): Promise<number> {
    try {
      const total = await new Promise<number>((resolve, reject)=>{
        this[table].count({}, function (err, count) {
          if(err) {
            return reject(err)
          }
          return resolve(count)
        })
      })
      return total;
    }catch(err) {
      console.error(err)
      return 0
    }
  }

  insertOne(table: string, data: object) {
    return new Promise((resolve, reject)=>{
      this[table].insert(data, function (err, newDoc) {
        if(err) console.error(err)
        return resolve(newDoc)
      });
    })
  }

  insert(table: string, data: Array<object>) {
    return new Promise((resolve, reject)=>{
      this[table].insert(data, function (err, newDocs) {
        if(err) console.error(err)
        return resolve(newDocs)
      });
    })
  }

  updateOne(table: string, id: string, rule: any) {
    return new Promise((resolve, reject)=>{
      this[table].update({ _id: id }, rule, {}, (err, numReplaced) => {
        if(err) console.error(err)
        console.log(`成功更新了 ${numReplaced} 条记录`);
        return resolve(numReplaced)
      });
    })
  }

  async updateAll(table: string, newData: any) {
    try{
      for(let data of newData) {
        await this.updateOne(table, data._id, data)
      }
      return true
    }catch(err) {
      console.error(err)
      return false
    }
  }

  @Find('tb_name')
  deleteOne(id: string) {
    return (docs: CollectItem[]) => {
      docs.forEach(async (doc: CollectItem)=>{
        const table = doc.value
        this.delete(table, id)
      })
    }
  }

  delete(table: string, id: string) {
    return new Promise((resolve, reject)=>{
      this[table].remove({ _id: id }, {}, function (err, numRemoved) {
        if(err) console.error(err)
        console.log(`成功删除了 ${numRemoved} 条记录`);
        return resolve(numRemoved)
      });
    })
  }

  deleteAll(table: string) {
    return new Promise((resolve, reject)=>{
      this[table].remove({}, { multi: true }, function (err, numRemoved) {
        console.log(`成功删除了 ${numRemoved} 条记录`);
        return resolve(numRemoved)
      });
    })
  }

  @FindAll()
  deleteClassify(id: string, tb_name: string) {
    return (docs: CollectItem[]) => {
      try {
        docs.forEach(async (item: CollectItem)=>{
          const table = item.value
          const arr = await this.findAll(table, {rule: {custom_col: tb_name}})
          if(Array.isArray(arr)) {
            for(let v of arr) {
              await this.updateOne(table, v._id, {$pull: { custom_col: tb_name }})
            }
          }
        })
        this.delete('tb_name', id)
        // TODO: 删除数据库文件
        return true;
      }catch(err) {
        console.error(err)
        return false
      }
    }
  }

  #updatePath(table: string, fieldName: string[], origin: string) {
    return new Promise((resolve, reject)=>{
      this[table].find({}, (err, docs: QuickLinkDataItem[]) => {
        if(err) console.error(err)
        
        docs.forEach((doc: QuickLinkDataItem) => {
          for(let v of fieldName) {
            doc[v] = pathFormat(doc[v], origin);
          }
          // 更新数据库记录
          this[table].update({ _id: doc._id }, doc, {}, (err, numReplaced) => {
            if(err) console.error(err)
      
            // console.log(`Updated ${numReplaced} record(s) in ${table}`);
            resolve(true)
          });
        });
      });
    })
  }

  @Find('tb_name')
  updatePathInAllTables(fieldName: string[]) {
    return (docs: CollectItem[]) => {
      docs.forEach(async (doc: CollectItem)=>{
        const table = doc.value
        const count = await this.count(table)
        if(count > 0) {
          const item = await this.findFirst(table)
          const c = path.dirname(item.img)
          const o = path.join(process.env.INIT_CWD, 'assets_pc', 'images')
          if(c !== o) {
            this.#updatePath(table, fieldName, o)
          }
        }
      })
    }
  }

  async collect(table: string, id: string) {
    try{
      const status = await new Promise((resolve, reject)=> {
        this.tb_list.findOne({_id: id}, async (err, doc) => {
          if(err) reject(err)
          const list = ['tb_list'].concat(doc.custom_col)
          for(let tb of list) {
            await this.updateOne(tb, id, {$push: { custom_col: table }})
          }
          doc.custom_col.push(table)
          await this.insertOne(table, doc)
          resolve(true)
        })
      })
      return status
    }catch(err) {
      console.error(err)
      return false;
    }
  }

  async cancelCollect(table: string, id: string) {
    try {
      const status = await new Promise((resolve, reject)=> {
        this.tb_list.find({_id: id}, async (err, docs) => {
          if(err) reject(err)
          const list = ['tb_list'].concat(docs.custom_col || [])
          for(let tb of list) {
            await this.updateOne(tb, id, {$pull: { custom_col: table }})
          }
          await this.delete(table, id)
          resolve(true)
        })
      })
      return status
    }catch(err) {
      console.error(err)
      return false
    }
  }

  async updateData(id: string, newData: QuickLinkDataItem) {
    try {
      // const img = newData.img
      // const banner = newData.banner
      // const origin = path.join(process.env.INIT_CWD, 'assets_pc', 'images')
      // newData.img = pathFormat(img, origin)
      // newData.banner = pathFormat(banner, origin)
      // fse.copyFileSync(img, newData.img)
      // fse.copyFileSync(banner, newData.banner)
      const list = ['tb_list'].concat(newData.custom_col || [])
      for(let tb of list) {
        await this.updateOne(tb, id, newData)
      }
      return true
    }catch(err) {
      console.error(err)
      return false
    }
  }

  /**
   * 老方案，走的fs迁移，已淘汰
   * @param id 
   * @param newData 
   * @returns 
   */
  async updateData_oldFunc(id: string, newData: QuickLinkDataItem) {
    try {
      const img = newData.img
      const banner = newData.banner
      const origin = path.join(process.env.INIT_CWD, 'assets_pc', 'images')
      newData.img = pathFormat(img, origin)
      newData.banner = pathFormat(banner, origin)
      fse.copyFileSync(img, newData.img)
      fse.copyFileSync(banner, newData.banner)
      const list = ['tb_list'].concat(newData.custom_col || [])
      for(let tb of list) {
        await this.updateOne(tb, id, newData)
      }
      return true
    }catch(err) {
      console.error(err)
      return false
    }
  }

  async insertData(newData: QuickLinkDataItem) {
    try {
      await this.insertOne('tb_list', newData)
      return true
    }catch(err) {
      console.error(err)
      return false
    }
  }

  /**
   * TODO: 需要对custom_col中的表进行处理，新建相关表，并将数据插入到对应的表中
   * @param filePath 
   * @returns 
   */
  async import(filePath: string) {
    try {
      const data = await fse.readJSON(filePath, {encoding: 'utf-8'})
      for(let item of data) {
        const table = item.tableName
        const rows = item.rows
        // 默认表存在重复注入问题，需要过滤重复数据
        if(table === 'tb_name') {
          const tmp = rows.filter(item=> (item.value !== 'tb_list') && (item.value !== 'tb_collect'))
          await this.insert(table, tmp)
        }
        else if(this[table]) {
          await this.insert(table, rows)
        }
        else {
          this[table] = new Datastore({filename: path.join(root, `${table}.db`), autoload: true});
          await this.insert(table, rows)
        }
      }
      
      return true
    }catch(err) {
      console.error(err)
      return false
    }
  }

  async export() {
    try {
      const arr = []
      const tables = await this.findAll('tb_name')
      if(Array.isArray(tables)) {
        for(let item of tables) {
          const table = item.value
          const rows = await this.findAll(table)
          const tmp = {
            tableName: table,
            rows: rows
          }
          arr.push(tmp)
        }
      }
      const rows = await this.findAll('tb_name')
      arr.push({
        tableName: 'tb_name',
        rows: rows
      })
      return arr
    }catch(err) {
      console.error(err)
      return []
    }
    
  }
}

function pathFormat(p: string, origin: string) {
  let name = '';
  if(process.platform !== 'win32') {
    if(p.includes(':\\')) {
      name = path.win32.basename(p)
    }else {
      name = path.basename(p)
    }
  }else {
    name = path.basename(p)
  }
  return path.join(origin, name)
}

export default MyDatabase;