# pc-run
pc端程序管理器

## 
webpack 先将代码打包成对应文件，然后再通过electron启动程序？？？

接口存储默认数据？
  - 匹配
    - 根据接口中默认数据去对应文件夹匹配
      - 名称模糊匹配？？ ｜ 名称完整匹配？？
      - 模糊匹配如何处理？
        - 按两个字符进行拆分，再去对文件夹名称进行匹配，
        - 匹配时间过长、可能需要进度条，
    - 和接口中默认数据不一致的，手动更改程序启动链接

- 接口中默认数据获取？
  - 爬虫
    - puppeteer
      - 对于需要登录的页面，难以处理

- 分类目录自定义
   - 需要新增数据表
   - 保存 按照json文件导出进行保存

- 截图
  - 通过robotjs触发系统自带截图工具，win11下，截图完成后图片信息会保存在剪切板，node可以拿到
  - macos下需要screencapture，
    - 快捷键的截图不会保存在剪切板，不过它的保存目录和文件名称是可以预知的

## 已支持
- 支持分类目录的位置调整，可上下拖动，调整分类所在位置
- 删除分类
- 支持打开文件所在文件夹
- 顶部工具栏更新
- 主进程支持toast提示
- 详情页面支持多张图片
  - 数据编辑样式更新，要更加方便


## 待兼容
- 列表数据排序
  - 时间
  - 名称
  - 厂商

- 增加标签展示
  - 标签 筛选

- 项目内图片全部走http服务  

- 图片增加清除机制
  - 检测images下图片是否存在未被项目使用到的图片，提供一键清除能力

- quill图片大小可调整

## 较重需求
- 截图接入
  - windows端截图接入
  - mac端已完成
- 多列数据，样式完善
- 爬虫集成？？？

- 打包产物优化
  - 将图片存储目录放置到外部
  - 支持用户设置图片存储目录

通过服务器访问，可以抹平不同系统上图片路径访问问题

## 待定
- 接入可视化


markdown只接入文本编辑器， 
文件上传另起一个弹窗组件来控制，弹窗中展示assets_pc下的文件信息，用户可点击后，复制链接