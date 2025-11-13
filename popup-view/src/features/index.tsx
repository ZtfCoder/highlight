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
      id: "default",
      name: "默认分组",
      enabled: true,
      items: [
        {
          id: "1",
          text: "重要通知323232",
          color: "#ffeb3b",
          enabled: true,
          textColor: "inherit",
        },
        {
          id: "2",
          text: "技术文档",
          color: "#4caf50",
          enabled: true,
          textColor: "inherit",
        },
        {
          id: "3",
          text: "错误信息",
          color: "#f44336",
          enabled: true,
          textColor: "inherit",
        },
        {
          id: "4",
          text: "开发提示",
          color: "#2196f3",
          enabled: true,
          textColor: "inherit",
        },
      ],
    },
    {
      id: "frontend",
      name: "前端相关3232",
      enabled: true,
      items: [
        {
          id: "5",
          text: "前端框架",
          color: "#e91e63",
          enabled: true,
          textColor: "inherit",
        },
        {
          id: "6",
          text: "待办事项",
          color: "#ff9800",
          enabled: true,
          textColor: "inherit",
        },
      ],
    },
    {
      id: "backend",
      name: "后端相关",
      enabled: true,
      items: [
        {
          id: "7",
          text: "后端接口",
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
          name: "默认分组",
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
          name: "默认分组",
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
      alert("分组名称不能为空");
      return;
    }

    if (originId) {
      // 编辑
      const originGroup = groups.find((g) => g.id === originId);
      if (!originGroup) {
        alert("原分组不存在");
        return;
      }
      // 判断名称是否重复
      const exists = groups.some(
        (group) => group.name === groupName && group.id !== originId
      );
      if (exists) {
        alert("分组名称已存在，请使用其他名称");
        return;
      }
      originGroup.name = groupName;
      // 判断下是否修改了 newGroupId
      if (targetGroupId && targetGroupId !== originId) {
        // 分组id改变了
        const confirm = window.confirm(
          "确定要将该分组下的高亮词移动到新分组吗？移动后该分组将被删除"
        );
        if (!confirm) {
          return;
        }
        // 移动高亮词到新分组
        const targetGroup = groups.find((g) => g.id === targetGroupId);
        if (!targetGroup) {
          alert("目标分组不存在");
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
        alert("分组名称已存在，请使用其他名称");
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
      "确定删除该分组吗？删除分组后，分组内的高亮词将被全部删除！！！"
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
          <h3 className={styles.title}>文字高亮 <span className={styles.version}>当前版本:{version}</span></h3>
          {/* 全局开关 */}
        <div className={styles.globalSwitch}>
          <span className={styles.switchLabel}>全局开启</span>
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
