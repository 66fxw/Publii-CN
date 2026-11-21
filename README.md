# Publii-CN

> 面向简体中文用户的 Publii 二次开发分支 —— 保留静态站点的全部能力，补齐中文使用场景。

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](./LICENSE)
[![Version](https://img.shields.io/badge/version-0.48.3-orange.svg)](./package.json)
[![Upstream](https://img.shields.io/badge/upstream-GetPublii%2FPublii-lightgrey.svg)](https://github.com/GetPublii/Publii)

**Publii-CN** 是开源桌面静态站点生成器 [Publii](https://github.com/GetPublii/Publii) 的中文增强分支。它在上游 0.48.3 的基础上，围绕中文内容与国内用户习惯做了本地化和功能增强，并以相同的 **GPLv3** 协议开放源码。

- 完整简体中文界面（2085 条翻译键，与英文包一一对应）
- WordPress 式独立分类栏目体系（分类归档页 / 分类列表页 / 菜单链接 / SEO 设置）
- 两款中文主题：企业官网 `china-corporate`、资讯博客 `china-news`
- 中文排版、拼音排序、中文摘要截断、分类拼音 slug 等中文兼容性优化
- GitHub Pages 首次部署（空仓库）连通性修复

---

## ⚠️ 修改声明（GPLv3 第 5 条要求）

本项目基于 **GetPublii/Publii**（Copyright © 2026 TidyCustoms，GPLv3）二次开发，由 **66fxw** 修改。

- **修改日期**：2026-11-16 起持续修改至今
- **修改内容**：新增中文语言包、WordPress 风格外观、右侧快捷面板、独立分类栏目体系、两款中文主题，以及中文兼容性与部署、渲染相关修复。完整清单见 [`CN-DEVELOPMENT.md`](./CN-DEVELOPMENT.md) 和提交历史。
- **许可**：本项目遵循 GNU General Public License v3.0（见 [`LICENSE`](./LICENSE)），源码可自由获取、修改与再分发，但须保留本声明与协议条款。

> 本项目是社区二次开发版本，**非 Publii 官方发布**，与 TidyCustoms / GetPublii 官方无关联，也不使用其商标或背书。上游官方项目请访问 <https://github.com/GetPublii/Publii>。

---

## ✨ 二次开发特色

### 1. 完整简体中文界面
- 新增 `zh-cn` 语言包（`app/default-files/default-languages/zh-cn/`），2085 条翻译键与英文包完全对齐。
- 新安装默认即为简体中文；老配置若仍为默认英文会自动迁移到中文（仅迁移一次，不覆盖用户手动选择）。
- 12 个月份缩写、编辑器文案均已本地化。

### 2. WordPress 式独立分类栏目体系
上游 Publii 只有标签（tag），本分支新增与标签**完全解耦**的分类（category）体系：

- **右侧快捷面板**管理分类（新增 / 重命名 / 删除），数据存于 `site.config.json` 的 `categories` 数组，无需数据库迁移。
- **独立分类归档页**：每个分类生成 `/categories/<分类 slug>/` 页面，支持自定义标题、描述、meta robots。
- **分类列表页**：`/categories/` 汇总所有分类，同样支持独立 SEO 设置（网站设置 → SEO → 分类栏目 SEO 设置）。
- **菜单链接**：菜单编辑器可直接添加指向分类栏目 / 分类列表的链接。
- **SEO 完整**：分类页标题支持 `%categoryname`、`%sitename` 变量；可控制空分类是否显示、是否分页。
- 默认 URL 前缀为 `categories`（可在站点设置中调整）。

### 3. 两款中文主题
| 主题 | 定位 | 风格 |
|---|---|---|
| `china-corporate` | 企业官网 | 商务深蓝、Hero、服务卡片、关于我们、数据展示、CTA |
| `china-news` | 资讯 / 博客 | 红橙主色、置顶头条、高密度图文列表、侧边栏热门与标签云 |

两者均为中文优先字体栈、响应式布局，并已适配分类栏目、中文摘要、OG 语言标签（`og:locale`）、`lang="zh-CN"`。

### 4. WordPress 风格后台外观
新增 `wordpress` 应用外观：经典深色侧边栏、工具栏、蓝色主色。在「应用设置 → 基本设置 → 界面风格」中切换。

### 5. 中文兼容性优化
- 中文内容按**字数**截断摘要（上游按空格分词，对中文无效）。
- 中文名称（文章 / 标签 / 作者 / 分类 / 站点）按 **zh-Hans-CN 拼音顺序**排序。
- 分类 slug 自动转拼音（如「新闻」→ `xin-wen`），与站点其他 URL 保持一致。
- 中文标点不再造成拼音粘连（「你好，世界」→ `ni-hao-shi-jie`）。
- 默认界面字体补充苹方 / 微软雅黑 / 思源黑体；西文字体自动附中文 fallback。
- 主题标题行高、断行规则针对中文优化。

### 6. 稳定性与部署修复
- **GitHub Pages 首次部署**：修复空仓库 / 分支不存在时推送失败（自动创建分支引用、空 parents 提交）。
- **渲染鲁棒性**：修复主题显示名与目录名不一致（如 `China News` 与 `china-news`）导致的渲染崩溃。
- **分类页显示**：修复分类列表容器高度塌陷导致的不显示问题；分类与标签使用不同图标。

---

## 🚀 快速开始

### 下载安装
从本仓库 [Releases](https://github.com/66fxw/Publii-CN/releases) 下载 Windows 安装包（`.exe`），双击安装即可。

> 当前基于上游 0.48.3。macOS / Linux 版本尚未提供，可自行按下方步骤从源码构建。

### 第一次使用
1. 启动应用，界面默认为简体中文。
2. 新建一个站点，填写站点名称（中文名会自动生成拼音目录名）。
3. 在「网站设置 → 主题」选择 `china-corporate` 或 `china-news` 体验中文主题。
4. 在右侧快捷面板的「分类」页添加分类；到「网站设置 → SEO → 分类栏目 SEO 设置」配置分类页 SEO。
5. 编辑内容后，通过「生成站点 / 预览」查看效果，再到「服务器设置」配置上传方式。

详细图文说明见 **[使用文档](./docs/USAGE.md)**。

---

## 🛠️ 从源码构建

需要 Node.js 22+、npm。

```bash
git clone https://github.com/66fxw/Publii-CN.git
cd Publii-CN
npm install
cd app && npm install && cd ..
npm run prod              # Webpack 构建前端
npm run packager:win      # 打包 Windows 安装包（输出到 dist/）
```

> Windows 打包若遇到网络问题，可设置 `ELECTRON_MIRROR` / `ELECTRON_BUILDER_BINARIES_MIRROR` 为国内镜像。
> 更完整的构建与开发说明见上游 [App build process](https://github.com/GetPublii/Publii/wiki/App-build-process) 与 [`CN-DEVELOPMENT.md`](./CN-DEVELOPMENT.md)。

---

## 🤝 贡献

欢迎提交 Issue 与 Pull Request，尤其是：
- 中文翻译校对与补充
- 中文主题改进 / 新主题
- 中文排版与兼容性问题
- 部署与渲染相关的 Bug 修复

请基于 `dev/cn-secondary` 分支开发，并保持与上游的改动可追溯。

---

## 📄 开源协议

```
Publii-CN
Copyright (C) 2026 66fxw

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```

本项目以 **GPL-3.0** 开源，完整协议见 [`LICENSE`](./LICENSE)。

本项目包含的上游 Publii 代码版权归 TidyCustoms 所有，同样遵循 GPLv3；本项目使用的第三方依赖各自遵循其许可协议（见 `app/licenses/`）。

---

## 🔗 相关链接

- 上游官方项目：<https://github.com/GetPublii/Publii>
- 上游官方文档：<https://getpublii.com/docs/>
- 本项目使用文档：[`docs/USAGE.md`](./docs/USAGE.md)
- 二次开发说明：[`CN-DEVELOPMENT.md`](./CN-DEVELOPMENT.md)
