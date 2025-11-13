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
  id: string;
  text: string;
  color: string;
  textColor:string
  isUnderline: boolean;//下划线
  isWavy: boolean;//波浪线
}

declare interface Chrome {
  tabs: ChromeTabs;
  storage: {
    local: ChromeStorageLocal;
  };
}

declare const chrome: Chrome;

