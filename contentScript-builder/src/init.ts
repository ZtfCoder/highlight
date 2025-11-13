import { debounce } from "lodash-es";
import { getStorage } from "./chrome";
import { EVENT } from "./event";
import pubsub from "./event";
import { applyHighlightStyles, clearAllHighlightStyles } from "./highlight";
import { eventUnsubscribers, observeMap, setEnabled } from "./state";
import { loadExistingHighlights } from "./data-manager";
import { listenerIframeDOMChange } from "./dom-observer";
import { setupMessageListener } from "./message-handler";
// 添加这个未定义的引用
import { enabled } from "./state";

/**
 * 清理所有资源
 */
export const cleanup = () => {
  // 清理所有观察器
  observeMap.forEach((entry) => {
    entry.cleanup();
  });
  observeMap.clear();

  // 清理所有事件订阅
  eventUnsubscribers.forEach((unsubscribe) => {
    unsubscribe();
  });
  eventUnsubscribers.clear();

  // 清理高亮样式
  clearAllHighlightStyles(window);
};

/**
 * 初始化
 */
export const init = async () => {
  // 先清理之前的资源
  cleanup();

  await loadExistingHighlights();

  const enableResult = await getStorage("highlightEnabled");
  setEnabled(enableResult !== undefined ? enableResult : true);
  setupMessageListener();

  // 刷新当前窗口的高亮
  const refreshWindowHighlights = debounce(() => {
    if (enabled) {
      applyHighlightStyles(window, document, document.body);
    }
  }, 250);

  // 避免重复订阅
  const unsubscribe = pubsub.subscribe(
    EVENT.HIGHLIGHTS_REFRESHED,
    refreshWindowHighlights
  );
  eventUnsubscribers.add(unsubscribe);

  const observe = new MutationObserver((mutations) => {
    let shouldReapply = false;
    mutations.forEach((mutation) => {
      const { addedNodes, removedNodes } = mutation;
      Array.from(addedNodes).forEach((node) => {
        if (node.nodeName === "WUJIE-APP" && node instanceof HTMLElement) {
          listenerIframeDOMChange(node);
        }
      });
      Array.from(removedNodes).forEach((node) => {
        if (node.nodeName === "WUJIE-APP") {
          const entry = observeMap.get(node);
          if (entry) {
            entry.cleanup();
            observeMap.delete(node);
          }
        }
        Array.from(observeMap.keys()).forEach((key) => {
          if (node.contains(key)) {
            observeMap.get(key)?.cleanup();
            observeMap.delete(key);
          }
        });
      });

      if (mutation.type === "childList") {
        // 检查是否有新增或删除的节点
        const isUpdate =
          mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0;
        if (isUpdate) {
          const nodes = [
            ...Array.from(mutation.addedNodes),
            ...Array.from(mutation.removedNodes),
          ];
          for (let node of nodes) {
            const isYesDode =
              node.nodeType === Node.ELEMENT_NODE ||
              node.nodeType === Node.TEXT_NODE;
            if (isYesDode) {
              shouldReapply = true;
              break;
            }
          }
        }
      } else if (mutation.type === "characterData") {
        // 文本内容发生变化
        shouldReapply = true;
      }

      if (shouldReapply) {
        refreshWindowHighlights();
      }
    });
  });
  refreshWindowHighlights();
  observe.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // 存储主观察器的清理函数
  const mainCleanup = () => {
    observe.disconnect();
  };
  observeMap.set(document.body, {
    observer: observe,
    cleanup: mainCleanup,
    heightlightNames: new Set(),
  });
};


