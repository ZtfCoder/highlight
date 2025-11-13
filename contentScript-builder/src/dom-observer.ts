import { debounce } from "lodash-es";
import { EVENT } from "./event";
import pubsub from "./event";
import { enabled, observeMap } from "./state";
import { applyHighlightStyles } from "./highlight";
import { waitForElement } from "./utils";
// 添加这个未定义的函数引用
import { clearAllHighlightStyles } from "./highlight";

/**
 * 监听 iframe DOM 变化
 * @param iframe
 * @param waitDoc
 */
export const listenerIframeDOMChange = async (
  node: HTMLElement,
  isCheckChd = true
) => {
  try {
    // 等待shadowRoot 加载完成
    const shadowBody = await waitForElement("body", node.shadowRoot as any);

    // shadowRoot 没有独立的 window，使用宿主文档的 window
    const targetWindow = window; // 或者 targetDom.ownerDocument.defaultView
    const targetDocument = node.shadowRoot; // 直接使用 shadowRoot 作为文档根节点

    // 创建一个 MutationObserver 实例
    let unsubscribeHighlights: (() => void) | null = null;

    const updateHighlightStyles = () => {
      if (enabled) {
        applyHighlightStyles(targetWindow, targetDocument as any, node);
      }
    };

    const debouncedUpdate = debounce(() => {
      console.log("iframe 内容变化，重新应用高亮");
      // 判断当前是否开启高亮
      if (enabled) {
        // 判断 targetDocument 是否还存在
        updateHighlightStyles();
      }
      // 避免重复订阅
      if (!unsubscribeHighlights) {
        unsubscribeHighlights = pubsub.subscribe(
          EVENT.HIGHLIGHTS_REFRESHED,
          updateHighlightStyles
        );
      }
    }, 400);

    const observer = new MutationObserver((mutationsList) => {
      let shouldReapply = false;
      mutationsList.forEach((mutation) => {
        Array.from(mutation.removedNodes).forEach((removedNode) => {
          if (removedNode.nodeName === "WUJIE-APP") {
            const entry = observeMap.get(removedNode);
            if (entry) {
              entry.cleanup();
              observeMap.delete(removedNode);
            }
          }
          Array.from(observeMap.keys()).forEach((key) => {
            if (removedNode.contains(key)) {
              observeMap.get(key)?.cleanup();
              observeMap.delete(key);
            }
          });
        });

        // 检查是否有文本或元素变化
        if (mutation.type === "childList") {
          // 检查是否有新增或删除的节点
          if (
            mutation.addedNodes.length > 0 ||
            mutation.removedNodes.length > 0
          ) {
            for (let node of [
              ...Array.from(mutation.addedNodes),
              ...Array.from(mutation.removedNodes),
            ]) {
              if (
                node.nodeType === Node.ELEMENT_NODE ||
                node.nodeType === Node.TEXT_NODE
              ) {
                shouldReapply = true;
                break;
              }
            }
          }
        } else if (mutation.type === "characterData") {
          // 文本内容发生变化
          shouldReapply = true;
        }
      });

      if (shouldReapply) {
        debouncedUpdate();
      }
    });

    observer.observe(targetDocument?.querySelector("body")!, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: false, // 不监听属性变化，减少触发频率
    });

    const checkChd = () => {
      const nestedObserver = new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation) => {
          const { addedNodes, removedNodes } = mutation;
          Array.from(addedNodes).forEach((node) => {
            if (node.nodeName === "WUJIE-APP" && node instanceof HTMLElement) {
              listenerIframeDOMChange(node, false);
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
          });
        });
      });
      nestedObserver.observe(node.shadowRoot as any, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: false, // 不监听属性变化，减少触发频率
      });
      return nestedObserver;
    };

    if (isCheckChd) {
      checkChd();
    }

    // 清理函数
    const cleanup = () => {
      observer.disconnect();
      if (unsubscribeHighlights) {
        unsubscribeHighlights();
        unsubscribeHighlights = null;
      }
      clearAllHighlightStyles(targetWindow);
    };

    // 存储清理函数
    observeMap.set(node, {
      observer,
      cleanup,
      heightlightNames: new Set(),
    });
  } catch (e) {
    console.error(e);
  }
};


