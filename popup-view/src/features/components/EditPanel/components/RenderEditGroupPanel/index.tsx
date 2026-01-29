import { useState, useEffect } from "react";
import styles from "../../EditPanel.module.scss";
import Select from "../../../../../components/Select";
import { t } from "../../../../../i18n";

/** 统一样式设置 */
interface UniformStyle {
  textColor: string;
  bgColor: string;
  underline: boolean;
  wavy: boolean;
}

/**
 * 编辑分组
 * @returns
 */
const RenderEditGroupPanel = (props: {
  panelMode: PanelMode;
  groups: HighlightGroup[];
  onCancel?: () => void;
  handleSave?: (groupName: string, targetGroupId?: string, originId?: string) => void;
  onApplyUniformStyle?: (groupId: string, style: UniformStyle) => void;
  selectedGroupId?: string;
}) => {
  const { panelMode, groups, onCancel, handleSave, onApplyUniformStyle, selectedGroupId:originId } = props;

  const [targetGroupId, setTargetGroupId] = useState<string>();
  const [newGroupName, setNewGroupName] = useState("");
  
  // 统一样式设置
  const [applyUniformStyle, setApplyUniformStyle] = useState(false);
  const [textColor, setTextColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#4caf50");
  const [underline, setUnderline] = useState(false);
  const [wavy, setWavy] = useState(false);

  // 获取当前分组的高亮词数量
  const currentGroup = groups.find((g) => g.id === originId);
  const itemCount = currentGroup?.items.length || 0;
  
  useEffect(() => {
    if (panelMode === "editGroup") {
      setNewGroupName(groups.find((g) => g.id === originId)?.name || "");
    } else {
      setNewGroupName("");
    }
    setTargetGroupId(originId);
    setApplyUniformStyle(false);
  }, [panelMode, originId, groups]);

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
    };
  };

  const handleApplyStyle = () => {
    if (originId && applyUniformStyle) {
      const confirmed = window.confirm(
        t("applyUniformStyleConfirm") || `确定要将统一样式应用到该分组的 ${itemCount} 个高亮词吗？此操作不可撤销！`
      );
      if (confirmed) {
        onApplyUniformStyle?.(originId, { textColor, bgColor, underline, wavy });
      }
    }
  };

  return (
    <div className={styles.editPanel}>
      <div className={styles.formGroup}>
        <label htmlFor="group-name">{t("groupNameLabel")}</label>
        <input
          type="text"
          id="group-name"
          placeholder={t("createNewGroup")}
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="move-group-name">
          {t("moveToOtherGroup")}
          <b className={styles.labelDesc}>
            {t("moveGroupWarning")}
          </b>
        </label>
        <Select
          id="move-group-name"
          value={targetGroupId}
          onChange={setTargetGroupId}
          options={groups.map((group) => ({
            label: group.name,
            value: group.id,
          }))}
        />
      </div>

      {/* 统一样式设置区域 */}
      <div className={styles.uniformStyleSection}>
        <div className={styles.uniformStyleToggle}>
          <input
            type="checkbox"
            id="apply-uniform-style"
            checked={applyUniformStyle}
            onChange={(e) => setApplyUniformStyle(e.target.checked)}
          />
          <label htmlFor="apply-uniform-style">
            {t("uniformStyleLabel")}
            <span className={styles.itemCountBadge}>
              {t("itemCount", String(itemCount)) || `${itemCount} 个高亮词`}
            </span>
          </label>
        </div>

        {applyUniformStyle && (
          <div className={styles.uniformStyleOptions}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="uniform-text-color">{t("textColor")}</label>
                <div className={styles.colorPicker}>
                  <input
                    type="color"
                    id="uniform-text-color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                  />
                  <span className={styles.colorCode}>{textColor}</span>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="uniform-bg-color">{t("backgroundColor")}</label>
                <div className={styles.colorPicker}>
                  <input
                    type="color"
                    id="uniform-bg-color"
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
                  id="uniform-underline"
                  checked={underline}
                  onChange={(e) => setUnderline(e.target.checked)}
                />
                <label htmlFor="uniform-underline">
                  <span className={`${styles.optionIcon} ${styles.underlineIcon}`}>U</span>
                  <span className={styles.optionText}>{t("underline")}</span>
                </label>
              </div>
              <div className={styles.styleOption}>
                <input
                  type="checkbox"
                  id="uniform-wavy"
                  checked={wavy}
                  onChange={(e) => setWavy(e.target.checked)}
                />
                <label htmlFor="uniform-wavy">
                  <span className={`${styles.optionIcon} ${styles.wavyIcon}`}>~</span>
                  <span className={styles.optionText}>{t("wavyLine")}</span>
                </label>
              </div>
            </div>

            <div className={styles.previewSection}>
              <h3>{t("stylePreview")}</h3>
              <div className={styles.previewContent}>
                <p>
                  {t("uniformPreviewText")}
                  <span style={getPreviewStyle()}>{t("highlightPlaceholder")}</span>
                </p>
              </div>
            </div>

            <button
              className={styles.applyStyleBtn}
              onClick={handleApplyStyle}
              disabled={itemCount === 0}
            >
              {t("applyUniformStyle")}
            </button>
          </div>
        )}
      </div>

      <div className={styles.actionButtons}>
        <button className={styles.cancelBtn} onClick={onCancel}>
          {t("cancel")}
        </button>
        <button
          className={styles.saveBtn}
          onClick={() => handleSave?.(newGroupName.trim(), targetGroupId, originId)}
          disabled={!newGroupName.trim()}
        >
          {t("saveChanges")}
        </button>
      </div>
    </div>
  );
};

export default RenderEditGroupPanel;
