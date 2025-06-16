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

let apiClient: MyApiClient;

async function getApiUrl() {
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

async function getApiClient(): Promise<MyApiClient> {
  if (apiClient) {
    console.log("Using Cached api client.");
    return apiClient;
  }
  try {
    const openAPIConfig: Partial<OpenAPIConfig> = {
      BASE: await getApiUrl(),
      HEADERS: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    console.log("Getting Actual API Client ..");
    apiClient = new MyApiClient(openAPIConfig);
    return apiClient;
  } catch (error) {
    console.log(`Error occurred during creation of apiClient: ${error}`);
    throw error;
  }
}

function getLoginCredentials(): { username: string; password: string } {
  const username = localStorage.getItem("username") || "";
  const password = localStorage.getItem("password") || "";
  return { username, password };
}

export async function getLoginResponse(
  username: string,
  password: string
): Promise<LoginResponse> {
  console.log("Attempting login with URL:", apiClient.request.config.BASE);
  try {
    const response = await (
      await getApiClient()
    ).users.loginUsersApiLoginPost({
      username,
      password,
    });
    console.log("Login success:", response);
    return response;
  } catch (error: any) {
    console.error("Login failed:", error);
    throw error;
  }
}

export async function createTaskAPI(
  taskId: string,
  boardUserId: string,
  category: string
) {
  const { username, password } = getLoginCredentials();
  return await (
    await getApiClient()
  ).tasks.createTaskTasksApiTasksPost({
    username,
    password,
    boardUserId,
    taskId,
    category,
  });
}

export async function getTasks(userId: string): Promise<ContainerCollection> {
  return await (
    await getApiClient()
  ).tasks.getTasksTasksApiTasksUserIdGet(userId);
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
  await (
    await getApiClient()
  ).tasks.updateTaskTasksApiTasksTaskIdPatch(taskId.toString(), {
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
  await (
    await getApiClient()
  ).tasks.deleteTaskTasksApiTasksTaskIdDelete(taskId, {
    username,
    password,
  });
}

export async function registerAPI(
  username: string,
  password: string,
  role: string
) {
  return await (
    await getApiClient()
  ).users.registerUsersApiRegisterPost({
    username,
    password,
    role,
  });
}

export async function getAllUsers() {
  return await (await getApiClient()).users.getUsersUsersApiUsersGet();
}

export async function getUser(userId: string) {
  return await (
    await getApiClient()
  ).users.getUserUsersApiUserUserIdGet(userId);
}
