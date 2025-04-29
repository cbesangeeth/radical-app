import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const ProtectedRoutes = () => {
  const isAuthenticated = sessionStorage.getItem("isAuthenticated") === "true" && sessionStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated && location.pathname !== "/") {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  return <Outlet></Outlet>;
};

export default ProtectedRoutes;
