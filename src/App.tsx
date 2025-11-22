import { useState } from 'react';
import { useTasks } from './hooks/useTasks';
import type { TaskPriority } from './types/task';

function App() {
  const { tasks, addTask, updateTaskStatus, deleteTask, addChecklistItem, toggleChecklistItem, deleteChecklistItem } = useTasks();
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    // Note: addTask in hook needs update to accept priority if we want to set it on creation
    // For now, let's just create it and we can update the hook later or just default to medium
    // Let's update the hook usage to pass priority if we modify the hook, 
    // but for now I'll just stick to the simple addTask signature and maybe update it later.
    // Actually, let's just modify the hook to accept priority or update it after creation.
    // For MVP verification, I'll just add it with default and let user change it, 
    // OR better, I'll update the hook signature in the next step. 
    // Wait, I can't update the hook in this same step easily. 
    // I'll just use the default for now and add a priority selector for *display* or *update*.

    // Actually, I'll just update the hook in the next step. For now, let's just add the task.
    await addTask(input);
    setInput('');
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case 'high': return '#ef4444'; // Red
      case 'medium': return '#f59e0b'; // Amber
      case 'low': return '#10b981'; // Green
      default: return '#64748b';
    }
  };

  return (
    <div style={{ padding: 'var(--space-8)', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', marginBottom: 'var(--space-2)' }}>Chronicle</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Task Management Reimagined</p>
      </header>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-8)' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What needs to be done?"
          style={{
            flex: 1,
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            fontSize: 'var(--text-base)'
          }}
        />
        <button
          type="submit"
          style={{
            padding: 'var(--space-3) var(--space-6)',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 'bold'
          }}
        >
          Add Task
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {tasks?.map((task) => (
          <div
            key={task.id}
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-bg-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)',
              borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontWeight: 'bold', marginBottom: 'var(--space-1)' }}>{task.title}</h3>
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                  <span style={{
                    fontSize: 'var(--text-xs)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: task.status === 'done' ? 'var(--color-status-done)' :
                      task.status === 'hold' ? 'var(--color-status-hold)' :
                        task.status === 'inprogress' ? 'var(--color-status-inprogress)' :
                          'var(--color-status-todo)',
                    color: 'white'
                  }}>
                    {task.status}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    {task.priority}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {task.status === 'todo' && (
                  <button
                    onClick={() => updateTaskStatus(task.id, 'inprogress')}
                    style={{
                      padding: 'var(--space-2) var(--space-4)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-status-inprogress)',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--color-status-inprogress)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    Start
                  </button>
                )}
                {task.status === 'inprogress' && (
                  <button
                    onClick={() => updateTaskStatus(task.id, 'hold')}
                    style={{
                      padding: 'var(--space-2) var(--space-4)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-status-hold)',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--color-status-hold)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    Hold
                  </button>
                )}
                {task.status === 'hold' && (
                  <button
                    onClick={() => updateTaskStatus(task.id, 'inprogress')}
                    style={{
                      padding: 'var(--space-2) var(--space-4)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-status-inprogress)',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--color-status-inprogress)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    Resume
                  </button>
                )}
                {task.status !== 'done' && (
                  <button
                    onClick={() => updateTaskStatus(task.id, 'done')}
                    style={{
                      padding: 'var(--space-2) var(--space-4)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-status-done)',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--color-status-done)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    Done
                  </button>
                )}
                <button
                  onClick={() => deleteTask(task.id)}
                  style={{
                    padding: 'var(--space-2) var(--space-4)',
                    fontSize: 'var(--text-sm)',
                    color: '#ef4444', // Explicit red for visibility
                    backgroundColor: 'transparent',
                    border: '1px solid #ef4444',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Checklist Section */}
            <div style={{
              marginTop: 'var(--space-2)',
              paddingTop: 'var(--space-2)',
              borderTop: '1px solid var(--color-border)',
              paddingLeft: 'var(--space-4)',
              paddingRight: 'var(--space-4)',
              paddingBottom: 'var(--space-4)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {task.checklist.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleChecklistItem(task.id, item.id)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{
                      textDecoration: item.completed ? 'line-through' : 'none',
                      color: item.completed ? 'var(--color-text-muted)' : 'var(--color-text-main)',
                      fontSize: 'var(--text-sm)'
                    }}>
                      {item.text}
                    </span>
                    <button
                      onClick={() => deleteChecklistItem(task.id, item.id)}
                      style={{
                        marginLeft: 'auto',
                        fontSize: 'var(--text-lg)', // Larger icon
                        padding: 'var(--space-1) var(--space-2)', // More hit area
                        color: 'var(--color-text-muted)',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const input = form.elements.namedItem('checklistInput') as HTMLInputElement;
                    if (input.value.trim()) {
                      addChecklistItem(task.id, input.value);
                      input.value = '';
                    }
                  }}
                  style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}
                >
                  <input
                    name="checklistInput"
                    type="text"
                    placeholder="Add subtask..."
                    style={{
                      flex: 1,
                      padding: 'var(--space-1) var(--space-2)',
                      fontSize: 'var(--text-sm)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      fontSize: 'var(--text-xs)',
                      padding: 'var(--space-1) var(--space-3)',
                      backgroundColor: 'var(--color-primary)', // Primary color for visibility
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Add
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))
        }
      </div >
    </div >
  );
}

export default App;
