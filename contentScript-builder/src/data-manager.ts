import { getStorage, setStorage } from "./chrome";
import { EVENT } from "./event";
import pubsub from "./event";
import { highlightGroups, setHighlightGroups } from "./state";
import { refreshHighlights } from "./helpers";

const storageKey = "highlightGroups";

/**
 * 加载已有的高亮
 * 从缓存中获取
 */
export const loadExistingHighlights = async () => {
  const highlights: HighlightGroup[] = (await getStorage(storageKey)) || [];
  // 首先对组进行排序
  setHighlightGroups(highlights);
};

/**
 * 批量导入
 */
export const importHighlights = async (
  groups: HighlightGroup[],
  successCallBack?: (highlights: HighlightGroup[]) => void
) => {
  
  if (!groups || !Array.isArray(groups)) {
    console.error("导入高亮失败：无效的高亮数据");
    successCallBack?.([]);
    return;
  }
 
  await setStorage(storageKey, groups);
  refreshHighlights();
  successCallBack?.(groups);
};

/**
 * 删除高亮
 */
export const removeHighlight = async (
  highlightId: string,
  successCallBack: () => void
) => {
  const highlightsStorage: HighlightGroup[] =
    (await getStorage(storageKey)) || [];

  const updatedHighlights = highlightsStorage.filter(
    (highlight) => highlight.id !== highlightId
  );

  await setStorage(storageKey, updatedHighlights);
  successCallBack();
  pubsub.publish(EVENT.HIGHLIGHTS_REFRESHED, highlightGroups);
};

/**
 * 删除全部高亮
 * @param successCallBack
 */
export const removeAllHighlights = async (successCallBack?: () => void) => {
  await setStorage(storageKey, []);
  successCallBack?.();
  pubsub.publish(EVENT.HIGHLIGHTS_REFRESHED);
};
