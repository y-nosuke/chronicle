---
description: プロジェクトのドキュメント管理方針
---

# Chronicle プロジェクトのドキュメント管理方針

このプロジェクトでは、**プロジェクト側のドキュメントを直接使用**します。

## ドキュメントの場所

- **タスク管理**: `docs/task.md`
- **実装計画**: `docs/implementation_plan.md`
- **要件定義**: `docs/requirements.md`
- **仕様書**: `docs/specs/` （フォルダ）
- **デザイン資料**: `docs/designs/` （フォルダ）

## 重要な注意事項

⚠️ **Antigravity側のファイル（`.gemini/antigravity/brain/`）は使用しないでください**

- タスク管理や実装計画は、必ず `docs/` 内のファイルを直接編集してください
- これにより、二重管理を回避し、ドキュメントが常に最新の状態に保たれます

## 作業フロー

1. **計画時**: `docs/implementation_plan.md` を作成または更新
2. **実装時**: `docs/task.md` で進捗を管理しながらコードを実装
3. **Lintチェック**: `npm run lint` でエラー確認 → 修正 → コミット
4. **Antigravity による動作確認**: ブラウザツールで UI をテスト
5. **ユーザーへの動作確認依頼**: Antigravity の確認が完了したらユーザーに実際の操作を依頼
6. **コミット**: `git add .` → `git commit -m "…"`.
7. **完了時**: `docs/task.md` と `docs/implementation_plan.md` を更新

## ファイル構成

（全体像はツリーで示しています。個別ファイルの説明は上記「ドキュメントの場所」セクションをご参照ください）

```text
chronicle/
├── docs/
│   ├── task.md
│   ├── implementation_plan.md
│   ├── requirements.md
│   ├── specs/
│   └── designs/
├── src/
│   └── …
└── .agent/
    └── workflows/
        └── document_management.md
```
