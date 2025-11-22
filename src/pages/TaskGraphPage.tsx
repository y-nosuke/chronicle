import { useParams, useNavigate } from 'react-router-dom';
import { TaskGraph } from '../components/TaskGraph';

export function TaskGraphPage() {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();

    if (!taskId) {
        return <div>Task ID is missing</div>;
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{
                padding: 'var(--space-4)',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
                backgroundColor: 'var(--color-bg-surface)'
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        padding: 'var(--space-2) var(--space-4)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        background: 'transparent',
                        cursor: 'pointer',
                        color: 'var(--color-text-main)'
                    }}
                >
                    ← Back
                </button>
                <h1 style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold' }}>Task Graph View</h1>
            </header>
            <div style={{ flex: 1 }}>
                <TaskGraph
                    taskId={taskId}
                    mode="recursive"
                    onTaskClick={(id) => navigate(`/graph/${id}`)}
                />
            </div>
        </div>
    );
}
