import Datastore from 'nedb';

function Find(table: string, rule: any = {}) {
  return function decorator(target, name, descriptor) {
    const func = descriptor.value
    if(typeof func === 'function') {
      descriptor.value = function(...args) {
        this[table].find(rule).exec((err, docs)=>{
          if (err) {
            console.error(err);
          }
          const callback = func.apply(this, args)
          return callback(docs)
        })
        
      }
    }
    return descriptor
  }
}

function FindAll() {
  return function decorator(target, name, descriptor) {
    const func = descriptor.value
    if(typeof func === 'function') {
      descriptor.value = async function(...args) {
        const docs = await findTb(this['tb_name'])
        const callback = func.apply(this, args)
        return callback(docs)
      }
    }
    return descriptor
  }
}

const findTb = (db: Datastore<any>) => {
  return new Promise((resolve, reject) => {
    db.find({}).exec((err, docs)=>{
      if(err) {
        reject(err)
        return
      }
      resolve(docs)
      return 
    })
  })
}

export {
  Find,
  FindAll
}