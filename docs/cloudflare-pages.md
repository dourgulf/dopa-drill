# Cloudflare Pages 部署 / デプロイ

## 中文

网站仍然是纯静态文件，没有新增运行时依赖、服务器或付费服务。部署脚本只复制 `app/` 到 `dist/`，并生成当前站点的 canonical、robots.txt 和 sitemap.xml。本地开发仍可直接服务 `app/`。

在 Cloudflare 控制台进入 **Workers & Pages → Create application → Pages → Connect to Git**，连接自己的 `dourgulf/dopa-drill` 仓库。请确认创建的是 Pages 项目。

| 配置项 | 值 |
| --- | --- |
| Project name | 自选可用名称，例如 `dopa-drill`；以控制台最终分配为准 |
| Production branch | `main` |
| Framework preset | `None` |
| Root directory | 仓库根目录（留空） |
| Build command | `node tools/build_pages.mjs` |
| Build output directory | `dist` |
| Environment variable | `NODE_VERSION=22`，Production 和 Preview 均设置 |

首次发布后地址为 `https://<实际项目名>.pages.dev`，无需自定义域名。Cloudflare 自动注入 `CF_PAGES_URL`，脚本据此提取稳定的项目域名；不会将临时预览地址或原作者的域名写入搜索元数据。不需要手工设置 `CF_PAGES_URL`。Cloudflare 默认对 Preview 部署添加 `X-Robots-Tag: noindex`。

本地验证部署包（下面只是示例域名，并未申请）：

```bash
node --test tests/*.test.mjs
SITE_URL=https://example-game.pages.dev node tools/build_pages.mjs
python3 -m http.server 8000 -d dist
```

本地未设置 URL 时脚本会报错，避免意外发布带有错误域名的元数据。不要直接上传 `app/` 作为正式部署包；使用 `dist/` 才有生成后的搜索元数据。`dist/` 已加入 Git 忽略，每次构建会重新生成。

上线后检查首页、日语/中文切换、开始练习，以及 `/robots.txt`、`/sitemap.xml` 的地址。检查 `_headers` 中的响应头是否生效。实际网络速度、HTTPS 和线上响应头需在发布后验证。用户记录按浏览器来源保存；更换域名不会自动迁移记录。

以后使用自有域名时，先在 Pages 绑定域名，再将 Production 和 Preview 的 `SITE_URL` 设置为该 HTTPS 根地址并重新部署；它优先于自动推导的 `pages.dev` 地址。

## 日本語

静的サイトのまま、`app/` を `dist/` にコピーし、公開先に合わせて canonical・robots.txt・sitemap.xml を生成します。ローカル開発は従来どおり `app/` を配信できます。

Cloudflare の **Workers & Pages → Create application → Pages → Connect to Git** から自分のリポジトリを接続してください。Production branch は `main`、Framework preset は `None`、Root directory は空欄、Build command は `node tools/build_pages.mjs`、Build output directory は `dist`。Production と Preview の両方に `NODE_VERSION=22` を設定します。

公開 URL は `https://<実際のプロジェクト名>.pages.dev` です。`CF_PAGES_URL` は Cloudflare が自動設定し、スクリプトが一時的なハッシュやブランチ名を除いて安定した URL を生成します。Preview には Cloudflare が標準で `X-Robots-Tag: noindex` を付けます。

ローカル確認は上記のコマンドを使用してください。`SITE_URL` の例は未取得の仮 URL です。生成済みの `dist/` を配信し、言語切替、練習開始、検索用ファイルとレスポンスヘッダーを確認します。保存データはオリジンごとのため、ドメイン変更時には自動移行されません。

独自ドメインに変更するときは Pages 側で登録し、Production と Preview の `SITE_URL` に HTTPS のルート URL を指定して再デプロイします。

## 官方文档 / 公式ドキュメント

- [Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/)
- [Build configuration and environment variables](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Preview deployments and indexing](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
- [Custom headers](https://developers.cloudflare.com/pages/configuration/headers/)
