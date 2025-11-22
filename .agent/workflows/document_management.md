---
description: プロジェクトのドキュメント管理方針
---

# Chronicle プロジェクトのドキュメント管理方針

このプロジェクトでは、**プロジェクト側のドキュメントを直接使用**します。

## ドキュメントの場所

- **タスク管理**: `chronicle/docs/task.md`
- **実装計画**: `chronicle/docs/implementation_plan.md`

## 重要な注意事項

⚠️ **Antigravity側のファイル（`.gemini/antigravity/brain/`）は使用しないでください**

- タスク管理や実装計画は、必ず `chronicle/docs/` 内のファイルを直接編集してください
- これにより、2重管理を回避し、プロジェクトのドキュメントが常に最新の状態に保たれます

## 作業フロー

1. **計画時**: `chronicle/docs/implementation_plan.md` を作成または更新
2. **実装時**: `chronicle/docs/task.md` で進捗を管理しながらコードを実装
3. **Lintチェック**: 実装後、必ずlintエラーを確認・修正
   - `npm run lint` でエラーを確認
   - すべてのlintエラーを修正してからコミット
4. **Antigravityによる動作確認**: UIが変わった場合は、ブラウザ操作による動作確認を実施
   - Antigravityのブラウザツールを使用して実際の操作をテスト
   - 主要な機能フローを確認（タスク作成、編集、削除など）
   - 新機能が正しく動作することを確認
5. **ユーザーへの動作確認依頼**: Antigravityの動作確認が完了したら、ユーザーに実際の動作確認を依頼
   - ユーザーがブラウザで実際に操作して確認
   - 問題があれば修正し、再度確認
6. **コミット**: ユーザーの承認後、変更をコミット
   - `git add .` で変更をステージング
   - `git commit -m "適切なコミットメッセージ"` でコミット
7. **完了時**: `chronicle/docs/task.md` と `chronicle/docs/implementation_plan.md` を更新

## ファイル構成

```
chronicle/
├── docs/
│   ├── task.md                    # タスク管理（進捗チェックリスト）
│   └── implementation_plan.md     # 実装計画・仕様書
├── src/
│   └── ...
└── .agent/
    └── workflows/
        └── document_management.md  # このファイル
```

この方針により、ドキュメントの一元管理が実現され、更新漏れを防ぐことができます。
