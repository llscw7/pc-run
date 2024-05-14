import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import {fileTypeFromFile} from 'file-type';
import network from '../api/network'

/**
 * 遍历目录--递归
 * @param {*} dir 
 * @param {*} callback 
 * @returns 
 */
function travel(dir: string, callback: Function) {
    let file = fs.readdirSync(dir,{encoding: 'utf8'})
    for(let i = 0; i < file.length; i++) {
        const pathname = path.join(dir, file[i])
        if(fs.statSync(pathname).isDirectory()) {
            travel(pathname, callback)
        }else if (fs.statSync(pathname).isFile()) {
            callback(i === file.length - 1, pathname)
        }
    }
}

// 如何判断递归函数执行完成 ？  监听结果数组变化 / 迭代？

// 迭代   先把文件夹都存入数组，再逐级遍历
/**
 * 遍历目录--迭代
 * 获取当前目录下的文件
 * @param {*} dir 
 */
function iterationStep(dir: string) {
    if(fs.statSync(dir).isFile()) {
        return dir
    }
    let arr = []
    let res = []
    let file = fs.readdirSync(dir,{encoding: 'utf8'})
    while(file.length || arr.length) {
        for(let i = 0; i < file.length; i++) {
            const pathname = path.resolve(dir, file[i])
            if(fs.statSync(pathname).isDirectory()) {
                arr.push(pathname)
            }else if (fs.statSync(pathname).isFile()) {
                res.push(pathname)
            }
        }
        dir = arr.pop()
        file = dir ? fs.readdirSync(dir,{encoding: 'utf8'}) : []
    }
    return res
}

function encodeByBase64(str: string) {
    return Buffer.from(str).toString('base64');
}
  
function decodeByBase64(str: string) {
    return Buffer.from(str,'base64').toString()
}

function encodeById(str: string) {
    // return `llscw_${encodeByBase64(str)}`
    return `llscw_${uuidv4()}`
}

function pathJoin(...args: string[]) {
    return path.join(...args)
}

function pathBasename(o: string, ext?: string) {
    if(o.includes(':\\')) {
        return path.win32.basename(o, ext)
    }
    return path.basename(o, ext)
}

function pathDirname(o: string) {
    if(o.includes(':\\')) {
        return path.win32.dirname(o)
    }
    return path.dirname(o)
}

function formatTime(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function uploadImage(path_img: string, name_img: string) {
    // 读取图片文件
    const imageBuffer = fs.readFileSync(path_img);
      
    const fileType = await fileTypeFromFile(path_img);

    const imageBlob = new Blob([imageBuffer], { type: fileType.mime });
    const formData = new FormData();
    
    formData.append('image', imageBlob, name_img);
    const data = await network.post('http://localhost:38435/upload', formData)

    return data
}

export {
    travel,
    iterationStep,
    encodeByBase64,
    decodeByBase64,
    encodeById,
    pathJoin,
    pathBasename,
    pathDirname,
    formatTime,
    uploadImage
}