# Hono AWS Middlewares

[![npm version](https://badge.fury.io/js/@squilla%2Fhono-aws-middlewares.svg)](https://www.npmjs.com/package/@squilla/hono-aws-middlewares)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

HonoでAWSサービスを使用するためのミドルウェアライブラリです。

## 概要

このライブラリは、Honoアプリケーション内でAWS SDK v3を簡単に使用できるよう設計されたミドルウェアコレクションです。AWSサービスのクライアントインスタンスを自動的に作成し、Honoのコンテキストに設定することで、アプリケーション全体で一貫したAWSサービスの利用を可能にします。

## 特徴

- ⚡ **Hono対応**: Honoフレームワークとの完全な統合
- 🏗️ **TypeScript**: 完全な型安全性
- 🔧 **AWS SDK v3**: 最新のAWS SDKに対応
- 📦 **軽量**: 必要な機能のみを選択的にインポート可能
- 🧪 **テスト済み**: 包括的なテストカバレッジ

## 対応サービス

現在、以下のAWSサービスに対応しています：

- **DynamoDB**: NoSQLデータベースサービス
- **S3**: オブジェクトストレージサービス
- **Secrets Manager**: シークレット管理サービス

追加のAWSサービスも順次対応予定です。

## インストール

```bash
npm install @squilla/hono-aws-middlewares
```

### ピア依存関係

使用するAWSサービスに応じて、以下のパッケージも合わせてインストールしてください：

```bash
# DynamoDB用
npm install @aws-sdk/client-dynamodb

# S3用
npm install @aws-sdk/client-s3

# Secrets Manager用
npm install @aws-sdk/client-secrets-manager

# Hono（必須）
npm install hono
```

## 使用方法

### DynamoDBミドルウェア

DynamoDBのクライアントインスタンスをHonoコンテキストに設定します。

```typescript
import { Hono } from 'hono';
import { dynamoDBMiddleware, Env } from '@squilla/hono-aws-middlewares';

const app = new Hono<Env>();

// ミドルウェアの設定
app.use('*', dynamoDBMiddleware({
  region: 'ap-northeast-1'
}));

// DynamoDBの使用
app.get('/users/:id', async (c) => {
  const dynamoDB = c.get('DynamoDB');
  const result = await dynamoDB.getItem({
    TableName: 'Users',
    Key: { id: { S: c.req.param('id') } }
  });
  return c.json(result.Item);
});

app.post('/users', async (c) => {
  const dynamoDBClient = c.get('DynamoDBClient');
  const body = await c.req.json();
  
  await dynamoDBClient.putItem({
    TableName: 'Users',
    Item: {
      id: { S: body.id },
      name: { S: body.name },
      email: { S: body.email }
    }
  });
  
  return c.json({ success: true });
});
```

### S3ミドルウェア

S3のクライアントインスタンスをHonoコンテキストに設定します。

```typescript
import { Hono } from 'hono';
import { s3Middleware, Env } from '@squilla/hono-aws-middlewares';

const app = new Hono<Env>();

// ミドルウェアの設定
app.use('*', s3Middleware({
  region: 'ap-northeast-1'
}));

// S3の使用
app.get('/files/:bucket/:key', async (c) => {
  const s3 = c.get('S3');
  const result = await s3.getObject({
    Bucket: c.req.param('bucket'),
    Key: c.req.param('key')
  });
  
  // ファイル内容を返す
  const body = await result.Body?.transformToString();
  return c.text(body || '');
});

app.post('/files/:bucket/:key', async (c) => {
  const s3Client = c.get('S3Client');
  const body = await c.req.text();
  
  await s3Client.putObject({
    Bucket: c.req.param('bucket'),
    Key: c.req.param('key'),
    Body: body,
    ContentType: 'text/plain'
  });
  
  return c.json({ success: true });
});

app.delete('/files/:bucket/:key', async (c) => {
  const s3 = c.get('S3');
  await s3.deleteObject({
    Bucket: c.req.param('bucket'),
    Key: c.req.param('key')
  });
  
  return c.json({ success: true });
});
```

### Secrets Managerミドルウェア

Secrets ManagerのクライアントインスタンスをHonoコンテキストに設定します。

```typescript
import { Hono } from 'hono';
import { secretsManagerMiddleware, Env } from '@squilla/hono-aws-middlewares';

const app = new Hono<Env>();

// ミドルウェアの設定
app.use('*', secretsManagerMiddleware({
  region: 'ap-northeast-1'
}));

// Secrets Managerの使用
app.get('/config', async (c) => {
  const secretsManager = c.get('SecretsManager');
  const result = await secretsManager.getSecretValue({
    SecretId: 'prod/myapp/config'
  });
  return c.json({ config: result.SecretString });
});
```

### 複数のミドルウェアの組み合わせ

複数のAWSサービスを同時に使用する場合：

```typescript
import { Hono } from 'hono';
import { 
  dynamoDBMiddleware, 
  s3Middleware,
  secretsManagerMiddleware, 
  Env 
} from '@squilla/hono-aws-middlewares';

const app = new Hono<Env>();

// 複数のミドルウェアを設定
app.use('*', dynamoDBMiddleware({ region: 'ap-northeast-1' }));
app.use('*', s3Middleware({ region: 'ap-northeast-1' }));
app.use('*', secretsManagerMiddleware({ region: 'ap-northeast-1' }));

app.get('/secure-data/:id', async (c) => {
  // 設定情報をSecrets Managerから取得
  const secretsManager = c.get('SecretsManager');
  const config = await secretsManager.getSecretValue({
    SecretId: 'prod/myapp/config'
  });
  
  // DynamoDBからデータを取得
  const dynamoDB = c.get('DynamoDB');
  const result = await dynamoDB.getItem({
    TableName: 'SecureData',
    Key: { id: { S: c.req.param('id') } }
  });
  
  // S3からファイルを取得
  const s3 = c.get('S3');
  const fileResult = await s3.getObject({
    Bucket: 'secure-files',
    Key: `data/${c.req.param('id')}.json`
  });
  const fileContent = await fileResult.Body?.transformToString();
  
  return c.json({
    data: result.Item,
    config: JSON.parse(config.SecretString || '{}'),
    file: fileContent ? JSON.parse(fileContent) : null
  });
});
```

### 個別インポート

必要なミドルウェアのみをインポートすることも可能です：

```typescript
// DynamoDBのみ
import { dynamoDBMiddleware } from '@squilla/hono-aws-middlewares/dynamodb';

// S3のみ
import { s3Middleware } from '@squilla/hono-aws-middlewares/s3';

// Secrets Managerのみ
import { secretsManagerMiddleware } from '@squilla/hono-aws-middlewares/secrets-manager';
```

## API リファレンス

### DynamoDB

#### `dynamoDBMiddleware(config?: DynamoDBClientConfig)`

DynamoDBクライアントインスタンスを作成し、Honoコンテキストに設定するミドルウェアです。

**パラメータ:**
- `config` (オプション): DynamoDBクライアントの設定オプション

**コンテキストに設定される変数:**
- `DynamoDB`: AWS SDK v3のDynamoDBサービスインスタンス
- `DynamoDBClient`: AWS SDK v3のDynamoDBClientインスタンス

### S3

#### `s3Middleware(config?: S3ClientConfig)`

S3クライアントインスタンスを作成し、Honoコンテキストに設定するミドルウェアです。

**パラメータ:**
- `config` (オプション): S3クライアントの設定オプション

**コンテキストに設定される変数:**
- `S3`: AWS SDK v3のS3サービスインスタンス
- `S3Client`: AWS SDK v3のS3Clientインスタンス

### Secrets Manager

#### `secretsManagerMiddleware(config?: SecretsManagerClientConfig)`

Secrets Managerクライアントインスタンスを作成し、Honoコンテキストに設定するミドルウェアです。

**パラメータ:**
- `config` (オプション): Secrets Managerクライアントの設定オプション

**コンテキストに設定される変数:**
- `SecretsManager`: AWS SDK v3のSecretsManagerサービスインスタンス
- `SecretsManagerClient`: AWS SDK v3のSecretsManagerClientインスタンス

## 環境要件

- Node.js 18.0.0以上
- TypeScript 5.0以上（TypeScriptを使用する場合）
- Hono 4.x
- AWS SDK v3

## 設定オプション

各ミドルウェアは、対応するAWS SDKの設定オプションをそのまま受け取ります。

### 共通設定例

```typescript
const awsConfig = {
  region: 'ap-northeast-1',
  credentials: {
    accessKeyId: 'your-access-key',
    secretAccessKey: 'your-secret-key'
  }
};

app.use('*', dynamoDBMiddleware(awsConfig));
app.use('*', s3Middleware(awsConfig));
app.use('*', secretsManagerMiddleware(awsConfig));
```

### Lambda環境での使用

AWS Lambda環境では、通常は認証情報の設定は不要です：

```typescript
app.use('*', dynamoDBMiddleware({
  region: process.env.AWS_REGION
}));
app.use('*', s3Middleware({
  region: process.env.AWS_REGION
}));
```

## 開発

### プロジェクト構造

```
lib/
├── dynamodb/               # DynamoDBミドルウェア
│   ├── __tests__/         # テストファイル
│   └── index.ts           # メイン実装
├── s3/                    # S3ミドルウェア
│   ├── __tests__/         # テストファイル
│   └── index.ts           # メイン実装
├── secrets-manager/       # Secrets Managerミドルウェア
│   ├── __tests__/         # テストファイル
│   └── index.ts           # メイン実装
└── index.ts               # エントリーポイント
```

### 利用可能なスクリプト

```bash
# ビルド
npm run build

# テスト実行
npm run test

# テスト（カバレッジ付き）
npm run test:coverage

# リント実行
npm run lint

# コード整形
npm run format

# 型チェック
npm run type-check

# ドキュメント生成
npm run docs
```

### テスト

包括的なテストスイートが含まれています：

```bash
# テスト実行
npm run test

# カバレッジレポート生成
npm run test:coverage

# UIでのテスト実行
npm run test:ui
```

## コントリビューション

プルリクエストや課題報告を歓迎します。新しいAWSサービスの対応要望もお気軽にお知らせください。

### 新しいAWSサービスの追加

1. `lib/`ディレクトリ内に新しいサービス用のフォルダを作成
2. ミドルウェア実装とテストを追加
3. `lib/index.ts`にエクスポートを追加
4. `package.json`の`exports`に新しいエントリを追加

## ライセンス

[Apache 2.0 License](LICENSE)

## リンク

- [GitHub Repository](https://github.com/squillaiugis/hono-aws-middlewares)
- [npm Package](https://www.npmjs.com/package/@squilla/hono-aws-middlewares)
- [Documentation](https://squillaiugis.github.io/hono-aws-middlewares/)
- [Hono](https://hono.dev/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
