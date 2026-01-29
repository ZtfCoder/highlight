import { useEffect, useState } from "react";
import styles from "../../EditPanel.module.scss";
import { v4 as uuidv4 } from "uuid";
import Select from "../../../../../components/Select";
import Core from "../../../../../core";
import { t } from "../../../../../i18n";

/**
 * 新增/编辑 关键词
 * @returns
 */
const RenderEditPanel = (props: {
  panelMode: PanelMode;
  groups: HighlightGroup[];
  onCancel?: () => void;
  selectedHighlight?: HighlightItem;
  onEditSave?: (highlight: HighlightItem, groupId: string) => void;
  onBatchSave?: (highlights: HighlightItem[], groupId: string) => void;
}) => {
  const {
    groups,
    onCancel,
    panelMode,
    selectedHighlight,
    onEditSave,
    onBatchSave,
  } = props;

  /** 高亮文字  */
  const [text, setText] = useState("");
  /** 文字颜色 */
  const [textColor, setTextColor] = useState("#ffffff");
  /** 背景色 */
  const [bgColor, setBgColor] = useState("#4caf50");
  /** 下划线 */
  const [underline, setUnderline] = useState(false);
  /** 波浪线 */
  const [wavy, setWavy] = useState(false);
  /** 批量导入模式 */
  const [batchMode, setBatchMode] = useState(false);

  const [groupId, setGroupId] = useState(Core.defaultGroupNameId);

  const getPreviewStyle = (): React.CSSProperties => {
    return {
      backgroundColor: bgColor,
      color: textColor,
      textDecoration: underline
        ? "underline"
        : wavy
        ? "underline wavy"
        : "none",
      padding: "2px 4px",
      borderRadius: "2px",
      wordBreak: "break-all",
    };
  };
 
  useEffect(() => {
    if (selectedHighlight && panelMode === "edit") {
      setText(selectedHighlight.text);
     const id =  groups.find((g) => g.items.some((i) => i.id === selectedHighlight?.id))
          ?.id || Core.defaultGroupNameId
      setGroupId(id);
      setBgColor(selectedHighlight.color || "#4caf50");
      setUnderline(selectedHighlight.isUnderline || false);
      setWavy(selectedHighlight.isWavy || false);
      setTextColor(selectedHighlight.textColor || "#ffffff");
      setBatchMode(false); // 编辑模式下禁用批量导入
    } else {
      setText("");
      setGroupId(Core.defaultGroupNameId);
      setTextColor("#ffffff");
      setBgColor("#4caf50");
      setUnderline(false);
      setWavy(false);
    }
  }, [panelMode, selectedHighlight, groups]);

  /**
   * 解析批量输入的文本，按换行、逗号、空格分割
   */
  const parseBatchText = (input: string): string[] => {
    // 先按换行分割，再按逗号分割，最后按空格分割
    const items = input
      .split(/[\n,，]/) // 按换行和逗号（中英文）分割
      .flatMap(item => item.split(/\s+/)) // 按空格分割
      .map(item => item.trim())
      .filter(item => item.length > 0); // 过滤空字符串
    // 去重
    return [...new Set(items)];
  };

  const handleSave = () => {
    if (batchMode && panelMode === "addHighlight") {
      // 批量导入模式
      const items = parseBatchText(text);
      if (items.length === 0) return;
      
      const highlights: HighlightItem[] = items.map(item => ({
        id: uuidv4(),
        text: item,
        color: bgColor,
        textColor: textColor,
        enabled: true,
        isUnderline: underline,
        isWavy: wavy,
      }));
      
      onBatchSave?.(highlights, groupId);
    } else {
      // 单个保存模式
      onEditSave?.(
        {
          id: selectedHighlight?.id || uuidv4(),
          text: text.trim(),
          color: bgColor,
          textColor: textColor,
          enabled: true,
          isUnderline: underline,
          isWavy: wavy,
        },
        groupId
      );
    }
  };

  // 获取批量导入预览的文本列表
  const getBatchPreviewItems = (): string[] => {
    if (!batchMode || !text.trim()) return [];
    return parseBatchText(text).slice(0, 5); // 最多显示5个预览
  };

  return (
    <div className={styles.editPanel}>
      {/* 批量导入开关 - 仅在添加模式下显示 */}
      {panelMode === "addHighlight" && (
        <div className={styles.batchModeToggle}>
          <input
            type="checkbox"
            id="batch-mode"
            checked={batchMode}
            onChange={(e) => setBatchMode(e.target.checked)}
          />
          <label htmlFor="batch-mode">{t("batchImportMode")}</label>
          {batchMode && (
            <span className={styles.batchHint}>{t("batchImportHint")}</span>
          )}
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="highlight-text">{t("highlightTextLabel")}</label>
        <textarea
          id="highlight-text"
          placeholder={batchMode ? t("batchImportPlaceholder") : t("highlightTextPlaceholder")}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={batchMode ? 5 : 2}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="highlight-group">{t("groupLabel")}</label>
        <Select
          id="highlight-group"
          value={groupId}
          onChange={(e) => setGroupId(e)}
          options={
            groups.map((group) => ({ label: group.name, value: group.id })) ||
            []
          }
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="text-color">{t("textColor")}</label>
          <div className={styles.colorPicker}>
            <input
              type="color"
              id="text-color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
            />
            <span className={styles.colorCode}>{textColor}</span>
          </div>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="bg-color">{t("backgroundColor")}</label>
          <div className={styles.colorPicker}>
            <input
              type="color"
              id="bg-color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
            />
            <span className={styles.colorCode}>{bgColor}</span>
          </div>
        </div>
      </div>

      <div className={styles.styleOptions}>
        <div className={styles.styleOption}>
          <input
            type="checkbox"
            id="style-underline"
            checked={underline}
            onChange={(e) => setUnderline(e.target.checked)}
          />
          <label htmlFor="style-underline">
            <span className={`${styles.optionIcon} ${styles.underlineIcon}`}>
              U
            </span>
            <span className={styles.optionText}>{t("underline")}</span>
          </label>
        </div>
        <div className={styles.styleOption}>
          <input
            type="checkbox"
            id="style-wavy"
            checked={wavy}
            onChange={(e) => setWavy(e.target.checked)}
          />
          <label htmlFor="style-wavy">
            <span className={`${styles.optionIcon} ${styles.wavyIcon}`}>~</span>
            <span className={styles.optionText}>{t("wavyLine")}</span>
          </label>
        </div>
      </div>

      <div className={styles.previewSection}>
        <h3>{t("stylePreview")}</h3>
        <div className={styles.previewContent}>
          {batchMode && getBatchPreviewItems().length > 0 ? (
            <div className={styles.batchPreview}>
              <p>{t("batchPreviewLabel")}</p>
              <div className={styles.batchPreviewItems}>
                {getBatchPreviewItems().map((item, index) => (
                  <span key={index} style={getPreviewStyle()}>{item}</span>
                ))}
                {parseBatchText(text).length > 5 && (
                  <span className={styles.moreItems}>
                    +{parseBatchText(text).length - 5} {t("moreItems")}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p>
              {t("highlightPreviewText")}
              <span style={getPreviewStyle()}>{text || t("highlightPlaceholder")}</span>
              {t("highlightPreviewTextEnd")}
            </p>
          )}
        </div>
      </div>

      <div className={styles.actionButtons}>
        <button className={styles.cancelBtn} onClick={onCancel}>
          {t("cancel")}
        </button>
        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={!text.trim()}
        >
          {batchMode ? t("batchImportBtn") : t("save")}
        </button>
      </div>
    </div>
  );
};

export default RenderEditPanel;
