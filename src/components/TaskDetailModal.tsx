import { useState } from 'react';
import type { Task } from '../types/task';
import { useTaskHistory } from '../hooks/useTaskHistory';
import { useRelatedTasks } from '../hooks/useRelatedTasks';
import { TaskHistory } from './TaskHistory';
import { RelatedTasks } from './RelatedTasks';

interface TaskDetailModalProps {
    task: Task | null;
    onClose: () => void;
    onTaskClick: (taskId: string) => void;
}

export function TaskDetailModal({ task, onClose, onTaskClick }: TaskDetailModalProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'history' | 'relations'>('info');
    const history = useTaskHistory(task?.id || null);
    const relatedTasks = useRelatedTasks(task);

    if (!task) return null;

    const tabs = [
        { id: 'info' as const, label: '基本情報', icon: '📋' },
        { id: 'history' as const, label: '履歴', icon: '📜' },
        { id: 'relations' as const, label: '関連タスク', icon: '🔗' }
    ];

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: 'var(--space-4)'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: 'var(--color-bg-app)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)',
                    maxWidth: '700px',
                    width: '100%',
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: 'var(--space-6)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                }}>
                    <div style={{ flex: 1, marginRight: 'var(--space-4)' }}>
                        <h2 style={{
                            fontSize: 'var(--text-xl)',
                            fontWeight: 'bold',
                            marginBottom: 'var(--space-2)'
                        }}>
                            {task.title}
                        </h2>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
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
                            <span style={{
                                fontSize: 'var(--text-xs)',
                                color: 'var(--color-text-muted)'
                            }}>
                                優先度: {task.priority}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: 'var(--text-2xl)',
                            cursor: 'pointer',
                            color: 'var(--color-text-muted)',
                            padding: 'var(--space-2)',
                            lineHeight: 1
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg-surface)'
                }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                padding: 'var(--space-3)',
                                border: 'none',
                                backgroundColor: activeTab === tab.id ? 'var(--color-bg-app)' : 'transparent',
                                borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                                cursor: 'pointer',
                                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                                color: activeTab === tab.id ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 'var(--space-2)'
                            }}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: 'var(--space-6)'
                }}>
                    {activeTab === 'info' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {task.description && (
                                <div>
                                    <h3 style={{
                                        fontWeight: 'bold',
                                        marginBottom: 'var(--space-2)',
                                        color: 'var(--color-text-secondary)'
                                    }}>
                                        説明
                                    </h3>
                                    <p style={{ color: 'var(--color-text-main)' }}>
                                        {task.description}
                                    </p>
                                </div>
                            )}

                            {task.tags.length > 0 && (
                                <div>
                                    <h3 style={{
                                        fontWeight: 'bold',
                                        marginBottom: 'var(--space-2)',
                                        color: 'var(--color-text-secondary)'
                                    }}>
                                        タグ
                                    </h3>
                                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                                        {task.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                style={{
                                                    padding: 'var(--space-1) var(--space-3)',
                                                    backgroundColor: 'var(--color-bg-surface)',
                                                    borderRadius: 'var(--radius-full)',
                                                    fontSize: 'var(--text-sm)'
                                                }}
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {task.checklist.length > 0 && (
                                <div>
                                    <h3 style={{
                                        fontWeight: 'bold',
                                        marginBottom: 'var(--space-2)',
                                        color: 'var(--color-text-secondary)'
                                    }}>
                                        チェックリスト
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                        {task.checklist.map((item) => (
                                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={item.completed}
                                                    disabled
                                                    style={{ cursor: 'not-allowed' }}
                                                />
                                                <span style={{
                                                    textDecoration: item.completed ? 'line-through' : 'none',
                                                    color: item.completed ? 'var(--color-text-muted)' : 'var(--color-text-main)'
                                                }}>
                                                    {item.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 style={{
                                    fontWeight: 'bold',
                                    marginBottom: 'var(--space-2)',
                                    color: 'var(--color-text-secondary)'
                                }}>
                                    作成日時
                                </h3>
                                <p style={{ color: 'var(--color-text-main)' }}>
                                    {new Date(task.createdAt).toLocaleString('ja-JP')}
                                </p>
                            </div>

                            <div>
                                <h3 style={{
                                    fontWeight: 'bold',
                                    marginBottom: 'var(--space-2)',
                                    color: 'var(--color-text-secondary)'
                                }}>
                                    更新日時
                                </h3>
                                <p style={{ color: 'var(--color-text-main)' }}>
                                    {new Date(task.updatedAt).toLocaleString('ja-JP')}
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div>
                            <h3 style={{
                                fontWeight: 'bold',
                                marginBottom: 'var(--space-4)',
                                color: 'var(--color-text-secondary)'
                            }}>
                                タスク履歴
                            </h3>
                            {history ? (
                                <TaskHistory events={history} />
                            ) : (
                                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    読み込み中...
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'relations' && (
                        <div>
                            <h3 style={{
                                fontWeight: 'bold',
                                marginBottom: 'var(--space-4)',
                                color: 'var(--color-text-secondary)'
                            }}>
                                関連タスク
                            </h3>
                            {relatedTasks ? (
                                <RelatedTasks
                                    relatedTasks={relatedTasks}
                                    onTaskClick={onTaskClick}
                                />
                            ) : (
                                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    読み込み中...
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
