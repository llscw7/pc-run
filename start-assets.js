const express = require('express');
const multer = require('multer');
const path = require('path')
const fse = require('fs-extra')
const { accessSync, constants } = require('fs')
const { killPortProcess } = require('kill-port-process');
const detect = require('detect-port');
const bodyParser = require('body-parser')
const app = express();

fse.emptyDirSync('./assets_pc/cache')
fse.ensureDirSync('./assets_pc/cache')
fse.ensureDirSync('./assets_pc/images')

const port = 38435

// app.use("*",function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
//   res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
//   if (req.method === 'OPTIONS') {
//     res.send(200)
//   } else {
//     next()
//   }
// })

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(req.body, '9999', req.url, '---00', file)
    if(req.url === '/upload') {
      cb(null, 'assets_pc/cache')
    }
    // else if(req.url === '/submit') {
    //   cb(null, 'assets_pc/images')
    // }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + ext)
  }
})

const upload = multer({ storage: storage })

// const upload = multer({ dest: 'assets_pc/images' }); // 设置上传文件的目标目录

app.post('/upload', upload.single('image'), (req, res) => {
  // 处理上传的文件
  const file = req.file;
  // 进行文件处理或保存等操作
  // 返回响应
  res.json({ status: {message: '文件上传成功', code: 0}, result: {url: `http://localhost:38435/${file.filename}`, oldName: file.originalname, name: file.filename}});
});

var jsonParser = bodyParser.json()

app.post('/submit', jsonParser, (req, res) => {
  console.log(req.body,'??>>>>>>---===')
  const { data } = req.body
  if(data && data.images && data.images.length) {
    for(let img of data.images) {
      try {
        accessSync(`./assets_pc/cache/${img}`, constants.R_OK | constants.W_OK);
        fse.copyFileSync(`./assets_pc/cache/${img}`, `./assets_pc/images/${img}`)
        console.log(`上传成功：${img}`)
      } catch (err) {
        // console.error(`上传跳过：${img}`);
      } 
    }
  }
  res.json({ status: {message: 'success', code: 0}, result: data });
})

app.get('/allImage', (req, res) => {
  const files = fse.readdirSync('./assets_pc/images')
  const images = []
  if(files.length) {
    for(let v of files) {
      images.push(`http://localhost:38435/${v}`)
    }
  }
  console.log(images,'------')
  return res.json(images)
})

// 将指定目录下的文件作为静态资源提供给客户端
app.use(express.static('assets_pc/images'));
app.use(express.static('assets_pc/cache'));

detect(port)
.then(async (_port) => {
  if (port != _port) {
    await killPortProcess(port)
  }
  // 启动服务器
  app.listen(port, () => {
    console.log(`图片服务器已启动，http://localhost:${port}`);
  })
})
.catch(err => {
  console.error(`图片服务器启动失败：${err}`);
});
  