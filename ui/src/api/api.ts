const API_URL = 'https://pwvok9yht1.execute-api.eu-west-2.amazonaws.com/dev'


export async function getApiResult(): Promise<any> {
    const response = await fetch(API_URL);
    return response;
}