import React from "react";
import styles from "./HighlightItem.module.scss";
import Switch from "../../../components/Switch";

interface HighlightItemProps {
  /** 高亮项数据 */
  item: HighlightItem;
  /** 选中高亮项 */
  onSelect: (highlight: HighlightItem) => void;
  /** 是否为选中状态 */
  active?: boolean;
  /** 启用/禁用高亮 */
  onHighlightEnabled: (enabled: boolean) => void;
  /** 删除高亮项 */
  onDeleteHighlight?: (highlight: HighlightItem) => void;
}

const HighlightItem: React.FC<HighlightItemProps> = ({
  item,
  onSelect,
  onHighlightEnabled,
  onDeleteHighlight,
  active = false,
}) => {
  const handleSelect = () => {
    onSelect(item);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 处理删除逻辑
    onDeleteHighlight?.(item)
    
  };

  /**
   * 处理开关切换
   * @param enable  是否启用
   * @param e 事件对象
   */
  const handleToggle = (enable: boolean, e?: React.MouseEvent) => {
    e?.stopPropagation();
    onHighlightEnabled(enable);
  };

  return (
    <div
      className={`${styles.highlightItem} ${active ? styles.active : ""}`}
      onClick={handleSelect}
    >
      <div className={styles.highlightItemContent}>
        <div
          className={styles.colorPreview}
          style={{ backgroundColor: item.color }}
        ></div>
        <span className={styles.highlightText}>{item.text}</span>
      </div>
      <div className={styles.highlightItemControls}>
        <Switch
          checked={item.enabled !== false}
          size={"small"}
          onChange={(enable, event) => handleToggle(enable, event)}
        />
        <button className={styles.deleteBtn} onClick={handleDelete}>
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default HighlightItem;
