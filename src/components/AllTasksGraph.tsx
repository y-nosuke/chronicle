import { useState, useEffect } from 'react';
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
import { useTaskGraph, type TimeFilter } from '../hooks/useTaskGraph';
import type { Task } from '../types/task';

// Custom Node Component
const TaskNode = ({ data }: NodeProps<{ task: Task; label: string; isCurrent: boolean }>) => {
    const { task } = data;

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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{
            padding: '10px',
            borderRadius: '8px',
            background: 'var(--color-bg-surface)',
            border: '2px solid transparent',
            boxShadow: 'var(--shadow-md)',
            minWidth: '150px',
            borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
            opacity: task.status === 'done' ? 0.8 : 1,
        }}>
            <Handle type="target" position={Position.Left} style={{ background: '#555' }} />

            <div style={{ marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>
                {task.title}
            </div>

            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '4px' }}>
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

            <div style={{ fontSize: '9px', color: 'var(--color-text-muted)' }}>
                {formatDate(task.createdAt)}
            </div>

            <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
        </div>
    );
};

const nodeTypes = {
    taskNode: TaskNode,
};

interface AllTasksGraphProps {
    onTaskClick: (taskId: string) => void;
}

export function AllTasksGraph({ onTaskClick }: AllTasksGraphProps) {
    const [timeFilter, setTimeFilter] = useState<TimeFilter>({});
    const [startDateInput, setStartDateInput] = useState('');
    const [endDateInput, setEndDateInput] = useState('');

    const { nodes, edges, loading } = useTaskGraph(null, 'all', timeFilter);

    // Initialize filter inputs with current data range
    useEffect(() => {
        if (!loading && nodes.length > 0 && !startDateInput && !endDateInput) {
            const tasks = nodes.map(n => n.data.task).filter(Boolean);
            if (tasks.length === 0) return;

            const dates = tasks.map(t => new Date(t.createdAt).getTime());
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));

            // Format as YYYY-MM-DD for input[type="date"]
            const formatDateInput = (date: Date) => {
                return date.toISOString().split('T')[0];
            };

            setStartDateInput(formatDateInput(minDate));
            setEndDateInput(formatDateInput(maxDate));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, nodes]);

    const handleApplyFilter = () => {
        const filter: TimeFilter = {};
        if (startDateInput) {
            filter.startDate = new Date(startDateInput);
        }
        if (endDateInput) {
            // Set end date to end of the day
            const end = new Date(endDateInput);
            end.setHours(23, 59, 59, 999);
            filter.endDate = end;
        }
        setTimeFilter(filter);
    };

    const handleClearFilter = () => {
        setStartDateInput('');
        setEndDateInput('');
        setTimeFilter({});
    };

    const onNodeClick = (_: React.MouseEvent, node: Node) => {
        if (node.type === 'taskNode' && node.data?.task) {
            onTaskClick(node.data.task.id);
        }
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Loading graph...</div>;
    }

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Time Filter Controls */}
            <div style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-bg-surface)',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                gap: 'var(--space-4)',
                alignItems: 'center',
                flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                    <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold' }}>開始日:</label>
                    <input
                        type="date"
                        value={startDateInput}
                        onChange={(e) => setStartDateInput(e.target.value)}
                        style={{
                            padding: 'var(--space-2)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--text-sm)'
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                    <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold' }}>終了日:</label>
                    <input
                        type="date"
                        value={endDateInput}
                        onChange={(e) => setEndDateInput(e.target.value)}
                        style={{
                            padding: 'var(--space-2)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--text-sm)'
                        }}
                    />
                </div>
                <button
                    onClick={handleApplyFilter}
                    style={{
                        padding: 'var(--space-2) var(--space-4)',
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-sm)',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    フィルタ適用
                </button>
                <button
                    onClick={handleClearFilter}
                    style={{
                        padding: 'var(--space-2) var(--space-4)',
                        backgroundColor: 'transparent',
                        color: 'var(--color-text-main)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-sm)',
                        cursor: 'pointer'
                    }}
                >
                    クリア
                </button>
                <div style={{ marginLeft: 'auto', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                    {nodes.length} タスク表示中
                </div>
            </div>

            {/* Graph Display */}
            <div style={{ flex: 1, minHeight: '400px' }}>
                {nodes.length === 0 ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: 'var(--color-text-secondary)'
                    }}>
                        タスクがありません
                    </div>
                ) : (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges as Edge[]}
                        nodeTypes={nodeTypes}
                        onNodeClick={onNodeClick}
                        fitView
                        attributionPosition="bottom-right"
                    >
                        <Background color="#aaa" gap={16} />
                        <Controls />
                        <MiniMap />
                    </ReactFlow>
                )}
            </div>
        </div>
    );
}
