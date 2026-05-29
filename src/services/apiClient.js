import axios from "axios";

// ==========================================
// BASE URL
// ==========================================

const BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8080/api";

// ==========================================
// AXIOS INSTANCE
// ==========================================

const apiClient = axios.create({

    baseURL: BASE_URL,

    headers: {
        "Content-Type": "application/json",
    },

    timeout: 15000,
});

// ==========================================
// REQUEST INTERCEPTOR
// ADD JWT TOKEN
// ==========================================

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

// ==========================================
// RESPONSE INTERCEPTOR
// GLOBAL ERROR HANDLING
// ==========================================

apiClient.interceptors.response.use(

    (response) => response,

    (error) => {

        // ==========================================
        // NO INTERNET / SERVER DOWN
        // ==========================================

        if (!error.response) {

            console.error(
                "Network Error / Backend Unreachable"
            );

            alert(
                "Unable to connect to server."
            );

            return Promise.reject(error);
        }

        // ==========================================
        // STATUS CODES
        // ==========================================

        const status = error.response.status;

        switch (status) {

            // ======================================
            // UNAUTHORIZED
            // ======================================

            case 401:

                localStorage.removeItem("token");
                localStorage.removeItem("role");

                window.location.href = "/login";

                break;

            // ======================================
            // FORBIDDEN
            // ======================================

            case 403:

                alert(
                    "You do not have permission to access this resource."
                );

                break;

            // ======================================
            // SERVER ERROR
            // ======================================

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
