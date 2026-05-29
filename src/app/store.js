import { configureStore } from "@reduxjs/toolkit";

// ==========================================
// SLICES
// ==========================================

import authReducer
from "../features/auth/authSlice";

// ==========================================
// STORE
// ==========================================

export const store = configureStore({

    reducer: {

        // ==================================
        // AUTH
        // ==================================

        auth: authReducer,
    },

    // ======================================
    // DEVTOOLS
    // ======================================

    devTools:
        import.meta.env.MODE !== "production",
});
