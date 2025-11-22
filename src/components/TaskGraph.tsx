import { useCallback } from 'react';
import ReactFlow, {
    Controls,
    Background,
    MiniMap,
    Handle,
    Position,
    type NodeProps,
    type Node,
    type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useTaskGraph } from '../hooks/useTaskGraph';
import type { Task } from '../types/task';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

// Custom Node Component
const TaskNode = ({ data }: NodeProps<{ task: Task; label: string; isCurrent: boolean }>) => {
    const { task, isCurrent } = data;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'done': return 'var(--color-status-done)';
            case 'inprogress': return 'var(--color-status-inprogress)';
            case 'hold': return 'var(--color-status-hold)';
            default: return 'var(--color-status-todo)';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#64748b';
        }
    };

    return (
        <div style={{
            padding: '10px',
            borderRadius: '8px',
            background: 'var(--color-bg-surface)',
            border: `2px solid ${isCurrent ? 'var(--color-primary)' : 'transparent'}`,
            boxShadow: 'var(--shadow-md)',
            minWidth: '150px',
            borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
            opacity: task.status === 'done' ? 0.8 : 1,
        }}>
            <Handle type="target" position={Position.Left} style={{ background: '#555' }} />

            <div style={{ marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>
                {task.title}
            </div>

            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    backgroundColor: getStatusColor(task.status),
                    color: 'white'
                }}>
                    {task.status}
                </span>
            </div>

            <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
        </div>
    );
};

const nodeTypes = {
    taskNode: TaskNode,
};

interface TaskGraphProps {
    taskId: string;
    mode?: 'direct' | 'recursive' | 'all';
    onTaskClick: (taskId: string) => void;
    compact?: boolean;
}

export function TaskGraph({ taskId, mode = 'direct', onTaskClick, compact = false }: TaskGraphProps) {
    return (
        <TaskGraphContent taskId={taskId} mode={mode} onTaskClick={onTaskClick} compact={compact} />
    );
}

function TaskGraphContent({ taskId, mode, onTaskClick, compact }: TaskGraphProps) {
    const task = useLiveQuery(() => db.tasks.get(taskId), [taskId]);
    const { nodes, edges, loading } = useTaskGraph(task || null, mode);

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        if (node.type === 'taskNode' && node.data?.task) {
            onTaskClick(node.data.task.id);
        }
    }, [onTaskClick]);

    if (loading || !task) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Loading graph...</div>;
    }

    return (
        <div style={{ width: '100%', height: compact ? '400px' : '100%', minHeight: '400px' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges as Edge[]}
                nodeTypes={nodeTypes}
                onNodeClick={onNodeClick}
                fitView
                attributionPosition="bottom-right"
            >
                <Background color="#aaa" gap={16} />
                {!compact && <Controls />}
                {!compact && <MiniMap />}
            </ReactFlow>
        </div>
    );
}
