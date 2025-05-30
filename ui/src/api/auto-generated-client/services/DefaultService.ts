/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ContainerCollection } from '../models/ContainerCollection';
import type { CreateTaskRequest } from '../models/CreateTaskRequest';
import type { CreateTaskResponse } from '../models/CreateTaskResponse';
import type { LoginRequest } from '../models/LoginRequest';
import type { LoginResponse } from '../models/LoginResponse';
import type { UpdateTaskRequest } from '../models/UpdateTaskRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class DefaultService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Root
     * @returns any Successful Response
     * @throws ApiError
     */
    public rootGet(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/',
        });
    }
    /**
     * Get Items
     * @returns any Successful Response
     * @throws ApiError
     */
    public getItemsApiItemsGet(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/items',
        });
    }
    /**
     * Create Task
     * @param requestBody
     * @returns CreateTaskResponse Successful Response
     * @throws ApiError
     */
    public createTaskApiTasksPost(
        requestBody: CreateTaskRequest,
    ): CancelablePromise<CreateTaskResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/tasks',
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
    public getTasksApiTasksUserIdGet(
        userId: string,
    ): CancelablePromise<ContainerCollection> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/tasks/{userId}',
            path: {
                'userId': userId,
            },
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
    public updateTaskApiTasksTaskIdPatch(
        taskId: string,
        requestBody: UpdateTaskRequest,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/tasks/{taskId}',
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
     * Login
     * @param requestBody
     * @returns LoginResponse Successful Response
     * @throws ApiError
     */
    public loginApiLoginPost(
        requestBody: LoginRequest,
    ): CancelablePromise<LoginResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
