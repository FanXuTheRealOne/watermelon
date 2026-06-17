# 听瓜

一个极简移动端 Web App：前端录音，后端把 WAV 敲击声转成频率特征，再用本地标准或 OpenAI 生成成熟度评分。

## 运行

```bash
npm start
```

打开 `http://localhost:3000`。手机测试时，让手机和电脑在同一 Wi-Fi 下，访问终端里打印的 `LAN` 地址。

## AI 配置

复制 `.env.example` 为 `.env`，填入：

```bash
OPENAI_API_KEY=你的 key
OPENAI_MODEL=gpt-5.5
```

没有 key 时仍可使用本地声学评分。
