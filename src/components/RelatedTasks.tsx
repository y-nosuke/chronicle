import type { Task } from '../types/task';
import type { RelatedTasksResult } from '../hooks/useRelatedTasks';

interface RelatedTasksProps {
    relatedTasks: RelatedTasksResult;
    onTaskClick: (taskId: string) => void;
}

export function RelatedTasks({ relatedTasks, onTaskClick }: RelatedTasksProps) {
    const { parentTasks, childTasks, mergedFromTasks, mergedIntoTask } = relatedTasks;

    const hasRelations =
        parentTasks.length > 0 ||
        childTasks.length > 0 ||
        mergedFromTasks.length > 0 ||
        mergedIntoTask !== null;

    if (!hasRelations) {
        return (
            <div style={{
                padding: 'var(--space-4)',
                color: 'var(--color-text-muted)',
                textAlign: 'center'
            }}>
                関連タスクがありません
            </div>
        );
    }

    const renderTaskLink = (task: Task) => (
        <button
            key={task.id}
            onClick={() => onTaskClick(task.id)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-3)',
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-app)';
                e.currentTarget.style.borderColor = 'var(--color-primary)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-surface)';
                e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
        >
            <span style={{ flex: 1, fontWeight: '500' }}>{task.title}</span>
            <span style={{
                fontSize: 'var(--text-xs)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor:
                    task.status === 'done' ? 'var(--color-status-done)' :
                        task.status === 'hold' ? 'var(--color-status-hold)' :
                            task.status === 'inprogress' ? 'var(--color-status-inprogress)' :
                                'var(--color-status-todo)',
                color: 'white'
            }}>
                {task.status}
            </span>
        </button>
    );

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)'
        }}>
            {parentTasks.length > 0 && (
                <div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        marginBottom: 'var(--space-2)',
                        fontWeight: 'bold',
                        color: 'var(--color-text-secondary)'
                    }}>
                        <span>↑</span>
                        <span>親タスク（分割元）</span>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-2)',
                        paddingLeft: 'var(--space-4)'
                    }}>
                        {parentTasks.map(renderTaskLink)}
                    </div>
                </div>
            )}

            {childTasks.length > 0 && (
                <div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        marginBottom: 'var(--space-2)',
                        fontWeight: 'bold',
                        color: 'var(--color-text-secondary)'
                    }}>
                        <span>↓</span>
                        <span>子タスク（分割先）</span>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-2)',
                        paddingLeft: 'var(--space-4)'
                    }}>
                        {childTasks.map(renderTaskLink)}
                    </div>
                </div>
            )}

            {mergedFromTasks.length > 0 && (
                <div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        marginBottom: 'var(--space-2)',
                        fontWeight: 'bold',
                        color: 'var(--color-text-secondary)'
                    }}>
                        <span>⇄</span>
                        <span>統合元タスク</span>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-2)',
                        paddingLeft: 'var(--space-4)'
                    }}>
                        {mergedFromTasks.map(renderTaskLink)}
                    </div>
                </div>
            )}

            {mergedIntoTask && (
                <div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        marginBottom: 'var(--space-2)',
                        fontWeight: 'bold',
                        color: 'var(--color-text-secondary)'
                    }}>
                        <span>⇄</span>
                        <span>統合先タスク</span>
                    </div>
                    <div style={{ paddingLeft: 'var(--space-4)' }}>
                        {renderTaskLink(mergedIntoTask)}
                    </div>
                </div>
            )}
        </div>
    );
}
