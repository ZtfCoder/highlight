import React, { useEffect } from "react";
import styles from "./ContextMenu.module.scss";
import { t } from "../../../i18n";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  visible: boolean;
}

/**
 * 右键菜单更多组件
 * @param props 
 * @returns 
 */
const ContextMenu = (props: ContextMenuProps) => {
  const { x, y, onClose, onEdit, onDelete, visible } = props;


  useEffect(() => {
    const handleClickOutside = () => {
      onClose();
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={styles.contextMenu}
      style={{ left: x, top: y, display: visible ? "block" : "none" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.contextMenuItem} onClick={()=>{
        onClose();
        onEdit(); 
      }}>
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
        </svg>
        <span>{t("editGroup")}</span>
      </div>
      <div className={styles.contextMenuItem} onClick={()=>{
        onClose();
        onDelete();   
      }}>
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
        </svg>
        <span>{t("deleteGroup")}</span>
      </div>
    </div>
  );
};

export default ContextMenu;
