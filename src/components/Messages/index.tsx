import { Avatar, Box, Typography, IconButton } from "@mui/material";

import { useState, useEffect } from "react";
import CommonButton from "../common/CommonButton";
import emojiIcon from "../../assets/icons/mood-smile.svg";
import file from "../../assets/icons/link.svg";
import photo from "../../assets/icons/photo.svg";
import share from "../../assets/icons/share.svg";
import search from "../../assets/icons/Search.svg";
import CommonTextField from "../common/CommonTextField";
import useDebounce from "../../hooks/useDebounce";
import { useAuth } from "../../store/AuthContext";
const sidebarStyles = {
  width: 350,
  borderRight: "1px solid #E2E8F0",
  overflow: "auto",
  display: { xs: "none", sm: "block" },
  scrollbarWidth: "thin",
  scrollbarColor: "transparent transparent",
  "&::-webkit-scrollbar": {
    width: 8,
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "transparent",
    borderRadius: 4,
    transition: "background-color 0.2s",
  },
  "&:hover::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  "&:hover": {
    scrollbarColor: "rgba(0,0,0,0.2) transparent",
  },
};
const messageAreaStyles = {
  flexGrow: 1,
  py: 2,
  px: 4,
  overflowY: "auto",
  "&::-webkit-scrollbar": {
    width: "8px",
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "transparent",
    borderRadius: "4px",
    transition: "background-color 0.2s",
  },
  scrollbarWidth: "thin",
  scrollbarColor: "transparent transparent",
  "&:hover": {
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(0,0,0,0.2)",
    },
    scrollbarColor: "rgba(0,0,0,0.2) transparent",
  },
};

