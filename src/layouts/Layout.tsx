import { Outlet } from 'react-router-dom';
import Header from '../components/header/Header';

const Layout = () => {
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
