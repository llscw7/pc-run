const concurrently = require('concurrently')
const path = require('path')
const fs = require('fs')
const logUtil = require('./util-log')

function preview() {
    return new Promise((resolve,reject)=>{
        const { result } = concurrently(
            [
                {
                    command: 'node webpack.config.js',
                    name: 'webpack',
                },
                // {
                //     command: `npm run start`,
                //     name: 'view',
                //     cwd: path.join(__dirname, 'pc-run-view'),
                // },
            ],
            {
                prefix: 'name',
                killOthers: ['failure', 'success'],
                restartTries: 3,
                prefixColors: ["cyanBright"]
            }
        )
        result.then((res)=>{
            logUtil.pass('webpack打包完成')
            resolve(true)
        },(err)=>{
            logUtil.error('webpack打包失败' + JSON.stringify(err))
            resolve(false)
        })
    })
}


function start() {
    const { result } = concurrently(
        [
            {
                command: 'electron .',
                name: 'electron',
                cwd: path.join(__dirname, 'dist'),
            },
            // {
            //     command: 'node index.js',
            //     name: 'python-capture',
            //     cwd: path.join(__dirname, 'assets_pc'),
            // }
        ],
        {
          prefix: 'name',
          killOthers: ['failure', 'success'],
        //   restartTries: 3,
          prefixColors: ["yellowBright"]
        }
    )
    result.then((res)=>{
        logUtil.pass('electron启动完成')
        // process.exit();
    },(err)=>{
        logUtil.error('electron启动失败')
        process.exit();
    })
}
preview().then(start)