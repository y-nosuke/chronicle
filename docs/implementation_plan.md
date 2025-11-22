# メイン画面グラフ表示の実装

メイン画面に全タスクのトレーサビリティグラフを表示する機能を実装します。時間フィルタ機能を含め、ユーザーが全体のタスクの流れを視覚的に把握できるようにします。

## User Review Required

> [!IMPORTANT]
> この実装では、メイン画面に新しいビュー（グラフビュー）を追加します。現在のリストビューとグラフビューを切り替えるUIを追加する予定です。

## Proposed Changes

### Core Logic

#### [MODIFY] [useTaskGraph.ts](file:///c:/Users/yoichi/.gemini/antigravity/scratch/chronicle/src/hooks/useTaskGraph.ts)

`useTaskGraph` フックに 'all' モードの実装を追加します:

- 現在は 'all' モードが未実装（空の配列を返す）
- 全タスクとその関係性を取得するロジックを実装
- 時間フィルタ（開始日・終了日）をサポート
- すべてのタスクノードと、分割・統合の関係性エッジを生成
- レイアウトアルゴリズムを適用（階層的レイアウト）

---

### UI Components

#### [NEW] [AllTasksGraph.tsx](file:///c:/Users/yoichi/.gemini/antigravity/scratch/chronicle/src/components/AllTasksGraph.tsx)

全タスクグラフを表示する新しいコンポーネント:

- 時間フィルタUI（開始日・終了日の入力フィールド）
- `useTaskGraph` の 'all' モードを使用
- `TaskGraph` コンポーネントを再利用（または新しいレイアウトで実装）
- タスクノードクリックで詳細モーダルを開く

#### [MODIFY] [App.tsx](file:///c:/Users/yoichi/.gemini/antigravity/scratch/chronicle/src/App.tsx)

メイン画面にグラフビューの切り替え機能を追加:

- リストビュー/グラフビューの切り替えボタンを追加
- 状態管理（useState）でビューモードを管理
- グラフビュー時は `AllTasksGraph` コンポーネントを表示
- リストビュー時は既存のタスクリストを表示

---

### Types & Interfaces

#### [MODIFY] [useTaskGraph.ts](file:///c:/Users/yoichi/.gemini/antigravity/scratch/chronicle/src/hooks/useTaskGraph.ts)

型定義の拡張:

- `useTaskGraph` の引数に時間フィルタオプションを追加
- `TimeFilter` インターフェースの定義（`startDate?: Date`, `endDate?: Date`）

## Verification Plan

### Automated Tests

現在、プロジェクトにはテストフレームワークが設定されていません。今回は手動テストで検証します。

### Manual Verification

#### 1. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開く

#### 2. グラフビューの表示確認

- メイン画面でグラフビュー切り替えボタンをクリック
- 全タスクがグラフとして表示されることを確認
- タスクノード間の関係性（分割・統合）が正しく表示されることを確認

#### 3. 時間フィルタの動作確認

- 開始日を設定し、それ以降に作成されたタスクのみが表示されることを確認
- 終了日を設定し、それ以前に作成されたタスクのみが表示されることを確認
- 両方を設定し、期間内のタスクのみが表示されることを確認
- フィルタをクリアし、全タスクが再表示されることを確認

#### 4. インタラクション確認

- グラフ内のタスクノードをクリックし、タスク詳細モーダルが開くことを確認
- グラフのズーム・パン操作が正常に動作することを確認
- リストビューに戻れることを確認

#### 5. Lintチェック

```bash
npm run lint
```

エラーがないことを確認

#### 6. ユーザーによる最終確認

Antigravityによる動作確認後、ユーザーに実際の操作を依頼し、以下を確認:
- UI/UXが期待通りか
- パフォーマンスに問題がないか
- 追加の改善点がないか
