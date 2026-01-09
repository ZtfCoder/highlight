import { useState } from "react";
import styles from "../../EditPanel.module.scss";
import { t } from "../../../../../i18n";
/**
 * 新增分组
 * @returns
 */
 const RenderCreateGroupPanel = (props: {
  onCancel?: () => void;
  handleSave?: (groupName: string) => void;
}) => {
  // 新增状态
  const [newGroupName, setNewGroupName] = useState("");

  const { onCancel ,handleSave} = props;


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

      <div className={styles.actionButtons}>
        <button className={styles.cancelBtn} onClick={onCancel}>
          {t("cancel")}
        </button>
        <button
          className={styles.saveBtn}
          onClick={()=>handleSave?.(newGroupName.trim(),)}
          disabled={!newGroupName.trim()}
        >
          {t("createGroup")}
        </button>
      </div>
    </div>
  );
};

export default RenderCreateGroupPanel;