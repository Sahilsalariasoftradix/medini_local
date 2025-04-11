import { Avatar, Box, Typography, IconButton } from "@mui/material";

import { useState } from "react";
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
  minWidth: 350,
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
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).slice(-2);
  }
  return color;
};

const Messages = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [messageHistory, setMessageHistory] = useState<{
    [contactId: string]: any[];
  }>({});

  //@ts-ignore
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const { socketData, socket, message, setMessage,userDetails } = useAuth();
console.log(socketData)
  const handleSend = () => {
    if (
      message.trim() &&
      socket &&
      socket.readyState === WebSocket.OPEN &&
      selectedContact
    ) {
      // Create message payload
      const messagePayload = {
        type: "message",
        content: message,
        recipient: selectedContact?.id,
        name: selectedContact?.first_name,
      };

      // Create a message object for the UI
      const newMessage = {
        id: Date.now().toString(),
        content: message,
        sender: "You",
        isUser: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Update message history
      setMessageHistory((prev) => ({
        ...prev,
        [selectedContact.booking_id]: [
          ...(prev[selectedContact.booking_id] || []),
          newMessage,
        ],
      }));

      // Send the message
      socket.send(JSON.stringify(messagePayload));
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const handleContactSelect = (contact: any) => {
    setSelectedContact(contact);

    // Check if there are no messages for this contact yet
    if (
      !messageHistory[contact.booking_id] ||
      messageHistory[contact.booking_id].length === 0
    ) {
      // Add the initial booking message
      const bookingMessage = {
        id: Date.now().toString(),
        content: "booked", // Special marker to trigger the custom formatting
        sender: contact.first_name,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessageHistory((prev) => ({
        ...prev,
        [contact.booking_id]: [bookingMessage],
      }));
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
        <Box>
          {socketData &&
            socketData.length > 0 &&
            socketData
              .filter((contact: any) =>
                contact.first_name
                  .toLowerCase()
                  .includes(debouncedSearchValue.toLowerCase())
              )
              .map((contact: any) => (
                <Box
                  key={contact.booking_id}
                  sx={{
                    display: "flex",
                    p: 2,
                    borderBottom: "1px solid #f5f5f5",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "rgba(0, 0, 0, 0.04)",
                    },
                    // Highlight active chat based on selected contact
                    ...(selectedContact?.booking_id === contact.booking_id
                      ? { bgcolor: "rgba(0, 0, 0, 0.04)" }
                      : {}),
                  }}
                  onClick={() => handleContactSelect(contact)}
                >
                  <Avatar
                    sx={{
                      bgcolor: stringToColor(
                        contact.first_name + contact.last_name
                      ),
                      width: 40,
                      height: 40,
                    }}
                  >
                    {contact.first_name.charAt(0)} 
                    {contact.last_name.charAt(0)}
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
                        {contact.first_name} {' '}
                        {contact.last_name}
                      </Typography>
                      <Typography variant="bodyMediumMedium">
                        {contact.start_time}
                      </Typography>
                    </Box>
                    {/* <Box
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
                  </Box> */}
                  </Box>
                </Box>
              ))}
          {socketData && socketData.length === 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "calc(100vh - 320px)",
              }}
            >
              <Typography variant="bodyLargeExtraBold">
                No messages yet
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Right side - chat area */}
      {selectedContact ? (
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
              {selectedContact.first_name.charAt(0)}{" "}
              {selectedContact.last_name.charAt(0)}
            </Avatar>
            <Typography variant="subtitle1" fontWeight="bold">
              {selectedContact.first_name}
              {selectedContact.last_name}
            </Typography>
          </Box>

          {/* Messages area */}
          <Box sx={messageAreaStyles}>
            {selectedContact &&
              (messageHistory[selectedContact.booking_id]?.length > 0 ? (
                messageHistory[selectedContact.booking_id].map((msg) => (
                  <Box
                    key={msg.id}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: msg.isUser ? "flex-end" : "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: msg.isUser ? "flex-end" : "flex-start",
                      }}
                    >
                      {/* {!msg.isUser && (
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            mr: 1,
                            bgcolor: stringToColor(
                              selectedContact.first_name +
                                selectedContact.last_name
                            ),
                          }}
                        >
                          {selectedContact.first_name.charAt(0)}
                        </Avatar>
                      )} */}
                      <Box
                        sx={{
                          maxWidth: "70%",
                          p: 1.5,
                          borderRadius: "16px",
                          borderBottomRightRadius: msg.isUser ? 0 : "16px",
                          borderBottomLeftRadius: msg.isUser ? "16px" : 0,
                          bgcolor: msg.isUser ? "primary.main" : "grey.100",
                          color: msg.isUser ? "white" : "inherit",
                        }}
                      >
                        {!msg.isUser && msg.content.includes("booked") ? (
                          <Typography variant="body1">
                            Hey! I just booked this patient{" "}
                            {selectedContact.first_name}{" "}
                            {selectedContact.last_name} for an appointment on{" "}
                            {selectedContact.date} at{" "}
                            {selectedContact.start_time} o'clock with
                           {' '} {userDetails?.firstName}
                          </Typography>
                        ) : (
                          <Typography variant="body1">{msg.content}</Typography>
                        )}
                      </Box>
                      {msg.isUser && (
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
                        gap: 1,
                        ml: msg.isUser ? 0 : 0,
                      }}
                    >
                      <Typography variant="bodySmallExtraBold" ml={1}>
                        {msg.isUser ? "You" : selectedContact.first_name}
                      </Typography>
                      <Typography variant="bodySmallMedium" color="grey.500">
                        {msg.timestamp}
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <Typography variant="bodyLargeExtraBold">
                    No messages yet. Start the conversation!
                  </Typography>
                </Box>
              ))}
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
      ) : (
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography variant="bodyLargeExtraBold">
            Select a contact to start chatting
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Messages;
