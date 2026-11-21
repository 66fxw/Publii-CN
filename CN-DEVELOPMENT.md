# Publii-CN 二次开发说明

本文档记录 Publii-CN 相对上游 `GetPublii/Publii` 的改动，方便后续维护与重新生成。面向用户的使用说明见 [`README.md`](./README.md) 与 [`docs/USAGE.md`](./docs/USAGE.md)。

## 分支与远端

- `upstream` → `https://github.com/GetPublii/Publii.git`（原始仓库，上游 v0.48.3）
- `origin` → `https://github.com/66fxw/Publii-CN.git`（Fork 仓库）
- 开发分支：`dev/cn-secondary`

## 协议与修改声明

本项目基于上游 GPLv3 代码二次开发，同样以 GPLv3 开源。按 GPLv3 第 5 条要求保留修改声明：

- 修改者：66fxw；修改起始日期：2026-11-16。
- 上游版权：Copyright © 2026 TidyCustoms（GPLv3）。
- 本项目非官方发布，不使用上游商标或背书。

## 改动清单（按提交顺序）

### 1. 简体中文界面语言包
- 新增目录：`app/default-files/default-languages/zh-cn/`：
  - `config.json`（name=简体中文，momentLocale=zh-cn）
  - `translations.json`（主界面翻译，2085 条叶子 key，与 en-gb 完全一致）
  - `wysiwyg.json`（编辑器翻译）
  - `thumbnail.svg`
- 四个语言包 `translations.json` 新增：`settings.appAppearance*`、`wpPanel.*`、`wpCategorySeo.*` 等 key。
- 12 个月份缩写翻译为中文。
- `app/config/AST.app.config.js` 默认 `language: 'zh-cn'`；`app/back-end/app.js` 的 `migrateDefaultLanguageToChinese()` 对老配置一次性迁移。

### 2. WordPress 风格后台外观
- 生成器：`build/scripts/generate-wordpress-appearance.js`（由 `publii.css` 派生，替换调色板为 WordPress 经典配色 #2271b1 主色 / #23282d 侧边栏，含中文优先字体栈）。
- 生成产物：`app/src/css/appearances/wordpress.css`（勿手改，改生成器后重跑 `node build/scripts/generate-wordpress-appearance.js`）。
- `app/src/helpers/app-appearance.js` 注册 `wordpress` 外观；`App.vue` 导入；`AppSettings.vue` 新增「界面风格」下拉框。

### 3. 右侧快捷设置面板
- 组件：`app/src/components/RightSettingsPanel.vue`，四个标签页：分类 / 页面 / 标签 / 菜单，展开状态存 localStorage。
- 分类为新增的轻量分类法：数据存于 `site.config.json` 的 `categories` 数组（`{id, name, slug, postIDs}`），通过 `app-site-config-save` IPC 持久化，无需 SQLite 迁移。
- `Site.vue` 挂载面板并为内容区预留右侧空间。

### 4. 两款中文主题
位于 `app/default-files/default-themes/`：
- `china-corporate/`：企业官网主题，商务深蓝，Hero + 服务卡片 + 关于 + 数据 + CTA。
- `china-news/`：中文资讯主题，红橙主色，置顶头条 + 高密度图文列表 + 侧边栏。
- 各含完整 hbs 模板 / partials / CSS / JS / `<主题名>.lang.json`，config 派生自 `simple`。当前版本 **1.3.0.0**。
- 已适配分类栏目、中文摘要、中文字体 fallback、`og:locale`、`lang="zh-CN"`、中文断行规则。

