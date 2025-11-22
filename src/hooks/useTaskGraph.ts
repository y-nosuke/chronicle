import { useMemo } from 'react';
import { type Node, type Edge, Position } from 'reactflow';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
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

    // Fetch all data for recursive mode
    const allData = useLiveQuery(async () => {
        if (mode !== 'recursive' || !task) return null;
        const tasks = await db.tasks.toArray();
        const history = await db.history
            .filter(h => ['SPLIT_FROM', 'STATUS_CHANGE', 'MERGED_INTO'].includes(h.type))
            .toArray();
        return { tasks, history };
    }, [mode, task?.id]);

    const { nodes, edges } = useMemo(() => {
        if (!task) {
            return { nodes: [], edges: [] };
        }

        if (mode === 'direct' && relatedTasks) {
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
                    label: 'Merge',
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
                newNodes.push({
                    id: mergedInto.id,
                    type: 'taskNode',
                    data: { task: mergedInto, label: mergedInto.title, isCurrent: false },
                    position: { x: 300, y: 0 }, // Assuming only one merged into, center it
                    sourcePosition: Position.Right,
                    targetPosition: Position.Left,
                });
                newEdges.push({
                    id: `${task.id}-${mergedInto.id}`,
                    source: task.id,
                    target: mergedInto.id,
                    type: 'default',
                    animated: true,
                    label: 'Merge',
                    data: { relationType: 'merge' }
                });
            }

            return { nodes: newNodes, edges: newEdges };

        } else if (mode === 'recursive' && allData) {
            const { tasks, history } = allData;
            const taskMap = new Map(tasks.map(t => [t.id, t]));
            const adj = new Map<string, { target: string, type: EdgeType }[]>();
            const revAdj = new Map<string, { source: string, type: EdgeType }[]>();

            // Build adjacency graph from history
            history.forEach(h => {
                if (h.type === 'SPLIT_FROM') {
                    const childId = h.taskId;
                    const parentId = h.details?.sourceId as string;
                    if (parentId && childId) {
                        if (!adj.has(parentId)) adj.set(parentId, []);
                        adj.get(parentId)!.push({ target: childId, type: 'split' });
                        if (!revAdj.has(childId)) revAdj.set(childId, []);
                        revAdj.get(childId)!.push({ source: parentId, type: 'split' });
                    }
                } else if (h.type === 'STATUS_CHANGE' && h.details?.splitInto) {
                    const parentId = h.taskId;
                    const childIds = h.details.splitInto as string[];
                    childIds.forEach(childId => {
                        if (!adj.has(parentId)) adj.set(parentId, []);
                        adj.get(parentId)!.push({ target: childId, type: 'split' });
                        if (!revAdj.has(childId)) revAdj.set(childId, []);
                        revAdj.get(childId)!.push({ source: parentId, type: 'split' });
                    });
                } else if (h.type === 'MERGED_INTO') {
                    if (h.details?.mergedFrom) {
                        const targetId = h.taskId;
                        const sourceIds = h.details.mergedFrom as string[];
                        sourceIds.forEach(sourceId => {
                            if (!adj.has(sourceId)) adj.set(sourceId, []);
                            adj.get(sourceId)!.push({ target: targetId, type: 'merge' });
                            if (!revAdj.has(targetId)) revAdj.set(targetId, []);
                            revAdj.get(targetId)!.push({ source: sourceId, type: 'merge' });
                        });
                    } else if (h.details?.targetId) {
                        const sourceId = h.taskId;
                        const targetId = h.details.targetId as string;
                        if (!adj.has(sourceId)) adj.set(sourceId, []);
                        adj.get(sourceId)!.push({ target: targetId, type: 'merge' });
                        if (!revAdj.has(targetId)) revAdj.set(targetId, []);
                        revAdj.get(targetId)!.push({ source: sourceId, type: 'merge' });
                    }
                }
            });

            // BFS to find all connected nodes
            const visited = new Set<string>();
            const queue = [task.id];
            visited.add(task.id);

            while (queue.length > 0) {
                const currentId = queue.shift()!;

                // Forward connections
                if (adj.has(currentId)) {
                    adj.get(currentId)!.forEach(edge => {
                        if (!visited.has(edge.target)) {
                            visited.add(edge.target);
                            queue.push(edge.target);
                        }
                    });
                }

                // Backward connections
                if (revAdj.has(currentId)) {
                    revAdj.get(currentId)!.forEach(edge => {
                        if (!visited.has(edge.source)) {
                            visited.add(edge.source);
                            queue.push(edge.source);
                        }
                    });
                }
            }

            // Assign levels (BFS from task.id again, but this time for levels)
            const levels = new Map<string, number>();
            levels.set(task.id, 0);
            const levelQueue = [task.id];
            const levelVisited = new Set<string>();
            levelVisited.add(task.id);

            while (levelQueue.length > 0) {
                const currentId = levelQueue.shift()!;
                const currentLevel = levels.get(currentId)!;

                if (adj.has(currentId)) {
                    adj.get(currentId)!.forEach(edge => {
                        if (!levelVisited.has(edge.target)) {
                            levels.set(edge.target, currentLevel + 1);
                            levelVisited.add(edge.target);
                            levelQueue.push(edge.target);
                        }
                    });
                }
                if (revAdj.has(currentId)) {
                    revAdj.get(currentId)!.forEach(edge => {
                        if (!levelVisited.has(edge.source)) {
                            levels.set(edge.source, currentLevel - 1);
                            levelVisited.add(edge.source);
                            levelQueue.push(edge.source);
                        }
                    });
                }
            }

            // Generate nodes and edges
            const newNodes: GraphNode[] = [];
            const newEdges: GraphEdge[] = [];
            const levelGroups = new Map<number, string[]>();

            visited.forEach(id => {
                const level = levels.get(id) || 0;
                if (!levelGroups.has(level)) levelGroups.set(level, []);
                levelGroups.get(level)!.push(id);
            });

            levelGroups.forEach((ids, level) => {
                ids.forEach((id, index) => {
                    const t = taskMap.get(id);
                    if (t) {
                        newNodes.push({
                            id: t.id,
                            type: 'taskNode',
                            data: { task: t, label: t.title, isCurrent: t.id === task.id },
                            position: { x: level * 300, y: index * 100 },
                            sourcePosition: Position.Right,
                            targetPosition: Position.Left,
                        });
                    }
                });
            });

            // Generate edges for visited nodes
            visited.forEach(sourceId => {
                if (adj.has(sourceId)) {
                    adj.get(sourceId)!.forEach(edge => {
                        if (visited.has(edge.target)) {
                            newEdges.push({
                                id: `${sourceId}-${edge.target}`,
                                source: sourceId,
                                target: edge.target,
                                type: 'default',
                                animated: true,
                                label: edge.type === 'split' ? 'Split' : 'Merge',
                                data: { relationType: edge.type }
                            });
                        }
                    });
                }
            });

            return { nodes: newNodes, edges: newEdges };
        }

        return { nodes: [], edges: [] };
    }, [task, mode, relatedTasks, allData]);

    return { nodes, edges, loading: !task || (mode === 'recursive' && !allData) };
}
