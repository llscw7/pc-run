const concurrently = require('concurrently')
const path = require('path')
const fs = require('fs')
const logUtil = require('./util-log')

const { result } = concurrently(
    [
        {
            command: `npm run start`,
            name: 'view',
            cwd: path.join(__dirname, 'pc-run-view'),
        },
    ],
    {
        prefix: 'name',
        killOthers: ['failure', 'success'],
        restartTries: 3,
        prefixColors: ["greenBright"]
    }
)
    
result.then((res)=>{
    logUtil.pass('视图进程启动成功')
    // process.exit();
},(err)=>{
    console.log('视图进程启动失败')
    process.exit();
})
