# ApiForge · 接口自动化测试平台

一个基于浏览器的接口调试与自动化测试工具，采用 React + TypeScript + Vite 构建。支持接口集合管理、请求编辑、环境变量、测试断言与测试集运行报告。

> 当前版本内置 mock 执行引擎（`src/engine.ts`），无需真实后端即可完整体验发送请求、断言校验与测试集报告流程。接入真实后端时替换 `executeRequest` 即可。

## 功能特性

- 接口集合管理：按服务分组、搜索、新建请求、多标签页
- 请求编辑：HTTP 方法、URL（支持 `{{变量}}` 占位符）、Query 参数、请求头、请求体（JSON / form-data / x-www-form-urlencoded / raw）
- 测试断言：状态码、响应时间、JSON 路径、响应头、响应体包含，支持等于 / 不等于 / 大于 / 小于 / 包含 / 存在等运算符
- 响应查看：响应体、响应头、Cookies、断言结果
- 环境切换：开发 / 测试 / 生产三套环境变量
- 测试集运行：一键运行全部接口并生成汇总报告

## 技术栈

- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)（strict 模式）
- [Vite 5](https://vitejs.dev/)
- [lucide-react](https://lucide.dev/)

## 环境要求

- Node.js >= 18
- npm（推荐使用仓库中的 `package-lock.json` 保持一致）

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建
npm run build

# 本地预览生产构建产物
npm run preview

# 类型检查
npm run typecheck
```

## 可用脚本

| 脚本 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run preview` | 预览生产构建产物 |
| `npm run typecheck` | 运行 TypeScript 类型检查 |
| `npm run lint` | 类型检查（与 `typecheck` 等价，待接入 ESLint） |

## 项目结构

```
src/
├── main.tsx                # 应用入口
├── App.tsx                 # 根组件与状态编排
├── types.ts                # 领域类型定义
├── data.ts                 # 种子数据（接口集合、环境变量）
├── engine.ts               # 请求执行与断言引擎（当前为 mock）
├── id.ts                   # 唯一 ID 生成
├── components/             # UI 组件
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── RequestEditor.tsx
│   ├── ResponsePanel.tsx
│   ├── RunnerModal.tsx
│   ├── AssertionEditor.tsx
│   ├── KeyValueEditor.tsx
│   ├── JsonView.tsx
│   └── MethodBadge.tsx
└── styles/
    └── index.css
```

## 关于 mock 数据

默认种子数据与 mock 响应中的账号、口令、Token 均为演示用途的虚构值，请勿用于生产环境。接入真实服务时，请将环境变量中的 Token 等敏感信息迁移到环境变量文件（`.env`，已被 `.gitignore` 忽略）并妥善保管。
