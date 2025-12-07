import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";

export default function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace={false} />;
  }
  return children;
}
