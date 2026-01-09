import React, { useState } from "react";
import styles from "./EditPanel.module.scss";
import RenderCreateGroupPanel from "./components/RenderCreateGroupPanel";
import RenderEditPanel from "./components/RenderEditPanel";
import RenderImportAndExport from "./components/RenderImportAndExport";
import RenderEditGroupPanel from "./components/RenderEditGroupPanel";
import RenderEmptyState from "./components/RenderEmptyState";
import { t } from "../../../i18n";

interface EditPanelProps {
  selectedHighlight?: HighlightItem;
  groups: HighlightGroup[];
  panelMode: PanelMode;
  onCancel: () => void;
  onCreateGroup: (groupName: string) => void;
  /** 当前选中的 分组  */
  selectedGroupId?: string;
  /** 编辑保存高亮词  */
  onEditSave?: (highlight: HighlightItem, groupId: string) => void;
}

/**
 * 右侧编辑面板组件
 * @param props
 * @returns
 */
const EditPanel = (props: EditPanelProps) => {
  const {
    selectedHighlight,
    groups,
    panelMode,
    selectedGroupId,
    onCancel,
    onCreateGroup,
  } = props;

  return (
    <div className={styles.content}>
      <div className={styles.contentHeader}>
        <h2>
          {panelMode === "createGroup" && t("createNewGroupPanel")}
          {panelMode === "addHighlight" && t("addHighlightPanel")}
          {panelMode === "edit" &&
            selectedHighlight &&
            `${t("editHighlightPanel")}${selectedHighlight.text}`}
          {panelMode === "empty" && t("emptyPanel")}
          {panelMode === "editGroup" && t("editGroupPanel")}
          {panelMode === "importExport" && t("importExportPanel")}
        </h2>
      </div>

      {panelMode === "createGroup" && (
        <RenderCreateGroupPanel
          onCancel={onCancel}
          handleSave={onCreateGroup}
        />
      )}
      {(panelMode === "edit" || panelMode === "addHighlight") && (
        <RenderEditPanel
          selectedHighlight={selectedHighlight}
          groups={groups}
          panelMode={panelMode}
          onCancel={onCancel}
          onEditSave={props.onEditSave}
        />
      )}
      {panelMode === "editGroup" && (
        <RenderEditGroupPanel
          groups={groups}
          selectedGroupId={selectedGroupId}
          panelMode={panelMode}
          onCancel={onCancel}
          handleSave={onCreateGroup}
        />
      )}
      {panelMode === "importExport" && (
        <RenderImportAndExport onCancel={onCancel} groups={groups} />
      )}
      {panelMode === "empty" && <RenderEmptyState />}
    </div>
  );
};

export default EditPanel;
