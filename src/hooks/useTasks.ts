import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Task, TaskStatus } from '../types/task';
import { v4 as uuidv4 } from 'uuid';

export function useTasks() {
    const tasks = useLiveQuery(() => db.tasks.toArray());

    const addTask = async (title: string) => {
        const newTask: Task = {
            id: uuidv4(),
            title,
            description: '',
            status: 'todo',
            priority: 'medium',
            tags: [],
            checklist: [],
            relations: [],
            timeLogs: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        await db.tasks.add(newTask);

        // Add history
        await db.history.add({
            id: uuidv4(),
            taskId: newTask.id,
            type: 'CREATED',
            timestamp: new Date().toISOString(),
            details: { title }
        });
    };

    const updateTaskStatus = async (id: string, status: TaskStatus) => {
        await db.tasks.update(id, { status, updatedAt: new Date().toISOString() });
        await db.history.add({
            id: uuidv4(),
            taskId: id,
            type: 'STATUS_CHANGE',
            timestamp: new Date().toISOString(),
            details: { status }
        });
    };

    const deleteTask = async (id: string) => {
        await db.tasks.delete(id);
    };

    const addChecklistItem = async (taskId: string, text: string) => {
        const task = await db.tasks.get(taskId);
        if (!task) return;

        const newItem = { id: uuidv4(), text, completed: false };
        const updatedChecklist = [...task.checklist, newItem];

        await db.tasks.update(taskId, { checklist: updatedChecklist, updatedAt: new Date().toISOString() });
    };

    const toggleChecklistItem = async (taskId: string, itemId: string) => {
        const task = await db.tasks.get(taskId);
        if (!task) return;

        const updatedChecklist = task.checklist.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
        );

        await db.tasks.update(taskId, { checklist: updatedChecklist, updatedAt: new Date().toISOString() });
    };

    const deleteChecklistItem = async (taskId: string, itemId: string) => {
        const task = await db.tasks.get(taskId);
        if (!task) return;

        const updatedChecklist = task.checklist.filter(item => item.id !== itemId);
        await db.tasks.update(taskId, { checklist: updatedChecklist, updatedAt: new Date().toISOString() });
    };

    return {
        tasks,
        addTask,
        updateTaskStatus,
        deleteTask,
        addChecklistItem,
        toggleChecklistItem,
        deleteChecklistItem
    };
}
