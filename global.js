/**
 * 通过webpack注入全局变量
 */
const path = require('path')
const cwd = process.cwd()

// 卡片的数据 本地保存目录
const QUICK_LINK_DATA_PATH = path.join(cwd, 'dist')

const TOAST_ROOR_PATH = path.join(cwd, 'dist/toast')
const PICTURE_ROOR_PATH = path.join(cwd, 'dist/picture')
const CAPTURE_ROOT_PATH = path.join(cwd, 'dist/capture')
const VIEW_PATH = path.join(cwd, 'dist/view')
const PYTHON_PATH = path.join(cwd, 'external/python')
const ASSETS_PATH = path.join(cwd, 'assets_pc')
const DATABASE_PATH = path.join(cwd, 'dist/database')

module.exports = {
  QUICK_LINK_DATA_PATH: JSON.stringify(QUICK_LINK_DATA_PATH),
  TOAST_ROOR_PATH: JSON.stringify(TOAST_ROOR_PATH),
  PICTURE_ROOR_PATH: JSON.stringify(PICTURE_ROOR_PATH),
  CAPTURE_ROOT_PATH: JSON.stringify(CAPTURE_ROOT_PATH),
  VIEW_PATH: JSON.stringify(VIEW_PATH),
  PYTHON_PATH: JSON.stringify(PYTHON_PATH),
  ASSETS_PATH: JSON.stringify(ASSETS_PATH),
  DATABASE_PATH: JSON.stringify(DATABASE_PATH),
}