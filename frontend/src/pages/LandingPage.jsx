import { useEffect  } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
} from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import { setSessionStorage } from "../utils/sessionStorageUtil";
import { googleOauth } from "../utils/api/userApi";


function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
   
  }, []);


  async function handleLoginSuccess(response){
    console.log(response);
    // call backend api to validate the response
    const oauthResponse = await googleOauth({credential: response.credential})
    setSessionStorage("isAuthenticated", true)
    setSessionStorage("token", oauthResponse?.token)
    navigate("/dashboard")
  }

  return (
    <Box>
      The Radical
      <div>
        The Radical is a personal expense tracker to manage and understand the financal status.
      </div>
      <Typography>
        <GoogleLogin onSuccess={handleLoginSuccess} onError={()=> console.log("Login failed")}></GoogleLogin>
      </Typography>
    </Box>
  );
}

export default LandingPage;
