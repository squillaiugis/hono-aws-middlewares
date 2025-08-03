# Vite Library Template

ViteとTypeScriptを使用したモダンなライブラリ開発のためのテンプレートリポジトリです。

## このテンプレートについて

このテンプレートは以下の技術スタックを使用してライブラリを開発するための完全なセットアップを提供します：

- ⚡ **Vite**: 高速なビルドとホットリロード
- 📘 **TypeScript**: 型安全なコード開発
- 🧪 **Vitest**: 高速なテスト実行
- 📋 **ESLint**: コード品質の維持
- 🎨 **Prettier**: 統一されたコードフォーマット
- 📦 **複数フォーマット**: ESM、CommonJS、UMD対応
- 🔧 **VS Code設定**: 最適化された開発環境

## テンプレートの使用方法

### 1. リポジトリの作成

このテンプレートを使用してリポジトリを作成します：

1. GitHubで「Use this template」ボタンをクリック
2. 新しいリポジトリ名を入力
3. リポジトリを作成

または、CLIを使用：

```bash
# GitHub CLIを使用
gh repo create my-awesome-library --template username/vite-library-template

# 手動でクローン
git clone https://github.com/username/vite-library-template.git my-awesome-library
cd my-awesome-library
```

### 2. 初期設定

```bash
# 依存関係をインストール
npm install

# パッケージ情報を更新
npm init
```

### 3. カスタマイズ

以下のファイルを編集して、あなたのライブラリに合わせてカスタマイズします：

#### `package.json`
```json
{
  "name": "your-library-name",
  "version": "1.0.0",
  "description": "あなたのライブラリの説明",
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/username/your-library-name.git"
  },
  "keywords": ["keyword1", "keyword2"]
}
```

#### `vite.config.ts`
```typescript
export default defineConfig({
  plugins: [
    dts({
      include: ['lib/**/*'],
      // ...
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      name: 'YourLibraryName', // グローバル名を更新
      fileName: (format) => `your-library-name.${format}.js` // ファイル名を更新
    }
  }
})
```

#### `lib/index.ts`
このファイルがライブラリのメインエントリーポイントです。あなたの機能をここからエクスポートします。

### 4. 開発開始

```bash
# 開発モードで起動
npm run dev

# テストを実行
npm run test

# テストをウォッチモードで実行
npm run test:watch

# ビルドを実行
npm run build
```

## ディレクトリ構造

```
your-library/
├── lib/                    # ソースコード
│   ├── __tests__/          # 単体テストコード
│   └── index.ts            # メインエントリーポイント
├── dist/                   # ビルド出力（自動生成）
├── .vscode/                # VS Code設定
├── vite.config.ts          # Vite設定
├── vitest.config.ts        # Vitest設定
├── tsconfig.json           # TypeScript設定
├── .eslintrc.js            # ESLint設定
├── .prettierrc             # Prettier設定
├── package.json            # パッケージ設定
└── README.md               # ドキュメント
```

## 利用可能なスクリプト

```bash
# ライブラリをビルド
npm run build

# テストを実行
npm run test

# カバレッジ付きでテストを実行
npm run test:coverage

# ウォッチモードでテストを実行
npm run test:watch

# UIでテストを実行
npm run test:ui

# コードをリント
npm run lint

# リンティング問題を修正
npm run lint:fix

# コードをフォーマット
npm run format

# 型チェック
npm run type-check

# HTMLドキュメントを生成
npm run docs

# マークダウンドキュメントを生成
npm run docs:markdown

# ローカルサーバーで確認
npm run docs:serve
```

## 開発ワークフロー

1. **機能開発**: `lib/` ディレクトリに機能を実装
2. **テスト作成**: 対応するテストファイルを作成
3. **型定義**: 必要に応じて `lib/types.ts` を更新
4. **ビルド確認**: `npm run build` でビルドエラーがないことを確認
5. **テスト実行**: `npm run test` ですべてのテストが通ることを確認

## ライブラリの公開

### 1. パッケージの準備

```bash
# ビルドを実行
npm run build

# テストを実行
npm run test

# リンティングを実行
npm run lint
```

### 2. バージョン管理

```bash
# パッチバージョンを上げる
npm version patch

# マイナーバージョンを上げる
npm version minor

# メジャーバージョンを上げる
npm version major
```

### 3. 公開

```bash
# npmに公開
npm publish

# スコープ付きパッケージの場合
npm publish --access public
```

## カスタマイズ例

### React用ライブラリの場合

`package.json`の`peerDependencies`を追加：

```json
{
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

### Vue用ライブラリの場合

`vite.config.ts`を更新：

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue(), dts()],
  // ...
})
```

### Node.js用ライブラリの場合

`package.json`を更新：

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## README.md の更新

ライブラリが完成したら、このREADME.mdを実際のライブラリのドキュメントに置き換えてください。
