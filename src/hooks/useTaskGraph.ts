import { useMemo } from 'react';
import { type Node, type Edge, Position } from 'reactflow';
import { useRelatedTasks } from './useRelatedTasks';
import type { Task } from '../types/task';

// Graph types
export interface GraphNodeData {
    task: Task;
    label: string;
    isCurrent: boolean;
}

export type GraphNode = Node<GraphNodeData>;

export type EdgeType = 'split' | 'merge' | 'parent-child';

export type GraphEdge = Edge & {
    data?: {
        relationType: EdgeType;
    };
};

interface UseTaskGraphResult {
    nodes: GraphNode[];
    edges: GraphEdge[];
    loading: boolean;
}

/**
 * タスクデータからグラフデータ（nodes, edges）を生成するカスタムフック
 */
export function useTaskGraph(
    task: Task | null,
    mode: 'direct' | 'recursive' | 'all' = 'direct'
): UseTaskGraphResult {
    const relatedTasks = useRelatedTasks(task);

    const { nodes, edges } = useMemo(() => {
        if (!task || !relatedTasks) {
            return { nodes: [], edges: [] };
        }

        if (mode === 'direct') {
            const newNodes: GraphNode[] = [];
            const newEdges: GraphEdge[] = [];

            // Center: Current Task
            newNodes.push({
                id: task.id,
                type: 'taskNode',
                data: { task, label: task.title, isCurrent: true },
                position: { x: 0, y: 0 },
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
            });

            // Left: Parents / Merged From
            const leftSpacing = 100;

            // Parent Tasks (Split From)
            relatedTasks.parentTasks.forEach((parent, index) => {
                const y = (index - (relatedTasks.parentTasks.length - 1) / 2) * leftSpacing;
                newNodes.push({
                    id: parent.id,
                    type: 'taskNode',
                    data: { task: parent, label: parent.title, isCurrent: false },
                    position: { x: -300, y },
                    sourcePosition: Position.Right,
                    targetPosition: Position.Left,
                });
                newEdges.push({
                    id: `${parent.id}-${task.id}`,
                    source: parent.id,
                    target: task.id,
                    type: 'default',
                    animated: true,
                    label: 'Split',
                    data: { relationType: 'split' }
                });
            });

            // Merged From Tasks
            // Adjust Y if we have both parents and merged from (stack them)
            const mergedFromOffset = relatedTasks.parentTasks.length > 0 ? relatedTasks.parentTasks.length * leftSpacing : 0;

            relatedTasks.mergedFromTasks.forEach((mergedFrom, index) => {
                const y = mergedFromOffset + (index - (relatedTasks.mergedFromTasks.length - 1) / 2) * leftSpacing;
                newNodes.push({
                    id: mergedFrom.id,
                    type: 'taskNode',
                    data: { task: mergedFrom, label: mergedFrom.title, isCurrent: false },
                    position: { x: -300, y },
                    sourcePosition: Position.Right,
                    targetPosition: Position.Left,
                });
                newEdges.push({
                    id: `${mergedFrom.id}-${task.id}`,
                    source: mergedFrom.id,
                    target: task.id,
                    type: 'default',
                    animated: true,
                    label: 'Merged',
                    data: { relationType: 'merge' }
                });
            });

            // Right: Children / Merged Into
            const rightSpacing = 100;

            // Child Tasks (Split Into)
            relatedTasks.childTasks.forEach((child, index) => {
                const y = (index - (relatedTasks.childTasks.length - 1) / 2) * rightSpacing;
                newNodes.push({
                    id: child.id,
                    type: 'taskNode',
                    data: { task: child, label: child.title, isCurrent: false },
                    position: { x: 300, y },
                    sourcePosition: Position.Right,
                    targetPosition: Position.Left,
                });
                newEdges.push({
                    id: `${task.id}-${child.id}`,
                    source: task.id,
                    target: child.id,
                    type: 'default',
                    animated: true,
                    label: 'Split',
                    data: { relationType: 'split' }
                });
            });

            // Merged Into Task
            if (relatedTasks.mergedIntoTask) {
                const mergedInto = relatedTasks.mergedIntoTask;
                // If we have children, place mergedInto below them
                const mergedIntoY = relatedTasks.childTasks.length > 0 ? relatedTasks.childTasks.length * rightSpacing : 0;

                newNodes.push({
                    id: mergedInto.id,
                    type: 'taskNode',
                    data: { task: mergedInto, label: mergedInto.title, isCurrent: false },
                    position: { x: 300, y: mergedIntoY },
                    sourcePosition: Position.Right,
                    targetPosition: Position.Left,
                });
                newEdges.push({
                    id: `${task.id}-${mergedInto.id}`,
                    source: task.id,
                    target: mergedInto.id,
                    type: 'default',
                    animated: true,
                    label: 'Merged',
                    data: { relationType: 'merge' }
                });
            }

            return { nodes: newNodes, edges: newEdges };
        }

        return { nodes: [], edges: [] };
    }, [task, relatedTasks, mode]);

    const loading = !!task && !relatedTasks;

    return { nodes, edges, loading };
}
