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
  query: (
    queryInfo: QueryInfo,
    callback: (tabs: queryResult[]) => void
  ) => void;
  sendMessage: (
    id: string,
    message: any,
    callback: (response: any) => void
  ) => void;
}

interface ChromeStorageLocal {
  get: (
    keys: string[],
    callback?: (result: { [key: string]: any }) => void
  ) => void;
  set: (items: { [key: string]: any }, callback?: () => void) => void;
}

declare interface Chrome {
  tabs: ChromeTabs;
  storage: {
    local: ChromeStorageLocal;
  };
  runtime: {
    sendMessage: (
      message: any,
      callback?: (response: any) => void
    ) => void;
    onMessage: {
      addListener: (callback: (message: any, sender: any, sendResponse: (response: any) => void) => void) => boolean;
    };
  };
}

declare const chrome: Chrome;

interface HighlightItem {
  id: string;
  text: string;
  /** 背景颜色 */
  color: string;
  /** 文字颜色 */ 
  textColor:string
  /** 下划线  */
  isUnderline: boolean;
  /**  加粗 */
  isBold: boolean;
  /** 波浪线 */
  isWavy: boolean;
}


interface Window {
  CSS: {
    highlights: Map<string, Highlight>;
  };
}
