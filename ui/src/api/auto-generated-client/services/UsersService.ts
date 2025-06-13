/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetUserResponse } from '../models/GetUserResponse';
import type { GetUsersResponse } from '../models/GetUsersResponse';
import type { LoginRequest } from '../models/LoginRequest';
import type { LoginResponse } from '../models/LoginResponse';
import type { RegisterRequest } from '../models/RegisterRequest';
import type { RegisterResponse } from '../models/RegisterResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class UsersService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Register
     * @param requestBody
     * @returns RegisterResponse Successful Response
     * @throws ApiError
     */
    public registerUsersApiRegisterPost(
        requestBody: RegisterRequest,
    ): CancelablePromise<RegisterResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/users/api/register',
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
    public loginUsersApiLoginPost(
        requestBody: LoginRequest,
    ): CancelablePromise<LoginResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/users/api/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Getusers
     * @returns GetUsersResponse Successful Response
     * @throws ApiError
     */
    public getUsersUsersApiUsersGet(): CancelablePromise<GetUsersResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/users/api/users',
        });
    }
    /**
     * Getuser
     * @param userId
     * @returns GetUserResponse Successful Response
     * @throws ApiError
     */
    public getUserUsersApiUserUserIdGet(
        userId: string,
    ): CancelablePromise<GetUserResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/users/api/user/{userId}',
            path: {
                'userId': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
