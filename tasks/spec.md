# Spec: 项目代码规范化（符合 GitHub 上传标准）

## Goal

依据 coding-standards 技能，对现有 ApiForge 项目进行整理，使其达到可直接上传 GitHub 的工程规范与可维护性标准。

## Inputs / Outputs

- 输入：现有 Vite + React + TypeScript 源码、`package.json`、`tsconfig.json`、`vite.config.ts`、`.gitignore`。
- 输出：通过构建与类型检查的规范化代码库、完整的 `README.md`、GitHub 上传所需的元数据与忽略规则、以及规范的首个提交。

## Constraints

- 不改变现有功能与交互行为。
- TypeScript 保持 strict 模式，构建（`tsc -b && vite build`）与类型检查（`tsc --noEmit`）必须通过。
- 不引入新的运行时依赖；仅补充必要的工程元数据。

## Edge Cases

- 源码中的中文字符串必须保持 UTF-8 编码正确，避免乱码。
- `node_modules`、构建产物 `dist`、日志文件（`*.log`）与本地环境变量（`.env`）不得被纳入版本控制。

## Out of Scope

- 不接入真实后端（保持现有 mock 引擎）。
- 不选择开源许可证（`private: true`，如后续需要再单独决策）。
- 不新增 ESLint/Prettier 依赖（本次以 `tsc --noEmit` 作为静态检查）。

## Acceptance Criteria

- `npm run build` 退出码为 0，产出 `dist/`。
- `npm run typecheck` 退出码为 0。
- 代码中无 `console.log`、`any`、`TODO`、`debugger`、`@ts-ignore` 等红旗。
- `README.md` 完整说明项目、技术栈、启动方式、脚本与目录结构。
- `package.json` 具备 `description` 与合理的 Node 版本约束。
- `.gitignore` 覆盖依赖、构建产物、日志与本地环境变量。
- 存在规范的首个提交（Conventional Commit 格式）。

## Test Stubs

本次为规范化任务，以构建与静态检查作为自动化验证，不新增单元测试。
