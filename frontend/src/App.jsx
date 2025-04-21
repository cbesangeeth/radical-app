import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import ExpenseList from './pages/ExpenseList';
import ExpenseForm from './pages/ExpenseForm';
import Summary from './pages/Summary';
import Navbar from './components/Navbar';

const basename =  '';

function App() {
  return (
    <Router basename={basename}>
      <Container
        sx={{
          minHeight: '100vh',
          backgroundColor: '#ffffff',
          py: { xs: 2, sm: 4 }, // Responsive padding
          px: { xs: 1, sm: 2 }, // Responsive padding
        }}
        disableGutters
      >
        <Navbar />
        <Routes>
          <Route path="/" element={<ExpenseList />} />
          <Route path="/add" element={<ExpenseForm />} />
          <Route path="/edit/:id" element={<ExpenseForm />} />
          <Route path="/summary" element={<Summary />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;