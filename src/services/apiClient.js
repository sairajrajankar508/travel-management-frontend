import axios from "axios";

const BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8080/api";

const apiClient = axios.create({

    baseURL: BASE_URL,

    headers: {
        "Content-Type": "application/json",
    },

    timeout: 15000,
});

apiClient.interceptors.request.use(

    (config) => {

        const token = localStorage.getItem("token");

        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(

    (response) => response,

    (error) => {

        if (!error.response) {

            console.error(
                "Network Error / Backend Unreachable"
            );

            alert(
                "Unable to connect to server."
            );

            return Promise.reject(error);
        }

        const status = error.response.status;

        switch (status) {

            case 401:

                localStorage.removeItem("token");
                localStorage.removeItem("role");

                window.location.href = "/login";

                break;

            case 403:

                alert(
                    "You do not have permission to access this resource."
                );

                break;

            case 500:

                alert(
                    "Internal Server Error."
                );

                break;

            default:
                break;
        }

        return Promise.reject(error);
    }
);

export default apiClient;
