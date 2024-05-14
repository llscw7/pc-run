import axios, { AxiosResponse, AxiosError } from 'axios'

const network = axios.create({
    baseURL: 'http://localhost:38435/',
    timeout: 5000,
    headers: {
        'Content-Type': 'multipart/form-data',
    }
});



network.interceptors.response.use(
    (res: AxiosResponse): AxiosResponse => {
        return res.data;
    },
    (error: AxiosError): Promise<AxiosError> => {
        console.error('响应错误：', error);
        return Promise.reject(error);
    }
);

export default network;