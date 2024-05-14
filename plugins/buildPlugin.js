const {PluginBase, namedHookWithTaskFn} = require('@electron-forge/plugin-base')
const path = require('path')
const fse = require('fs-extra')
const cwd = process.cwd()

function iterationStep(dir) {
  if(fse.statSync(dir).isFile()) {
      return dir
  }
  let arr = []
  let res = []
  let file = fse.readdirSync(dir,{encoding: 'utf8'})
  while(file.length || arr.length) {
      for(let i = 0; i < file.length; i++) {
          const pathname = path.resolve(dir, file[i])
          if(fse.statSync(pathname).isDirectory()) {
              arr.push(pathname)
          }else if (fse.statSync(pathname).isFile()) {
              res.push(pathname)
          }
      }
      dir = arr.pop()
      file = dir ? fse.readdirSync(dir,{encoding: 'utf8'}) : []
  }
  return res
}

class BuildPlugin extends PluginBase {
  name = 'build';
  constructor(c) {
    super(c);

    this.getHooks = this.getHooks.bind(this);
  }

  getHooks() {
    return {
      prePackage: [
        // namedHookWithTaskFn(this.prePackage, '你好')  
      ],

      packageAfterCopy: (forgeConfig, ...args)=>{
        console.log(args,'????[[[[[')
      },

      postPackage: namedHookWithTaskFn((forgeConfig, options)=>{
        console.log('????---', options)
      }, '你好')
    };
  }
  
  prePackage(buildPath) {
    // let target = path.join(cwd, 'dist')
    // let out = path.join(cwd, 'out/electron-ts-darwin-arm64/electron-ts.app/Contents/Resources/app')
    // // fse.removeSync(out)
    // fse.copySync(target, out)
    console.log('running prePackage hook----000000', buildPath);
  }
}

module.exports = BuildPlugin