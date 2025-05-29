import axios from "axios";
import {
  type LoginResponse,
  MyApiClient,
  type Task,
  type OpenAPIConfig,
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
  const body = JSON.stringify({
    username,
    password,
  });
  const response = await apiClient.default.loginApiLoginPost({
    username,
    password,
  });
  return response;
}

export async function getTasks(username: string): Promise<Array<Task>> {
  return await [
    {
      id: "1",
      name: "First Task",
      description: "lorem ipsum",
      assignedTo: undefined,
      category: "Milestones",
    },
    {
      id: "2",
      name: "Second Task",
      description: "lorem ipsum",
      assignedTo: undefined,
      category: "Milestones",
    },

    {
      id: "3",
      name: "third Task",
      description: "lorem ipsum",
      assignedTo: undefined,
      category: "ProtoSec",
    },

    {
      id: "4",
      name: "Fouth Task",
      description: "lorem ipsum",
      assignedTo: undefined,
      category: "ProtoSec",
    },
  ];
  // return await apiClient.default.getTasksApiTasksGet();
}
