import {
    createSlice,
    createAsyncThunk,
} from "@reduxjs/toolkit";

export const loginUser = createAsyncThunk(

    "auth/loginUser",

    async (credentials, { rejectWithValue }) => {

        try {

            const response = await fetch(
                "http://localhost:8080/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify(credentials),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    data ||
                    "Login failed"
                );
            }

            return data;

        } catch (error) {

            return rejectWithValue(

                error.response?.data?.message ||

                error.response?.data ||

                "Login failed"
            );
        }
    }
);

const initialState = {

    user: JSON.parse(
        localStorage.getItem("user")
    ) || null,

    token:
        localStorage.getItem("token") || null,

    role:
        localStorage.getItem("role") || null,

    loading: false,

    error: null,
};

const authSlice = createSlice({

    name: "auth",

    initialState,

    reducers: {

        logout: (state) => {

            state.user = null;

            state.token = null;

            state.role = null;

            state.loading = false;

            state.error = null;

            localStorage.removeItem("token");

            localStorage.removeItem("role");

            localStorage.removeItem("user");
        },

        clearAuthError: (state) => {

            state.error = null;
        },
    },

    extraReducers: (builder) => {

        builder

            .addCase(
                loginUser.pending,

                (state) => {

                    state.loading = true;

                    state.error = null;
                }
            )

            .addCase(
                loginUser.fulfilled,

                (state, action) => {

                    state.loading = false;

                    state.token =
                        action.payload.token;

                    state.role =
                        action.payload.role;

                    state.user = {

                        email:
                            action.payload.email,

                        name:
                            action.payload.name,
                    };

                    localStorage.setItem(
                        "token",
                        action.payload.token
                    );

                    localStorage.setItem(
                        "role",
                        action.payload.role
                    );

                    localStorage.setItem(
                        "user",
                        JSON.stringify(state.user)
                    );
                }
            )

            .addCase(
                loginUser.rejected,

                (state, action) => {

                    state.loading = false;

                    state.error = action.payload;
                }
            );
    },
});

export const {

    logout,

    clearAuthError,

} = authSlice.actions;

export default authSlice.reducer;
