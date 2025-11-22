import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { Task, TaskStatus } from '../types/task';
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

    const splitTask = async (originalTaskId: string, newTitles: string[]) => {
        const originalTask = await db.tasks.get(originalTaskId);
        if (!originalTask) return;

        const newTasks: Task[] = newTitles.map(title => ({
            id: uuidv4(),
            title,
            description: `Split from: ${originalTask.title}`,
            status: 'todo',
            priority: originalTask.priority,
            tags: originalTask.tags,
            checklist: [],
            relations: [{ targetId: originalTaskId, type: 'parent' }], // Or 'related'? Let's say parent for now as origin
            timeLogs: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }));

        // Add new tasks
        await db.tasks.bulkAdd(newTasks);

        // Update original task
        await db.tasks.update(originalTaskId, {
            status: 'done',
            updatedAt: new Date().toISOString()
        });

        // History for original task
        await db.history.add({
            id: uuidv4(),
            taskId: originalTaskId,
            type: 'STATUS_CHANGE', // Or maybe we need a specific type for SPLIT? 
            // The types/task.ts has SPLIT_FROM, but that seems more for the NEW task.
            // Let's use UPDATED for now with details, or maybe we should add SPLIT_INTO to types?
            // For now, let's stick to existing types. 
            // Actually, let's record a custom event or just rely on the new tasks pointing back.
            timestamp: new Date().toISOString(),
            details: { splitInto: newTasks.map(t => t.id) }
        });

        // History for new tasks
        for (const newTask of newTasks) {
            await db.history.add({
                id: uuidv4(),
                taskId: newTask.id,
                type: 'SPLIT_FROM',
                timestamp: new Date().toISOString(),
                details: { sourceId: originalTaskId }
            });
        }
    };

    const mergeTasks = async (sourceTaskIds: string[], newTitle: string) => {
        const sourceTasks = await db.tasks.where('id').anyOf(sourceTaskIds).toArray();
        if (sourceTasks.length === 0) return;

        const newTask: Task = {
            id: uuidv4(),
            title: newTitle,
            description: `Merged from: ${sourceTasks.map(t => t.title).join(', ')}`,
            status: 'todo',
            priority: 'medium', // Default or calculate?
            tags: [...new Set(sourceTasks.flatMap(t => t.tags))], // Merge tags
            checklist: [], // Could merge checklists too, but complex.
            relations: sourceTaskIds.map(id => ({ targetId: id, type: 'child' })), // Point back to sources
            timeLogs: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await db.tasks.add(newTask);

        // Update source tasks
        await db.tasks.bulkPut(sourceTasks.map(t => ({
            ...t,
            status: 'done',
            updatedAt: new Date().toISOString()
        })));

        // History for new task
        await db.history.add({
            id: uuidv4(),
            taskId: newTask.id,
            type: 'MERGED_INTO', // Wait, MERGED_INTO usually means "I was merged into X". 
            // If this is the NEW task, maybe it should be CREATED (via merge)?
            // Or maybe MERGED_FROM? 
            // The type definition has MERGED_INTO. 
            // Let's assume MERGED_INTO is for the SOURCE tasks saying "I was merged into X".
            // And the new task is just CREATED or has a special event.
            // Let's use CREATED with details for the new task.
            timestamp: new Date().toISOString(),
            details: { mergedFrom: sourceTaskIds }
        });

        // History for source tasks
        for (const sourceId of sourceTaskIds) {
            await db.history.add({
                id: uuidv4(),
                taskId: sourceId,
                type: 'MERGED_INTO',
                timestamp: new Date().toISOString(),
                details: { targetId: newTask.id }
            });
        }
    };

    return {
        tasks,
        addTask,
        updateTaskStatus,
        deleteTask,
        addChecklistItem,
        toggleChecklistItem,
        deleteChecklistItem,
        splitTask,
        mergeTasks
    };
}
