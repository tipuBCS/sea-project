import axios from "axios";
import {
  type LoginResponse,
  MyApiClient,
  type OpenAPIConfig,
  type ContainerCollection,
  TaskPosition,
} from "./auto-generated-client";

type Config = {
  ApiUrl: string;
};

const API_URL = await axios
  .get("config.json")
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
  console.log("Running get tasks ..");
  return await apiClient.default.getTasksApiTasksUserIdGet((userId = "1"));
}

export async function updateTask(
  taskId: string | number,
  userId: string,
  position: number,
  name?: string,
  description?: string,
  completed?: boolean,
  assignedTo?: string,
  category?: string,
) {
  console.log("Updating Task ..");
  apiClient.default.updateTaskApiTasksTaskIdPatch(taskId.toString(), {
    userId: userId,
    name,
    description,
    completed,
    assignedTo,
    category,
    position,
  });
}
