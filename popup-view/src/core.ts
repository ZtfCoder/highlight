
const getStorage = (key: string): Promise<any> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
       resolve(result[key]);
    });
  });
}

const setStorage = (key: string, value: Record<string, any>): Promise<void> => {
  return new Promise((resolve) => {
    const items: Record<string, any> = {};
    items[key] = value;
    chrome.storage.local.set(items, () => {
      resolve();
    });
  });
}

const tabsQuery = (queryInfo: QueryInfo): Promise<queryResult[]> => {
  return new Promise((resolve) => {
    chrome.tabs.query(queryInfo, (tabs) => {
      resolve(tabs);
    });
  });
}



const tabSendMessage = (id: string, message: any): Promise<any> => {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(id, message, (response) => {
      resolve(response);
    });
  });
}

/** 高亮存储key */
const storageKey = "highlightGroups";

/** v2版本高亮存储key */
const storageKeyV2 = "highlights";

/** 默认分组的id */
const defaultGroupNameId = "default";


const Core = {
  getStorage,
  setStorage,
  tabsQuery,
  tabSendMessage,
  storageKey,
  defaultGroupNameId,
  storageKeyV2
}

export default Core;