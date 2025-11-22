import type { HistoryEvent } from '../types/task';

interface TaskHistoryProps {
    events: HistoryEvent[];
}

export function TaskHistory({ events }: TaskHistoryProps) {
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'たった今';
        if (diffMins < 60) return `${diffMins}分前`;
        if (diffHours < 24) return `${diffHours}時間前`;
        if (diffDays === 1) return '昨日';
        if (diffDays < 7) return `${diffDays}日前`;

        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'CREATED': return '✨';
            case 'STATUS_CHANGE': return '🔄';
            case 'SPLIT_FROM': return '🔀';
            case 'MERGED_INTO': return '🔗';
            case 'UPDATED': return '📝';
            default: return '•';
        }
    };

    const getEventLabel = (event: HistoryEvent) => {
        switch (event.type) {
            case 'CREATED':
                return 'タスクを作成';
            case 'STATUS_CHANGE':
                return `ステータス変更: ${(event.details as { status?: string }).status || '不明'}`;
            case 'SPLIT_FROM':
                return `タスクから分割 (ID: ${(event.details as { sourceId?: string }).sourceId?.substring(0, 8) || '不明'}...)`;
            case 'MERGED_INTO':
                if ((event.details as { mergedFrom?: string[] }).mergedFrom) {
                    return `${(event.details as { mergedFrom: string[] }).mergedFrom.length}個のタスクから統合`;
                }
                return `タスクに統合 (ID: ${(event.details as { targetId?: string }).targetId?.substring(0, 8) || '不明'}...)`;
            case 'UPDATED':
                return 'タスクを更新';
            default:
                return event.type;
        }
    };

    if (events.length === 0) {
        return (
            <div style={{
                padding: 'var(--space-4)',
                color: 'var(--color-text-muted)',
                textAlign: 'center'
            }}>
                履歴がありません
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)'
        }}>
            {events.map((event) => (
                <div
                    key={event.id}
                    style={{
                        display: 'flex',
                        gap: 'var(--space-3)',
                        padding: 'var(--space-3)',
                        backgroundColor: 'var(--color-bg-surface)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: '3px solid var(--color-primary)'
                    }}
                >
                    <div style={{
                        fontSize: 'var(--text-xl)',
                        lineHeight: 1
                    }}>
                        {getEventIcon(event.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontWeight: 'bold',
                            marginBottom: 'var(--space-1)'
                        }}>
                            {getEventLabel(event)}
                        </div>
                        <div style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-text-muted)'
                        }}>
                            {formatTimestamp(event.timestamp)}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
