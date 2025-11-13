
/**
 * 发布订阅
 */
class PubSub {
  private events: Map<string, Set<Function>> = new Map(); // eventName -> Set of handlers
  constructor() {
   
  }

  subscribe(eventName: string, handler: Function): () => void {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    this.events.get(eventName)?.add(handler);
    // 返回取消订阅的函数
    return () => this.unsubscribe(eventName, handler);
  }

  unsubscribe(eventName: string, handler: Function): void {
    const set = this.events.get(eventName);
    if (!set) return;
    set.delete(handler);
    if (set.size === 0) this.events.delete(eventName);
  }

  publish(eventName: string, payload?: any): void {
    const set = this.events.get(eventName);
    if (!set) return;
    // 拷贝一份，防止订阅者在回调中修改集合
    Array.from(set).forEach((handler) => {
      try {
        handler(payload);
      } catch (e) {
        console.error(`PubSub handler error for ${eventName}:`, e);
      }
    });
  }
}

export const EVENT = {
  /** 刷新高亮 */
   HIGHLIGHTS_REFRESHED: "highlightsRefreshed"
}

const pubsub = new PubSub();


export default pubsub;