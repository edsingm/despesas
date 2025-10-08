import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { Toaster } from "sonner";
import AuthGuard from "./components/AuthGuard";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Receitas from "./pages/Receitas";
import Despesas from "./pages/Despesas";
import Categorias from "./pages/Categorias";
import Bancos from "./pages/Bancos";
import Cartoes from "./pages/Cartoes";

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Rotas protegidas */}
            <Route path="/" element={
              <AuthGuard>
                <Layout>
                  <Dashboard />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/receitas" element={
              <AuthGuard>
                <Layout>
                  <Receitas />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/despesas" element={
              <AuthGuard>
                <Layout>
                  <Despesas />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/categorias" element={
              <AuthGuard>
                <Layout>
                  <Categorias />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/bancos" element={
              <AuthGuard>
                <Layout>
                  <Bancos />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/cartoes" element={
              <AuthGuard>
                <Layout>
                  <Cartoes />
                </Layout>
              </AuthGuard>
            } />
          </Routes>
          <Toaster position="top-right" richColors />
        </div>
      </Router>
    </Provider>
  );
}
