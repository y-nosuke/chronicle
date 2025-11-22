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
        // We might want to keep history or archive instead of delete, 
        // but for now hard delete is fine for "Delete" action. 
        // "Archive" should be a status change.
    };

    return {
        tasks,
        addTask,
        updateTaskStatus,
        deleteTask
    };
}
