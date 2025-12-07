import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CreateCapsule from "./pages/CreateCapsule";
import ViewCapsule from "./pages/ViewCapsule";
import UnlockCapsule from "./pages/UnlockCapsule";
import CapsuleOpened from "./pages/CapsuleOpened";
import CertificatePage from "./pages/CertificatePage";
import Timeline from "./pages/Timeline";
import HomePage from "./pages/HomePage";
import CapsuleDetails from './pages/CapsuleDetails';


import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

// ⭐ Correct Path of AppLayout
import AppLayout from "./layout/AppLayout";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* -------------------------
             PUBLIC ROUTES (NO NAVBAR)
          -------------------------- */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* -------------------------
             PROTECTED ROUTES (WITH NAVBAR)
             Everything inside AppLayout
          -------------------------- */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <HomePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CreateCapsule />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/timeline"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Timeline />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* -------------------------
             PUBLIC SHARE ROUTES
             (NO NAVBAR)
          -------------------------- */}
          <Route path="/capsule/:token" element={<ViewCapsule />} />
          <Route path="/unlock-capsule/:token" element={<UnlockCapsule />} />
          <Route path="/capsule/opened" element={<CapsuleOpened />} />
          <Route path="/certificate/:id" element={<CertificatePage />} />
          <Route path="/capsule-details/:id" element={<CapsuleDetails />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
