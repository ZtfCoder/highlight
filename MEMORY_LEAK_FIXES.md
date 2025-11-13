# 高亮插件内存泄露问题分析与修复

## 发现的主要内存泄露问题

### 1. 🚨 **最严重问题：重复订阅事件监听器**
**位置**: `init` 函数的 MutationObserver 回调中
**问题**: 每次 DOM 变化都会重复订阅同一个事件监听器
```typescript
// 原代码 - 问题代码
reapplyTimeout = setTimeout(() => {
  if(enabled){
    applyHighlightStyles(window, document);
  }
  pubsub.subscribe(EVENT.HIGHLIGHTS_REFRESHED, refreshWindowHighlights); // 🚨 每次都重复订阅
  reapplyTimeout = null;
}, 250);
```
**后果**: 同一个函数被重复添加到事件监听器中，造成严重的内存泄露和性能问题

### 2. 🚨 **CSS Highlights 累积问题**
**位置**: `applyHighlightStyles` 函数
**问题**: 每次都会创建新的 CSS.highlights，但没有清理旧的
```typescript
// 原代码 - 问题代码
const highlightName = `highlight-${index}-${Math.random().toString(36).substring(2, 9)}`;
targetWindow.CSS.highlights.set(highlightName, highlightObj); // 🚨 累积越来越多
```
**后果**: CSS highlight 对象在内存中不断累积，从不被清理

### 3. 🚨 **MutationObserver 没有正确清理**
**位置**: `listenerIframeDOMChange` 函数
**问题**: 当 iframe 被移除时，相关的 MutationObserver 没有被正确断开连接
**后果**: Observer 继续监听已不存在的 DOM，造成内存泄露

### 4. 🚨 **Range 对象没有被清理**
**位置**: `findTextRanges` 函数
**问题**: 创建的 Range 对象在某些情况下可能导致内存泄露
**后果**: Range 对象保持对 DOM 节点的引用，阻止垃圾回收

## 修复方案

### 1. **添加资源管理系统**
```typescript
// 用于存储观察器的映射，包含清理函数
const observeMap = new Map<Node, { observer: MutationObserver; cleanup: () => void }>();
// 用于跟踪已注册的highlight名称，便于清理
let currentHighlightNames = new Set<string>();
// 用于存储事件订阅的取消函数
let eventUnsubscribers = new Set<() => void>();
```

### 2. **修复事件监听器重复订阅**
```typescript
// 修复后的代码
let unsubscribeHighlights: (() => void) | null = null;

// 避免重复订阅
if (!unsubscribeHighlights) {
  unsubscribeHighlights = pubsub.subscribe(EVENT.HIGHLIGHTS_REFRESHED, updateHighlightStyles);
}
```

### 3. **添加 CSS Highlights 清理机制**
```typescript
const clearAllHighlightStyles = (targetWindow: Window) => {
  try {
    // 清理所有已注册的highlight
    currentHighlightNames.forEach(name => {
      (targetWindow.CSS.highlights as any).delete(name);
    });
    currentHighlightNames.clear();
    
    // 移除样式元素
    const styleElement = targetWindow.document.querySelector("#highlight-styles");
    if (styleElement) {
      styleElement.remove();
    }
  } catch (e) {
    console.error("清理高亮样式失败:", e);
  }
};
```

### 4. **完善 MutationObserver 清理**
```typescript
// 清理函数
const cleanup = () => {
  observer.disconnect();
  if (reapplyTimeout) {
    clearTimeout(reapplyTimeout);
    reapplyTimeout = null;
  }
  if (unsubscribeHighlights) {
    unsubscribeHighlights();
    unsubscribeHighlights = null;
  }
  clearAllHighlightStyles(targetWindow);
};

// 存储清理函数
observeMap.set(iframe, { observer, cleanup });
```

### 5. **改进 Range 对象处理**
```typescript
// 验证Range是否有效
if (range.startContainer && range.endContainer && 
    targetDocument.contains(range.startContainer) && 
    targetDocument.contains(range.endContainer)) {
  ranges.push(range);
} else {
  // 如果range无效，立即清理
  range.detach();
}
```

### 6. **添加全局清理机制**
```typescript
const cleanup = () => {
  // 清理所有观察器
  observeMap.forEach(entry => {
    entry.cleanup();
  });
  observeMap.clear();
  
  // 清理所有事件订阅
  eventUnsubscribers.forEach(unsubscribe => {
    unsubscribe();
  });
  eventUnsubscribers.clear();
  
  // 清理高亮样式
  clearAllHighlightStyles(window);
};
```

## 性能优化建议

### 1. **防抖优化**
- 将防抖时间从 100ms 调整到 250ms，减少频繁触发
- 在防抖期间避免重复订阅事件

### 2. **Observer 优化**
- 只监听必要的变化类型
- 及时断开不再需要的 Observer

### 3. **内存监控**
- 定期清理无效的高亮样式
- 监控 CSS.highlights 的数量

## 预期效果

修复这些内存泄露问题后，应该能显著改善：
- ✅ 减少内存占用增长
- ✅ 提高页面响应速度  
- ✅ 减少浏览器卡顿
- ✅ 提高插件稳定性

## 验证方法

1. **开发者工具监控**
   - 使用 Chrome DevTools 的 Memory 标签页
   - 观察 heap snapshot 的变化
   - 监控 CSS.highlights 的数量

2. **长期测试**
   - 在页面上长时间使用高亮功能
   - 观察内存使用情况
   - 测试多个 iframe 场景

3. **性能指标**
   - 页面响应时间
   - 高亮应用速度
   - 浏览器内存占用