const Messages = () => {
  const [message, setMessage] = useState("");
  const [searchValue, setSearchValue] = useState<string>("");
    //@ts-ignore
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const { userDetails } = useAuth();
  const [socketData, setSocketData] = useState<any>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  //@ts-ignore
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("disconnected");

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
          setSocketData(data?.payload);
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

  const handleSend = () => {
    if (message.trim() && socket && socket.readyState === WebSocket.OPEN) {
      // Create message payload
      const messagePayload = {
        type: "message",
        content: message,
        // Add any other required fields
      };

      // Send the message
      socket.send(JSON.stringify(messagePayload));
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "calc(100vh - 140px)",
        borderTop: "1px solid #E2E8F0",
      }}
    >
      {/* Left sidebar - contact list */}
      <Box sx={sidebarStyles}>
        <Box sx={{ p: 2 }}>
          <CommonTextField
            placeholder="Search..."
            startIcon={<img src={search} alt="search" />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </Box>

        {/* Contact list items */}
        <Box
          sx={{
            display: "flex",
            p: 2,
            borderBottom: "1px solid #f5f5f5",
            cursor: "pointer",
            "&:hover": {
              bgcolor: "rgba(0, 0, 0, 0.04)",
            },
            // Highlight active chat - can be controlled with state
          }}
        >
          <Avatar sx={{ width: 40, height: 40 }}>
            {socketData?.first_name.charAt(0)} {socketData?.last_name.charAt(0)}
          </Avatar>
          <Box sx={{ ml: 1.5, overflow: "hidden", flexGrow: 1 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="bodyLargeExtraBold" noWrap>
                {socketData?.first_name} {socketData?.last_name}
              </Typography>
              <Typography variant="bodyMediumMedium">
                {socketData?.start_time}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* <Typography
                variant="bodyMediumMedium"
                noWrap
                sx={{
                  maxWidth: "150px",
                  ...(contact.unreadCount > 0
                    ? { fontWeight: 500, color: "text.primary" }
                    : {}),
                }}
              >
                {contact.lastMessage}
              </Typography> */}
            </Box>
          </Box>
        </Box>
        {/* <Box>
          {mockContacts
            .filter((contact) =>
              contact.name
                .toLowerCase()
                .includes(debouncedSearchValue.toLowerCase())
            )
            .map((contact) => (
              <Box
                key={contact.id}
                sx={{
                  display: "flex",
                  p: 2,
                  borderBottom: "1px solid #f5f5f5",
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "rgba(0, 0, 0, 0.04)",
                  },
                  // Highlight active chat - can be controlled with state
                  ...(contact.id === 3
                    ? { bgcolor: "rgba(0, 0, 0, 0.04)" }
                    : {}),
                }}
              >
                <Avatar
                  sx={{ bgcolor: contact.avatarColor, width: 40, height: 40 }}
                >
                  {contact.name.charAt(0)}
                </Avatar>
                <Box sx={{ ml: 1.5, overflow: "hidden", flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="bodyLargeExtraBold" noWrap>
                      {contact.name}
                    </Typography>
                    <Typography variant="bodyMediumMedium">
                      {contact.time}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="bodyMediumMedium"
                      noWrap
                      sx={{
                        maxWidth: "150px",
                        ...(contact.unreadCount > 0
                          ? { fontWeight: 500, color: "text.primary" }
                          : {}),
                      }}
                    >
                      {contact.lastMessage}
                    </Typography>
                    {contact.unreadCount > 0 && (
                      <Box
                        sx={{
                          bgcolor: "primary.main",
                          color: "white",
                          borderRadius: "50%",
                          width: 20,
                          height: 20,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                        }}
                      >
                        {contact.unreadCount}
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            ))}
        </Box> */}
      </Box>

      {/* Right side - chat area */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Chat header */}
        <Box
          sx={{
            px: 4,
            py: 3,
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ bgcolor: "#f50057", mr: 2 }}>
            {socketData?.first_name.charAt(0)} {socketData?.last_name.charAt(0)}
          </Avatar>
          <Typography variant="subtitle1" fontWeight="bold">
            {socketData?.first_name} {socketData?.last_name}
          </Typography>
        </Box>

        {/* Messages area */}
        <Box sx={messageAreaStyles}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",

              alignItems: socketData?.isUser ? "flex-end" : "flex-start",
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: socketData?.isUser ? "flex-end" : "flex-start",
              }}
            >
              {/* {!msg.isUser && (
                  <Avatar
                    sx={{ width: 32, height: 32, mr: 1, bgcolor: "#9c27b0" }}
                  >
                    {msg.sender.charAt(0)}
                  </Avatar>
                )} */}
              {socketData?.isUser && (
                <IconButton size="small" sx={{ ml: 1, opacity: 0.6 }}>
                  <img src={share} alt="share" />
                </IconButton>
              )}
              {socketData && (
                <Box
                  sx={{
                    maxWidth: "70%",
                    p: 1.5,
                    borderRadius: "16px",
                    borderBottomRightRadius: 0,
                    bgcolor: socketData?.isUser ? "primary.main" : "grey.100",
                    color: socketData?.isUser ? "white" : "inherit",
                  }}
                >
                  <Typography variant="body1">
                    New booking from {socketData?.first_name}{" "}
                    {socketData?.last_name} on {socketData?.date}
                  </Typography>
                </Box>
              )}

              {!socketData?.isUser && (
                <IconButton size="small" sx={{ ml: 1, opacity: 0.6 }}>
                  <img src={share} alt="share" />
                </IconButton>
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",

                mt: 0.5,
                ml: socketData?.isUser ? 0 : 0,
              }}
            >
              {!socketData?.isUser && (
                <Typography
                  variant="bodySmallExtraBold"
                  sx={{ mx: 1, mb: 0.5 }}
                >
                  {socketData?.sender}
                </Typography>
              )}

              <Typography variant="bodySmallMedium" color="grey.500">
                {socketData?.timestamp}{" "}
              </Typography>
              <Typography variant="bodySmallExtraBold" ml={1}>
                {socketData?.isUser && "You"}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Message input area */}
        <Box sx={{ px: 6 }}>
          <CommonTextField
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
        </Box>
        <Box
          sx={{
            py: 2,
            px: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <IconButton>
              <img src={photo} alt="photo" />
            </IconButton>
            <IconButton>
              <img src={file} alt="file" />
            </IconButton>
            <IconButton>
              <img src={emojiIcon} alt="emoji" />
            </IconButton>
          </Box>

          <CommonButton
            text="Send"
            onClick={handleSend}
            disabled={!message.trim()}
            sx={{ width: "150px" }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Messages;
