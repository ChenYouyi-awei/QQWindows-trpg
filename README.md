# 跑团记录整理工具

这是一个简单的网页工具，用于整理和合并跑团聊天记录。它可以将主聊天记录（大窗）和私聊记录（小窗）按时间顺序合并，并自动处理消息分组。

## 功能特点

- 支持多个大窗聊天记录文件的合并
- 支持添加多个小窗聊天记录，并自动标记来源
- 自定义消息分组时间间隔（默认 5 分钟）
- 自动去重复消息
- 批量文件上传支持
- 生成整理后的 txt 文件并自动下载

## 使用方法

1. 下载所有文件到本地文件夹
2. 双击打开 `index.html` 文件（或将其拖拽到浏览器中）
3. 在打开的页面中：
   - 上传大窗聊天记录文件（必须至少一个）
   - 添加小窗聊天记录文件（可选）
   - 设置消息分组时间间隔（可选，默认 5 分钟）
   - 点击"开始处理"按钮
4. 处理完成后会自动下载整理好的文件
5. 可以将处理好的 txt 文件内容复制到[海豹着色器](https://log.weizaima.com/)进行着色

## 聊天记录格式要求

文件必须是 txt 格式，且消息格式需要符合：

```
名字(QQ号) 年/月/日 时:分:秒 消息内容
```

例如：

```
张三(12345678) 2024/01/01 12:34:56 这是一条消息
李四(87654321) 2024/01/01 12:35:00 这是另一条消息
```

## 本地运行说明

本工具是纯前端应用，无需安装任何依赖或运行环境。要在本地运行，您只需要：

1. 一个现代浏览器（推荐使用 Chrome、Firefox、Edge 等主流浏览器的最新版本）
2. 下载以下三个文件到同一个文件夹：
   - `index.html`（主页面文件）
   - `process.js`（处理逻辑文件）
   - `README.md`（说明文档）
3. 双击打开 `index.html` 即可使用

## 注意事项

- 所有处理都在浏览器本地进行，不会上传任何文件到服务器
- 建议每次处理的文件大小总和不要超过 100MB
- 如果文件较大，处理可能需要一些时间，请耐心等待
- 确保聊天记录文件的编码为 UTF-8，以避免出现乱码

## 常见问题

1. **文件无法上传**

   - 确保文件是.txt 格式
   - 检查文件是否损坏

2. **处理后的文件有乱码**

   - 确保原始文件为 UTF-8 编码
   - 使用记事本打开并另存为 UTF-8 格式

3. **消息顺序不正确**
   - 检查原始文件中的时间戳格式是否正确
   - 确保所有文件使用相同的时间格式

## 后续处理

处理完成后的 txt 文件可以全选复制到[豹着色器](https://log.weizaima.com/)中进行着色，让跑团记录更易于阅读和回顾。
