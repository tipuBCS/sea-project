import axios from "axios";
import {
  type LoginResponse,
  MyApiClient,
  type Task,
  type OpenAPIConfig,
} from "./auto-generated-client";

const API_URL = await axios
  .get("config.json")
  .then(async (response) => {
    return response.data.API_URL;
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
  const body = JSON.stringify({
    username,
    password,
  });
  const response = await apiClient.default.loginLoginPost({
    username,
    password,
  });
  return response;
}

export async function getTasks(username: string): Promise<Array<Task>> {
  return await apiClient.default.getTasksApiTasksGet();
}
