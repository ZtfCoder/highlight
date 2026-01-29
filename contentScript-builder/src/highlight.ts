import { findTextRanges, runConcurrently } from "./utils";
import { currentHighlightNames, highlightGroups, observeMap } from "./state";
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



    const highlightsMaps = highlightGroups
      .filter((item) => item.enabled)
      .flatMap((group) => group.items)
      .filter((item) => item.enabled)
      .reduce((acc,curr)=>{
        if(!acc.has(curr.text)){
          acc.set(curr.text,curr);
        }
        return acc;
      },new Map<string,HighlightItem>());
    const highlights = Array.from(highlightsMaps.values());

    // 按文本长度降序排序，优先处理长词
    highlights.sort((a, b) => b.text.length - a.text.length);

    // 记录已高亮的范围，避免重叠
    const occupiedRanges: Array<{start: Node, startOffset: number, end: Node, endOffset: number}> = [];

    // 检查范围是否与已占用范围重叠
    const isRangeOccupied = (range: Range): boolean => {
      for (const occupied of occupiedRanges) {
        try {
          // 创建临时 Range 对象用于比较
          const occupiedRange = targetDocument.createRange();
          occupiedRange.setStart(occupied.start, occupied.startOffset);
          occupiedRange.setEnd(occupied.end, occupied.endOffset);
          
          // 使用 Range.compareBoundaryPoints 进行全面的重叠检查
          // 这可以正确处理跨文本节点的情况
          
          // range 的结束位置是否在 occupied 的开始位置之后
          const rangeEndAfterOccupiedStart = 
            range.compareBoundaryPoints(Range.END_TO_START, occupiedRange) > 0;
          
          // range 的开始位置是否在 occupied 的结束位置之前
          const rangeStartBeforeOccupiedEnd = 
            range.compareBoundaryPoints(Range.START_TO_END, occupiedRange) < 0;
          
          // 如果两个条件都满足，说明存在重叠
          if (rangeEndAfterOccupiedStart && rangeStartBeforeOccupiedEnd) {
            occupiedRange.detach();
            return true;
          }
          
          occupiedRange.detach();
        } catch (error) {
          // 如果比较失败（例如节点已被移除），跳过此检查
          console.warn("Range comparison failed:", error);
          continue;
        }
      }
      return false;
    };
     
    // 顺序处理高亮（不能并发，因为需要按长度优先避免覆盖）
    for (let index = 0; index < highlights.length; index++) {
      const highlight = highlights[index];
      // console.log(targetDocument,targetWindow.CSS)
      const ranges = findTextRanges(highlight.text, targetDocument);
      
      // 过滤掉已被占用的范围
      const validRanges = ranges.filter(range => !isRangeOccupied(range));
      
      if (validRanges.length > 0) {
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

        // 记录这些范围为已占用
        validRanges.forEach(range => {
          occupiedRanges.push({
            start: range.startContainer,
            startOffset: range.startOffset,
            end: range.endContainer,
            endOffset: range.endOffset
          });
        });

        // 创建Highlight对象并注册
        const highlightObj = new Highlight(...validRanges);
        targetWindow.CSS.highlights.set(highlightName, highlightObj);
        // 记录新的highlight名称
        currentHighlightNames.add(highlightName);
        observeEntry?.heightlightNames.add(highlightName);
      } else {
        // console.warn(`未找到文本 "${highlight.text}" 的高亮范围`);
      }
    }

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
    await removeAllHighlights();
  }
};
