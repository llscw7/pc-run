declare const QUICK_LINK_DATA_PATH: string;
declare const TOAST_ROOR_PATH: string;
declare const PICTURE_ROOR_PATH: string;
declare const CAPTURE_ROOT_PATH: string;
declare const PYTHON_PATH: string;
declare const ASSETS_PATH: string;
declare const VIEW_PATH: string;
declare const DATABASE_PATH: string;

interface QuickLinkData {
  [key: string]: {
    [key: string]: QuickLinkDataItem
  }
}

interface QuickLinkDataItem {
  id?: string;
  _id: string;
  title: string;
  img: string;
  factory: string;
  createTime: string;
  banner: string;
  about: string;
  startLink: string;
  src: string;
  tags: string[];
  title_cn: string;
  collect?: number;
  custom_col?: string[]
}

interface FileMessage {
  path: string,
  fName: string,
  cTime: Date,
  mTime: Date,
  content?: JSON,
  url?: string,
}

interface OptionData {
  default: (content: QuickLinkData, newData: QuickLinkDataItem) => QuickLinkData; 
  time: (content: QuickLinkData, newData: QuickLinkDataItem) => QuickLinkData; 
}

interface OptionCollect {
  default: (content: QuickLinkData, collect: number, newData?: QuickLinkDataItem) => QuickLinkData; 
  time: (content: QuickLinkData, collect: number, newData?: QuickLinkDataItem) => QuickLinkData; 
}

interface CollectItem {
  _id: string;
  value: string;
  name: string;
  sort?: number;
}

declare namespace Database {
  interface findOptions {
    sort?: object,
    skip?: number,
    limit?: number,
    rule?: object,
  }
}

declare namespace ResponseParam {
  interface status {
    code: number;
    message?: string;
  }
  
  interface getQuickLinkData {
    status: status,
    result: QuickLinkData,
  }

  interface getOneFileMessage {
    status: status;
    result?: FileMessage
  }

  interface getMoreFileMessage {
    status: status;
    result?: Array<FileMessage>
  }

  interface getDirMessage {
    status: status;
    result: string;
  }
}

interface PicturePreviewData {
  url: string;
  srcList: string[];
}