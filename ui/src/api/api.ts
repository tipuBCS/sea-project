const API_URL = "https://056sv4iaig.execute-api.eu-west-2.amazonaws.com/";

export async function getApiResult(): Promise<any> {
  const response = await fetch(API_URL);
  return response;
}

export async function getLoginResponse(username: string, password: string): Promise<any> {
    const loginUrl = API_URL + 'login'
    const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });
  if (!response.ok) {
    throw new Error(`HTTP Error! Status: ${response.status}`);
  }
  const data = await response.json();
  return data;
}
