import React, { useEffect, useState } from "react";
import styles from "./HighlightPlugin.module.scss";
import Sidebar from "./components/Sidebar";
import EditPanel from "./components/EditPanel";
import ContextMenu from "./components/ContextMenu";
import { ContextData } from "./components/ContexData/ContexData";
import { v4 as uuidv4 } from "uuid";
import Switch from "../components/Switch";
import Core from "../core";
import pubsub, { EVENT } from "../utils/event";
import {version} from "./../../../package.json"
import { t } from "../i18n";

/**
 * v3 版本 高亮插件
 * @returns
 */
const FeaturesApp = () => {
  /** 全局开关 */
  const [globalEnabled, setGlobalEnabled] = useState(true);
  /** 选中的高亮项 */
  const [selectedHighlight, setSelectedHighlight] = useState<HighlightItem>();
  /** 选中的分组ID */
  const [selectedGroupId, setSelectedGroupId] = useState<string>();
  /** 右侧面板模式 */
  const [panelMode, setPanelMode] = useState<PanelMode>("empty");
  /** 右键菜单状态 */
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    groupId?: string;
  }>({ visible: false, x: 0, y: 0 });

  // 示例数据
  const [groups, setGroups] = useState<HighlightGroup[]>([
    {
      id: Core.defaultGroupNameId,
      name: t("defaultGroup"),
      enabled: true,
      items: [
        {
          id: "1",
          text: "Important Notice",
          color: "#ffeb3b",
          enabled: true,
          textColor: "inherit",
        },
        {
          id: "2",
          text: "Technical Documentation",
          color: "#4caf50",
          enabled: true,
          textColor: "inherit",
        },
        {
          id: "3",
          text: "Error Message",
          color: "#f44336",
          enabled: true,
          textColor: "inherit",
        },
        {
          id: "4",
          text: "Development Tips",
          color: "#2196f3",
          enabled: true,
          textColor: "inherit",
        },
      ],
    },
    {
      id: "frontend",
      name: t("frontendGroup"),
      enabled: true,
      items: [
        {
          id: "5",
          text: "Frontend Framework",
          color: "#e91e63",
          enabled: true,
          textColor: "inherit",
        },
        {
          id: "6",
          text: "Todo Items",
          color: "#ff9800",
          enabled: true,
          textColor: "inherit",
        },
      ],
    },
    {
      id: "backend",
      name: t("backendGroup"),
      enabled: true,
      items: [
        {
          id: "7",
          text: "Backend API",
          color: "#9c27b0",
          enabled: true,
          textColor: "inherit",
        },
      ],
    },
  ]);

  // 订阅更新分组事件
  useEffect(() => {
    const updateGroups = (newGroups: HighlightGroup[]) => {
      const defaultGroup = newGroups.find(
        (item) => item.id === Core.defaultGroupNameId
      )!;
      // 确保默认分组使用国际化的名称
      if (defaultGroup) {
        defaultGroup.name = t("defaultGroup");
      }
      // 排序
      const groups = newGroups
        .filter((item) => item.id !== Core.defaultGroupNameId)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((group) => ({
          ...group,
          items: group.items.sort((a, b) => a.text.localeCompare(b.text)),
        }));
      setGroups([defaultGroup, ...groups]);
      handleRefreshHighlights([defaultGroup, ...groups]);
    };
    pubsub.subscribe(EVENT.updateGroups, updateGroups);
    return () => pubsub.unsubscribe(EVENT.updateGroups, updateGroups);
  }, []);

  /**
   * 初始化数据
   */
  const initData = async () => {
    const data: HighlightGroup[] =
      (await Core.getStorage(Core.storageKey)) || [];
    if (
      Array.isArray(data) &&
      data.some((item) => item.id === Core.defaultGroupNameId)
    ) {
      const defaultGroup = data.find(
        (item) => item.id === Core.defaultGroupNameId
      )!;
      // 确保默认分组使用国际化的名称
      defaultGroup.name = t("defaultGroup");
      const newGroups = data
        .filter((item) => item.id !== Core.defaultGroupNameId)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((group) => ({
          ...group,
          items: group.items.sort((a, b) => a.text.localeCompare(b.text)),
        }));
      setGroups([defaultGroup, ...newGroups]);
    } else if (Array.isArray(data)) {
      // 如果没有默认分组，则添加一个
      const groups = [
        {
          id: Core.defaultGroupNameId,
          name: t("defaultGroup"),
          items: [],
          enabled: true,
        },
        ...data
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((group) => ({
            ...group,
            items: group.items.sort((a, b) => a.text.localeCompare(b.text)),
          })),
      ];
      setGroups(groups);
      Core.setStorage(Core.storageKey, groups);
    } else {
      const groups: HighlightGroup[] = [
        {
          id: Core.defaultGroupNameId,
          name: t("defaultGroup"),
          items: [],
          enabled: true,
        },
      ];
      setGroups(groups);
      Core.setStorage(Core.storageKey, groups);
    }
   const highlightEnabled =  await Core.getStorage("highlightEnabled")
   setGlobalEnabled(highlightEnabled===undefined?true:highlightEnabled);
  };

  // 初始化
  useEffect(() => {
    initData();
  }, []);

  /**
   * 处理选中高亮项
   * @param highlight
   */
  const handleHighlightSelect = (highlight: HighlightItem) => {
    setSelectedHighlight(highlight);
    setPanelMode("edit");
  };

  /**
   * 处理创建分组
   */
  const handleCreateGroup = () => {
    setPanelMode("createGroup");
    setSelectedGroupId(undefined);
    setSelectedHighlight(undefined);
  };

  /**
   * 处理添加高亮词
   */
  const handleAddHighlight = () => {
    setPanelMode("addHighlight");
    setSelectedHighlight(undefined);
  };

  /**
   * 处理导入和导出
   */
  const handleImportExport = () => {
    setPanelMode("importExport");
  };

  /**
   * 处理右键菜单
   * @param e event
   * @param groupId 分组id
   */
  const handleGroupContextMenu = (e: React.MouseEvent, groupId: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      groupId,
    });
  };

  /**
   * 关闭右键菜单
   */
  const handleContextMenuClose = () => {
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  /**
   *  处理创建/编辑分组
   * @param groupName 分组名称
   * @param targetGroupId 新分组id
   * @param originId 原分组id，编辑分组时传入
   */
  const handleCreateOrEditNewGroup = (
    groupName: string,
    targetGroupId?: string,
    originId?: string
  ) => {
    if (!groupName.trim()) {
      alert(t("groupNameEmpty"));
      return;
    }

    if (originId) {
      // 编辑
      const originGroup = groups.find((g) => g.id === originId);
      if (!originGroup) {
        alert(t("groupNotFound"));
        return;
      }
      // 判断名称是否重复
      const exists = groups.some(
        (group) => group.name === groupName && group.id !== originId
      );
      if (exists) {
        alert(t("groupNameExists"));
        return;
      }
      originGroup.name = groupName;
      // 判断下是否修改了 newGroupId
      if (targetGroupId && targetGroupId !== originId) {
        // 分组id改变了
        const confirm = window.confirm(
          t("moveGroupConfirm")
        );
        if (!confirm) {
          return;
        }
        // 移动高亮词到新分组
        const targetGroup = groups.find((g) => g.id === targetGroupId);
        if (!targetGroup) {
          alert(t("targetGroupNotFound"));
          return;
        }
        // 合并,如果有重复的名称，则以当前分组的高亮词为主
        const names = originGroup.items.map((item) => item.text);
        const newTargetItems = targetGroup.items.filter(
          (item) => !names.includes(item.text)
        );
        targetGroup.items = [...newTargetItems, ...originGroup.items];
        const newGroups = groups.filter((g) => g.id !== originId);
        setGroups(newGroups);
        handleRefreshHighlights(newGroups);
      } else {
        // 只修改了名字
        setGroups([...groups]);
        handleRefreshHighlights([...groups]);
      }
    } else {
      // 新增
      const exists = groups.some((group) => group.name === groupName);
      if (exists) {
        alert(t("groupNameExists"));
        return;
      }
      const newGroup: HighlightGroup = {
        id: uuidv4(),
        name: groupName,
        items: [],
        enabled: true,
      };
      const newGroups = [...groups, newGroup];
      setGroups(newGroups);
      handleRefreshHighlights(newGroups);
    }
    handleCancel();
  };

  /**
   * 处理取消操作
   */
  const handleCancel = () => {
    setSelectedHighlight(undefined);
    setSelectedGroupId(undefined);
    setPanelMode("empty");
  };

  /**
   * 处理删除分组
   * @param groupId
   */
  const handleDeleteGroup = () => {
    const isConfirmed = confirm(
      t("deleteGroupConfirm")
    );
    if (isConfirmed) {
      const newGroups = groups.filter(
        (group) => group.id !== contextMenu.groupId
      );
      setGroups(newGroups);
      handleRefreshHighlights(newGroups);
    }
    handleCancel();
  };

  /**
   * 处理编辑保存高亮词
   * @param highlight 高亮词对象
   * @param groupId 分组id
   * @returns
   */
  const handleEditSaveHighlight = async (
    highlight: HighlightItem,
    groupId: string
  ) => {
    // 如果分组改变了，需要把高亮词从原分组移除，添加到新分组
    const originalGroup = groups.find((group) =>
      group.items.some((i) => i.id === highlight.id)
    );

    if (!originalGroup) {
      //新增高亮词
      const newGroups = groups.map((group) =>
        group.id === groupId
          ? { ...group, items: [...group.items, highlight] }
          : group
      );
      setGroups(newGroups);
      await handleRefreshHighlights(newGroups);
      handleCancel();
      return;
    }

    if (originalGroup.id !== groupId) {
      // 分组改变了
      // 需要移除原分组的高亮词,添加到新分组
      const newGroups = groups.map((group) => {
        if (group.id === originalGroup.id) {
          return {
            ...group,
            items: group.items.filter((i) => i.id !== highlight.id),
          };
        } else if (group.id === groupId) {
          return {
            ...group,
            items: [
              ...group.items.filter((i) => i.id !== highlight.id),
              highlight,
            ],
          };
        }
        return group;
      });
      setGroups(newGroups);
      await handleRefreshHighlights(newGroups);
      handleCancel();
    } else {
      // 分组没变，直接更新高亮词
      const newGroups = groups.map((group) => ({
        ...group,
        items: group.items.map((item) =>
          item.id === highlight.id ? highlight : item
        ),
      }));
      setGroups(newGroups);
      await handleRefreshHighlights(newGroups);
      handleCancel();
    }
  };

  /**
   * 处理批量保存高亮词
   * @param highlights 高亮词数组
   * @param groupId 分组id
   */
  const handleBatchSaveHighlights = async (
    highlights: HighlightItem[],
    groupId: string
  ) => {
    const targetGroup = groups.find((g) => g.id === groupId);
    if (!targetGroup) return;

    // 过滤掉已存在的高亮词（按文本去重）
    const existingTexts = new Set(targetGroup.items.map((item) => item.text));
    const newHighlights = highlights.filter(
      (h) => !existingTexts.has(h.text)
    );

    if (newHighlights.length === 0) {
      alert(t("allHighlightsExist") || "所有高亮词已存在");
      return;
    }

    const newGroups = groups.map((group) =>
      group.id === groupId
        ? { ...group, items: [...group.items, ...newHighlights] }
        : group
    );
    setGroups(newGroups);
    await handleRefreshHighlights(newGroups);
    handleCancel();
  };

  /**
   * 应用统一样式到分组内所有高亮词
   * @param groupId 分组id
   * @param style 样式设置
   */
  const handleApplyUniformStyle = async (
    groupId: string,
    style: { textColor: string; bgColor: string; underline: boolean; wavy: boolean }
  ) => {
    const newGroups = groups.map((group) => {
      if (group.id === groupId) {
        return {
          ...group,
          items: group.items.map((item) => ({
            ...item,
            textColor: style.textColor,
            color: style.bgColor,
            isUnderline: style.underline,
            isWavy: style.wavy,
          })),
        };
      }
      return group;
    });
    setGroups(newGroups);
    await handleRefreshHighlights(newGroups);
  };

  /**
   * 修改分组启用和禁用
   * @param groupId 分组id
   * @param enabled
   */
  const onGroupEnabled = (groupId: string, enabled: boolean) => {
    const newGroups = groups.map((group) => {
      if (group.id === groupId) {
        return {
          ...group,
          enabled,
        };
      }
      return group;
    });
    setGroups(newGroups);
    handleRefreshHighlights(newGroups);
  };

  /**
   * 处理高亮词启用和禁用
   * @param highlightId 高亮词id
   * @param enabled 是否启用
   * @param groupId 所属分组id
   * @returns
   */
  const onHighlightEnabled = async (
    highlightId: string,
    enabled: boolean,
    groupId: string
  ) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;
    group.items = group.items.map((item) => {
      if (item.id === highlightId) {
        return {
          ...item,
          enabled,
        };
      }
      return item;
    });
    setGroups([...groups]);
    // 通知当前标签页更新
    handleRefreshHighlights(groups);
  };

  /**
   * 刷新页面高亮
   * @param groups
   */
  const handleRefreshHighlights = async (groups: HighlightGroup[]) => {
    // 存储 高亮词组
    const tabs = await Core.tabsQuery({ active: true, currentWindow: true });
    Core.tabSendMessage(tabs[0].id, {
      action: "refreshHighlights",
      groups,
    });
  };

  /** 删除高亮项 */
  const onDeleteHighlight = (highlight: HighlightItem) => {
    const newGroups = groups.map((group) => ({
      ...group,
      items: group.items.filter((item) => item.id !== highlight.id),
    }));
    setGroups(newGroups);
    handleRefreshHighlights(newGroups);
  };

  const handleChangeGlobalEnabled = async (checked:boolean)=>{
    setGlobalEnabled(checked);
    const tabs = await Core.tabsQuery({ active: true, currentWindow: true });
    Core.tabSendMessage(tabs[0].id, {
      action: "setGlobalEnabled",
      enabled:checked
    });
  }

  return (
    <ContextData.Provider
      value={{ globalEnabled, setGlobalEnabled, groups, setGroups }}
    >
      <div className={styles.highlightPlugin}>
       <div className={styles.header}>
          <h3 className={styles.title}>{t("mainTitle")} <span className={styles.version}>{t("currentVersionLabel")}{version}</span></h3>
          {/* 全局开关 */}
        <div className={styles.globalSwitch}>
          <span className={styles.switchLabel}>{t("globalEnable")}</span>
          <Switch
            checked={globalEnabled}
            onChange={handleChangeGlobalEnabled}
            size={"small"}
          />
        </div>
       </div>
        

        <div className={styles.mainContainer}>
          <Sidebar
            groups={groups}
            onHighlightSelect={handleHighlightSelect}
            onGroupContextMenu={handleGroupContextMenu}
            onCreateGroup={handleCreateGroup}
            onAddHighlight={handleAddHighlight}
            onImportExport={handleImportExport}
            onGroupEnabled={onGroupEnabled}
            onHighlightEnabled={onHighlightEnabled}
            onDeleteHighlight={onDeleteHighlight}
          />

          <EditPanel
            selectedHighlight={selectedHighlight}
            groups={groups}
            panelMode={panelMode}
            onCancel={handleCancel}
            onCreateGroup={handleCreateOrEditNewGroup}
            onEditSave={handleEditSaveHighlight}
            onBatchSave={handleBatchSaveHighlights}
            onApplyUniformStyle={handleApplyUniformStyle}
            selectedGroupId={selectedGroupId}
          />
        </div>

        <ContextMenu
          visible={contextMenu.visible}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={handleContextMenuClose}
          onEdit={() => {
            // console.log("Edit group:", contextMenu.groupId);
            setSelectedGroupId(contextMenu.groupId);
            setPanelMode("editGroup");
          }}
          onDelete={handleDeleteGroup}
        />
      </div>
    </ContextData.Provider>
  );
};

export default FeaturesApp;
