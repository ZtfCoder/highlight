import React, { useState } from "react";
import styles from "./HighlightGroup.module.scss";
import HighlightItem from "../HighlightItem";
import Switch from "../../../components/Switch";

interface HighlightGroupProps {
  group: HighlightGroup;
  onHighlightSelect: (highlight: HighlightItem) => void;
  onContextMenu: (e: React.MouseEvent, groupId: string) => void;
  onGroupEnabled: (groupId: string, enabled: boolean) => void;
  onHighlightEnabled: (highlightId: string, enabled: boolean, groupId: string) => void;
  onDeleteHighlight: (highlight: HighlightItem) => void;
}

/**
 * 高亮分组组件
 * @param props
 * @returns
 */
const HighlightGroup = (props: HighlightGroupProps) => {
  const { group, onHighlightSelect, onContextMenu, onGroupEnabled,onHighlightEnabled ,onDeleteHighlight} = props;
  const [expanded, setExpanded] = useState(group.id === "default");

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (group.id !== "default") {
      // 默认分组不允许删除/编辑
      onContextMenu(e, group.id);
    }
  };

  return (
    <div
      className={`${styles.highlightGroup} ${expanded ? styles.expanded : ""}`}
    >
      <div
        className={styles.groupHeader}
        onClick={handleToggleExpand}
        onContextMenu={handleContextMenu}
      >
        <div className={styles.groupTitle}>
          <span className={styles.expandIcon}>
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d={"M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"}></path>
            </svg>
          </span>
          <span>{group.name}</span>
          <span className={styles.itemCount}>({group.items.length})</span>
        </div>
        <div className={styles.groupControls}>
          <Switch
            checked={group.enabled}
            onChange={(checked, event) => {
              // 处理分组开关逻辑
              event?.stopPropagation();
              onGroupEnabled(group.id, checked);
            }}
            size={"small"}
          />
          {group.id !== "default" && (
            <button
              className={styles.groupMenuBtn}
              onClick={(e) => {
                e.stopPropagation();
                onContextMenu(e, group.id);
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
              </svg>
            </button>
          )}
        </div>
      </div>
      {expanded && (
        <div className={styles.highlightList}>
          {group.items.map((item) => (
            <HighlightItem
              key={item.id}
              item={item}
              onSelect={onHighlightSelect}
              onHighlightEnabled={(enabled) => onHighlightEnabled(item.id, enabled, group.id)}
              onDeleteHighlight={() => onDeleteHighlight(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HighlightGroup;
