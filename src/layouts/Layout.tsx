import { Outlet } from 'react-router-dom';
import Header from '../components/header/Header';
import { useLanguage } from '../hooks/useLanguage';

interface LayoutProps {
  children?: React.ReactNode;
  standalone?: boolean;
}

const Layout = ({ children, standalone = false }: LayoutProps) => {
  useLanguage(!standalone);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        {standalone ? children : <Outlet />}
      </main>
    </>
  );
};

export default Layout;
