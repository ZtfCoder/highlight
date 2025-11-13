/**
 * 高亮项目类型定义
 */
export interface HighlightItem {
  id: string;
  text: string;
  color: string;
  textColor?: string;
  colorName: string;
  selector?: string;
  isUnderline?: boolean;
  isWavy?: boolean;
  createdAt?: number;
}

// 因为原代码中使用了全局 Highlight，这里也需要声明它
declare global {
  interface HighlightRegistry {
    set(name: string, highlight: any): void;
    get(name: string): any | undefined;
    delete(name: string): boolean;
    clear(): void;
  }

  interface CSS {
    highlights: HighlightRegistry;
  }
}
