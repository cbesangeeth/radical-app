import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { setSessionStorage } from '../utils/sessionStorageUtil';
import { performLogout } from '../utils/auth';

function Navbar() {
  const navigate = useNavigate();
  
  function handleLogout(){
    performLogout();
    navigate('/')
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
        <Button color="inherit" component={Link} to="/dashboard">
          Expense Tracker
        </Button>
        </Typography>
        <Button color="inherit" component={Link} to="/list">
          Expenses
        </Button>
        <Button color="inherit" component={Link} to="/list-enhanced">
          Enhanced Expenses
        </Button>
        <Button color="inherit" component={Link} to="/add">
          Add Expense
        </Button>
         <Button color="inherit" component={Link} to="/bulk-add">
          Bulk Add
        </Button>
        <Button color="inherit" component={Link} to="/summary">
          Summary
        </Button> 
        <Button color="inherit" onClick={handleLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;