import axios from "axios";
import {
  type ContainerCollection,
  type LoginResponse,
  MyApiClient,
  type OpenAPIConfig,
} from "./auto-generated-client";

type Config = {
  HttpApiUrl: string;
};

let apiClient: MyApiClient

async function getAPIURL() {
  const API_URL = await axios
    .get("../config.json", {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    })
    .then(async (response) => {
      const data: Config = response.data;
      return data.HttpApiUrl;
    })
    .catch((error) => {
      console.log("Error occurred retrieving config.json file!");
      throw error;
    });
  return API_URL;
}

(async () => {
  const openAPIConfig: Partial<OpenAPIConfig> = {
    BASE: await getAPIURL(),
  };

  apiClient = await new MyApiClient(openAPIConfig);
})().catch((error) => {
  console.log(`Error occurred  during creation of apiClient ${error}`);
});

function getLoginCredentials(): { username: string; password: string } {
  const username = localStorage.getItem("username") || "";
  const password = localStorage.getItem("password") || "";
  return { username, password };
}

export async function getLoginResponse(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await apiClient.users.loginUsersApiLoginPost({
    username,
    password,
  });
  return response;
}

export async function createTaskAPI(
  taskId: string,
  boardUserId: string,
  category: string
) {
  const { username, password } = getLoginCredentials();
  return await apiClient.tasks.createTaskTasksApiTasksPost({
    username,
    password,
    boardUserId,
    taskId,
    category,
  });
}

export async function getTasks(userId: string): Promise<ContainerCollection> {
  return await apiClient.tasks.getTasksTasksApiTasksUserIdGet(userId);
}

export async function updateTask(
  taskId: string | number,
  position: number,
  name?: string,
  description?: string,
  completed?: boolean,
  assignedTo?: string,
  category?: string
) {
  console.log("Updating Task ..");
  const { username, password } = getLoginCredentials();
  apiClient.tasks.updateTaskTasksApiTasksTaskIdPatch(taskId.toString(), {
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

export async function deleteTaskAPI(taskId: string) {
  const { username, password } = getLoginCredentials();
  apiClient.tasks.deleteTaskTasksApiTasksTaskIdDelete(taskId, {
    username,
    password,
  });
}

export async function registerAPI(
  username: string,
  password: string,
  role: string
) {
  return await apiClient.users.registerUsersApiRegisterPost({
    username,
    password,
    role,
  });
}

export async function getAllUsers() {
  return await apiClient.users.getUsersUsersApiUsersGet();
}

export async function getUser(userId: string) {
  return await apiClient.users.getUserUsersApiUserUserIdGet(userId);
}
