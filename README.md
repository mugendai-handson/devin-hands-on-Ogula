# Devin Task Board

タスク管理アプリ

## ドキュメント

- [機能仕様書](docs/spec.md)
- [ユーザーストーリー](docs/user-stories.md)
- [ER 図](docs/erd.md)
- [OpenAPI 仕様](docs/openapi.yaml)
- [Issue 計画](docs/issue.md)

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router) + React 19 + TypeScript
- **DB**: PostgreSQL 16 + Prisma
- **スタイル**: Tailwind CSS v4
- **インフラ**: Docker Compose

## セットアップ

### 前提条件

- Node.js 22+
- Docker / Docker Compose

### 1. リポジトリのクローン

```bash
git clone https://github.com/micci184/devin-handson.git
cd devin-handson
```

### 2. 環境変数の設定

```bash
cp .env.example .env
```

### 3. Docker Compose で起動

```bash
docker compose up -d
```
