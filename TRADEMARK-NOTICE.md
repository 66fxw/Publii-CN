# 品牌与商标声明

## 项目品牌

本项目现以 **Shanhe CMS（闪核 CMS）** 作为产品品牌名。这是一个独立的社区二次开发项目，与上游 Publii 官方无任何关联。

## 与上游 Publii 的关系

- 本项目基于 [GetPublii/Publii](https://github.com/GetPublii/Publii) 0.48.3 源代码二次开发。
- 上游 Publii 的版权归 TidyCustoms 所有，遵循 GNU GPL v3.0 协议。
- 本项目按 GPLv3 第 5 条要求保留了修改声明与日期（见 [`README.md`](./README.md) 的"修改声明"章节与提交历史）。
- **本项目不是 Publii 官方发布**，未获得上游商标授权，不使用 Publii 的商标、Logo 或背书进行宣传。

## 为什么更名

GNU GPL v3 第 7(e) 条明确允许版权持有人附加"不授予商标权"的条款；GPL 授权的是**版权**，不包含**商标**使用权。因此二次开发版本继续以 "Publii" / "Publii-CN" 作为产品品牌名，存在商标侵权与来源误述（误让用户以为是官方产品）的法律风险。

为避免上述风险，本项目将面向用户的品牌标识统一改为 Shanhe CMS：

- 应用名称、窗口标题、安装包文件名
- 首屏 Logo、通知中心图标、关于页
- 界面文案、菜单、错误提示、默认提交信息
- 生成的站点 `generator` meta 标签
- 两款主题的作者署名

## 应用图标

应用图标（安装包、可执行文件、托盘、DMG 卷标等）已统一替换为**蓝底白字「闪核」**设计：

- `build/installation/icon.ico` — Windows 多尺寸图标（16/32/48/64/128/256）
- `build/installation/icon.icns`、`volume.icns`、`volume-prerelease.icns` — macOS 图标
- `build/installation/icons/icon.png`、`build/icon.png` — 1024×1024 PNG
- `app/back-end/assets/icon.png` — 系统托盘图标
- `app/src/assets/logo.png`、`images/logo.png` 及各 SVG — 应用内 Logo

图标生成脚本见 [`build/scripts/generate-icons.py`](./build/scripts/generate-icons.py)（需 Pillow 与微软雅黑字体）。

## 保留的上游引用（合规所需）

以下内容予以保留，属于**事实性来源标注**与 GPL 要求，不构成商标使用：

- 源代码注释中对上游的致谢与修改标记（如 `Publii-CN:` 前缀的修改注释）
- `LICENSE` 中的 GPLv3 全文
- 关于页中"基于 Publii（Copyright TidyCustoms）二次开发"的致谢链接
- 指向上游官方仓库的事实性链接
- 内部组件/函数名等不面向用户的技术标识符（如 `publii-head`、`PubliiCode`）

## 数据兼容

为不影响已有用户，应用会检测旧的数据目录 `文档/Publii`：若存在则继续沿用，新安装则使用 `文档/Shanhe CMS`。此目录名仅为兼容性保留，不代表品牌归属。

## 仓库地址说明

GitHub 仓库地址 `github.com/66fxw/Publii-CN` 作为历史 URL 保留（改名会导致外链失效），但项目名称、README、发布包均已使用 Shanhe CMS 品牌。

---

如有商标或品牌相关问题，请通过 GitHub Issues 反馈。
