# トレーサビリティグラフUI実装計画 (Antigravity作業用)

## 現在のタスク: フェーズ2 専用グラフビューページ
    -   `src/pages/TaskGraphPage.tsx`: 全画面でグラフを表示するページコンポーネント
    -   ヘッダーに「戻る」ボタンを配置

5.  **UI連携**
    -   `src/components/TaskDetailModal.tsx`: 「全画面で見る」ボタンを追加し、`/graph/:taskId` へ遷移

### 検証手順

1.  ビルドとLintチェック (`npm run build`, `npm run lint`)
2.  ブラウザでの動作確認
    -   タスク詳細モーダルから「全画面で見る」をクリック
    -   URLが `/graph/xxx` に遷移することを確認
    -   グラフが全画面で表示され、再帰的な関係（祖先・子孫）が表示されることを確認
    -   「戻る」ボタンで元の画面に戻れることを確認
