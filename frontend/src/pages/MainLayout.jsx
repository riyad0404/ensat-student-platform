import Sidebar from "../components/Sidebar.jsx";
import { Outlet, useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import "../styles/MainLayout.css";

const MainLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        {/* BOÎTE 1 : La barre qui RESTE en haut quoi qu'il arrive */}
        <div className="sticky-header">
          <div className="header-limit">
             <TopBar onAddPost={() => navigate('/?create=1')} />
          </div>
        </div>
        
        {/* BOÎTE 2 : La zone qui défile dessous */}
        <div className="scroll-content">
          <div className="page-container">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;