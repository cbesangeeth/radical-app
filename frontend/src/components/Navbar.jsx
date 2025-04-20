import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
        <Button color="inherit" component={Link} to="/">
          Expense Tracker
        </Button>
        </Typography>
        <Button color="inherit" component={Link} to="/">
          Expenses
        </Button>
        <Button color="inherit" component={Link} to="/add">
          Add Expense
        </Button>
        <Button color="inherit" component={Link} to="/summary">
          Summary
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;