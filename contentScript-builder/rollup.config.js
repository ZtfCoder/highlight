import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import path from "path"
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const parentDir = path.resolve(__dirname, ".."); // 获取当前目录的父级目录

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file:  path.join(parentDir,"heightLight-plug/content.js"),
        format: "es",
        sourcemap: false,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false, // 禁用类型文件生成
        sourceMap: false, // 禁用 sourcemap
      }),
      terser({
        mangle: false, // 禁用变量名压缩
        compress: {
          defaults: false, // 禁用默认压缩选项
        },
      }),
    ],
  }
];
