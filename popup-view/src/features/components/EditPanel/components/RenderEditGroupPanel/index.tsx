import { useState, useEffect } from "react";
import styles from "../../EditPanel.module.scss";
import Select from "../../../../../components/Select";
import { t } from "../../../../../i18n";

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
  }, [panelMode, originId, groups]);

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
