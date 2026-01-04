(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/services/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "authApi",
    ()=>authApi,
    "bancoApi",
    ()=>bancoApi,
    "cartaoApi",
    ()=>cartaoApi,
    "categoriaApi",
    ()=>categoriaApi,
    "dashboardApi",
    ()=>dashboardApi,
    "default",
    ()=>__TURBOPACK__default__export__,
    "despesaApi",
    ()=>despesaApi,
    "receitaApi",
    ()=>receitaApi
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$axios$40$1$2e$12$2e$2$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/axios@1.12.2/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
;
// Configuração base do axios
// Em produção, usa caminho relativo (/api) pois o backend serve o frontend
// Em desenvolvimento, usa URL absoluta para o servidor local
const API_BASE_URL = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL || (("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : 'http://localhost:3001/api');
class ApiService {
    api;
    constructor(){
        this.api = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$axios$40$1$2e$12$2e$2$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        // Interceptor para adicionar token de autenticação
        this.api.interceptors.request.use((config)=>{
            if ("TURBOPACK compile-time truthy", 1) {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
            return config;
        }, (error)=>{
            return Promise.reject(error);
        });
        // Interceptor para tratar respostas
        this.api.interceptors.response.use((response)=>response, (error)=>{
            if (error.response?.status === 401 && ("TURBOPACK compile-time value", "object") !== 'undefined') {
                // Token inválido ou expirado
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        });
    }
    // Métodos auxiliares
    handleResponse(response) {
        return response.data;
    }
    handlePaginatedResponse(response) {
        return response.data;
    }
}
// Instância do serviço de API
const apiService = new ApiService();
const authApi = {
    login: async (credentials)=>{
        const response = await apiService.api.post('/auth/login', credentials);
        return apiService.handleResponse(response);
    },
    register: async (userData)=>{
        const response = await apiService.api.post('/auth/register', userData);
        return apiService.handleResponse(response);
    },
    getProfile: async ()=>{
        const response = await apiService.api.get('/auth/profile');
        return apiService.handleResponse(response);
    },
    updateProfile: async (userData)=>{
        const response = await apiService.api.put('/auth/profile', userData);
        return apiService.handleResponse(response);
    },
    changePassword: async (passwordData)=>{
        const response = await apiService.api.put('/auth/change-password', passwordData);
        return apiService.handleResponse(response);
    },
    verifyToken: async ()=>{
        const response = await apiService.api.get('/auth/verify-token');
        return apiService.handleResponse(response);
    }
};
const categoriaApi = {
    getCategorias: async (params)=>{
        const response = await apiService.api.get('/categorias', {
            params
        });
        return apiService.handlePaginatedResponse(response);
    },
    getCategoriaById: async (id)=>{
        const response = await apiService.api.get(`/categorias/${id}`);
        return apiService.handleResponse(response);
    },
    createCategoria: async (categoriaData)=>{
        const response = await apiService.api.post('/categorias', categoriaData);
        return apiService.handleResponse(response);
    },
    updateCategoria: async (id, categoriaData)=>{
        const response = await apiService.api.put(`/categorias/${id}`, categoriaData);
        return apiService.handleResponse(response);
    },
    deleteCategoria: async (id)=>{
        const response = await apiService.api.delete(`/categorias/${id}`);
        return apiService.handleResponse(response);
    },
    getEstatisticasCategorias: async ()=>{
        const response = await apiService.api.get('/categorias/estatisticas');
        return apiService.handleResponse(response);
    }
};
const bancoApi = {
    getBancos: async (params)=>{
        const response = await apiService.api.get('/bancos', {
            params
        });
        return apiService.handlePaginatedResponse(response);
    },
    getBancoById: async (id)=>{
        const response = await apiService.api.get(`/bancos/${id}`);
        return apiService.handleResponse(response);
    },
    getSaldoConsolidado: async ()=>{
        const response = await apiService.api.get('/bancos/saldo-consolidado');
        return apiService.handleResponse(response);
    },
    getExtratoBanco: async (id, params)=>{
        const response = await apiService.api.get(`/bancos/${id}/extrato`, {
            params
        });
        return apiService.handlePaginatedResponse(response);
    },
    createBanco: async (bancoData)=>{
        const response = await apiService.api.post('/bancos', bancoData);
        return apiService.handleResponse(response);
    },
    updateBanco: async (id, bancoData)=>{
        const response = await apiService.api.put(`/bancos/${id}`, bancoData);
        return apiService.handleResponse(response);
    },
    deleteBanco: async (id)=>{
        const response = await apiService.api.delete(`/bancos/${id}`);
        return apiService.handleResponse(response);
    }
};
const cartaoApi = {
    getCartoes: async (params)=>{
        const response = await apiService.api.get('/cartoes', {
            params
        });
        return apiService.handlePaginatedResponse(response);
    },
    getCartaoById: async (id)=>{
        const response = await apiService.api.get(`/cartoes/${id}`);
        return apiService.handleResponse(response);
    },
    getLimiteConsolidado: async ()=>{
        const response = await apiService.api.get('/cartoes/limite-consolidado');
        return apiService.handleResponse(response);
    },
    getProximosVencimentos: async ()=>{
        const response = await apiService.api.get('/cartoes/proximos-vencimentos');
        return apiService.handleResponse(response);
    },
    getFaturaCartao: async (id, mes, ano)=>{
        const response = await apiService.api.get(`/cartoes/${id}/fatura/${mes}/${ano}`);
        return apiService.handleResponse(response);
    },
    createCartao: async (cartaoData)=>{
        const response = await apiService.api.post('/cartoes', cartaoData);
        return apiService.handleResponse(response);
    },
    updateCartao: async (id, cartaoData)=>{
        const response = await apiService.api.put(`/cartoes/${id}`, cartaoData);
        return apiService.handleResponse(response);
    },
    deleteCartao: async (id)=>{
        const response = await apiService.api.delete(`/cartoes/${id}`);
        return apiService.handleResponse(response);
    }
};
const receitaApi = {
    getReceitas: async (params)=>{
        const response = await apiService.api.get('/receitas', {
            params
        });
        return apiService.handlePaginatedResponse(response);
    },
    getReceitaById: async (id)=>{
        const response = await apiService.api.get(`/receitas/${id}`);
        return apiService.handleResponse(response);
    },
    getEstatisticasReceitas: async (params)=>{
        const response = await apiService.api.get('/receitas/estatisticas', {
            params
        });
        return apiService.handleResponse(response);
    },
    getProximasRecorrentes: async ()=>{
        const response = await apiService.api.get('/receitas/proximas-recorrentes');
        return apiService.handleResponse(response);
    },
    createReceita: async (receitaData)=>{
        const response = await apiService.api.post('/receitas', receitaData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return apiService.handleResponse(response);
    },
    createReceitaJSON: async (receitaData)=>{
        const response = await apiService.api.post('/receitas', receitaData);
        return apiService.handleResponse(response);
    },
    updateReceita: async (id, receitaData)=>{
        const response = await apiService.api.put(`/receitas/${id}`, receitaData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return apiService.handleResponse(response);
    },
    updateReceitaJSON: async (id, receitaData)=>{
        const response = await apiService.api.put(`/receitas/${id}`, receitaData);
        return apiService.handleResponse(response);
    },
    deleteReceita: async (id)=>{
        const response = await apiService.api.delete(`/receitas/${id}`);
        return apiService.handleResponse(response);
    }
};
const despesaApi = {
    getDespesas: async (params)=>{
        const response = await apiService.api.get('/despesas', {
            params
        });
        return apiService.handlePaginatedResponse(response);
    },
    getDespesaById: async (id)=>{
        const response = await apiService.api.get(`/despesas/${id}`);
        return apiService.handleResponse(response);
    },
    getEstatisticasDespesas: async (params)=>{
        const response = await apiService.api.get('/despesas/estatisticas', {
            params
        });
        return apiService.handleResponse(response);
    },
    getProximasParcelasVencimento: async ()=>{
        const response = await apiService.api.get('/despesas/proximas-parcelas-vencimento');
        return apiService.handleResponse(response);
    },
    createDespesa: async (despesaData)=>{
        const response = await apiService.api.post('/despesas', despesaData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return apiService.handleResponse(response);
    },
    createDespesaJSON: async (despesaData)=>{
        const response = await apiService.api.post('/despesas', despesaData);
        return apiService.handleResponse(response);
    },
    updateDespesa: async (id, despesaData)=>{
        const response = await apiService.api.put(`/despesas/${id}`, despesaData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return apiService.handleResponse(response);
    },
    updateDespesaJSON: async (id, despesaData)=>{
        const response = await apiService.api.put(`/despesas/${id}`, despesaData);
        return apiService.handleResponse(response);
    },
    updateStatusParcela: async (id, numeroParcela, statusData)=>{
        const response = await apiService.api.put(`/despesas/${id}/parcelas/${numeroParcela}`, statusData);
        return apiService.handleResponse(response);
    },
    deleteDespesa: async (id)=>{
        const response = await apiService.api.delete(`/despesas/${id}`);
        return apiService.handleResponse(response);
    }
};
const dashboardApi = {
    getResumoGeral: async (params)=>{
        const response = await apiService.api.get('/dashboard/resumo', {
            params
        });
        return apiService.handleResponse(response);
    },
    getGraficoReceitasDespesas: async (params)=>{
        const response = await apiService.api.get('/dashboard/grafico-receitas-despesas', {
            params
        });
        return apiService.handleResponse(response);
    },
    getGraficoDespesasPorCategoria: async (params)=>{
        const response = await apiService.api.get('/dashboard/grafico-despesas-categoria', {
            params
        });
        return apiService.handleResponse(response);
    },
    getEvolucaoPatrimonial: async (params)=>{
        const response = await apiService.api.get('/dashboard/evolucao-patrimonial', {
            params
        });
        return apiService.handleResponse(response);
    }
};
const __TURBOPACK__default__export__ = apiService;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/store/slices/authSlice.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "changePassword",
    ()=>changePassword,
    "clearError",
    ()=>clearError,
    "default",
    ()=>__TURBOPACK__default__export__,
    "getProfile",
    ()=>getProfile,
    "initializeAuth",
    ()=>initializeAuth,
    "login",
    ()=>login,
    "logout",
    ()=>logout,
    "register",
    ()=>register,
    "setToken",
    ()=>setToken,
    "updateProfile",
    ()=>updateProfile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@reduxjs+toolkit@2.9.0_react-redux@9.2.0_@types+react@18.3.26_react@18.3.1_redux@5.0.1__react@18.3.1/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/api.ts [app-client] (ecmascript)");
;
;
const isClient = ("TURBOPACK compile-time value", "object") !== 'undefined';
const initialState = {
    user: null,
    token: ("TURBOPACK compile-time truthy", 1) ? localStorage.getItem('token') : "TURBOPACK unreachable",
    isAuthenticated: ("TURBOPACK compile-time truthy", 1) ? !!localStorage.getItem('token') : "TURBOPACK unreachable",
    isLoading: false,
    error: null
};
const login = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('auth/login', async (credentials, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authApi"].login(credentials);
        if (response.success && response.data) {
            localStorage.setItem('token', response.data.token);
            return response.data;
        }
        return rejectWithValue(response.message || 'Erro no login');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro no login');
    }
});
const register = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('auth/register', async (userData, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authApi"].register(userData);
        if (response.success && response.data) {
            localStorage.setItem('token', response.data.token);
            return response.data;
        }
        return rejectWithValue(response.message || 'Erro no registro');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro no registro');
    }
});
const getProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('auth/getProfile', async (_, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authApi"].getProfile();
        if (response.success && response.data) {
            // A API retorna { data: { user: {...} } }, então precisamos extrair apenas o user
            return response.data.user || response.data;
        }
        return rejectWithValue(response.message || 'Erro ao buscar perfil');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar perfil');
    }
});
const initializeAuth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('auth/initializeAuth', async (_, { rejectWithValue })=>{
    try {
        const token = localStorage.getItem('token');
        if (token) {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authApi"].getProfile();
            if (response.success && response.data) {
                // A API retorna { data: { user: {...} } }, então precisamos extrair apenas o user
                return response.data.user || response.data;
            }
            // Se falhou, limpar token inválido
            localStorage.removeItem('token');
            return rejectWithValue(response.message || 'Token inválido');
        }
        return null;
    } catch (error) {
        // Se falhou, limpar token inválido
        localStorage.removeItem('token');
        return rejectWithValue(error.response?.data?.message || 'Erro na inicialização');
    }
});
const updateProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('auth/updateProfile', async (userData, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authApi"].updateProfile(userData);
        if (response.success && response.data) {
            // A API retorna { data: { user: {...} } }, então precisamos extrair apenas o user
            return response.data.user || response.data;
        }
        return rejectWithValue(response.message || 'Erro ao atualizar perfil');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar perfil');
    }
});
const changePassword = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('auth/changePassword', async (passwordData, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authApi"].changePassword(passwordData);
        if (response.success) {
            return response.message || 'Senha alterada com sucesso';
        }
        return rejectWithValue(response.message || 'Erro ao alterar senha');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao alterar senha');
    }
});
const authSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state)=>{
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
            localStorage.removeItem('token');
        },
        clearError: (state)=>{
            state.error = null;
        },
        setToken: (state, action)=>{
            state.token = action.payload;
            state.isAuthenticated = true;
            localStorage.setItem('token', action.payload);
        }
    },
    extraReducers: (builder)=>{
        // Login
        builder.addCase(login.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(login.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.error = null;
        }).addCase(login.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
            state.isAuthenticated = false;
        });
        // Register
        builder.addCase(register.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(register.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.error = null;
        }).addCase(register.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
            state.isAuthenticated = false;
        });
        // Get Profile
        builder.addCase(getProfile.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(getProfile.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.user = action.payload;
            state.error = null;
        }).addCase(getProfile.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
            // Se o token for inválido, fazer logout
            if (action.payload === 'Token inválido' || action.payload === 'Token expirado') {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                localStorage.removeItem('token');
            }
        });
        // Update Profile
        builder.addCase(updateProfile.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(updateProfile.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.user = action.payload;
            state.error = null;
        }).addCase(updateProfile.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Change Password
        builder.addCase(changePassword.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(changePassword.fulfilled, (state)=>{
            state.isLoading = false;
            state.error = null;
        }).addCase(changePassword.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Initialize Auth
        builder.addCase(initializeAuth.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(initializeAuth.fulfilled, (state, action)=>{
            state.isLoading = false;
            if (action.payload) {
                state.user = action.payload;
                state.isAuthenticated = true;
            } else {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                localStorage.removeItem('token');
            }
            state.error = null;
        }).addCase(initializeAuth.rejected, (state, action)=>{
            state.isLoading = false;
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
            state.error = action.payload;
        });
    }
});
const { logout, clearError, setToken } = authSlice.actions;
const __TURBOPACK__default__export__ = authSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/store/slices/categoriaSlice.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearCurrentCategoria",
    ()=>clearCurrentCategoria,
    "clearError",
    ()=>clearError,
    "createCategoria",
    ()=>createCategoria,
    "default",
    ()=>__TURBOPACK__default__export__,
    "deleteCategoria",
    ()=>deleteCategoria,
    "fetchCategoriaById",
    ()=>fetchCategoriaById,
    "fetchCategorias",
    ()=>fetchCategorias,
    "fetchCategoriasDespesa",
    ()=>fetchCategoriasDespesa,
    "fetchCategoriasReceita",
    ()=>fetchCategoriasReceita,
    "setCurrentCategoria",
    ()=>setCurrentCategoria,
    "updateCategoria",
    ()=>updateCategoria
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@reduxjs+toolkit@2.9.0_react-redux@9.2.0_@types+react@18.3.26_react@18.3.1_redux@5.0.1__react@18.3.1/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/api.ts [app-client] (ecmascript)");
;
;
const initialState = {
    categorias: [],
    categoriasReceita: [],
    categoriasDespesa: [],
    currentCategoria: null,
    pagination: {
        page: 1,
        limit: 12,
        total: 0,
        pages: 0
    },
    isLoading: false,
    error: null
};
const fetchCategorias = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('categoria/fetchCategorias', async (params, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["categoriaApi"].getCategorias(params);
        if (response.success && response.data) {
            return response.data;
        }
        return rejectWithValue('Erro ao buscar categorias');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar categorias');
    }
});
const fetchCategoriaById = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('categoria/fetchCategoriaById', async (id, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["categoriaApi"].getCategoriaById(id);
        if (response.success && response.data) {
            return response.data;
        }
        return rejectWithValue('Erro ao buscar categoria');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar categoria');
    }
});
const createCategoria = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('categoria/createCategoria', async (categoriaData, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["categoriaApi"].createCategoria(categoriaData);
        if (response.success && response.data) {
            return response.data;
        }
        return rejectWithValue('Erro ao criar categoria');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao criar categoria');
    }
});
const updateCategoria = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('categoria/updateCategoria', async ({ id, data }, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["categoriaApi"].updateCategoria(id, data);
        if (response.success && response.data) {
            return response.data;
        }
        return rejectWithValue('Erro ao atualizar categoria');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar categoria');
    }
});
const deleteCategoria = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('categoria/deleteCategoria', async (id, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["categoriaApi"].deleteCategoria(id);
        if (response.success) {
            return id;
        }
        return rejectWithValue('Erro ao deletar categoria');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao deletar categoria');
    }
});
const fetchCategoriasReceita = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('categoria/fetchCategoriasReceita', async (_, { rejectWithValue })=>{
    try {
        console.log('[fetchCategoriasReceita] Iniciando busca...');
        // Buscar uma quantidade grande para preencher os selects dos modais
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["categoriaApi"].getCategorias({
            tipo: 'receita',
            page: 1,
            limit: 100
        });
        console.log('[fetchCategoriasReceita] Resposta recebida:', response);
        if (response.success && response.data) {
            console.log('[fetchCategoriasReceita] Categorias encontradas:', response.data.categorias?.length || 0);
            return response.data.categorias;
        }
        console.error('[fetchCategoriasReceita] Erro: resposta não foi bem-sucedida');
        return rejectWithValue('Erro ao buscar categorias de receita');
    } catch (error) {
        console.error('[fetchCategoriasReceita] Exceção:', error);
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar categorias de receita');
    }
});
const fetchCategoriasDespesa = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('categoria/fetchCategoriasDespesa', async (_, { rejectWithValue })=>{
    try {
        console.log('[fetchCategoriasDespesa] Iniciando busca...');
        // Buscar uma quantidade grande para preencher os selects dos modais
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["categoriaApi"].getCategorias({
            tipo: 'despesa',
            page: 1,
            limit: 100
        });
        console.log('[fetchCategoriasDespesa] Resposta recebida:', response);
        if (response.success && response.data) {
            console.log('[fetchCategoriasDespesa] Categorias encontradas:', response.data.categorias?.length || 0);
            return response.data.categorias;
        }
        console.error('[fetchCategoriasDespesa] Erro: resposta não foi bem-sucedida');
        return rejectWithValue('Erro ao buscar categorias de despesa');
    } catch (error) {
        console.error('[fetchCategoriasDespesa] Exceção:', error);
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar categorias de despesa');
    }
});
const categoriaSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'categoria',
    initialState,
    reducers: {
        clearError: (state)=>{
            state.error = null;
        },
        clearCurrentCategoria: (state)=>{
            state.currentCategoria = null;
        },
        setCurrentCategoria: (state, action)=>{
            state.currentCategoria = action.payload;
        }
    },
    extraReducers: (builder)=>{
        // Fetch Categorias
        builder.addCase(fetchCategorias.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(fetchCategorias.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.categorias = action.payload.categorias;
            state.pagination = action.payload.pagination;
            state.error = null;
        }).addCase(fetchCategorias.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Fetch Categoria By ID
        builder.addCase(fetchCategoriaById.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(fetchCategoriaById.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.currentCategoria = action.payload;
            state.error = null;
        }).addCase(fetchCategoriaById.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Create Categoria
        builder.addCase(createCategoria.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(createCategoria.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.categorias.unshift(action.payload);
            // Atualizar listas específicas por tipo
            if (action.payload.tipo === 'receita') {
                state.categoriasReceita.unshift(action.payload);
            } else {
                state.categoriasDespesa.unshift(action.payload);
            }
            state.error = null;
        }).addCase(createCategoria.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Update Categoria
        builder.addCase(updateCategoria.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(updateCategoria.fulfilled, (state, action)=>{
            state.isLoading = false;
            const index = state.categorias.findIndex((cat)=>cat._id === action.payload._id);
            if (index !== -1) {
                state.categorias[index] = action.payload;
            }
            // Atualizar listas específicas por tipo
            const receitaIndex = state.categoriasReceita.findIndex((cat)=>cat._id === action.payload._id);
            const despesaIndex = state.categoriasDespesa.findIndex((cat)=>cat._id === action.payload._id);
            if (action.payload.tipo === 'receita') {
                if (receitaIndex !== -1) {
                    state.categoriasReceita[receitaIndex] = action.payload;
                } else if (action.payload.ativa) {
                    state.categoriasReceita.push(action.payload);
                }
                // Remover da lista de despesas se mudou de tipo
                if (despesaIndex !== -1) {
                    state.categoriasDespesa.splice(despesaIndex, 1);
                }
            } else {
                if (despesaIndex !== -1) {
                    state.categoriasDespesa[despesaIndex] = action.payload;
                } else if (action.payload.ativa) {
                    state.categoriasDespesa.push(action.payload);
                }
                // Remover da lista de receitas se mudou de tipo
                if (receitaIndex !== -1) {
                    state.categoriasReceita.splice(receitaIndex, 1);
                }
            }
            state.currentCategoria = action.payload;
            state.error = null;
        }).addCase(updateCategoria.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Delete Categoria
        builder.addCase(deleteCategoria.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(deleteCategoria.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.categorias = state.categorias.filter((cat)=>cat._id !== action.payload);
            state.categoriasReceita = state.categoriasReceita.filter((cat)=>cat._id !== action.payload);
            state.categoriasDespesa = state.categoriasDespesa.filter((cat)=>cat._id !== action.payload);
            if (state.currentCategoria?._id === action.payload) {
                state.currentCategoria = null;
            }
            state.error = null;
        }).addCase(deleteCategoria.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Fetch Categorias Receita
        builder.addCase(fetchCategoriasReceita.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(fetchCategoriasReceita.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.categoriasReceita = action.payload;
            state.error = null;
        }).addCase(fetchCategoriasReceita.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Fetch Categorias Despesa
        builder.addCase(fetchCategoriasDespesa.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(fetchCategoriasDespesa.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.categoriasDespesa = action.payload;
            state.error = null;
        }).addCase(fetchCategoriasDespesa.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
    }
});
const { clearError, clearCurrentCategoria, setCurrentCategoria } = categoriaSlice.actions;
const __TURBOPACK__default__export__ = categoriaSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/store/slices/bancoSlice.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearCurrentBanco",
    ()=>clearCurrentBanco,
    "clearError",
    ()=>clearError,
    "createBanco",
    ()=>createBanco,
    "default",
    ()=>__TURBOPACK__default__export__,
    "deleteBanco",
    ()=>deleteBanco,
    "fetchBancoById",
    ()=>fetchBancoById,
    "fetchBancos",
    ()=>fetchBancos,
    "fetchBancosAtivos",
    ()=>fetchBancosAtivos,
    "fetchExtratoBanco",
    ()=>fetchExtratoBanco,
    "fetchSaldoConsolidado",
    ()=>fetchSaldoConsolidado,
    "setCurrentBanco",
    ()=>setCurrentBanco,
    "updateBanco",
    ()=>updateBanco,
    "updateSaldoBanco",
    ()=>updateSaldoBanco
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@reduxjs+toolkit@2.9.0_react-redux@9.2.0_@types+react@18.3.26_react@18.3.1_redux@5.0.1__react@18.3.1/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/api.ts [app-client] (ecmascript)");
;
;
const initialState = {
    bancos: [],
    bancosAtivos: [],
    currentBanco: null,
    saldoConsolidado: 0,
    pagination: {
        page: 1,
        limit: 50,
        total: 0,
        pages: 0
    },
    isLoading: false,
    error: null
};
const fetchBancos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('banco/fetchBancos', async (params, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bancoApi"].getBancos(params);
        if (response.success && response.data) {
            return response.data;
        }
        return rejectWithValue('Erro ao buscar bancos');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar bancos');
    }
});
const fetchBancosAtivos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('banco/fetchBancosAtivos', async (_, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bancoApi"].getBancos({
            ativo: true
        });
        if (response.success && response.data) {
            return response.data.bancos;
        }
        return rejectWithValue('Erro ao buscar bancos ativos');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar bancos ativos');
    }
});
const fetchBancoById = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('banco/fetchBancoById', async (id, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bancoApi"].getBancoById(id);
        if (response.success && response.data) {
            return response.data;
        }
        return rejectWithValue('Erro ao buscar banco');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar banco');
    }
});
const fetchSaldoConsolidado = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('banco/fetchSaldoConsolidado', async (_, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bancoApi"].getSaldoConsolidado();
        if (response.success && response.data) {
            return response.data.saldoConsolidado;
        }
        return rejectWithValue('Erro ao buscar saldo consolidado');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar saldo consolidado');
    }
});
const createBanco = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('banco/createBanco', async (bancoData, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bancoApi"].createBanco(bancoData);
        if (response.success && response.data) {
            return response.data;
        }
        return rejectWithValue('Erro ao criar banco');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao criar banco');
    }
});
const updateBanco = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('banco/updateBanco', async ({ id, data }, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bancoApi"].updateBanco(id, data);
        if (response.success && response.data) {
            return response.data;
        }
        return rejectWithValue('Erro ao atualizar banco');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar banco');
    }
});
const deleteBanco = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('banco/deleteBanco', async (id, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bancoApi"].deleteBanco(id);
        if (response.success) {
            return id;
        }
        return rejectWithValue('Erro ao deletar banco');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao deletar banco');
    }
});
const fetchExtratoBanco = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('banco/fetchExtratoBanco', async ({ id, params }, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bancoApi"].getExtratoBanco(id, params);
        if (response.success && response.data) {
            return response.data;
        }
        return rejectWithValue('Erro ao buscar extrato do banco');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar extrato do banco');
    }
});
const bancoSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'banco',
    initialState,
    reducers: {
        clearError: (state)=>{
            state.error = null;
        },
        clearCurrentBanco: (state)=>{
            state.currentBanco = null;
        },
        setCurrentBanco: (state, action)=>{
            state.currentBanco = action.payload;
        },
        updateSaldoBanco: (state, action)=>{
            const { bancoId, novoSaldo } = action.payload;
            // Atualizar na lista principal
            const bancoIndex = state.bancos.findIndex((banco)=>banco._id === bancoId);
            if (bancoIndex !== -1) {
                state.bancos[bancoIndex].saldoAtual = novoSaldo;
            }
            // Atualizar na lista de bancos ativos
            const bancoAtivoIndex = state.bancosAtivos.findIndex((banco)=>banco._id === bancoId);
            if (bancoAtivoIndex !== -1) {
                state.bancosAtivos[bancoAtivoIndex].saldoAtual = novoSaldo;
            }
            // Atualizar banco atual se for o mesmo
            if (state.currentBanco?._id === bancoId) {
                state.currentBanco.saldoAtual = novoSaldo;
            }
        }
    },
    extraReducers: (builder)=>{
        // Fetch Bancos
        builder.addCase(fetchBancos.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(fetchBancos.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.bancos = action.payload.bancos;
            state.pagination = action.payload.pagination;
            state.error = null;
        }).addCase(fetchBancos.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Fetch Bancos Ativos
        builder.addCase(fetchBancosAtivos.fulfilled, (state, action)=>{
            state.bancosAtivos = action.payload;
        });
        // Fetch Banco By ID
        builder.addCase(fetchBancoById.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(fetchBancoById.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.currentBanco = action.payload;
            state.error = null;
        }).addCase(fetchBancoById.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Fetch Saldo Consolidado
        builder.addCase(fetchSaldoConsolidado.fulfilled, (state, action)=>{
            state.saldoConsolidado = action.payload;
        });
        // Create Banco
        builder.addCase(createBanco.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(createBanco.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.bancos.unshift(action.payload);
            if (action.payload.ativo) {
                state.bancosAtivos.unshift(action.payload);
            }
            state.error = null;
        }).addCase(createBanco.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Update Banco
        builder.addCase(updateBanco.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(updateBanco.fulfilled, (state, action)=>{
            state.isLoading = false;
            const index = state.bancos.findIndex((banco)=>banco._id === action.payload._id);
            if (index !== -1) {
                state.bancos[index] = action.payload;
            }
            const ativoIndex = state.bancosAtivos.findIndex((banco)=>banco._id === action.payload._id);
            if (action.payload.ativo) {
                if (ativoIndex !== -1) {
                    state.bancosAtivos[ativoIndex] = action.payload;
                } else {
                    state.bancosAtivos.push(action.payload);
                }
            } else if (ativoIndex !== -1) {
                state.bancosAtivos.splice(ativoIndex, 1);
            }
            state.currentBanco = action.payload;
            state.error = null;
        }).addCase(updateBanco.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Delete Banco
        builder.addCase(deleteBanco.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(deleteBanco.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.bancos = state.bancos.filter((banco)=>banco._id !== action.payload);
            state.bancosAtivos = state.bancosAtivos.filter((banco)=>banco._id !== action.payload);
            if (state.currentBanco?._id === action.payload) {
                state.currentBanco = null;
            }
            state.error = null;
        }).addCase(deleteBanco.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Fetch Extrato Banco
        builder.addCase(fetchExtratoBanco.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(fetchExtratoBanco.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.error = null;
        // O extrato será tratado no componente que o solicita
        }).addCase(fetchExtratoBanco.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
    }
});
const { clearError, clearCurrentBanco, setCurrentBanco, updateSaldoBanco } = bancoSlice.actions;
const __TURBOPACK__default__export__ = bancoSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/store/slices/cartaoSlice.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearCurrentCartao",
    ()=>clearCurrentCartao,
    "clearError",
    ()=>clearError,
    "createCartao",
    ()=>createCartao,
    "default",
    ()=>__TURBOPACK__default__export__,
    "deleteCartao",
    ()=>deleteCartao,
    "fetchCartaoById",
    ()=>fetchCartaoById,
    "fetchCartoes",
    ()=>fetchCartoes,
    "fetchCartoesAtivos",
    ()=>fetchCartoesAtivos,
    "fetchFaturaCartao",
    ()=>fetchFaturaCartao,
    "fetchLimiteConsolidado",
    ()=>fetchLimiteConsolidado,
    "fetchProximosVencimentos",
    ()=>fetchProximosVencimentos,
    "setCurrentCartao",
    ()=>setCurrentCartao,
    "updateCartao",
    ()=>updateCartao
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@reduxjs+toolkit@2.9.0_react-redux@9.2.0_@types+react@18.3.26_react@18.3.1_redux@5.0.1__react@18.3.1/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/api.ts [app-client] (ecmascript)");
;
;
const initialState = {
    cartoes: [],
    cartoesAtivos: [],
    currentCartao: null,
    limiteConsolidado: 0,
    proximosVencimentos: [],
    pagination: {
        page: 1,
        limit: 50,
        total: 0,
        pages: 0
    },
    isLoading: false,
    error: null
};
const fetchCartoes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('cartao/fetchCartoes', async (params, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cartaoApi"].getCartoes(params);
        if (response.success && response.data) {
            return response.data;
        }
        return rejectWithValue('Erro ao buscar cartões');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar cartões');
    }
});
const fetchCartoesAtivos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('cartao/fetchCartoesAtivos', async (_, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cartaoApi"].getCartoes({
            ativo: true
        });
        if (response.success && response.data) {
            return response.data.cartoes;
        }
        return rejectWithValue('Erro ao buscar cartões ativos');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar cartões ativos');
    }
});
const fetchCartaoById = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('cartao/fetchCartaoById', async (id, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cartaoApi"].getCartaoById(id);
        if (response.success && response.data) {
            return response.data;
        }
        return rejectWithValue('Erro ao buscar cartão');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar cartão');
    }
});
const fetchLimiteConsolidado = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('cartao/fetchLimiteConsolidado', async (_, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cartaoApi"].getLimiteConsolidado();
        if (response.success && response.data) {
            return response.data.limiteDisponivel;
        }
        return rejectWithValue('Erro ao buscar limite consolidado');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar limite consolidado');
    }
});
const fetchProximosVencimentos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('cartao/fetchProximosVencimentos', async (_, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cartaoApi"].getProximosVencimentos();
        if (response.success && response.data) {
            return response.data.proximosVencimentos;
        }
        return rejectWithValue('Erro ao buscar próximos vencimentos');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar próximos vencimentos');
    }
});
const createCartao = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('cartao/createCartao', async (cartaoData, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cartaoApi"].createCartao(cartaoData);
        if (response.success && response.data) {
            return response.data;
        }
        return rejectWithValue('Erro ao criar cartão');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao criar cartão');
    }
});
const updateCartao = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('cartao/updateCartao', async ({ id, data }, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cartaoApi"].updateCartao(id, data);
        if (response.success && response.data) {
            return response.data;
        }
        return rejectWithValue('Erro ao atualizar cartão');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar cartão');
    }
});
const deleteCartao = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('cartao/deleteCartao', async (id, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cartaoApi"].deleteCartao(id);
        if (response.success) {
            return id;
        }
        return rejectWithValue('Erro ao deletar cartão');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao deletar cartão');
    }
});
const fetchFaturaCartao = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('cartao/fetchFaturaCartao', async ({ id, mes, ano }, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cartaoApi"].getFaturaCartao(id, mes, ano);
        if (response.success && response.data) {
            return response.data;
        }
        return rejectWithValue('Erro ao buscar fatura do cartão');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar fatura do cartão');
    }
});
const cartaoSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'cartao',
    initialState,
    reducers: {
        clearError: (state)=>{
            state.error = null;
        },
        clearCurrentCartao: (state)=>{
            state.currentCartao = null;
        },
        setCurrentCartao: (state, action)=>{
            state.currentCartao = action.payload;
        }
    },
    extraReducers: (builder)=>{
        // Fetch Cartões
        builder.addCase(fetchCartoes.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(fetchCartoes.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.cartoes = action.payload.cartoes;
            state.pagination = action.payload.pagination;
            state.error = null;
        }).addCase(fetchCartoes.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Fetch Cartões Ativos
        builder.addCase(fetchCartoesAtivos.fulfilled, (state, action)=>{
            state.cartoesAtivos = action.payload;
        });
        // Fetch Cartão By ID
        builder.addCase(fetchCartaoById.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(fetchCartaoById.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.currentCartao = action.payload;
            state.error = null;
        }).addCase(fetchCartaoById.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Fetch Limite Consolidado
        builder.addCase(fetchLimiteConsolidado.fulfilled, (state, action)=>{
            state.limiteConsolidado = action.payload;
        });
        // Fetch Próximos Vencimentos
        builder.addCase(fetchProximosVencimentos.fulfilled, (state, action)=>{
            state.proximosVencimentos = action.payload;
        });
        // Create Cartão
        builder.addCase(createCartao.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(createCartao.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.cartoes.unshift(action.payload);
            if (action.payload.ativo) {
                state.cartoesAtivos.unshift(action.payload);
            }
            state.error = null;
        }).addCase(createCartao.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Update Cartão
        builder.addCase(updateCartao.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(updateCartao.fulfilled, (state, action)=>{
            state.isLoading = false;
            const index = state.cartoes.findIndex((cartao)=>cartao._id === action.payload._id);
            if (index !== -1) {
                state.cartoes[index] = action.payload;
            }
            const ativoIndex = state.cartoesAtivos.findIndex((cartao)=>cartao._id === action.payload._id);
            if (action.payload.ativo) {
                if (ativoIndex !== -1) {
                    state.cartoesAtivos[ativoIndex] = action.payload;
                } else {
                    state.cartoesAtivos.push(action.payload);
                }
            } else if (ativoIndex !== -1) {
                state.cartoesAtivos.splice(ativoIndex, 1);
            }
            state.currentCartao = action.payload;
            state.error = null;
        }).addCase(updateCartao.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Delete Cartão
        builder.addCase(deleteCartao.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(deleteCartao.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.cartoes = state.cartoes.filter((cartao)=>cartao._id !== action.payload);
            state.cartoesAtivos = state.cartoesAtivos.filter((cartao)=>cartao._id !== action.payload);
            if (state.currentCartao?._id === action.payload) {
                state.currentCartao = null;
            }
            state.error = null;
        }).addCase(deleteCartao.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Fetch Fatura Cartão
        builder.addCase(fetchFaturaCartao.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(fetchFaturaCartao.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.error = null;
        // A fatura será tratada no componente que a solicita
        }).addCase(fetchFaturaCartao.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
    }
});
const { clearError, clearCurrentCartao, setCurrentCartao } = cartaoSlice.actions;
const __TURBOPACK__default__export__ = cartaoSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/store/slices/receitaSlice.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearCurrentReceita",
    ()=>clearCurrentReceita,
    "clearError",
    ()=>clearError,
    "clearEstatisticas",
    ()=>clearEstatisticas,
    "createReceita",
    ()=>createReceita,
    "default",
    ()=>__TURBOPACK__default__export__,
    "deleteReceita",
    ()=>deleteReceita,
    "fetchEstatisticasReceitas",
    ()=>fetchEstatisticasReceitas,
    "fetchProximasRecorrentes",
    ()=>fetchProximasRecorrentes,
    "fetchReceitaById",
    ()=>fetchReceitaById,
    "fetchReceitas",
    ()=>fetchReceitas,
    "setCurrentReceita",
    ()=>setCurrentReceita,
    "updateReceita",
    ()=>updateReceita
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@reduxjs+toolkit@2.9.0_react-redux@9.2.0_@types+react@18.3.26_react@18.3.1_redux@5.0.1__react@18.3.1/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/api.ts [app-client] (ecmascript)");
;
;
const initialState = {
    receitas: [],
    currentReceita: null,
    estatisticas: null,
    proximasRecorrentes: [],
    totalFiltrado: 0,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    },
    isLoading: false,
    error: null
};
const fetchReceitas = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('receita/fetchReceitas', async (params, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["receitaApi"].getReceitas(params);
        if (response.success && response.data) {
            return response.data;
        }
        return rejectWithValue('Erro ao buscar receitas');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar receitas');
    }
});
const fetchReceitaById = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('receita/fetchReceitaById', async (id, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["receitaApi"].getReceitaById(id);
        if (response.success && response.data) {
            return response.data;
        }
        return rejectWithValue('Erro ao buscar receita');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar receita');
    }
});
const fetchEstatisticasReceitas = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('receita/fetchEstatisticasReceitas', async (params, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["receitaApi"].getEstatisticasReceitas(params);
        if (response.success && response.data) {
            return response.data;
        }
        return rejectWithValue('Erro ao buscar estatísticas de receitas');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar estatísticas de receitas');
    }
});
const fetchProximasRecorrentes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('receita/fetchProximasRecorrentes', async (_, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["receitaApi"].getProximasRecorrentes();
        if (response.success && response.data) {
            return response.data.receitas;
        }
        return rejectWithValue('Erro ao buscar próximas receitas recorrentes');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar próximas receitas recorrentes');
    }
});
const createReceita = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('receita/createReceita', async (receitaData, { rejectWithValue })=>{
    try {
        let response;
        // Se é FormData, usar a API que aceita FormData
        if (receitaData instanceof FormData) {
            response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["receitaApi"].createReceita(receitaData);
        } else {
            // Se é objeto JSON, usar a API que aceita JSON
            response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["receitaApi"].createReceitaJSON(receitaData);
        }
        if (response.success && response.data) {
            return response.data;
        }
        return rejectWithValue('Erro ao criar receita');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao criar receita');
    }
});
const updateReceita = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('receita/updateReceita', async ({ id, data }, { rejectWithValue })=>{
    try {
        let response;
        // Se é FormData, usar a API que aceita FormData
        if (data instanceof FormData) {
            response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["receitaApi"].updateReceita(id, data);
        } else {
            // Se é objeto JSON, usar a API que aceita JSON
            response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["receitaApi"].updateReceitaJSON(id, data);
        }
        if (response.success && response.data) {
            return response.data;
        }
        return rejectWithValue('Erro ao atualizar receita');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar receita');
    }
});
const deleteReceita = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('receita/deleteReceita', async (id, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["receitaApi"].deleteReceita(id);
        if (response.success) {
            return id;
        }
        return rejectWithValue('Erro ao deletar receita');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao deletar receita');
    }
});
const receitaSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'receita',
    initialState,
    reducers: {
        clearError: (state)=>{
            state.error = null;
        },
        clearCurrentReceita: (state)=>{
            state.currentReceita = null;
        },
        setCurrentReceita: (state, action)=>{
            state.currentReceita = action.payload;
        },
        clearEstatisticas: (state)=>{
            state.estatisticas = null;
        }
    },
    extraReducers: (builder)=>{
        // Fetch Receitas
        builder.addCase(fetchReceitas.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(fetchReceitas.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.receitas = action.payload.receitas;
            state.totalFiltrado = action.payload.totalFiltrado || 0;
            state.pagination = action.payload.pagination;
            state.error = null;
        }).addCase(fetchReceitas.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Fetch Receita By ID
        builder.addCase(fetchReceitaById.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(fetchReceitaById.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.currentReceita = action.payload;
            state.error = null;
        }).addCase(fetchReceitaById.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Fetch Estatísticas Receitas
        builder.addCase(fetchEstatisticasReceitas.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(fetchEstatisticasReceitas.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.estatisticas = action.payload;
            state.error = null;
        }).addCase(fetchEstatisticasReceitas.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Fetch Próximas Recorrentes
        builder.addCase(fetchProximasRecorrentes.fulfilled, (state, action)=>{
            state.proximasRecorrentes = action.payload;
        });
        // Create Receita
        builder.addCase(createReceita.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(createReceita.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.receitas.unshift(action.payload);
            state.error = null;
        }).addCase(createReceita.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Update Receita
        builder.addCase(updateReceita.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(updateReceita.fulfilled, (state, action)=>{
            state.isLoading = false;
            const index = state.receitas.findIndex((receita)=>receita._id === action.payload._id);
            if (index !== -1) {
                state.receitas[index] = action.payload;
            }
            state.currentReceita = action.payload;
            state.error = null;
        }).addCase(updateReceita.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Delete Receita
        builder.addCase(deleteReceita.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(deleteReceita.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.receitas = state.receitas.filter((receita)=>receita._id !== action.payload);
            if (state.currentReceita?._id === action.payload) {
                state.currentReceita = null;
            }
            state.error = null;
        }).addCase(deleteReceita.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
    }
});
const { clearError, clearCurrentReceita, setCurrentReceita, clearEstatisticas } = receitaSlice.actions;
const __TURBOPACK__default__export__ = receitaSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/store/slices/despesaSlice.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearCurrentDespesa",
    ()=>clearCurrentDespesa,
    "clearError",
    ()=>clearError,
    "clearEstatisticas",
    ()=>clearEstatisticas,
    "createDespesa",
    ()=>createDespesa,
    "default",
    ()=>__TURBOPACK__default__export__,
    "deleteDespesa",
    ()=>deleteDespesa,
    "fetchDespesaById",
    ()=>fetchDespesaById,
    "fetchDespesas",
    ()=>fetchDespesas,
    "fetchEstatisticasDespesas",
    ()=>fetchEstatisticasDespesas,
    "fetchProximasParcelasVencimento",
    ()=>fetchProximasParcelasVencimento,
    "setCurrentDespesa",
    ()=>setCurrentDespesa,
    "updateDespesa",
    ()=>updateDespesa,
    "updateParcela",
    ()=>updateParcela,
    "updateStatusParcela",
    ()=>updateStatusParcela
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@reduxjs+toolkit@2.9.0_react-redux@9.2.0_@types+react@18.3.26_react@18.3.1_redux@5.0.1__react@18.3.1/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/api.ts [app-client] (ecmascript)");
;
;
const initialState = {
    despesas: [],
    currentDespesa: null,
    estatisticas: null,
    proximasParcelasVencimento: [],
    totalFiltrado: 0,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    },
    isLoading: false,
    error: null
};
const fetchDespesas = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('despesa/fetchDespesas', async (params, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["despesaApi"].getDespesas(params);
        if (response.success && response.data) {
            return response.data;
        }
        return rejectWithValue('Erro ao buscar despesas');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar despesas');
    }
});
const fetchDespesaById = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('despesa/fetchDespesaById', async (id, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["despesaApi"].getDespesaById(id);
        if (response.success && response.data) {
            return response.data;
        }
        return rejectWithValue('Erro ao buscar despesa');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar despesa');
    }
});
const fetchEstatisticasDespesas = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('despesa/fetchEstatisticasDespesas', async (params, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["despesaApi"].getEstatisticasDespesas(params);
        if (response.success && response.data) {
            return response.data;
        }
        return rejectWithValue('Erro ao buscar estatísticas de despesas');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar estatísticas de despesas');
    }
});
const fetchProximasParcelasVencimento = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('despesa/fetchProximasParcelasVencimento', async (_, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["despesaApi"].getProximasParcelasVencimento();
        if (response.success && response.data) {
            return response.data.proximasParcelas;
        }
        return rejectWithValue('Erro ao buscar próximas parcelas de vencimento');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar próximas parcelas de vencimento');
    }
});
const createDespesa = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('despesa/createDespesa', async (despesaData, { rejectWithValue })=>{
    try {
        let response;
        if (despesaData instanceof FormData) {
            // Se é FormData, usar a API para FormData
            response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["despesaApi"].createDespesa(despesaData);
        } else {
            // Se é objeto JSON, usar a API para JSON
            response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["despesaApi"].createDespesaJSON(despesaData);
        }
        if (response.success && response.data) {
            return response.data;
        }
        return rejectWithValue('Erro ao criar despesa');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao criar despesa');
    }
});
const updateDespesa = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('despesa/updateDespesa', async ({ id, data }, { rejectWithValue })=>{
    try {
        let response;
        if (data instanceof FormData) {
            // Se é FormData, usar a API para FormData
            response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["despesaApi"].updateDespesa(id, data);
        } else {
            // Se é objeto JSON, usar a API para JSON
            response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["despesaApi"].updateDespesaJSON(id, data);
        }
        if (response.success && response.data) {
            return response.data;
        }
        return rejectWithValue('Erro ao atualizar despesa');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar despesa');
    }
});
const updateStatusParcela = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('despesa/updateStatusParcela', async ({ id, numeroParcela, paga, dataPagamento }, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["despesaApi"].updateStatusParcela(id, numeroParcela, {
            paga,
            dataPagamento
        });
        if (response.success && response.data) {
            return response.data;
        }
        return rejectWithValue('Erro ao atualizar status da parcela');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar status da parcela');
    }
});
const updateParcela = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('despesa/updateParcela', async ({ id, parcelaIndex, data }, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["despesaApi"].updateStatusParcela(id, parcelaIndex, data);
        if (response.success && response.data) {
            return response.data;
        }
        return rejectWithValue('Erro ao atualizar parcela');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar parcela');
    }
});
const deleteDespesa = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('despesa/deleteDespesa', async (id, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["despesaApi"].deleteDespesa(id);
        if (response.success) {
            return id;
        }
        return rejectWithValue('Erro ao deletar despesa');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao deletar despesa');
    }
});
const despesaSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'despesa',
    initialState,
    reducers: {
        clearError: (state)=>{
            state.error = null;
        },
        clearCurrentDespesa: (state)=>{
            state.currentDespesa = null;
        },
        setCurrentDespesa: (state, action)=>{
            state.currentDespesa = action.payload;
        },
        clearEstatisticas: (state)=>{
            state.estatisticas = null;
        }
    },
    extraReducers: (builder)=>{
        // Fetch Despesas
        builder.addCase(fetchDespesas.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(fetchDespesas.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.despesas = action.payload.despesas;
            state.totalFiltrado = action.payload.totalFiltrado || 0;
            state.pagination = action.payload.pagination;
            state.error = null;
        }).addCase(fetchDespesas.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Fetch Despesa By ID
        builder.addCase(fetchDespesaById.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(fetchDespesaById.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.currentDespesa = action.payload;
            state.error = null;
        }).addCase(fetchDespesaById.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Fetch Estatísticas Despesas
        builder.addCase(fetchEstatisticasDespesas.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(fetchEstatisticasDespesas.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.estatisticas = action.payload;
            state.error = null;
        }).addCase(fetchEstatisticasDespesas.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Fetch Próximas Parcelas Vencimento
        builder.addCase(fetchProximasParcelasVencimento.fulfilled, (state, action)=>{
            state.proximasParcelasVencimento = action.payload;
        });
        // Create Despesa
        builder.addCase(createDespesa.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(createDespesa.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.despesas.unshift(action.payload);
            state.error = null;
        }).addCase(createDespesa.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Update Despesa
        builder.addCase(updateDespesa.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(updateDespesa.fulfilled, (state, action)=>{
            state.isLoading = false;
            const index = state.despesas.findIndex((despesa)=>despesa._id === action.payload._id);
            if (index !== -1) {
                state.despesas[index] = action.payload;
            }
            state.currentDespesa = action.payload;
            state.error = null;
        }).addCase(updateDespesa.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Update Status Parcela
        builder.addCase(updateStatusParcela.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(updateStatusParcela.fulfilled, (state, action)=>{
            state.isLoading = false;
            const index = state.despesas.findIndex((despesa)=>despesa._id === action.payload._id);
            if (index !== -1) {
                state.despesas[index] = action.payload;
            }
            if (state.currentDespesa?._id === action.payload._id) {
                state.currentDespesa = action.payload;
            }
            state.error = null;
        }).addCase(updateStatusParcela.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Update Parcela
        builder.addCase(updateParcela.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(updateParcela.fulfilled, (state, action)=>{
            state.isLoading = false;
            const index = state.despesas.findIndex((despesa)=>despesa._id === action.payload._id);
            if (index !== -1) {
                state.despesas[index] = action.payload;
            }
            if (state.currentDespesa?._id === action.payload._id) {
                state.currentDespesa = action.payload;
            }
            state.error = null;
        }).addCase(updateParcela.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Delete Despesa
        builder.addCase(deleteDespesa.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(deleteDespesa.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.despesas = state.despesas.filter((despesa)=>despesa._id !== action.payload);
            if (state.currentDespesa?._id === action.payload) {
                state.currentDespesa = null;
            }
            state.error = null;
        }).addCase(deleteDespesa.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
    }
});
const { clearError, clearCurrentDespesa, setCurrentDespesa, clearEstatisticas } = despesaSlice.actions;
const __TURBOPACK__default__export__ = despesaSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/store/slices/dashboardSlice.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearDashboard",
    ()=>clearDashboard,
    "clearError",
    ()=>clearError,
    "default",
    ()=>__TURBOPACK__default__export__,
    "fetchEvolucaoPatrimonial",
    ()=>fetchEvolucaoPatrimonial,
    "fetchGraficoDespesasPorCategoria",
    ()=>fetchGraficoDespesasPorCategoria,
    "fetchGraficoReceitasDespesas",
    ()=>fetchGraficoReceitasDespesas,
    "fetchGraficoReceitasPorCategoria",
    ()=>fetchGraficoReceitasPorCategoria,
    "fetchResumoGeral",
    ()=>fetchResumoGeral
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@reduxjs+toolkit@2.9.0_react-redux@9.2.0_@types+react@18.3.26_react@18.3.1_redux@5.0.1__react@18.3.1/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/api.ts [app-client] (ecmascript)");
;
;
const initialState = {
    resumoGeral: null,
    graficoReceitasDespesas: null,
    graficoDespesasPorCategoria: null,
    graficoReceitasPorCategoria: null,
    evolucaoPatrimonial: null,
    isLoading: false,
    error: null
};
const fetchResumoGeral = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('dashboard/fetchResumoGeral', async (params = {}, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dashboardApi"].getResumoGeral(params);
        if (response.success && response.data) {
            return response.data;
        }
        return rejectWithValue(response.message || 'Erro ao buscar resumo geral');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar resumo geral');
    }
});
const fetchGraficoReceitasDespesas = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('dashboard/fetchGraficoReceitasDespesas', async (params = {}, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dashboardApi"].getGraficoReceitasDespesas(params);
        if (response.success && response.data) {
            const data = response.data;
            return {
                labels: data.map((item)=>`${item._id.mes}/${item._id.ano}`),
                receitas: data.map((item)=>item.receitas),
                despesas: data.map((item)=>item.despesas)
            };
        }
        return rejectWithValue(response.message || 'Erro ao buscar gráfico de receitas vs despesas');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar gráfico de receitas vs despesas');
    }
});
const fetchGraficoDespesasPorCategoria = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('dashboard/fetchGraficoDespesasPorCategoria', async (params = {}, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dashboardApi"].getGraficoDespesasPorCategoria(params);
        if (response.success && response.data) {
            const data = response.data;
            return {
                labels: data.map((item)=>item.nome),
                valores: data.map((item)=>item.total),
                cores: data.map((item)=>item.cor)
            };
        }
        return rejectWithValue(response.message || 'Erro ao buscar gráfico de despesas por categoria');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar gráfico de despesas por categoria');
    }
});
const fetchGraficoReceitasPorCategoria = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('dashboard/fetchGraficoReceitasPorCategoria', async (params = {}, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["receitaApi"].getEstatisticasReceitas(params);
        if (response.success && response.data) {
            const receitasPorCategoria = response.data.receitasPorCategoria || [];
            return {
                labels: receitasPorCategoria.map((cat)=>cat.nome),
                valores: receitasPorCategoria.map((cat)=>cat.total),
                cores: receitasPorCategoria.map((cat)=>cat.cor || '#6B7280')
            };
        }
        return rejectWithValue(response.message || 'Erro ao buscar gráfico de receitas por categoria');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar gráfico de receitas por categoria');
    }
});
const fetchEvolucaoPatrimonial = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('dashboard/fetchEvolucaoPatrimonial', async (params = {}, { rejectWithValue })=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dashboardApi"].getEvolucaoPatrimonial(params);
        if (response.success && response.data) {
            return response.data;
        }
        return rejectWithValue(response.message || 'Erro ao buscar evolução patrimonial');
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erro ao buscar evolução patrimonial');
    }
});
const dashboardSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'dashboard',
    initialState,
    reducers: {
        clearError: (state)=>{
            state.error = null;
        },
        clearDashboard: (state)=>{
            state.resumoGeral = null;
            state.graficoReceitasDespesas = null;
            state.graficoDespesasPorCategoria = null;
            state.graficoReceitasPorCategoria = null;
            state.evolucaoPatrimonial = null;
            state.error = null;
        }
    },
    extraReducers: (builder)=>{
        // Resumo Geral
        builder.addCase(fetchResumoGeral.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(fetchResumoGeral.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.resumoGeral = action.payload;
            state.error = null;
        }).addCase(fetchResumoGeral.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Gráfico Receitas vs Despesas
        builder.addCase(fetchGraficoReceitasDespesas.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(fetchGraficoReceitasDespesas.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.graficoReceitasDespesas = action.payload;
            state.error = null;
        }).addCase(fetchGraficoReceitasDespesas.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Gráfico Despesas por Categoria
        builder.addCase(fetchGraficoDespesasPorCategoria.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(fetchGraficoDespesasPorCategoria.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.graficoDespesasPorCategoria = action.payload;
            state.error = null;
        }).addCase(fetchGraficoDespesasPorCategoria.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Gráfico Receitas por Categoria
        builder.addCase(fetchGraficoReceitasPorCategoria.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(fetchGraficoReceitasPorCategoria.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.graficoReceitasPorCategoria = action.payload;
            state.error = null;
        }).addCase(fetchGraficoReceitasPorCategoria.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
        // Evolução Patrimonial
        builder.addCase(fetchEvolucaoPatrimonial.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        }).addCase(fetchEvolucaoPatrimonial.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.evolucaoPatrimonial = action.payload;
            state.error = null;
        }).addCase(fetchEvolucaoPatrimonial.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload;
        });
    }
});
const { clearError, clearDashboard } = dashboardSlice.actions;
const __TURBOPACK__default__export__ = dashboardSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/store/slices/uiSlice.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addToast",
    ()=>addToast,
    "clearAllLoading",
    ()=>clearAllLoading,
    "clearLoading",
    ()=>clearLoading,
    "clearToasts",
    ()=>clearToasts,
    "closeModal",
    ()=>closeModal,
    "default",
    ()=>__TURBOPACK__default__export__,
    "openModal",
    ()=>openModal,
    "removeToast",
    ()=>removeToast,
    "setLoading",
    ()=>setLoading,
    "setSidebarOpen",
    ()=>setSidebarOpen,
    "setTheme",
    ()=>setTheme,
    "toggleModal",
    ()=>toggleModal,
    "toggleSidebar",
    ()=>toggleSidebar,
    "toggleTheme",
    ()=>toggleTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@reduxjs+toolkit@2.9.0_react-redux@9.2.0_@types+react@18.3.26_react@18.3.1_redux@5.0.1__react@18.3.1/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
;
const isClient = ("TURBOPACK compile-time value", "object") !== 'undefined';
const initialState = {
    sidebarOpen: true,
    theme: ("TURBOPACK compile-time truthy", 1) ? localStorage.getItem('theme') || 'light' : "TURBOPACK unreachable",
    toasts: [],
    modals: {},
    loading: {}
};
const uiSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar: (state)=>{
            state.sidebarOpen = !state.sidebarOpen;
        },
        setSidebarOpen: (state, action)=>{
            state.sidebarOpen = action.payload;
        },
        setTheme: (state, action)=>{
            state.theme = action.payload;
            localStorage.setItem('theme', action.payload);
        },
        toggleTheme: (state)=>{
            state.theme = state.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', state.theme);
        },
        addToast: (state, action)=>{
            const toast = {
                ...action.payload,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
            };
            state.toasts.push(toast);
        },
        removeToast: (state, action)=>{
            state.toasts = state.toasts.filter((toast)=>toast.id !== action.payload);
        },
        clearToasts: (state)=>{
            state.toasts = [];
        },
        openModal: (state, action)=>{
            state.modals[action.payload] = true;
        },
        closeModal: (state, action)=>{
            state.modals[action.payload] = false;
        },
        toggleModal: (state, action)=>{
            state.modals[action.payload] = !state.modals[action.payload];
        },
        setLoading: (state, action)=>{
            const { key, loading } = action.payload;
            state.loading[key] = loading;
        },
        clearLoading: (state, action)=>{
            delete state.loading[action.payload];
        },
        clearAllLoading: (state)=>{
            state.loading = {};
        }
    }
});
const { toggleSidebar, setSidebarOpen, setTheme, toggleTheme, addToast, removeToast, clearToasts, openModal, closeModal, toggleModal, setLoading, clearLoading, clearAllLoading } = uiSlice.actions;
const __TURBOPACK__default__export__ = uiSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/store/index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "store",
    ()=>store
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@reduxjs+toolkit@2.9.0_react-redux@9.2.0_@types+react@18.3.26_react@18.3.1_redux@5.0.1__react@18.3.1/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$slices$2f$authSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/slices/authSlice.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$slices$2f$categoriaSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/slices/categoriaSlice.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$slices$2f$bancoSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/slices/bancoSlice.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$slices$2f$cartaoSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/slices/cartaoSlice.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$slices$2f$receitaSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/slices/receitaSlice.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$slices$2f$despesaSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/slices/despesaSlice.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$slices$2f$dashboardSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/slices/dashboardSlice.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$slices$2f$uiSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/slices/uiSlice.ts [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
const store = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$reduxjs$2b$toolkit$40$2$2e$9$2e$0_react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["configureStore"])({
    reducer: {
        auth: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$slices$2f$authSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        categoria: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$slices$2f$categoriaSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        banco: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$slices$2f$bancoSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        cartao: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$slices$2f$cartaoSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        receita: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$slices$2f$receitaSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        despesa: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$slices$2f$despesaSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        dashboard: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$slices$2f$dashboardSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        ui: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$slices$2f$uiSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
    },
    middleware: (getDefaultMiddleware)=>getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    'persist/PERSIST'
                ]
            }
        })
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/providers/ReduxProvider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ReduxProvider",
    ()=>ReduxProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1$2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react-redux@9.2.0_@types+react@18.3.26_react@18.3.1_redux@5.0.1/node_modules/react-redux/dist/react-redux.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/index.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$slices$2f$authSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/slices/authSlice.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function ReduxProvider({ children }) {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ReduxProvider.useEffect": ()=>{
            // Inicializar autenticação se houver token válido
            const token = localStorage.getItem('token');
            if (token) {
                console.log('🚀 Inicializando autenticação com token existente');
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["store"].dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$slices$2f$authSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initializeAuth"])());
            }
        }
    }["ReduxProvider.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$redux$40$9$2e$2$2e$0_$40$types$2b$react$40$18$2e$3$2e$26_react$40$18$2e$3$2e$1_redux$40$5$2e$0$2e$1$2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Provider"], {
        store: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["store"],
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/providers/ReduxProvider.tsx",
        lineNumber: 18,
        columnNumber: 10
    }, this);
}
_s(ReduxProvider, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = ReduxProvider;
var _c;
__turbopack_context__.k.register(_c, "ReduxProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_0f6c7830._.js.map