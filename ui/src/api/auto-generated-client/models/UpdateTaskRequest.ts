/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TaskImportance } from './TaskImportance';
export type UpdateTaskRequest = {
    username: string;
    password: string;
    name?: string;
    description?: string;
    completed?: boolean;
    assignedTo?: string;
    category?: string;
    dueDate?: string;
    minTime?: number;
    maxTime?: number;
    importance?: TaskImportance;
    position: number;
};

