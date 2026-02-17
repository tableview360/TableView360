import { Outlet } from 'react-router-dom';
import Header from '../components/header/Header';
import { useLanguage } from '../hooks/useLanguage';

const Layout = () => {
  // Sincroniza el idioma con la URL
  useLanguage();

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
