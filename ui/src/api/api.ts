const API_URL = 'https://056sv4iaig.execute-api.eu-west-2.amazonaws.com/'


export async function getApiResult(): Promise<any> {
    const response = await fetch(API_URL);
    return response;
}