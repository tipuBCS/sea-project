/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ContainerCollection } from '../models/ContainerCollection';
import type { CreateTaskRequest } from '../models/CreateTaskRequest';
import type { CreateTaskResponse } from '../models/CreateTaskResponse';
import type { DeleteTaskRequest } from '../models/DeleteTaskRequest';
import type { UpdateTaskRequest } from '../models/UpdateTaskRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class TasksService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Create Task
     * @param requestBody
     * @returns CreateTaskResponse Successful Response
     * @throws ApiError
     */
    public createTaskTasksApiTasksPost(
        requestBody: CreateTaskRequest,
    ): CancelablePromise<CreateTaskResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/tasks/api/tasks',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Tasks
     * @param userId
     * @returns ContainerCollection Successful Response
     * @throws ApiError
     */
    public getTasksTasksApiTasksUserIdGet(
        userId: string,
    ): CancelablePromise<ContainerCollection> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/tasks/api/tasks/{userId}',
            path: {
                'userId': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Task
     * @param taskId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public deleteTaskTasksApiTasksTaskIdDelete(
        taskId: string,
        requestBody: DeleteTaskRequest,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/tasks/api/tasks/{taskId}',
            path: {
                'taskId': taskId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Task
     * @param taskId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public updateTaskTasksApiTasksTaskIdPatch(
        taskId: string,
        requestBody: UpdateTaskRequest,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/tasks/api/tasks/{taskId}',
            path: {
                'taskId': taskId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
