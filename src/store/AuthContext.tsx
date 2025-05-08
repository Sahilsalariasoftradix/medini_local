import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { firebaseAuth } from "../firebase/BaseConfig";

import { getMessages, getUserDetails } from "../firebase/AuthService";
import { IBooking, ICompany, IUserDetails } from "../utils/Interfaces";
import { getCompany } from "../api/userApi";

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
  messages: any[];
  setMessages: (messages: any[]) => void;
  companyDetails: ICompany | null;
  setCompanyDetails: (companyDetails: ICompany | null) => void;
  loadingCompanyDetails: boolean;
  setLoadingCompanyDetails: (loadingCompanyDetails: boolean) => void;
  timer: number;
  setTimer: (timer: number) => void;
  newUserInfo: IUserDetails[] | null;
  setNewUserInfo: (newUserInfo: IUserDetails[] | null) => void;
  refreshUserDetails: () => Promise<void>;
  selectedUserId: string | null;
  selectedUser: IUserDetails | null;
  setSelectedUser: (userId: string) => void;
  clearSelectedUser: () => void;
}
const AuthContext = createContext<IAuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<any>(undefined);
  const [newUserInfo, setNewUserInfo] = useState<IUserDetails[] | null>(
    userDetails?.users
  );
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    localStorage.getItem("selectedUserId")
  );

  const [timer, setTimer] = useState(60000);

  //@ts-ignore
  const [socketData, setSocketData] = useState<IBooking[]>([]);
  //@ts-ignore
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingCompanyDetails, setLoadingCompanyDetails] = useState(true);
  const [companyDetails, setCompanyDetails] = useState<ICompany | null>(null);
  //@ts-ignore
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("disconnected");

  useEffect(() => {
    if (userDetails?.users) {
      setNewUserInfo(userDetails.users);
    }
  }, [userDetails?.users]);

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

  const fetchCompanyDetails = async () => {
    try {
      const resp = await getCompany(userDetails.company_id);
      setCompanyDetails(resp);
    } catch (error) {
      console.error("Error fetching company details:", error);
    } finally {
      setLoadingCompanyDetails(false);
    }
  };

  //* Fetch company details
  useEffect(() => {
    setLoadingCompanyDetails(true);
    if (!userDetails?.company_id) return;

    // Initial fetch
    fetchCompanyDetails();

    // Set up interval to fetch every 60 seconds
    const intervalId = setInterval(() => {
      fetchCompanyDetails();
    }, timer);

    return () => clearInterval(intervalId);
  }, [userDetails?.company_id]);

  useEffect(() => {
    if (!userDetails?.user_id) return;
    const unsubscribe = getMessages(
      { userId: userDetails.user_id },
      (messages) => {
        setMessages(messages);
      },
      (error) => {
        console.error("Error fetching messages:", error);
      }
    );

    return () => {
      unsubscribe(); // cleanup on unmount or when user_id changes
    };
  }, [userDetails?.user_id]);

  const logout = async () => {
    await signOut(firebaseAuth);
  };

  // Setup WebSocket connection
  // useEffect(() => {
  //   // Create WebSocket connection
  //   const ws = new WebSocket(import.meta.env.VITE_MEDINI_WEBSOCKET_URL);
  //   setSocket(ws);
  //   setConnectionStatus("connecting");

  //   // Connection opened
  //   ws.onopen = () => {
  //     console.log("WebSocket connected");
  //     setConnectionStatus("connected");

  //     // Send user ID when connection is established
  //     if (userDetails?.user_id) {
  //       const payload = {
  //         user_id: userDetails.user_id,
  //       };
  //       ws.send(JSON.stringify(payload));
  //     }
  //   };

  //   // Listen for messages
  //   ws.onmessage = (event) => {
  //     if (event.data) {
  //       try {
  //         const data = JSON.parse(event.data);
  //         console.log("Message from server:", data);
  //         if (data?.payload) {
  //           setSocketData((prevMessages) => {
  //             const isDuplicate = prevMessages.some(
  //               (msg) =>
  //                 msg.booking_id === data.payload.booking_id ||
  //                 msg.phone === data.payload.phone
  //             );

  //             return isDuplicate
  //               ? prevMessages
  //               : [...prevMessages, data.payload];
  //           });
  //         }
  //       } catch (error) {
  //         console.log("Received non-JSON message:", event.data);
  //         // Handle non-JSON messages if needed
  //       }
  //     }
  //   };

  //   // Handle errors
  //   ws.onerror = (error) => {
  //     console.error("WebSocket error:", error);
  //     setConnectionStatus("disconnected");
  //   };

  //   // Handle connection closing
  //   ws.onclose = () => {
  //     console.log("WebSocket connection closed");
  //     setConnectionStatus("disconnected");
  //   };

  //   //* Cleanup function to close socket when component unmounts
  //   return () => {
  //     if (
  //       ws.readyState === WebSocket.OPEN ||
  //       ws.readyState === WebSocket.CONNECTING
  //     ) {
  //       ws.close();
  //     }
  //   };
  // }, [userDetails?.user_id]);
  // Reconnect if user ID changes

  // Add this function to refresh user details
  const refreshUserDetails = async () => {
    if (!user) return;

    try {
      const details = await getUserDetails(user.uid);
      setUserDetails(details);
    } catch (error) {
      console.error("Error refreshing user details:", error);
    }
  };

  // Set selected user and store in localStorage
  const setSelectedUser = (userId: string) => {
    localStorage.setItem("selectedUserId", userId);
    setSelectedUserId(userId);
  };

  // Clear selected user from state and localStorage
  const clearSelectedUser = () => {
    localStorage.removeItem("selectedUserId");
    setSelectedUserId(null);
  };

  // Automatically select the first user if none is selected when users are loaded
  useEffect(() => {
    if (newUserInfo && newUserInfo.length > 0 && !selectedUserId) {
      // If there are users but none is selected, select the first one
      setSelectedUser(newUserInfo[0].user_id.toString());
    }
  }, [newUserInfo, selectedUserId]);

  // Make sure the selected user ID is a string since we're comparing it in the useMemo
  const selectedUser = useMemo(() => {
    if (!selectedUserId || !newUserInfo) return null;
    return (
      newUserInfo.find((user) => user.user_id.toString() === selectedUserId) ||
      null
    );
  }, [selectedUserId, newUserInfo]);

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
        messages,
        setMessages,
        companyDetails,
        setCompanyDetails,
        loadingCompanyDetails,
        setLoadingCompanyDetails,
        timer,
        setTimer,
        newUserInfo,
        setNewUserInfo,
        refreshUserDetails,
        selectedUserId,
        selectedUser,
        setSelectedUser,
        clearSelectedUser,
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
