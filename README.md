# Vision Draft Field / 灵感成图

`Vision Draft Field` 是一个多维表格字段捷径项目，用来把“参考图 + Prompt”发送到固定的中转服务，再把生成结果写回附件字段。

仓库包含 3 个交付物：

- `src/`：字段捷径代码
- `server/`：Cloudflare Workers 中转服务
- `docs/cloudflare-setup.md`：Cloudflare 配置与上线指引

## 字段捷径能力

- 输入一个文本 `prompt`
- 选择一个附件字段作为 `referenceImages`
- 使用 Bearer Token 调用 `https://visiondraft-api.su121.top/v1/images/generate`
- 返回多张图片附件，最多 5 张

## 本地开发

```bash
npm install
npm run start
```

本地调试时：

- 在 [config.json](/Volumes/文件/Work-projects/image2/vision-draft-field/config.json) 填入中转服务 Bearer Token
- 在字段捷径调试助手中选择实际的附件字段作为参考图输入
- `prompt` 可通过 `mockData` 提供默认值

## 关键约束

- 字段捷径白名单 host 固定为 `visiondraft-api.su121.top` 与飞书附件相关域名
- 不支持用户在运行时切换第三方 host
- 输入图片只接受 `png`、`jpg/jpeg`、`webp`
- 输出附件依赖中转服务返回公网图片 URL

## 目录说明

- [src/index.ts](/Volumes/文件/Work-projects/image2/vision-draft-field/src/index.ts)：字段捷径入口
- [server/src/index.js](/Volumes/文件/Work-projects/image2/vision-draft-field/server/src/index.js)：Cloudflare Worker 入口
- [docs/cloudflare-setup.md](/Volumes/文件/Work-projects/image2/vision-draft-field/docs/cloudflare-setup.md)：Cloudflare 配置指南

## 打包发布

```bash
npm run pack
```

打包后上传 `output/output.zip` 到字段捷径平台，再按 [docs/cloudflare-setup.md](/Volumes/文件/Work-projects/image2/vision-draft-field/docs/cloudflare-setup.md) 完成服务器与存储配置。
