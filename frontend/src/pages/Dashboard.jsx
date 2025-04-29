import { useEffect  } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
} from "@mui/material";

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
   
  }, []);


  return (
    <Box>
      <Typography>
        Dashboard
      </Typography>
    </Box>
  );
}

export default Dashboard;
