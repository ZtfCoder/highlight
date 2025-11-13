/**
 * 寻找节点
 */
export const findTextRanges = (searchText: string,targetDocument:Document) => {
  const ranges: Range[] = [];
  try {
    const body = targetDocument.querySelector("body");
    if (!body) {
      return ranges;
    }

    const walker = document.createTreeWalker(
      body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          // 检查节点是否仍在DOM中
          if (!targetDocument.contains(node)) {
            return NodeFilter.FILTER_REJECT;
          }

          // 跳过script、style等标签
          const parentTag = node.parentElement?.tagName?.toLowerCase();
          if (
            parentTag &&
            ["script", "style", "noscript", "iframe", "svg"].includes(parentTag)
          ) {
            return NodeFilter.FILTER_REJECT;
          }

          return node?.textContent?.includes(searchText)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        },
      }
    );

    let node;
    while ((node = walker.nextNode())) {
      // 再次检查节点是否仍在DOM中
      if (!targetDocument.contains(node)) {
        continue;
      }

      const text = node.textContent;
      if (!text) continue;
      
      let startIndex = 0;
      let index;

      // 查找该文本节点中所有匹配的位置
      while ((index = text.indexOf(searchText, startIndex)) !== -1) {
        try {
          const range = document.createRange();
          range.setStart(node, index);
          range.setEnd(node, index + searchText.length);

          // 验证Range是否有效
          if (
            range.startContainer &&
            range.endContainer &&
            targetDocument.contains(range.startContainer) &&
            targetDocument.contains(range.endContainer)
          ) {
            // console.log("找到节点-》",node)
            ranges.push(range);
          } else {
            // 如果range无效，立即清理
            range.detach();
          }
        } catch (error) {
          console.warn("创建Range失败:", error);
        }

        startIndex = index + 1; // 查找下一个匹配
      }
    }
  } catch (error) {
    console.warn("查找文本Range时出错:", error);
  }
  return ranges;
};

/**
 *  等待节点出现
 */
export async function waitForElement(
  selector: string,
  root = document,
  timeout = 10000
):Promise<Element> {
  const found = root.querySelector(selector);
  if (found) return found;

  return new Promise((resolve, reject) => {
    let observer: MutationObserver | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    
    const cleanup = () => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    observer = new MutationObserver(() => {
      const el = root.querySelector(selector);
      if (el) {
        cleanup();
        resolve(el);
      }
    });

    observer.observe(root, { childList: true, subtree: true });

    timer = setTimeout(() => {
      cleanup();
      reject(new Error(`waitForElement timeout: ${selector}`));
    }, timeout);
  });
}

/**
 * 并发执行函数
 */
export const runConcurrently = async (tasks: (() => Promise<any>)[]) => {
  try {
    const results = await Promise.all(tasks.map(task => task()));
    return results;
  } catch (error) {
    console.error("并发执行任务失败:", error);
    throw error;
  }
};
