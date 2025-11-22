import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { HistoryEvent } from '../types/task';

/**
 * 特定のタスクの履歴イベントを取得するカスタムフック
 * @param taskId タスクID
 * @returns 履歴イベントの配列（新しい順）
 */
export function useTaskHistory(taskId: string | null): HistoryEvent[] | undefined {
    return useLiveQuery(
        async () => {
            if (!taskId) return [];

            const events = await db.history
                .where('taskId')
                .equals(taskId)
                .toArray();

            // 新しい順にソート
            return events.sort((a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
        },
        [taskId]
    );
}
