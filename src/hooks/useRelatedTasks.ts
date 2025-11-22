import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { Task } from '../types/task';

export interface RelatedTasksResult {
    parentTasks: Task[];
    childTasks: Task[];
    mergedFromTasks: Task[];
    mergedIntoTask: Task | null;
}

/**
 * タスクの関連タスクを取得するカスタムフック
 * 履歴データのみを使用して分割・統合関連タスクを判定
 * @param task 対象のタスク
 * @returns 親タスク、子タスク、統合関連タスクの情報
 */
export function useRelatedTasks(task: Task | null): RelatedTasksResult | undefined {
    return useLiveQuery(
        async () => {
            if (!task) {
                return {
                    parentTasks: [],
                    childTasks: [],
                    mergedFromTasks: [],
                    mergedIntoTask: null
                };
            }

            // 履歴から分割・統合関連タスクを取得
            const history = await db.history
                .where('taskId')
                .equals(task.id)
                .toArray();

            // 分割元タスク（このタスクが分割された場合）
            const splitFromEvent = history.find(h => h.type === 'SPLIT_FROM');
            const parentId = splitFromEvent?.details?.sourceId as string | undefined;
            const parentTasks = parentId ? [await db.tasks.get(parentId)].filter(Boolean) as Task[] : [];

            // 分割先タスク（このタスクから分割された場合）
            const statusChangeEvent = history.find(h => h.type === 'STATUS_CHANGE' && (h.details?.splitInto as string[] | undefined));
            const childIds = (statusChangeEvent?.details?.splitInto as string[] | undefined) || [];
            const childTasks = childIds.length > 0
                ? await db.tasks.where('id').anyOf(childIds).toArray()
                : [];

            // 統合元タスク（このタスクが統合先の場合）
            const mergedIntoEvent = history.find(h => h.type === 'MERGED_INTO' && (h.details?.mergedFrom as string[] | undefined));
            const mergedFromIds = (mergedIntoEvent?.details?.mergedFrom as string[] | undefined) || [];
            const mergedFromTasks = mergedFromIds.length > 0
                ? await db.tasks.where('id').anyOf(mergedFromIds).toArray()
                : [];

            // 統合先タスク（このタスクが統合元の場合）
            const mergedToEvent = history.find(h => h.type === 'MERGED_INTO' && (h.details?.targetId as string | undefined));
            const mergedIntoId = mergedToEvent?.details?.targetId as string | undefined;
            const mergedIntoTask = mergedIntoId
                ? await db.tasks.get(mergedIntoId) || null
                : null;

            return {
                parentTasks,
                childTasks,
                mergedFromTasks,
                mergedIntoTask
            };
        },
        [task?.id]
    );
}
