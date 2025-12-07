// src/layout/AppLayout.jsx
import Navbar from "../components/Navbar";
import './AppLayout.css';

export default function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      
      <main className="app-main">
        {children}
      </main>
    </div>
  );
}