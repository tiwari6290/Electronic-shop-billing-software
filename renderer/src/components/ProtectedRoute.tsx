import { Navigate } from "react-router-dom";

interface Props {
  children: JSX.Element;
  allowedRole: string;
}

const ProtectedRoute = ({ children, allowedRole }: Props) => {
  const role = localStorage.getItem("role");

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;