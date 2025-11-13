import { findTextRanges, runConcurrently } from "./utils";
import { currentHighlightNames, highlightObj, observeMap } from "./state";
import pubsub, { EVENT } from "./event";
import { removeAllHighlights, removeHighlight } from "./data-manager";

/**
 * 清理所有高亮样式
 */
export const clearAllHighlightStyles = (targetWindow: Window) => {
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
export const applyHighlightStyles = async (
  targetWindow: Window,
  targetDocument: Document,
  node: HTMLElement
) => {
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

    const highlightPromises = highlightObj.map(
      (highlight, index) => async () => {
        {
          // console.log(targetDocument,targetWindow.CSS)
          const ranges = findTextRanges(highlight.text, targetDocument);
          if (ranges.length > 0) {
            const highlightName = `highlight-${index}-${Math.random()
              .toString(36)
              .substring(2, 9)}`;

            // 创建CSS ::highlight() 规则
            css += `
            ::highlight(${highlightName}) {
              background-color: ${highlight.color};
              color: ${highlight.textColor || "#fff"};
              ${highlight.isUnderline ? "text-decoration: underline;" : ""}
              ${highlight.isWavy ? "text-decoration: underline wavy ;" : ""}
          }
        `;

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
 * 删除全部高亮
 */
export const clearAllHighlights = async () => {
  // 删除所有高亮
  if (CSS.highlights) {
    // 清理所有已注册的highlight
    currentHighlightNames.forEach((name) => {
      (CSS.highlights as any).delete(name);
    });
    currentHighlightNames.clear();
    await removeAllHighlights()
  }
};
