import { Outlet } from 'react-router-dom';
import Header from './UI/Header';
import Footer from './UI/Footer';
import './Layout.css';

const Layout = () => {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <div className="container">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;