/**
 * 获取存储
 */
export const getStorage = (key: string): Promise<any> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key]);
    });
  });
};

/**
 *  设置存储
 */
export const setStorage = (
  key: string,
  value: Record<string, any> | boolean | string | number
): Promise<void> => {
  return new Promise((resolve) => {
    const items: Record<string, any> = {};
    items[key] = value;
    chrome.storage.local.set(items, () => {
      resolve();
    });
  });
};

/**
 *  获取当前活动标签页
 */
export const tabsQuery = (queryInfo: QueryInfo): Promise<queryResult[]> => {
  return new Promise((resolve) => {
    chrome.tabs.query(queryInfo, (tabs) => {
      resolve(tabs);
    });
  });
};

/**
 * 发送消息到指定标签页
 */
export const tabSendMessage = (id: string, message: any): Promise<any> => {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(id, message, (response) => {
      resolve(response);
    });
  });
};
