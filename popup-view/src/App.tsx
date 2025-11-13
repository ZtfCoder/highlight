import { useState, useEffect, useMemo } from "react";
import styles from "./index.module.scss";
import Core from "./core";
import { v4 as uuidv4 } from "uuid";
import { generateReadableColor } from "./utils";
import { version } from "../../package.json";
import Switch from "./components/Switch";
import HighlightItem from "./components/HighlightItem";

const Popup = () => {
  // 用户输入框的内容
  const [highlightInput, setHighlightInput] = useState("");

  // 当前搜索的文字
  const [filterText, setFilterText] = useState("");

  // 高亮列表
  const [currentHighlights, setCurrentHighlights] = useState<HighlightItem[]>([]);
  // 是否开启高亮插件
  const [isHighlightEnabled, setIsHighlightEnabled] = useState(true);

  const [editHighlightId, setEditHighlightId] = useState<string | null>(null);

  useEffect(() => {
    //@ts-ignore  只有插件环境下才能调用
    if (chrome?.tabs?.query) {
      loadHighlights();
    }
    // 获取高亮开关状态
    Core.getStorage("highlightEnabled").then((enabled) => {
      setIsHighlightEnabled(enabled !== undefined ? enabled : true);
    });
  }, []);

  const heightLightFilter = useMemo(() => {
    if (!filterText.trim()) {
      return currentHighlights;
    }
    return currentHighlights.filter((highlight) => {
      return highlight.text.toLowerCase().includes(filterText.toLowerCase());
    });
  }, [currentHighlights, filterText]);

  /**
   * 加载高亮缓存内容
   */
  const loadHighlights = async () => {
    const tabs = await Core.tabsQuery({ active: true, currentWindow: true });
    if (!tabs || tabs.length === 0) return;
    const allHighlights = (await Core.getStorage("highlights")) || [];
    console.log("allHighlights", allHighlights);
    setCurrentHighlights(
      allHighlights.sort((a: HighlightItem, b: HighlightItem) =>
        a.text.localeCompare(b.text)
      )
    );
  };

  /**
   *  添加高亮文本到当前页面
   */
  const addHighlightText = async () => {
    // 根据 空格，逗号，换行 分割
    const highlightTexts = highlightInput
      .split(/[\s,，\n]+/)
      .map((text) => text.trim())
      .filter((text) => text.length > 0)
      .map((item: string) => ({
        text: item,
        color: generateReadableColor(),
        id: uuidv4(),
      }));

    if (highlightTexts.length === 0) {
      alert("请输入要高亮的文字");
      return;
    }

    const tabs = await Core.tabsQuery({ active: true, currentWindow: true });
    const response = await Core.tabSendMessage(tabs[0].id, {
      action: "importHighlights",
      highlights: highlightTexts,
    });

    if (response && response.success) {
      setHighlightInput("");
      loadHighlights();
    } else {
      alert("高亮失败，请确保页面已完全加载,请切换到其他标签页后刷新页面");
    }
  };

  /**
   * 清除当前页面的所有高亮
   */
  const clearAllHighlights = async () => {
    if (window.confirm("确定要清除当前页面的所有高亮吗？")) {
      const tabs = await Core.tabsQuery({ active: true, currentWindow: true });
      if (!tabs || tabs.length === 0) return;

      await Core.tabSendMessage(tabs[0].id, { action: "clearAllHighlights" });
      setCurrentHighlights([]);
    }
  };

  /**
   * 导入高亮文本
   */
  const importHighlights = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt";
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (e: any) => {
        const content = e.target.result;
        try {
          const lines = content
            .split(/[\s,，\n]+/)
            .map((text: string) => text.trim())
            .filter((line: string) => line)
            .map((item: string) => ({
              text: item,
              color: generateReadableColor(),
              // uuid 随机数
              id: uuidv4(),
            }));
          if (Array.isArray(lines)) {
            const tabs = await Core.tabsQuery({
              active: true,
              currentWindow: true,
            });
            const response = await Core.tabSendMessage(tabs[0].id, {
              action: "importHighlights",
              highlights: lines,
            });
            console.log("导入高亮返回值", response);
            // 更新当前页面的高亮
            setCurrentHighlights(response.highlights);
          } else {
            alert("导入的文件格式不正确");
          }
        } catch (error) {
          console.error("解析文件失败", error);
          alert("解析文件失败，请确保文件格式正确");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  /**
   * 导出当前页面的高亮文本
   */
  const exportHighlights = () => {
    const highlightsText = currentHighlights
      .map((highlight) => highlight.text)
      .join("\n");
    const blob = new Blob([highlightsText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "highlights.txt";
    document.body.appendChild(a);
    a.click();
    alert("高亮已导出为 highlights.txt");
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * 更新存储，并且刷新页面高亮
   */
  const refreshHighlights = async () => {
    const tabs = await Core.tabsQuery({ active: true, currentWindow: true });

    // 发送消息到当前标签页，刷新高亮
    await Core.tabSendMessage(tabs[0].id, {
      action: "refreshHighlights",
      highlights: currentHighlights,
    });
  };

  /**
   * 删除单个
   * @param highlight
   * @returns
   */
  const deleteHighlight = async (highlight: HighlightItem) => {
    const tabs = await Core.tabsQuery({ active: true, currentWindow: true });
    if (!tabs || tabs.length === 0) return;
    console.log("删除高亮", highlight);
    await Core.tabSendMessage(tabs[0].id, {
      action: "removeHighlight",
      id: highlight.id,
    });
    loadHighlights();
  };

  /**
   * 切换高亮开关
   * @param checked
   */
  const onSwitchChange = async (checked: boolean) => {
    setIsHighlightEnabled(checked);
    const tabs = await Core.tabsQuery({ active: true, currentWindow: true });
    if (tabs && tabs.length > 0) {
      Core.tabSendMessage(tabs[0].id, {
        action: "toggleHighlight",
        enabled: checked,
      });
    }
  };

  /**
   * 更新高亮
   * @param id
   * @param value
   */
  const onChangeHighlight = (id: string, value: Partial<HighlightItem>) => {
    setCurrentHighlights((prevHighlights) => {
      const newHighlights = [...prevHighlights];
      const index = newHighlights.findIndex((highlight) => highlight.id === id);
      if (index !== -1) {
        newHighlights[index] = { ...newHighlights[index], ...value };
      }
      return newHighlights;
    });
  };

  return (
    <div className={styles.popupContainer}>
      <div className={styles.header}>
        <h3>
          文字高亮
          <span className={styles.version}>当前版本：{version}</span>
        </h3>
        <Switch
          checked={isHighlightEnabled}
          onChange={onSwitchChange}
          label="启用高亮"
          size="small"
        />
      </div>

      <div className={styles.addSection}>
        <div className={styles.inputSection}>
          <div className={styles.inputGroup}>
            <textarea
              value={highlightInput}
              onChange={(e) => setHighlightInput(e.target.value)}
              placeholder="输入要高亮的文字,自动解析逗号间隔,空格间隔,换行间隔"
              className={styles.highlightInput}
            />
          </div>
        </div>
        <div className={styles.actions}>
          <button
            onClick={addHighlightText}
            disabled={!highlightInput.trim()}
            className={`${styles.btnPrimary} ${
              !highlightInput.trim() ? styles.disabled : ""
            }`}
          >
            添加
          </button>
          <button onClick={clearAllHighlights} className={styles.btnDanger}>
            清空
          </button>

          <button onClick={importHighlights} className={styles.importBtn}>
            导入
          </button>

          <button onClick={exportHighlights} className={styles.exportBtn}>
            导出
          </button>

          <button onClick={refreshHighlights} className={styles.refreshBtn}>
            更新
          </button>
        </div>
      </div>

      <div className={styles.listSection}>
        <div>
          <input
            type="text"
            className={styles.filterTextInput}
            placeholder="搜索高亮..."
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>

        <div className={styles.highlightsList}>
          {heightLightFilter.length === 0 ? (
            <div className={styles.emptyState}>
              <p>没有高亮内容。。。</p>
            </div>
          ) : (
            heightLightFilter.map((highlight) => (
              <HighlightItem
                highlight={highlight}
                editHighlightId={editHighlightId}
                setEditHighlightId={setEditHighlightId}
                deleteHighlight={deleteHighlight}
                onChange={(value) => onChangeHighlight(highlight.id, value)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Popup;
