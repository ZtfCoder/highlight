/**
 * 16进制颜色转RGB字符串
 * @param hex 例如 #ffcc00 或 ffcc00
 * @returns 例如 'rgb(255,204,0)'
 */
export function hexToRgb(hex: string): string {
  let h = hex.replace(/^#/, "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((x) => x + x)
      .join("");
  }
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgb(${r},${g},${b})`;
}

/**
 * 计算颜色的相对亮度
 * @param hexColor 16进制颜色字符串
 * @returns 颜色的相对亮度值
 */
export const calculateLuminance = (hexColor: string) => {
  // 16进制转rgb
  const color = hexToRgb(hexColor);

  // 提取RGB值
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  // 伽马校正
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  // 计算相对亮度（W3C公式）
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * 根据背景色获取合适的文本颜色
 * @param bgColor 背景色（16进制颜色字符串）
 * @returns 文本颜色（黑色或白色）
 */
export const getTextColor = (bgColor: string): string => {
  const luminance = calculateLuminance(bgColor);
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
};

/**
 * 生成随机颜色
 * @description 生成适合文字显示的颜色，确保文字（白色或黑色）可见
 * @returns {string} 随机颜色的十六进制值
 */
export const generateReadableColor = () => {
  const getRandomValue = () => Math.floor(Math.random() * 256);
  let r, g, b;

  do {
    r = getRandomValue();
    g = getRandomValue();
    b = getRandomValue();
  } while (!isReadable(r, g, b));

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const isReadable = (r: number, g: number, b: number): boolean => {
  // 计算亮度值
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  // 确保亮度适中，避免太亮或太暗
  return brightness > 50 && brightness < 200;
};

/**
 * 将数字转换为两位十六进制字符串
 * @param {number} value 数字值
 * @returns {string} 十六进制字符串
 */
const toHex = (value: number): string => {
  const hex = value.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
};
