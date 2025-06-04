import axios from "axios";
import {
  type LoginResponse,
  MyApiClient,
  type OpenAPIConfig,
  type ContainerCollection,
} from "./auto-generated-client";

type Config = {
  ApiUrl: string;
};

const API_URL = await axios
  .get("../config.json")
  .then(async (response) => {
    const data: Config = response.data;
    return data.ApiUrl;
  })
  .catch((error) => {
    console.log("Error occurred retrieving config.json file!");
    throw error;
  });

const openAPIConfig: Partial<OpenAPIConfig> = {
  BASE: API_URL,
};

const apiClient = await new MyApiClient(openAPIConfig);

export async function getLoginResponse(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await apiClient.default.loginApiLoginPost({
    username,
    password,
  });
  return response;
}

export async function createTaskAPI(
  userId: string,
  taskId: string,
  category: string
) {
  return await apiClient.default.createTaskApiTasksPost({
    userId,
    taskId,
    category,
  });
}

export async function getTasks(userId: string): Promise<ContainerCollection> {
  return await apiClient.default.getTasksApiTasksUserIdGet(userId);
}

export async function updateTask(
  taskId: string | number,
  username: string,
  password: string,
  position: number,
  name?: string,
  description?: string,
  completed?: boolean,
  assignedTo?: string,
  category?: string
) {
  console.log("Updating Task ..");
  apiClient.default.updateTaskApiTasksTaskIdPatch(taskId.toString(), {
    username,
    password,
    name,
    description,
    completed,
    assignedTo,
    category,
    position,
  });
}

export async function deleteTaskAPI(userId: string, taskId: string) {
  apiClient.default.deleteTaskApiTasksTaskIdDelete(taskId, { userId });
}

export async function registerAPI(username: string, password: string) {
  return await apiClient.default.registerApiRegisterPost({
    username,
    password,
  });
}

export async function getAllUsers() {
  return await apiClient.default.getUsersApiUsersGet();
}

export async function getUser(userId: string) {
  return await apiClient.default.getUserApiUserUserIdGet(userId);
}