### 5. WordPress 式独立分类栏目体系
- 新增渲染上下文：`back-end/modules/render-html/contexts/category.js`（分类归档页）与 `categories.js`（分类列表页）。
- `renderer.js` 新增 `renderCategoryPreview()`、`generateCategories()`、`generateCategoriesList()`；URL helper、template helper、menu-url helper 增加分类支持。
- 主题新增 `category.hbs` / `categories.hbs`（两款中文主题 + simple）。
- 菜单编辑器支持「分类栏目 / 分类列表」链接类型（`MenuItem.vue` / `MenuItemEditor.vue`）。
- 默认 URL 前缀 `categories`（`AST.currentSite.config.js`）。
- 分类与标签使用不同图标（侧边栏 folder vs tags）。

### 6. 分类 SEO 设置
- `Settings.vue` SEO 区新增「分类栏目 SEO 设置」：分类列表页 / 分类归档页的标题、描述、meta robots，显示空分类、禁用分页开关。
- 新增 computed `currentThemeSupportsCategoriesList` / `currentThemeSupportsCategoryPages`。
- 四语言新增 `wpCategorySeo.*` 9 个 key。
- 与渲染器读取的 `advanced.categoryMeta*` / `categoriesMeta*` / `metaRobotsCategor*` key 对齐。

### 7. 中文兼容性优化
- 新增 `app/src/helpers/locale-compare.js`：按当前界面语言做确定性排序；文章 / 页面 / 标签 / 作者 / 站点名 5 个 getter 改用 zh-Hans-CN 拼音序。
- 默认外观 `publii.css` 补中文优先字体栈（PingFang SC / Microsoft YaHei / Noto Sans SC）。
- 分类 slug 改用后端 `app-main-process-create-slug`（中文转拼音），`Categories.vue` / `RightSettingsPanel.vue` 相应改 async。
- `back-end/helpers/slug.js`：中文标点替换为空格，修复拼音粘连；`post.js` 空 slug 兜底。
- `back-end/modules/render-html/helpers/content.js`：`prepareExcerpt` 增加 CJK 码点截断分支（中文按字数），新增 `content-excerpt.spec.js` 4 个测试。

### 8. 部署与渲染稳定性
- **GitHub Pages 首次部署修复**（`deploy/github-pages.js` + `github-api-client.js`）：
  - `getLatestSHA` 将分支不存在（404）识别为首次部署（并校验仓库存在）；
  - 首次提交用空 parents；`updateRef` 404 时回退 `createRef`（POST）创建分支引用；
  - `apiRequest` 对 404 跳过无意义重试；新增首次部署单元测试。
- **渲染崩溃修复**（`handlebars/helpers/css.js` / `js.js`）：主题显示名（如 "China News"）与目录名（china-news）不一致时，改用 `rendererInstance.themeName` 拼路径，避免 `ENOENT`，新增 2 个回归测试。
- **分类页显示修复**：`Categories.vue` 引入 `collection-page.css`，解决容器高度塌陷导致分类行不可见；分类与标签图标区分。

## 本地验证

- 所有改动的 `translations.json` / `config.json` 均可被 `JSON.parse` 解析；zh-cn 与 en-gb 翻译 key 集合完全一致（2085 叶子）。
- 修改过的 Vue 组件 `<script>` 通过 Node 语法检查，`<template>` 标签闭合平衡；Webpack `npm run prod` 构建通过。
- GitHub Pages 部署测试 41 项通过（含首次部署）；中文摘要、slug、主题目录名等新增测试通过。
- 通过 CDP 连接运行时应用实测：中文排序、字体栈、分类 SEO 字段、真实渲染（status:true）、生成 HTML 的 lang / og:locale / CSS MD5 均正确。
- Windows 安装包 `npm run packager:win` 打包成功（140MB），asar 内确认包含所有修复，冒烟测试通过。

## 后续建议

1. 主题缩略图仍为 `simple` 占位图，建议替换为真实预览图。
2. 预览弹窗（`RenderingPopup.vue`）尚未提供「分类」单页预览模式（渲染器 `renderCategoryPreview()` 已支持）。
3. 分类若需更复杂的关联与前台筛选，可继续扩展渲染上下文与主题模板。
4. macOS / Linux 打包未适配，欢迎贡献。
