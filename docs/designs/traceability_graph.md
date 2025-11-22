# トレーサビリティグラフUI機能 基本設計書

`docs/traceability_graph_plan.md` の要件に基づき、具体的な実装設計を定義します。

## 技術スタック

- **ライブラリ**: `reactflow` (v11.11.0)
- **状態管理**: React Local State + Dexie.js (LiveQuery)

## データ構造設計

### グラフノード (GraphNode)

React FlowのNode型を拡張し、タスクデータを保持させます。

```typescript
import { Node } from 'reactflow';
import { Task } from '../types/task';

export interface GraphNodeData {
    task: Task;
    label: string; // タスクタイトルを表示
    isCurrent: boolean; // 現在選択中のタスクかどうか
}

export type GraphNode = Node<GraphNodeData>;
```

### グラフエッジ (GraphEdge)

タスク間の関係性を表現します。

```typescript
import { Edge } from 'reactflow';

export type EdgeType = 'split' | 'merge' | 'parent-child';

export interface GraphEdge extends Edge {
    type: 'default' | 'smoothstep';
    data?: {
        relationType: EdgeType;
    };
    animated?: boolean; // 進行中のタスクに関連する場合はアニメーション
}
```

## コンポーネント設計

### 1. TaskGraph コンポーネント

グラフ表示のコアコンポーネント。

**Props**:
```typescript
interface TaskGraphProps {
    nodes: GraphNode[];
    edges: GraphEdge[];
    onNodeClick: (event: React.MouseEvent, node: GraphNode) => void;
    direction?: 'LR' | 'TB'; // レイアウト方向（デフォルト: LR）
    fitView?: boolean; // 初期表示時に全体を表示するか
    compact?: boolean; // モーダル用などのコンパクト表示モード
}
```

### 2. useTaskGraph フック

タスクデータからグラフデータ（nodes, edges）を生成するロジックを分離します。

**Signature**:
```typescript
interface UseTaskGraphResult {
    nodes: GraphNode[];
    edges: GraphEdge[];
    loading: boolean;
    error: Error | null;
}

function useTaskGraph(
    taskId: string | null,
    mode: 'direct' | 'recursive' | 'all',
    options?: { dateRange?: DateRange }
): UseTaskGraphResult;
```

**レイアウト計算**:
- `dagre` ライブラリを使用して、自動的にノード配置（x, y座標）を計算することを検討しましたが、まずは簡易的な計算ロジック（階層ごとの固定幅配置）で実装し、必要に応じて導入します。

## 実装フェーズ詳細

### フェーズ1: 基本機能（タスク詳細モーダル内グラフ）

**目標**: 選択したタスクの直接の親子・兄弟関係を表示する。

**実装ステップ**:
1.  `npm install reactflow`
2.  `useTaskGraph` の `mode='direct'` 実装
    -   `useRelatedTasks` の結果を利用
    -   中心に対象タスク、左に親/統合元、右に子/統合先を配置
3.  `TaskGraph` コンポーネントの作成
    -   カスタムノード（`TaskNode`）の作成: タイトル、ステータス、優先度を表示
4.  `TaskDetailModal` への組み込み

### フェーズ2: 専用グラフビュー

**目標**: タスクの全系譜を表示する。

**実装ステップ**:
1.  `useTaskGraph` の `mode='recursive'` 実装
    -   再帰的に履歴を辿り、関連する全タスクを取得
    -   トポロジカルソートまたは階層計算による配置
2.  `GraphView` ページの作成
    -   フルスクリーン対応
    -   ミニマップ (`MiniMap` コンポーネント)
    -   コントロール (`Controls` コンポーネント)

### フェーズ3: メイン画面グラフ表示

**目標**: プロジェクト全体の俯瞰。

**実装ステップ**:
1.  `useTaskGraph` の `mode='all'` 実装
    -   全タスク取得とフィルタリング
2.  `MainGraphView` の作成
    -   期間フィルターの実装

## 依存関係

- `reactflow`: グラフ描画エンジン
- `dagre` (Optional): 複雑なレイアウト計算が必要になった場合に追加検討

## 検証項目

1.  **表示の正確性**: 親タスクが左、子タスクが右に配置されること。
2.  **インタラクション**: ノードクリックで詳細が開くこと。
3.  **パフォーマンス**: ノード数が増えても（50個程度）スムーズに動作すること。
4.  **レスポンシブ**: モーダル内とフルスクリーンで適切に表示されること。
