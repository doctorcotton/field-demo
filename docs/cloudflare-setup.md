# Cloudflare 配置指引

本文档说明 `Vision Draft Field / 灵感成图` 的服务端和存储在 Cloudflare 上需要如何准备、配置和验收。

## 概览

这个项目分为 3 部分：

- 字段捷径代码：运行在多维表格字段捷径环境
- 中转服务代码：运行在 Cloudflare Workers
- 图片存储：使用 Cloudflare R2

固定线上域名如下：

- API 域名：`visiondraft-api.su121.top`
- CDN 域名：`visiondraft-cdn.su121.top`

固定调用链路如下：

1. 字段捷径读取用户输入的 `prompt` 和参考图附件
2. 字段捷径将参考图转成 base64，请求 `visiondraft-api.su121.top`
3. Worker 调用 OpenAI 图片接口生成图片
4. Worker 将生成结果写入 R2
5. Worker 返回 `visiondraft-cdn.su121.top` 下的公网图片地址
6. 字段捷径将这些地址写入多维表格附件字段

## 1. Cloudflare 侧需要准备的资源

需要准备以下资源：

- 一个已接入 Cloudflare 的主域名：`su121.top`
- 一个 Worker 服务
- 一个 R2 bucket
- 两个子域名：
  - `visiondraft-api.su121.top`
  - `visiondraft-cdn.su121.top`

建议使用以下命名：

- Worker 名称：`vision-draft-relay`
- R2 bucket 名称：`visiondraft-images`

## 2. 创建 R2 Bucket

在 Cloudflare 控制台中：

1. 打开 `R2 Object Storage`
2. 创建 bucket，命名为 `visiondraft-images`
3. 进入 bucket 设置
4. 开启 public access 或绑定 public custom domain
5. 将自定义域名绑定为 `visiondraft-cdn.su121.top`

要求：

- 生成后的图片必须能通过公网匿名 `GET` 下载
- 不要依赖短时签名 URL 作为字段捷径附件源
- 单张图建议控制在 10MB 以内

## 3. 创建 Worker

在 Cloudflare 控制台中：

1. 打开 `Workers & Pages`
2. 创建 Worker，命名建议为 `vision-draft-relay`
3. 将项目中的 [server/src/index.js](/Volumes/文件/Work-projects/image2/vision-draft-field/server/src/index.js) 作为入口代码
4. 绑定 R2 bucket：
   - binding name：`VISION_DRAFT_IMAGES`
   - bucket：`visiondraft-images`

如果使用 Wrangler，本地配置可参考 [server/wrangler.toml.example](/Volumes/文件/Work-projects/image2/vision-draft-field/server/wrangler.toml.example)。

## 4. 配置 Worker Secrets 和 Vars

### Secrets

在 Worker 的 Secrets 中配置：

- `OPENAI_API_KEY`
- `RELAY_ACCESS_TOKEN`

说明：

- `OPENAI_API_KEY`：Worker 调用 OpenAI 图片接口使用
- `RELAY_ACCESS_TOKEN`：字段捷径调用 Worker 时携带的 Bearer Token

### Vars

在 Worker 的普通变量中配置：

- `R2_PUBLIC_BASE_URL=https://visiondraft-cdn.su121.top`
- `OPENAI_IMAGE_MODEL=gpt-image-1`
- `OPENAI_IMAGE_SIZE=1024x1024`
- `OPENAI_IMAGE_QUALITY=medium`
- `OPENAI_OUTPUT_FORMAT=png`

建议默认值：

- 模型：`gpt-image-1`
- 尺寸：`1024x1024`
- 质量：`medium`
- 输出格式：`png`

## 5. 绑定 API 域名

将 `visiondraft-api.su121.top` 绑定到 Worker。

要求：

- `POST https://visiondraft-api.su121.top/v1/images/generate` 可访问
- `GET https://visiondraft-api.su121.top/healthz` 可返回健康检查结果

推荐验收方式：

```bash
curl https://visiondraft-api.su121.top/healthz
```

预期返回类似：

```json
{
  "ok": true,
  "requestId": "..."
}
```

## 6. 字段捷径侧需要同步的固定配置

字段捷径代码侧固定使用以下值：

- Relay URL：`https://visiondraft-api.su121.top/v1/images/generate`
- 授权方式：`Authorization: Bearer <relay_access_token>`
- 白名单域名：
  - `visiondraft-api.su121.top`
  - 飞书附件相关域名

说明：

- 不支持用户在运行时修改第三方 host
- 如果要更换 API 域名，需要同步修改字段捷径代码里的固定地址和白名单

## 7. 发布顺序

建议严格按下面顺序上线：

1. 先创建 R2 bucket：`visiondraft-images`
2. 绑定 `visiondraft-cdn.su121.top`
3. 部署 Worker
4. 给 Worker 绑定 R2
5. 配置 Secrets 和 Vars
6. 给 Worker 绑定 `visiondraft-api.su121.top`
7. 先验证 `/healthz`
8. 再验证图片生成接口
9. 最后打包并上传字段捷径

## 8. 上线前验收清单

在正式联调前，至少确认以下项目：

### R2 / CDN

- `visiondraft-cdn.su121.top` 能直接访问测试图片
- 返回的图片链接不是签名临时 URL
- 图片能匿名下载

### Worker

- `visiondraft-api.su121.top/healthz` 返回 200
- Worker 能正确校验 `Authorization: Bearer ...`
- Worker 能把 OpenAI 返回的图片写入 R2
- Worker 返回的 `images[].url` 都是 `visiondraft-cdn.su121.top/...`

### 字段捷径

- 能读取飞书附件字段作为参考图
- 能把参考图转换成 base64 并请求 Worker
- 能成功写回附件字段
- 多图结果不超过 5 张
- 非支持格式图片会被拦截

## 9. 运维建议

- `RELAY_ACCESS_TOKEN` 不要和 `OPENAI_API_KEY` 共用
- 建议定期清理旧生成图片，避免 R2 无限制增长
- 建议按日期分目录存图，当前代码已按 `generated/YYYY/MM/DD/` 组织
- 建议监控以下错误：
  - OpenAI 401 / 403
  - OpenAI 429
  - R2 写入失败
  - Worker 返回空图片列表

## 10. 常见问题

### 1. 为什么字段捷径不能让用户自由填 API 域名？

因为字段捷径的 `addDomainList` 必须提前写死白名单 host，运行时不能动态放行任意新域名。

### 2. 为什么需要 R2？

因为字段捷径输出附件时，需要的是公网可下载图片 URL；而 OpenAI 图片结果通常需要先由中转服务处理后再落到可公开访问的存储中。

### 3. 可以只部署 Worker，不配 R2 吗？

不建议。这样会缺少稳定的公网图片承载层，字段捷径附件输出会变得不稳定，也不利于后续排障和运维。
