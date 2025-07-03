# 🧰 Mihomo（Clash Meta）/ singbox 配置生成工具

![Mihomo Logo](./icon/icon.png)

Mihomo（Clash Meta）是一款高效的订阅汇聚工具，支持快速生成 Clash/singbox 配置文件，并提供强大的分流与防护功能。

## 🌟 核心特性
- **智能分流**：全面的规则分流机制
- **隐私保护**：
  - DNS 广告过滤（Adblock）
  - 防止 DNS/WebRTC 泄漏
  - 安全DNS/DoH支持
- **多订阅汇聚**：
  - 多订阅整合，统一入口
  - 自定义分流规则
  - Singbox 自动节点过滤
  - 支持单节点地址
- **支持多种格式**
  - mihomo/clash/singbox 配置文件（不进行节点转换，防止丢参数）
  - 支持各种订阅链接或单节点链接
- **singbox**
  - 支持 1.11.x 、1.12.x 版本
  - 自适应版本，生成对应版本的配置
  - iOS版本 无弹窗
  - 谷歌版本 无弹窗
  - GitHub版本 无弹窗
  - 启用ip路由
  - 1.12.x 强制启用 `tls` 分段处理
- **mihomo**
  - 启用ip路由
  - 强制启用 `udp` 路由

## 🖥 Web 控制台
访问在线配置生成器：
👉 [mihomo.haxtop.ggff.net](https://mihomo.haxtop.ggff.net)

> 💡 使用建议：关闭所有覆写功能（不是关闭功能，是关闭覆写）以确保配置正常生效。

---

## 🚀 部署指南

### 1. Vercel 部署

#### 准备工作
- 注册 [Vercel 账号](https://vercel.com/signup)
- 安装 [Node.js](https://nodejs.org/) (v16+)
- 安装 [Git](https://git-scm.com/)

#### 方法一：一键部署
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/Kwisma/cf-worker-mihomo)

1. 点击上方按钮
2. 登录 Vercel 账号
3. 选择项目名称和存储位置（建议保持默认）
4. 点击 **Deploy** 开始部署
5. 等待约 1-3 分钟完成部署

#### 方法二：命令行部署
```bash
# 克隆项目
git clone https://github.com/Kwisma/cf-worker-mihomo.git
cd cf-worker-mihomo
```
```bash
# 安装依赖
npm install
```
```bash
# 构建项目
npm run build
```
```bash
# 部署到 Vercel
npm run deploy
```
> 首次部署需按提示登录 Vercel 账号

---

### 2. Cloudflare Workers 部署

#### 方法一：一键部署
[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Kwisma/cf-worker-mihomo)

配置选项：
- **构建命令**：`npm run build:workers`
- **部署命令**：`npx wrangler deploy --keep-vars`

#### 方法二：手动部署
1. 部署 CF Worker：
   - 在 CF Worker 控制台中创建一个新的 Worker。
   - 设置 > 运行时 > 兼容性标志 设置为 `nodejs_compat`
   - 将 [_worker.js](./_worker.js) 的内容粘贴到 Worker 编辑器中。
   - 保存部署
2. 给 workers绑定 自定义域： 
   - 在 workers控制台的 `触发器`选项卡，下方点击 `添加自定义域`。
   - 填入你已转入 CF 域名解析服务的次级域名，例如:`mihomo.haxtop.ggff.net`后 点击`添加自定义域`，等待证书生效即可。
3. 使用方法：
   ```
   https://your-domain.com?url=订阅链接1,订阅链接2
   ```

### 3. Cloudflare Pages 部署

#### 方法一：Git 仓库部署
1. 进入 [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. 点击 **创建项目** → **导入现有 Git 存储库** → 选择仓库 → 开始设置
3. 点击 **保存并部署**（首次部署会失败是正常现象） → **继续处理项目** → 继续
4. 设置 > 运行时 > 兼容性标志 设置为 `nodejs_compat`
5. 重试部署

#### 方法二：手动上传

1. 下载项目中的  [_worker.js](./_worker.js) 文件压缩成 zip 
2. 在 Pages 控制台选择 **直接上传**
3. 选择压缩好的 `zip` 文件
4. 设置 > 运行时 > 兼容性标志 设置为 `nodejs_compat`
5. 再次部署

#### 自定义域名
1. 进入 Pages 项目 → **自定义域**
2. 输入你的域名（需已在 Cloudflare 托管）
3. 系统会自动配置 DNS 和 SSL

---

## ⚙️ 配置参数
| 参数名       | 说明               | 示例值                                                          |
|--------------|--------------------|---------------------------------------------------------------|
| `IMG`        | 背景图 URL         | `https://t.alcy.cc/ycy`                                        |
| `SUB`        | 转换后端地址        | `https://url.v1.mk`                                            |
| `MIHOMO`     | mihomo配置模板           | `https://raw.githubusercontent.com/.../Mihomo_lite.yaml`       |
| `BEIAN`      | 备案信息           | `萌ICP备20250001号`                                             |
| `BEIANURL`   | 备案跳转链接        | `https://t.me/Marisa_kristi`                                   |
| `SINGBOX_1_11` | signbox配置模板 | `https://raw.githubusercontent.com/.../singbox_1.11.X.json`|
| `SINGBOX_1_12` | signbox配置模板 | `https://raw.githubusercontent.com/.../singbox_1.12.X.json`|
| `SINGBOX_1_12_ALPHA` | signbox配置模板 | `https://raw.githubusercontent.com/.../singbox_1.12.X.alpha.json`|
---

## 🤝 参与贡献
欢迎通过以下方式参与：
- 提交 [Issue](https://github.com/Kwisma/cf-worker-mihomo/issues)
- 发起 [Pull Request](https://github.com/Kwisma/cf-worker-mihomo/pulls)

## 📜 开源协议
[MIT License](LICENSE) © 2025 Kwisma