import { getStorage,  setStorage } from "./chrome";
import { EVENT } from "./event";
import pubsub from "./event";
import { highlightObj, setHighlightObj } from "./state";
import { refreshHighlights } from "./helpers";

/**
 * 加载已有的高亮
 * 从缓存中获取
 */
export const loadExistingHighlights = async () => {
  const highlights = (await getStorage("highlights")) || [];
  setHighlightObj(highlights.sort((a: HighlightItem, b: HighlightItem) => a.text.localeCompare(b.text)));
};

/**
 * 批量导入
 */
export const importHighlights = async (
  highlights: HighlightItem[],
  successCallBack: (highlights: HighlightItem[]) => void
) => {
  if (!highlights || !Array.isArray(highlights)) {
    console.error("导入高亮失败：无效的高亮数据");
    successCallBack([]);
    return;
  }

  const highlightsStorage = (await getStorage("highlights")) || [];
  const newHighlights = [...highlightsStorage, ...highlights];

  // 去重
  const uniqueHighlights = Array.from(
    new Map(newHighlights.map((h) => [h.text, h])).values()
  ).sort((a, b) => a.text.localeCompare(b.text));
  await setStorage("highlights", uniqueHighlights);
  refreshHighlights();
  successCallBack(highlights);
};

/**
 * 删除高亮
 */
export const removeHighlight = async (
  highlightId: string,
  successCallBack: () => void
) => {
  const highlightsStorage: HighlightItem[] =
    (await getStorage("highlights")) || [];

  const updatedHighlights = highlightsStorage.filter(
    (highlight) => highlight.id !== highlightId
  );

  await setStorage("highlights", updatedHighlights);
  successCallBack();
  pubsub.publish(EVENT.HIGHLIGHTS_REFRESHED, highlightObj);
};

/**
 * 删除全部高亮
 * @param successCallBack
 */
export const removeAllHighlights = async (successCallBack?: () => void) => {
  await setStorage("highlights", []);
  successCallBack?.();
  pubsub.publish(EVENT.HIGHLIGHTS_REFRESHED);
};
