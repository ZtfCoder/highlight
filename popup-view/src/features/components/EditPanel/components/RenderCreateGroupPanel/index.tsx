import { useState } from "react";
import styles from "../../EditPanel.module.scss";
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
        <label htmlFor="group-name">分组名称</label>
        <input
          type="text"
          id="group-name"
          placeholder="输入新分组名称"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.actionButtons}>
        <button className={styles.cancelBtn} onClick={onCancel}>
          取消
        </button>
        <button
          className={styles.saveBtn}
          onClick={()=>handleSave?.(newGroupName.trim(),)}
          disabled={!newGroupName.trim()}
        >
          创建分组
        </button>
      </div>
    </div>
  );
};

export default RenderCreateGroupPanel;