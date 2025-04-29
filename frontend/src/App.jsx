import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Container } from "@mui/material";
import ExpenseList from "./pages/ExpenseList";
import ExpenseForm from "./pages/ExpenseForm";
import Summary from "./pages/Summary";
import LandingPage from "./pages/LandingPage";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import ProtectedRoutes from "./ProtectedRoutes";

const basename = "";

function AppNavbar() {
  const location = useLocation();
  return location.pathname !== "/" ? <Navbar /> : null;
}

function App() {
  return (
    <Router basename={basename}>
      <Container
        sx={{
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          py: { xs: 2, sm: 4 }, // Responsive padding
          px: { xs: 1, sm: 2 }, // Responsive padding
        }}
        disableGutters
      >
        <AppNavbar></AppNavbar>
        <Routes>
          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/list" element={<ExpenseList />} />
            <Route path="/add" element={<ExpenseForm />} />
            <Route path="/edit/:id" element={<ExpenseForm />} />
            <Route path="/summary" element={<Summary />} />
          </Route>
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
