import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './i18n';
import Layout from './layouts/Layout';
import HomePage from './views/HomePage';
import LoginPage from './views/LoginPage';
import RegisterPage from './views/RegisterPage';
import SettingsPage from './views/SettingsPage';
import NotFoundPage from './views/NotFoundPage';
import ForgotPasswordPage from './views/ForgotPasswordPage';
import ResetPasswordPage from './views/ResetPasswordPage';

// Rutas de la app (reutilizables)
const AppRoutes = () => (
  <>
    <Route index element={<HomePage />} />
    <Route path="login" element={<LoginPage />} />
    <Route path="register" element={<RegisterPage />} />
    <Route path="forgot-password" element={<ForgotPasswordPage />} />
    <Route path="reset-password" element={<ResetPasswordPage />} />
    <Route path="settings" element={<SettingsPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </>
);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas en inglés (default) - sin prefijo */}
        <Route path="/" element={<Layout />}>
          {AppRoutes()}
        </Route>

        {/* Rutas con prefijo de idioma */}
        <Route path="/:lang" element={<Layout />}>
          {AppRoutes()}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
