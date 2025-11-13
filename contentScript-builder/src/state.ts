// 用于存储观察器的映射，包含清理函数
export const observeMap = new Map<
  Node,
  {
    observer: MutationObserver;
    cleanup: () => void;
    heightlightNames: Set<string>;
  }
>();

// 高亮对象数组
export let highlightGroups: HighlightGroup[] = [];

// 是否开启
export let enabled = true;

// 用于跟踪已注册的highlight名称，便于清理
export const currentHighlightNames = new Set<string>();

// 用于存储事件订阅的取消函数
export const eventUnsubscribers = new Set<() => void>();

// 更新高亮对象数组
export const setHighlightGroups = (groups: HighlightGroup[]) => {
  highlightGroups = groups;
};

// 更新启用状态
export const setEnabled = (isEnabled: boolean) => {
  enabled = isEnabled;
};
