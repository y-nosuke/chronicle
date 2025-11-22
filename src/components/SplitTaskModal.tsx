import React, { useState, useEffect } from 'react';

interface SplitTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (titles: string[]) => void;
}

export function SplitTaskModal({ isOpen, onClose, onSubmit }: SplitTaskModalProps) {
    const [titles, setTitles] = useState<string[]>(['', '']);

    useEffect(() => {
        if (isOpen) {
            setTitles(['', '']);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleTitleChange = (index: number, value: string) => {
        const newTitles = [...titles];
        newTitles[index] = value;
        setTitles(newTitles);
    };

    const addInput = () => {
        setTitles([...titles, '']);
    };

    const removeInput = (index: number) => {
        if (titles.length <= 2) return; // Keep at least 2 inputs for a split
        const newTitles = titles.filter((_, i) => i !== index);
        setTitles(newTitles);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validTitles = titles.map(t => t.trim()).filter(t => t);
        if (validTitles.length > 0) {
            onSubmit(validTitles);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'var(--color-bg-surface)',
                padding: 'var(--space-6)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                width: '100%',
                maxWidth: '500px',
                border: '1px solid var(--color-border)',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', marginBottom: 'var(--space-4)' }}>Split Task</h3>

                <div style={{ overflowY: 'auto', flex: 1, marginBottom: 'var(--space-4)' }}>
                    <p style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                        Break this task down into smaller, manageable tasks.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        {titles.map((title, index) => (
                            <div key={index} style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => handleTitleChange(index, e.target.value)}
                                    placeholder={`Task ${index + 1}`}
                                    autoFocus={index === 0}
                                    style={{
                                        flex: 1,
                                        padding: 'var(--space-3)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                        fontSize: 'var(--text-base)',
                                        backgroundColor: 'var(--color-bg-app)',
                                        color: 'var(--color-text-main)'
                                    }}
                                />
                                {titles.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removeInput(index)}
                                        style={{
                                            padding: 'var(--space-2)',
                                            color: 'var(--color-text-muted)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: 'var(--text-lg)'
                                        }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={addInput}
                        style={{
                            marginTop: 'var(--space-3)',
                            padding: 'var(--space-2) var(--space-3)',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-primary)',
                            background: 'none',
                            border: '1px dashed var(--color-primary)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            width: '100%'
                        }}
                    >
                        + Add another task
                    </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: 'var(--space-2) var(--space-4)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'transparent',
                            color: 'var(--color-text-main)',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        style={{
                            padding: 'var(--space-2) var(--space-4)',
                            borderRadius: 'var(--radius-md)',
                            border: 'none',
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Split Task
                    </button>
                </div>
            </div>
        </div>
    );
}
