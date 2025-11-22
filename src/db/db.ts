import Dexie, { type Table } from 'dexie';
import type { Task, HistoryEvent } from '../types/task';

export class ChronicleDB extends Dexie {
    tasks!: Table<Task>;
    history!: Table<HistoryEvent>;

    constructor() {
        super('ChronicleDB');
        this.version(1).stores({
            tasks: 'id, status, priority, *tags, dueDate', // Primary key and indexed props
            history: 'id, taskId, type, timestamp'
        });
    }
}

export const db = new ChronicleDB();
