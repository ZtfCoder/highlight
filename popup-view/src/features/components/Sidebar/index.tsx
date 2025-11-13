import React, { useState } from "react";
import styles from "./Sidebar.module.scss";
import HighlightGroup from "../HighlightGroup";

interface SidebarProps {
  /** 当前的分组 */
  groups: HighlightGroup[];
  /** 选中的高亮项 */
  onHighlightSelect: (highlight: HighlightItem) => void;
  /** 右键菜单 */
  onGroupContextMenu: (e: React.MouseEvent, groupId: string) => void;
  /** 创建分组 */
  onCreateGroup: () => void;
  /** 添加高亮词 */
  onAddHighlight: () => void;
  /** 导入/导出 */
  onImportExport: () => void;
  /** 分组启用/禁用 */
  onGroupEnabled: (groupId: string, enabled: boolean) => void;
  /** 高亮项启用/禁用 */
  onHighlightEnabled: (highlightId: string, enabled: boolean, groupId: string) => void;
  /** 删除高亮项 */
  onDeleteHighlight: (highlight: HighlightItem) => void;
}

const Sidebar = (props: SidebarProps) => {
  const {
    groups,
    onHighlightSelect,
    onGroupContextMenu,
    onCreateGroup,
    onAddHighlight,
    onImportExport,
    onGroupEnabled,
    onHighlightEnabled,
    onDeleteHighlight
  } = props;
  const [searchText, setSearchText] = useState("");

  const filteredGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.text.toLowerCase().includes(searchText.toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0 || searchText === "");

  return (
    <div className={styles.sidebar}>
      {/* 搜索框 */}
      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="搜索高亮词..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button className={styles.searchBtn}>
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
          </svg>
        </button>
      </div>

      {/* 菜单列表 */}
      <div className={styles.menuList}>
        {/* 固定菜单项 */}
        {/* <div className={`${styles.menuItem} ${styles.active}`}>
          <span>设置</span>
          <svg
            className="settings-icon"
            viewBox="0 0 24 24"
            width="18"
            height="18"
          >
            <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"></path>
          </svg>
        </div> */}
        <div className={styles.menuItem} onClick={onAddHighlight}>
          <span>添加高亮词</span>
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
          </svg>
        </div>
        <div className={styles.menuItem} onClick={onImportExport}>
          <span>导入/导出</span>
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z"></path>
          </svg>
        </div>

        {/* 创建分组按钮 */}
        <div className={styles.createGroup}>
          <button className={styles.createGroupBtn} onClick={onCreateGroup}>
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-1 8h-3v3h-2v-3h-3v-2h3V9h2v3h3v2z"></path>
            </svg>
            <span>创建新分组</span>
          </button>
        </div>

        {/* 高亮词分组列表 */}
        <div className={styles.groupContainer}>
          {filteredGroups.map((group) => (
            <HighlightGroup
              key={group.id}
              group={group}
              onHighlightSelect={onHighlightSelect}
              onContextMenu={onGroupContextMenu}
              onGroupEnabled={onGroupEnabled}
              onHighlightEnabled={onHighlightEnabled}
              onDeleteHighlight={onDeleteHighlight}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
