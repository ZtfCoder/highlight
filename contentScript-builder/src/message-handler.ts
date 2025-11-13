import { setStorage } from "./chrome";
import { clearAllHighlights } from "./highlight";
import { enabled, setEnabled } from "./state";
import { importHighlights, removeHighlight } from "./data-manager";
import { refreshHighlights } from "./helpers";
// 添加这个未定义的引用
import { currentHighlightNames } from "./state";
import pubsub, { EVENT } from "./event";

/**
 * 开启监听
 */
export const setupMessageListener = () => {
  (chrome as any).runtime.onMessage.addListener(
    (request: any, sender: any, sendResponse: any) => {
      if (request.action === "removeHighlight") {
        removeHighlight(request.id, () => {
          sendResponse({ success: true });
        });
      }

      if (request.action === "clearAllHighlights") {
        clearAllHighlights();
        sendResponse({ success: true });
      }

      // 导入高亮
      if (request.action === "importHighlights") {
        importHighlights(request.highlights, (result) => {
          sendResponse({ success: true, highlights: result });
        });
      }

      if (request.action === "refreshHighlights") {
        importHighlights(request.groups, () => {
          sendResponse({ success: true });
        });
      }

      if (request.action === "toggleHighlight") {
        setEnabled(request.enabled);
        // 存储 到本地
        setStorage("highlightEnabled", enabled);
        if (enabled) {
          refreshHighlights();
        } else {
          // 清除所有高亮样式
          if (CSS.highlights) {
            // 清理所有已注册的highlight
            currentHighlightNames.forEach((name) => {
              (CSS.highlights as any).delete(name);
            });
            currentHighlightNames.clear();
          }
        }
        sendResponse({ success: true });
      }

      if(request.action === "setGlobalEnabled"){
        setEnabled(request.enabled);
        // 存储 到本地
        setStorage("highlightEnabled", enabled);
        pubsub.publish(EVENT.HIGHLIGHTS_REFRESHED)
      }
      return true; // 保持消息通道开放
    }
  );
};
