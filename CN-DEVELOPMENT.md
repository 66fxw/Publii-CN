# Publii-CN 二次开发说明

本文档记录 Publii-CN 相对上游 `GetPublii/Publii` 的改动，方便后续维护与重新生成。

## 分支与远端

- `upstream` → `https://github.com/GetPublii/Publii.git`（原始仓库）
- `origin` → `https://github.com/66fxw/Publii-CN.git`（Fork 仓库）
- 开发分支：`dev/cn-secondary`

## 改动清单

### 1. 简体中文界面语言包
- 新增目录：`app/default-files/default-languages/zh-cn/`
  - `config.json`（name=简体中文，momentLocale=zh-cn）
  - `translations.json`（主界面翻译，key 与 en-gb 完全一致）
  - `wysiwyg.json`（编辑器翻译）
  - `thumbnail.svg`
- 在四个语言包的 `translations.json` 中新增：
  - `settings.appAppearance` / `appAppearanceNote` / `appAppearancePublii` / `appAppearanceWordpress`
  - `wpPanel.*`（右侧面板 31 个键）

### 2. WordPress 风格后台外观
- 新增生成器：`build/scripts/generate-wordpress-appearance.js`
  - 从 `publii.css` 派生，替换调色板为 WordPress 经典配色（#f0f0f1 画布、#2271b1 主色、#23282d 深色侧边栏）。
  - 中文字体栈、更方正的圆角。
  - 生成产物：`app/src/css/appearances/wordpress.css`（请勿手改，改生成器后重跑 `node build/scripts/generate-wordpress-appearance.js`）。
- `app/src/helpers/app-appearance.js`：注册 `wordpress` 外观（复用全部 workspace accents）。
- `app/src/components/App.vue`：导入 `wordpress.css`。
- `app/src/components/AppSettings.vue`：新增「界面风格」下拉框，保存 `appAppearance` 到应用配置。
- `app/config/AST.app.config.js`：`appAppearance` 默认 `publii`。

切换路径：应用设置 → 基本设置 → 界面风格 → WordPress 风格 → 保存（建议重启应用）。

### 3. 右侧快捷设置面板
- 新增组件：`app/src/components/RightSettingsPanel.vue`
  - 可折叠 dock，四个标签页：分类 / 页面 / 标签 / 菜单。
  - 分类为新增的轻量级分类法：数据存于 `site.config.json` 的 `categories` 数组（`{id, name, slug, postIDs}`），通过 `app-site-config-save` IPC 持久化，无需 SQLite 迁移。
  - 页面 / 标签读取 Vuex getters（`sitePages` / `siteTags`），菜单读取 `currentSite.menuStructure`；点击跳转到对应管理页。
  - 展开状态与当前标签保存于 localStorage。
- `app/src/components/Site.vue`：挂载面板；展开时通过 `.has-right-panel` 为内容区预留 30rem 右侧空间；监听 `right-panel-toggled` 事件。
- `app/config/AST.currentSite.config.js`：新增 `categories: []` 默认值。

说明：分类目前是组织用的元数据（可关联 postID），主题若需按分类展示，可在渲染上下文中读取 `site.config.categories` 自行扩展。

### 4. 两款中文主题
位于 `app/default-files/default-themes/`：
- `china-corporate/` — 企业官网主题：商务深蓝主色，导航 + Hero + 服务卡片 + 关于我们 + 数据展示 + CTA，中文优先字体栈，响应式。
- `china-news/` — 中文资讯主题：红橙主色，分类导航 + 置顶头条 + 高密度图文列表 + 侧边栏热门/标签云，杂志式布局，响应式。

两者各含 34 个文件（完整 hbs 模板、partials、CSS/JS、`<主题名>.lang.json` 中文文案、运行时脚本），config 派生自 `simple` 主题。缩略图暂用 `simple` 占位图，可后续替换。

## 本地验证结果

- 全部修改过的 `translations.json` / `config.json` 均可被 `JSON.parse` 正确解析。
- zh-cn 与 en-gb 的翻译 key 集合完全一致（1594 个叶子）。
- 修改过的 Vue 组件 `<script>` 通过 Node 语法检查，`<template>` 标签闭合平衡。
- `app-appearance.js`：能识别 `wordpress` 外观，非法值回退 `publii`，accent 应用正常。
- 两款主题 config 可被 Node require，必需文件齐全，CSS 各 480+ 行。

## 未执行 / 后续建议

1. **完整构建**：本环境未安装 `node_modules`（网络较慢），未执行 `npm run prod` 完整 Webpack 构建。
   建议在有依赖的环境执行 `npm install && npm run prod` 做最终验证。
2. **打包运行**：未做 Electron 打包（`npm run build`），建议实际启动应用验证外观切换与右侧面板交互。
3. **主题缩略图**：`china-*` 的 `thumbnail.png` 为占位图，建议替换为真实主题预览图。
4. **分类渲染**：如需在前端按分类筛选文章，需进一步扩展渲染上下文（`back-end/modules/render-html/renderer-context.js`）与主题模板。
