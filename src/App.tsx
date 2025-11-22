
import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTasks } from './hooks/useTasks';
import type { TaskPriority, Task } from './types/task';
import { Modal } from './components/Modal';
import { SplitTaskModal } from './components/SplitTaskModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { TaskGraphPage } from './pages/TaskGraphPage';
import { AllTasksGraph } from './components/AllTasksGraph';

function TaskList() {
  const { tasks, addTask, updateTaskStatus, deleteTask, restoreTask, addChecklistItem, toggleChecklistItem, deleteChecklistItem, splitTask, mergeTasks } = useTasks();
  const [input, setInput] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  // Modal states
  const [splitModalOpen, setSplitModalOpen] = useState(false);
  const [splitTaskId, setSplitTaskId] = useState<string | null>(null);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);

  // Undo state
  const [deletedTask, setDeletedTask] = useState<{ id: string, title: string } | null>(null);

  // View mode state
  const [viewMode, setViewMode] = useState<'list' | 'graph'>(() => {
    return (localStorage.getItem('viewMode') as 'list' | 'graph') || 'list';
  });

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await addTask(input);
    setInput('');
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedTaskIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedTaskIds(newSelection);
  };

  const handleMergeSubmit = async (newTitle: string) => {
    if (selectedTaskIds.size < 2 || !newTitle.trim()) return;
    await mergeTasks(Array.from(selectedTaskIds), newTitle);
    setIsSelectionMode(false);
    setSelectedTaskIds(new Set());
    setMergeModalOpen(false);
  };

  const handleSplitSubmit = async (newTitles: string[]) => {
    if (!splitTaskId || newTitles.length === 0) return;
    await splitTask(splitTaskId, newTitles);
    setSplitModalOpen(false);
    setSplitTaskId(null);
  };

  const handleDelete = async (id: string, title: string) => {
    await deleteTask(id);
    setDeletedTask({ id, title });
    // Auto-hide undo after 5 seconds
    setTimeout(() => {
      setDeletedTask(prev => prev && prev.id === id ? null : prev);
    }, 5000);
  };

  const handleUndoDelete = async () => {
    if (deletedTask) {
      await restoreTask(deletedTask.id);
      setDeletedTask(null);
    }
  };

  const handleDone = async (task: Task) => {
    const hasIncomplete = task.checklist.some((item) => !item.completed);
    if (hasIncomplete) {
      alert('Cannot mark as done: You have incomplete checklist items.');
      return;
    }
    await updateTaskStatus(task.id, 'done');
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case 'high': return '#ef4444'; // Red
      case 'medium': return '#f59e0b'; // Amber
      case 'low': return '#10b981'; // Green
      default: return '#64748b';
    }
  };

  const detailTask = tasks?.find(t => t.id === detailTaskId) || null;

  return (
    <div style={{
      padding: viewMode === 'graph' ? 0 : 'var(--space-8)',
      maxWidth: viewMode === 'graph' ? '100%' : '800px',
      margin: '0 auto',
      height: viewMode === 'graph' ? '100vh' : 'auto',
      display: viewMode === 'graph' ? 'flex' : 'block',
      flexDirection: 'column',
      overflow: viewMode === 'graph' ? 'hidden' : 'visible'
    }}>
      <SplitTaskModal
        isOpen={splitModalOpen}
        onClose={() => { setSplitModalOpen(false); setSplitTaskId(null); }}
        onSubmit={handleSplitSubmit}
      />
      <Modal
        isOpen={mergeModalOpen}
        title="Merge Tasks"
        message="Enter title for the new merged task"
        placeholder="New Merged Task Title"
        onClose={() => setMergeModalOpen(false)}
        onSubmit={handleMergeSubmit}
        submitLabel="Merge"
      />
      <TaskDetailModal
        task={detailTask}
        onClose={() => setDetailTaskId(null)}
        onTaskClick={(taskId) => setDetailTaskId(taskId)}
      />

      {/* Undo Notification */}
      {deletedTask && (
        <div style={{
          position: 'fixed',
          bottom: 'var(--space-8)',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--color-text-main)',
          color: 'var(--color-bg-app)',
          padding: 'var(--space-3) var(--space-6)',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          zIndex: 100
        }}>
          <span>Deleted "{deletedTask.title}"</span>
          <button
            onClick={handleUndoDelete}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              fontWeight: 'bold',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Undo
          </button>
          <button
            onClick={() => setDeletedTask(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-bg-app)',
              cursor: 'pointer',
              fontSize: 'var(--text-lg)'
            }}
          >
            ×
          </button>
        </div>
      )}

      <header style={{
        marginBottom: 'var(--space-8)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: viewMode === 'graph' ? 'var(--space-4)' : 0
      }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', marginBottom: 'var(--space-2)' }}>Chronicle</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Task Management Reimagined</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'graph' : 'list')}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              fontSize: 'var(--text-sm)',
              backgroundColor: viewMode === 'graph' ? 'var(--color-primary)' : 'transparent',
              color: viewMode === 'graph' ? 'white' : 'var(--color-text-main)',
              border: `1px solid ${viewMode === 'graph' ? 'var(--color-primary)' : 'var(--color-text-main)'}`,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer'
            }}
          >
            {viewMode === 'list' ? '📊 グラフビュー' : '📋 リストビュー'}
          </button>
          {viewMode === 'list' && (
            <button
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                setSelectedTaskIds(new Set());
              }}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                fontSize: 'var(--text-sm)',
                backgroundColor: isSelectionMode ? 'var(--color-text-main)' : 'transparent',
                color: isSelectionMode ? 'var(--color-bg-app)' : 'var(--color-text-main)',
                border: '1px solid var(--color-text-main)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer'
              }}
            >
              {isSelectionMode ? 'Cancel Selection' : 'Select Tasks'}
            </button>
          )}
        </div>
      </header>

      {isSelectionMode && (
        <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{selectedTaskIds.size} tasks selected</span>
          <button
            onClick={() => setMergeModalOpen(true)}
            disabled={selectedTaskIds.size < 2}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: selectedTaskIds.size >= 2 ? 'var(--color-primary)' : 'var(--color-text-muted)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: selectedTaskIds.size >= 2 ? 'pointer' : 'not-allowed'
            }}
          >
            Merge Selected
          </button>
        </div>
      )}

      {!isSelectionMode && (
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
      )}

      {/* Graph View */}
      {viewMode === 'graph' ? (
        <div style={{ flex: 1, minHeight: 0 }}>
          <AllTasksGraph onTaskClick={(taskId) => setDetailTaskId(taskId)} />
        </div>
      ) : (
        /* List View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {tasks?.map((task) => (
            <div
              key={task.id}
              style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-bg-surface)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)',
                borderLeft: `4px solid ${getPriorityColor(task.priority)} `,
                display: 'flex',
                flexDirection: 'column',
                opacity: task.status === 'done' ? 0.6 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  {isSelectionMode && (
                    <input
                      type="checkbox"
                      checked={selectedTaskIds.has(task.id)}
                      onChange={() => toggleSelection(task.id)}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                  )}
                  <div>
                    <h3 style={{ fontWeight: 'bold', marginBottom: 'var(--space-1)', textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>{task.title}</h3>
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
                </div>

                {!isSelectionMode && (
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button
                      onClick={() => setDetailTaskId(task.id)}
                      style={{
                        padding: 'var(--space-2) var(--space-4)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-primary)',
                        backgroundColor: 'transparent',
                        border: '1px solid var(--color-primary)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer'
                      }}
                    >
                      詳細
                    </button>
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
                    {task.status === 'done' && (
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
                      <>
                        <button
                          onClick={() => handleDone(task)}
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
                        <button
                          onClick={() => {
                            setSplitTaskId(task.id);
                            setSplitModalOpen(true);
                          }}
                          style={{
                            padding: 'var(--space-2) var(--space-4)',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-text-main)',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer'
                          }}
                        >
                          Split
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(task.id, task.title)}
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
                )}
              </div>

              {/* Checklist Section */}
              {!isSelectionMode && (
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
                          disabled={task.status === 'done'}
                          style={{ cursor: task.status === 'done' ? 'not-allowed' : 'pointer' }}
                        />
                        <span style={{
                          textDecoration: item.completed ? 'line-through' : 'none',
                          color: item.completed ? 'var(--color-text-muted)' : 'var(--color-text-main)',
                          fontSize: 'var(--text-sm)',
                          opacity: task.status === 'done' ? 'var(--color-text-muted)' : 'var(--color-text-main)'
                        }}>
                          {item.text}
                        </span>
                        {task.status !== 'done' && (
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
                        )}
                      </div>
                    ))}
                    {task.status !== 'done' && (
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
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<TaskList />} />
      <Route path="/graph/:taskId" element={<TaskGraphPage />} />
    </Routes>
  );
}

export default App;

