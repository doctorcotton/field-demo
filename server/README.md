# Vision Draft Relay Worker

这个目录是 `Vision Draft Field / 灵感成图` 的中转服务代码，目标运行环境是 Cloudflare Workers + R2。

## 接口

- `POST /v1/images/generate`
- `Authorization: Bearer <relay_access_token>`

请求体：

```json
{
  "prompt": "Generate a clean campaign poster image.",
  "referenceImages": [
    {
      "name": "reference-1.png",
      "mimeType": "image/png",
      "dataBase64": "..."
    }
  ]
}
```

响应体：

```json
{
  "images": [
    {
      "url": "https://visiondraft-cdn.su121.top/generated/2026/05/07/req-1.png",
      "name": "req-1.png",
      "mimeType": "image/png",
      "sizeBytes": 123456
    }
  ]
}
```

## 部署前准备

- 创建 R2 bucket：`visiondraft-images`
- 配置自定义访问域名：`visiondraft-cdn.su121.top`
- 准备 Worker 路由域名：`visiondraft-api.su121.top`
- 配置 secrets：
  - `OPENAI_API_KEY`
  - `RELAY_ACCESS_TOKEN`
- 配置 vars：
  - `R2_PUBLIC_BASE_URL`
  - `OPENAI_IMAGE_MODEL`
  - `OPENAI_IMAGE_SIZE`
  - `OPENAI_IMAGE_QUALITY`
  - `OPENAI_OUTPUT_FORMAT`

详细步骤见 [../docs/cloudflare-setup.md](/Volumes/文件/Work-projects/image2/vision-draft-field/docs/cloudflare-setup.md)。
