import { setStorage } from "./chrome";
import { clearAllHighlights } from "./highlight";
import { setEnabled } from "./state";
import { importHighlights, removeHighlight } from "./data-manager";
import { refreshHighlights } from "./helpers";
import { currentHighlightNames } from "./state";
import pubsub, { EVENT } from "./event";

/**
 * 开启监听
 */
export const setupMessageListener = () => {
  (chrome as any).runtime.onMessage.addListener(
    (request: any, sender: any, sendResponse: any) => {
      if (request.action === "removeHighlight") {
        console.log("removeHighlight", request.id);
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
        setStorage("highlightEnabled", request.enabled).then(() => {
          if (request.enabled) {
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
        });
      }

      if(request.action === "setGlobalEnabled"){
        setEnabled(request.enabled);
        // 存储 到本地
        setStorage("highlightEnabled", request.enabled).then(() => {
          pubsub.publish(EVENT.HIGHLIGHTS_REFRESHED);
          sendResponse({ success: true });
        });
      }
      return true; // 保持消息通道开放
    }
  );
};
