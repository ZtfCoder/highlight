import { EVENT } from "./event";
import pubsub from "./event";
import { enabled, highlightGroups } from "./state";
import { loadExistingHighlights } from "./data-manager";

/**
 * 刷新高亮
 * 发布订阅
 */
export const refreshHighlights = () => {
  if (enabled) {
    // 重新加载高亮
    loadExistingHighlights().then(() => {
      pubsub.publish(EVENT.HIGHLIGHTS_REFRESHED, highlightGroups);
    });
  }
};
