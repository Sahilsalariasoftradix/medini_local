import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { firebaseAuth } from "../firebase/BaseConfig";

import { getUserDetails } from "../firebase/AuthService";
import { IBooking } from "../utils/Interfaces";

interface IAuthContextType {
  user: User | null;
  userDetails: any;
  loading: boolean;
  logout: () => Promise<void>;
  setUserDetails: any;
  socketData: any;
  socket: WebSocket | null;
  connectionStatus: "connecting" | "connected" | "disconnected";
  message: string;
  setMessage: (message: string) => void;
}
const AuthContext = createContext<IAuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<any>(undefined);
  const [socketData, setSocketData] = useState<IBooking[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [message, setMessage] = useState("");
  //@ts-ignore
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("disconnected");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const details = await getUserDetails(user.uid);
          setUserDetails(details);
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      } else {
        setUserDetails(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // const signIn = async (email: string, password: string) => {
  //   setLoading(true);
  //   try {
  //     await signInWithEmail(email, password);
  //   } catch (error) {
  //     setLoading(false);
  //     throw error;
  //   }
  // };

  const logout = async () => {
    await signOut(firebaseAuth);
  };

  // Setup WebSocket connection
  useEffect(() => {
    // Create WebSocket connection
    const ws = new WebSocket(import.meta.env.VITE_MEDINI_WEBSOCKET_URL);
    setSocket(ws);
    setConnectionStatus("connecting");

    // Connection opened
    ws.onopen = () => {
      console.log("WebSocket connected");
      setConnectionStatus("connected");

      // Send user ID when connection is established
      if (userDetails?.user_id) {
        const payload = {
          user_id: userDetails.user_id,
        };
        ws.send(JSON.stringify(payload));
      }
    };

    // Listen for messages
    ws.onmessage = (event) => {
      if (event.data) {
        try {
          const data = JSON.parse(event.data);
          console.log("Message from server:", data);
          if (data?.payload) {
            setSocketData((prevMessages) => {
              const isDuplicate = prevMessages.some(
                (msg) =>
                  msg.booking_id === data.payload.booking_id ||
                  msg.phone === data.payload.phone
              );

              return isDuplicate
                ? prevMessages
                : [...prevMessages, data.payload];
            });
          }
        } catch (error) {
          console.log("Received non-JSON message:", event.data);
          // Handle non-JSON messages if needed
        }
      }
    };

    // Handle errors
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus("disconnected");
    };

    // Handle connection closing
    ws.onclose = () => {
      console.log("WebSocket connection closed");
      setConnectionStatus("disconnected");
    };

    //* Cleanup function to close socket when component unmounts
    return () => {
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close();
      }
    };
  }, [userDetails?.user_id]); // Reconnect if user ID changes
  return (
    <AuthContext.Provider
      value={{
        user,
        userDetails,
        loading,
        logout,
        setUserDetails,
        socketData,
        socket,
        connectionStatus,
        message,
        setMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
