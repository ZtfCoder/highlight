import { compareVersions } from "compare-versions";
import Core from "../../../../../core";
import { generateReadableColor } from "../../../../../utils";
import styles from "../../EditPanel.module.scss";
import { v4 as uuidv4 } from "uuid";
import { useMemo, useState } from "react";
import Select from "../../../../../components/Select";
import pubsub, { EVENT } from "../../../../../utils/event";
import { t } from "../../../../../i18n";

type ImportType = "newImport" | "newExport" | "oldImport" | "v2convert";

/**
 * 导入和导出
 * @returns
 */
const RenderImportAndExport = (props: {
  onCancel?: () => void;
  groups: HighlightGroup[];
}) => {
  const { onCancel, groups } = props;

  /** 导入/导出模式 */
  const [importType, setImportType] = useState<ImportType>("newImport");

  /** 选择的分组 */
  const [selectedGroup, setSelectedGroup] = useState(Core.defaultGroupNameId);

  /**
   * 分组的选项
   * 如果是选择的是导出则显示全部和各个分组
   */
  const groupOptions = useMemo(() => {
    const baseOptions = [{ label: t("allGroups"), value: "all" }];
    const groupOpts = groups.map((group) => ({
      label: group.name,
      value: group.id,
    }));
    if (importType === "newExport") {
      return [...baseOptions, ...groupOpts];
    }
    return groupOpts;
  }, [importType, groups]);

  /**
   * 新版本导入
   * @description 这里的导入指的是从其他用户导出的数据进行导入，格式是json
   * todo 待测试
   */
  const handleImport = async () => {
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        const text = await file.text();
        const data = JSON.parse(text);
        if (data.version && compareVersions(data.version, "3.0.0") >= 0) {
          // 解析出来的数据
          const groups: HighlightGroup[] = data.groups || [];
          // 获取当前最新的高亮词
          const highlights: HighlightGroup[] = await Core.getStorage(
            Core.storageKey
          );
          for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            const findGroup = highlights.find((g) => g.id === group.id);
            if (findGroup) {
              // 分组已存在，合并高亮词
              const texts = group.items.map((i) => i.text);
              // 去除重复的高亮词
              const newItems = findGroup.items.filter(
                (item) => !texts.includes(item.text)
              );
              // 合并高亮词
              findGroup.items = [...group.items, ...newItems];
            } else {
              // 分组不存在，直接添加
              highlights.push(group);
            }
          }
          pubsub.publish(EVENT.updateGroups, highlights);
          alert(t("importSuccess"));
        } else {
          alert(t("importFailedOldVersion"));
        }
      };
      input.click();
    } catch (e) {
      console.error("Import error:", e);
      alert(t("importFailedNewVersion"));
    }
  };

  /**
   * 新版本导出
   * @description 这里的导出指的是把当前用户的高亮词导出，格式是json
   */
  const handleExport = async () => {
    try {
      const highlights = (await Core.getStorage(
        Core.storageKey
      )) as HighlightGroup[];
      const data = {
        version: "3.0.0",
        exportedAt: new Date().toLocaleDateString(),
        groups: highlights,
      };
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `highlights-export-${new Date().getTime()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export error:", e);
      alert(t("exportFailed"));
    }
  };

  /**
   * 旧版本导入
   * @description 这里的导入指的是导入v3版本以下的关键词文件，格式是txt，内容是关键词列表（逗号、空格、换行分隔）
   */
  const handleOldVersionImport = async () => {
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".txt";
      input.onchange = (event: any) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e: any) => {
          const content = e.target.result;
          try {
            const lines = content
              .split(/[\s,，\n]+/)
              .map((text: string) => text.trim())
              .filter((line: string) => line)
              .map((item: string) => ({
                text: item.trim(),
                color: generateReadableColor(),
                // uuid 随机数
                id: uuidv4(),
                textColor: "#ffffff",
                enabled: true,
                isUnderline: false,
                isWavy: false,
              }));
            if (Array.isArray(lines)) {
              // 解析出来的数据
              const items: HighlightItem[] = lines || [];
              // 获取当前最新的高亮词
              const groups: HighlightGroup[] = await Core.getStorage(
                Core.storageKey
              );
              const currentGroup = groups.find((g) => g.id === selectedGroup)!;
              const texts = new Set(items.map((i) => i.text));
              const newItems = [...items];
              currentGroup?.items.forEach((item) => {
                if (!texts.has(item.text)) {
                  newItems.push(item);
                }
              });
              currentGroup.items = newItems;
              pubsub.publish(EVENT.updateGroups, groups);
              alert(t("importSuccess"));
            } else {
              alert(t("importFileFormatError"));
            }
          } catch (error) {
            console.error(t("parseFileFailed"), error);
            alert(t("parseError"));
          }
        };
        reader.readAsText(file);
      };
      input.click();
    } catch (e) {}
  };

  const handleConvertImport = async () => {
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        debugger;
        const text = await file.text();
        const data = JSON.parse(text);
        if (data && Array.isArray(data)) {
          // 解析出来的数据
          const items: HighlightItem[] = data || [];
          // 获取当前最新的高亮词
          const groups: HighlightGroup[] = await Core.getStorage(
            Core.storageKey
          );
          const currentGroup = groups.find((g) => g.id === selectedGroup)!;
          const texts = new Set(items.map((i) => i.text));
          const newItems = [...items];
          currentGroup?.items.forEach((item) => {
            if (!texts.has(item.text)) {
              newItems.push(item);
            }
          });
          currentGroup.items = newItems;
          pubsub.publish(EVENT.updateGroups, groups);
          alert(t("importSuccess"));
        } else {
          alert(t("importFailedOldVersion"));
        }
      };
      input.click();
    } catch (e) {}
  };

  const handleOk = () => {
    if (importType === "newImport") {
      handleImport();
    } else if (importType === "newExport") {
      handleExport();
    } else if (importType === "oldImport") {
      handleOldVersionImport();
    } else if (importType === "v2convert") {
      handleConvertImport();
    }
  };

  return (
    <>
      <div className={styles.editPanel}>
        <div className={styles.formGroup}>
          <label htmlFor="mport-button">{t("importTypeLabel")}</label>
          <Select
            id="import-type"
            value={importType}
            onChange={(e) => {
              setImportType(e as ImportType);
              // 如果不是导出，并且当前选择的是全部分组，则切换到默认分组
              if (e !== "newExport" && selectedGroup === "all") {
                setSelectedGroup(Core.defaultGroupNameId);
              }
            }}
            options={[
              { label: t("newVersionImport"), value: "newImport" },
              { label: t("newVersionExport"), value: "newExport" },
              { label: t("oldVersionImport"), value: "oldImport" },
              { label: t("v2VersionImport"), value: "v2convert" },
            ]}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="group-select">{t("groupSelectLabel")}</label>
          <Select
            id="group-select"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e)}
            options={groupOptions}
          />
        </div>
        <div>
          <ul>
            <li>
              {t("newVersionImportDesc")}
            </li>
            <li>
              {t("newVersionExportDesc")}
            </li>
            <li>
              {t("v2VersionImportDesc")}
            </li>
            <li>
              {t("oldVersionImportDesc")}
            </li>
          </ul>
        </div>

        <div className={styles.actionButtons}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            {t("cancel")}
          </button>
          <button className={styles.saveBtn} onClick={handleOk}>
            {t("confirm")}
          </button>
        </div>
      </div>
    </>
  );
};

export default RenderImportAndExport;
