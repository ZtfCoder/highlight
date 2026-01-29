/// <reference types="vite/client" />


interface QueryInfo {
  active?: boolean;
  currentWindow?: boolean;
  url?: string | string[];
}

interface queryResult {
  id: string;
  url: string;
  title: string;
}

interface ChromeTabs {
  query: (queryInfo: QueryInfo, callback: (tabs: queryResult[]) => void) => void;
  sendMessage: (id:string,message: any, callback: (response: any) => void) => void;
}

interface ChromeStorageLocal {
  get: (keys: string[], callback?: (result: { [key: string]: any }) => void) => void;
  set: (items: { [key: string]: any }, callback?: () => void) => void;
}


interface HighlightItem {
  /** id  */
  id: string;
  /** 文字  */
  text: string;
  /** 背景颜色 */
  color: string;
  /** 文字颜色 */
  textColor:string
  /** 下划线 */
  isUnderline?: boolean;
  /** 波浪线 */
  isWavy?: boolean;
  /** 是否启用 */
  enabled: boolean;
}

interface HighlightGroup {
  id: string;
  name: string;
  enabled: boolean;
  items: HighlightItem[];
}

type PanelMode = 'edit' | 'createGroup' | 'editGroup' | 'importExport' | 'addHighlight' | 'empty';

declare interface Chrome {
  tabs: ChromeTabs;
  storage: {
    local: ChromeStorageLocal;
  };
}

declare const chrome: Chrome;

