import axios from "axios";
import { useRecoilValue } from "recoil";
import { travelerState, useDoLogout } from "../states/traveler";
import { loadTraveler } from "../states/webstore";
import {renewalToken} from "./auth";


// Generated file. Do not edit
const status = {
    CONTINUE: 100,
    SWITCHING_PROTOCOLS: 101,
    PROCESSING: 102,
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NON_AUTHORITATIVE_INFORMATION: 203,
    NO_CONTENT: 204,
    RESET_CONTENT: 205,
    PARTIAL_CONTENT: 206,
    MULTI_STATUS: 207,
    MULTIPLE_CHOICES: 300,
    MOVED_PERMANENTLY: 301,
    MOVED_TEMPORARILY: 302,
    SEE_OTHER: 303,
    NOT_MODIFIED: 304,
    USE_PROXY: 305,
    TEMPORARY_REDIRECT: 307,
    PERMANENT_REDIRECT: 308,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    PAYMENT_REQUIRED: 402,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    NOT_ACCEPTABLE: 406,
    PROXY_AUTHENTICATION_REQUIRED: 407,
    REQUEST_TIMEOUT: 408,
    CONFLICT: 409,
    GONE: 410,
    LENGTH_REQUIRED: 411,
    PRECONDITION_FAILED: 412,
    REQUEST_TOO_LONG: 413,
    REQUEST_URI_TOO_LONG: 414,
    UNSUPPORTED_MEDIA_TYPE: 415,
    REQUESTED_RANGE_NOT_SATISFIABLE: 416,
    EXPECTATION_FAILED: 417,
    IM_A_TEAPOT: 418,
    INSUFFICIENT_SPACE_ON_RESOURCE: 419,
    METHOD_FAILURE: 420,
    MISDIRECTED_REQUEST: 421,
    UNPROCESSABLE_ENTITY: 422,
    LOCKED: 423,
    FAILED_DEPENDENCY: 424,
    PRECONDITION_REQUIRED: 428,
    TOO_MANY_REQUESTS: 429,
    REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
    UNAVAILABLE_FOR_LEGAL_REASONS: 451,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
    HTTP_VERSION_NOT_SUPPORTED: 505,
    INSUFFICIENT_STORAGE: 507,
    NETWORK_AUTHENTICATION_REQUIRED: 511,
};

Object.freeze(status);


export const rawAxiosInstance = axios.create({ baseURL: 'http://localhost:3000/api/v1' });


// 모든 요청에 액세스 토큰을 포함하도록 구성
rawAxiosInstance.interceptors.request.use(
    (config) => {
        const traveler = loadTraveler();
        if (traveler) {
            config.headers["Authorization"] = `Bearer ${traveler.accessToken}`;
        }
        return config;
    },
    (error) => {
        console.log({ "request-interceptors-error": error.response.data.message });
        return Promise.reject(error);
    }
);

export const useAPIv1 = function () {
    const traveler = useRecoilValue(travelerState);
    const doLogOut = useDoLogout();

    // 토큰 갱신 후 재시도 하는 함수
    async function handleTokenExpired(retryFunction) {
        try {
            console.log("API 오류, 토큰 갱신 시도");
            renewalToken()
                .then(res => {
                    const {accessToken, refreshToken} = res.data.data.payload;
                    window.sessionStorage.setItem("accessToken", accessToken);
                    window.sessionStorage.setItem("refreshToken", refreshToken);
                    console.log("토큰 갱신 성공");

                    return retryFunction(); // 원래 작업 재시도
                }).catch(() => {
                doLogOut();
            });
        } catch (error) {
            console.log({"예기치 못한 오류: 토큰 갱신 실패": error.toJSON()});
            doLogOut();
        }
    }

    return {
        put: async (url, data) => {
            try {
                return (await rawAxiosInstance.put(url, data)).data;
            } catch (error) {
                if (error.response.status === status.UNAUTHORIZED) {
                    return await handleTokenExpired(
                        async () => (await rawAxiosInstance.put(url, data)).data,
                    );
                }
            }
        },
        delete: async (url) => {
            try {
                return (await rawAxiosInstance.delete(url)).data;
            } catch (error) {
                if (error.response.status === status.UNAUTHORIZED) {
                    return await handleTokenExpired(
                        async () => (await rawAxiosInstance.delete(url)).data,
                    );
                }
            }
        },
        get: async (url) => {
            try {
                return (await rawAxiosInstance.get(url)).data;
            } catch (error) {
                if (error.response.status === status.UNAUTHORIZED) {
                    return await handleTokenExpired(
                        async () => (await rawAxiosInstance.get(url)).data,
                    );
                }
            }
        },
        post: async (url, data) => {
            try {
                return (await rawAxiosInstance.post(url, data)).data;
            } catch (error) {
                if (error.response.status === status.UNAUTHORIZED) {
                    return await handleTokenExpired(
                        async () => (await rawAxiosInstance.post(url, data)).data,
                    );
                }
            }
        },
    };
}

