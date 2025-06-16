/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TaskImportance } from './TaskImportance';
export type TaskType = {
    id: (string | number);
    name: string;
    description: string;
    completed: boolean;
    createdAt: string;
    assignedTo?: string;
    position: number;
    dueDate?: string;
    minTime: number;
    maxTime: number;
    importance: TaskImportance;
};

