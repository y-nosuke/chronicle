# トレーサビリティグラフUI実装計画 (Antigravity作業用)

## 現在のタスク: フェーズ1 基本機能（タスク詳細モーダル内グラフ）

`docs/specs/traceability_graph.md` (仕様) と `docs/designs/traceability_graph.md` (設計) に基づき、実装を進める。

### 実装ステップ

1.  **依存関係の追加**
    -   `npm install reactflow`
    -   `npm install --save-dev @types/reactflow` (必要であれば)

2.  **カスタムフックの実装**
    -   `src/hooks/useTaskGraph.ts` を作成
    -   `mode='direct'` のロジックを実装

3.  **コンポーネントの実装**
    -   `src/components/TaskGraph.tsx` を作成
    -   カスタムノード `TaskNode` を実装

4.  **UIへの統合**
    -   `src/components/TaskDetailModal.tsx` にグラフタブを追加
    -   `TaskGraph` コンポーネントを配置

### 検証手順

1.  ビルドとLintチェック (`npm run build`, `npm run lint`)
2.  ブラウザでの動作確認
    -   タスク詳細モーダルを開く
    -   グラフタブが表示されるか
    -   ノードが表示されるか
    -   インタラクション（クリック、ドラッグ）が動作するか
