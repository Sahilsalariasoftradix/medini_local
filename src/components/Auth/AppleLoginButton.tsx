import { Button, Typography } from "@mui/material";
import { AppleIcon } from "../../utils/Icons";
import { signInWithApple } from "../../firebase/AuthService";
import { useAuthHook } from "../../hooks/useAuth";
import { useAuth } from "../../store/AuthContext";
import { routes } from "../../utils/links";
import { useState } from "react";

const AppleLoginButton = () => {
  const { text, navigate } = useAuthHook();
  const { setUserDetails } = useAuth();
  //@ts-ignore
  const [loading, setLoading] = useState(false);
  const handleAppleSignIn = async () => {
    try {
      await signInWithApple(setUserDetails, setLoading);
      setTimeout(() => {
        navigate(routes.sidebar.bookings.link);
      }, 2000);
    } catch (error: any) {
      console.error("Apple Sign-In Failed:", error.message);
    }
  };

  return (
    <Button
      fullWidth
      variant="outlined"
      startIcon={AppleIcon}
      onClick={handleAppleSignIn}
      sx={{ py: 1 }}
    >
      <Typography
        variant="bodyMediumMedium"
        sx={{
          clear: "both",
          display: "inline-block",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        {text.appleSignInButton}
      </Typography>
    </Button>
  );
};

export default AppleLoginButton;
