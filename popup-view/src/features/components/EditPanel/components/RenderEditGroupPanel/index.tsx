import { useState, useEffect } from "react";
import styles from "../../EditPanel.module.scss";
import Select from "../../../../../components/Select";

/**
 * 编辑分组
 * @returns
 */
const RenderEditGroupPanel = (props: {
  panelMode: PanelMode;
  groups: HighlightGroup[];
  onCancel?: () => void;
  handleSave?: (groupName: string, targetGroupId?: string, originId?: string) => void;
  selectedGroupId?: string;
}) => {
  const { panelMode, groups, onCancel, handleSave, selectedGroupId:originId } = props;

  const [targetGroupId, setTargetGroupId] = useState<string>();

  const [newGroupName, setNewGroupName] = useState("");
  
  useEffect(() => {
    if (panelMode === "editGroup") {
      setNewGroupName(groups.find((g) => g.id === originId)?.name || "");
    } else {
      setNewGroupName("");
    }
    setTargetGroupId(originId);
  }, [panelMode, originId]);

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

      <div className={styles.formGroup}>
        <label htmlFor="move-group-name">
          移动到其他分组
          <b className={styles.labelDesc}>
            (请注意你在做什么！！！，如果你不知道这个选项，不要随意更改这个选项，不可恢复！！！)
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

      <div className={styles.actionButtons}>
        <button className={styles.cancelBtn} onClick={onCancel}>
          取消
        </button>
        <button
          className={styles.saveBtn}
          onClick={() => handleSave?.(newGroupName.trim(), targetGroupId, originId)}
          disabled={!newGroupName.trim()}
        >
          保存修改
        </button>
      </div>
    </div>
  );
};

export default RenderEditGroupPanel;
