import pubsub, { EVENT } from "./event";
import { init } from "./init";
import {
  currentHighlightNames,
  enabled,
  highlightGroups,
  observeMap,
} from "./state";
import { findTextRanges, runConcurrently, waitForElement } from "./utils";
import { debounce } from "lodash-es";

/**
 * 清理所有高亮样式
 */
const clearAllHighlightStyles = (targetWindow: Window) => {
  try {
    // 清理所有已注册的highlight
    currentHighlightNames.forEach((name) => {
      (targetWindow.CSS.highlights as any).delete(name);
    });
    currentHighlightNames.clear();
    console.log("清理所有高亮样式");

    // 移除样式元素
    const styleElement =
      targetWindow.document.querySelector("#highlight-styles");
    if (styleElement) {
      styleElement.remove();
    }
  } catch (e) {
    console.error("清理高亮样式失败:", e);
  }
};

/**
 * 应用样式
 * @param targetWindow
 * @param targetDocument
 */
const applyHighlightStyles = async (
  targetWindow: Window,
  targetDocument: Document,
  node: HTMLElement
) => {
  console.log("应用高亮样式");
  try {
    let style = targetDocument.querySelector("#highlight-styles");
    if (!style) {
      style = document.createElement("style");
      style.id = "highlight-styles";
      // shadowRoot 需要插入到 shadowRoot 内部
      if (targetDocument.head) {
        targetDocument.head.appendChild(style);
      } else {
        targetDocument.appendChild(style);
      }
    }

    // 寻找所有的需要高亮的元素
    let css = "";
    const observeEntry = observeMap.get(node);

    observeEntry?.heightlightNames.forEach((name) => {
      (targetWindow.CSS.highlights as any).delete(name);
    });
    observeEntry?.heightlightNames.clear();

    const highlightPromises = highlightGroups.map(
      (highlight, index) => async () => {
        {
          const highlightName = `highlight-${index}-${Math.random()
            .toString(36)
            .substring(2, 9)}`;

          // 创建CSS ::highlight() 规则
          css += `
          ::highlight(${highlightName}) {
            background-color: ${highlight.color};
            color: white;
          }
        `;
          // console.log(targetDocument,targetWindow.CSS)
          const ranges = findTextRanges(highlight.text, targetDocument);
          if (ranges.length > 0) {
            // console.log("找到的高亮范围:", ranges);
            // 创建Highlight对象并注册
            const highlightObj = new Highlight(...ranges);
            targetWindow.CSS.highlights.set(highlightName, highlightObj);
            // 记录新的highlight名称
            currentHighlightNames.add(highlightName);
            observeEntry?.heightlightNames.add(highlightName);
          } else {
            // console.warn(`未找到文本 "${highlight.text}" 的高亮范围`);
          }
        }
      }
    );
    await runConcurrently(highlightPromises);

    style.textContent = css;
  } catch (e) {
    console.error("Error applying highlight styles:", e);
  }
};

/**
 * 监听 iframe DOM 变化
 * @param iframe
 * @param waitDoc
 */
const listenerIframeDOMChange = async (
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
      }else{
        clearAllHighlightStyles(targetWindow);
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

if (document.readyState === "complete") {
  init();
} else {
  window.onload = function () {
    init();
  };
}
