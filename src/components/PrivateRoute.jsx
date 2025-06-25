import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    // Not logged in — redirect to login
    return <Navigate to="/login" replace />;
  }

  // Otherwise render the requested component
  return children;
};

export default PrivateRoute;