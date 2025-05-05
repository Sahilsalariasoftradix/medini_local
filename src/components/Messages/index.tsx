import {
  Avatar,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";

import { useCallback, useEffect, useState, useRef } from "react";
import CommonButton from "../common/CommonButton";
import emojiIcon from "../../assets/icons/mood-smile.svg";
import file from "../../assets/icons/link.svg";
import photo from "../../assets/icons/photo.svg";
import share from "../../assets/icons/share.svg";
import search from "../../assets/icons/Search.svg";
import CommonTextField from "../common/CommonTextField";
import useDebounce from "../../hooks/useDebounce";
import { useAuth } from "../../store/AuthContext";
import { sendMessageToPatient } from "../../firebase/AuthService";
import { stringToColor } from "../../utils/common";
import { EnMessageSender } from "../../utils/enums";
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

const Messages = () => {
  const { messages } = useAuth();
  const [searchValue, setSearchValue] = useState<string>("");
  // const [messageHistory, setMessageHistory] = useState<{
  //   [contactId: string]: any[];
  // }>({});
  // const [patients, setPatients] = useState<any>({});
  // console.log(patients);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // Add effect to set initial selected patient from messages
  useEffect(() => {
    if (messages && messages.length > 0 && !selectedPatient) {
      setSelectedPatient(messages[0]);
    }
  }, [messages, selectedPatient]);

  // console.log(selectedPatient);
  //@ts-ignore
  const [loading, setLoading] = useState(true);
  const [loadingSendMessage, setLoadingSendMessage] = useState(false);
  //@ts-ignore
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messageAreaRef = useRef<HTMLDivElement>(null);

  // Load initial data
  // useEffect(() => {
  //   const loadInitialData = async () => {
  //     try {
  //       const initialPatients = await getPatientsWithLatestMessage({userId:userDetails.user_id});
  //       console.log(initialPatients,'initialPatients')
  //       setPatients(initialPatients);
  //       if (Object.keys(initialPatients).length > 0) {
  //         setSelectedPatient(Object.keys(initialPatients)[0]);
  //       }
  //     } catch (err: any) {
  //       console.error("❌ Error loading initial data:", err);
  //       setError(err.message || "Failed to load initial data");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   loadInitialData();
  // }, []);
  // Set up real-time subscription
  // useEffect(() => {
  //   const unsubscribe = subscribeToDoctorMessages((updaterFn: any) => {
  //     setPatients((current: any) => {
  //       const updated = updaterFn(current);
  //       return updated;
  //     });
  //   });

  //   return () => {
  //     unsubscribe();
  //   };
  // }, []);

  const handlePatientSelect = useCallback((patient: any) => {
    setSelectedPatient(patient);
  }, []);

  const handleSendMessage = async (e: any) => {
    setLoadingSendMessage(true);
    e.preventDefault();
    if (!selectedPatient || !newMessage.trim()) return;

    try {
      await sendMessageToPatient(
        selectedPatient.details?.name,
        newMessage.trim()
      );
      setNewMessage("");
    } catch (err) {
      console.error("❌ Error sending message:", err);
      setError("Failed to send message");
    } finally {
      setLoadingSendMessage(false);
    }
  };
  // const patientIds = Object.keys(patients);

  //@ts-ignore
  const debouncedSearchValue = useDebounce(searchValue, 300);
  
  // Filter messages based on search term
  const filteredMessages = messages && messages.length > 0 
    ? messages.filter((contact: any) => 
        contact.contactName.toLowerCase().includes(debouncedSearchValue.toLowerCase())
      )
    : [];

  //@ts-ignore
  const { socketData, socket, message, setMessage, userDetails } = useAuth();
  // console.log(socketData);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [selectedPatient?.messages]);

  // Helper function to format timestamp based on if it's today or not
  const formatMessageTime = (timestamp: any) => {
    const messageDate = new Date(
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6
    );
    const today = new Date();
    
    // Check if the message is from today
    const isToday = 
      messageDate.getDate() === today.getDate() &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getFullYear() === today.getFullYear();
    
    if (isToday) {
      // Show only time for today's messages
      return messageDate.toLocaleString(undefined, {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } else {
      // Show date and time for older messages
      return messageDate.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
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
          {messages &&
            messages.length > 0 &&
            filteredMessages.map((contact: any, index: number) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  p: 2,
                  borderBottom: "1px solid #f5f5f5",
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "rgba(0, 0, 0, 0.04)",
                  },
                  // Highlight active chat based on selected contact
                  ...(selectedPatient?.contactName === contact.contactName
                    ? { bgcolor: "rgba(0, 0, 0, 0.04)" }
                    : {}),
                }}
                onClick={() => handlePatientSelect(contact)}
              >
                <Avatar
                  sx={{
                    bgcolor: stringToColor(contact.contactName),
                    width: 40,
                    height: 40,
                  }}
                >
                  {contact.contactName.charAt(0)}
                  {contact.contactName.charAt(0)}
                </Avatar>
                <Box sx={{ ml: 1.5, overflow: "hidden", flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{ maxWidth: "170px" }}
                      variant="bodyLargeExtraBold"
                      noWrap
                    >
                      {contact.contactName}
                    </Typography>
                    <Typography variant="bodyMediumMedium">
                      {formatMessageTime(contact.timestamp)}
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
          {messages && messages.length > 0 && filteredMessages.length === 0 && (

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 4,
              }}
            >
              <Box  sx={{ width:"300px"}}>

              <Typography className="truncate"  variant="bodyLargeExtraBold">
                No contacts found matching "{searchValue}"
              </Typography>
              </Box>
            </Box>
          )}
          {messages && messages.length === 0 && (
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
          {loading && messages.length === 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "calc(100vh - 320px)",
              }}
            >
              <CircularProgress />
            </Box>
          )}
        </Box>
      </Box>

      {/* Right side - chat area */}
      {selectedPatient ? (
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
              {selectedPatient.contactName.charAt(0)}
            </Avatar>
            <Typography variant="subtitle1" fontWeight="bold">
              {selectedPatient.contactName}
            </Typography>
          </Box>

          {/* Messages area */}
          <Box sx={messageAreaStyles} ref={messageAreaRef}>
            {selectedPatient &&
              (selectedPatient.message ? (
                // [...selectedPatient.messages].reverse().map((msg: any) => (
                <Box
                  key={selectedPatient.id}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems:
                      selectedPatient.sender !== EnMessageSender.MEDINI
                        ? "flex-end"
                        : "flex-start",
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        selectedPatient.sender !== EnMessageSender.MEDINI
                          ? "flex-end"
                          : "flex-start",
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
                        maxWidth: "100%",
                        p: 1.5,
                        borderRadius: "16px",
                        borderBottomRightRadius:
                          selectedPatient.sender !== EnMessageSender.MEDINI
                            ? 0
                            : "16px",
                        borderBottomLeftRadius:
                          selectedPatient.sender !== EnMessageSender.MEDINI
                            ? "16px"
                            : 0,
                        bgcolor:
                          selectedPatient.sender !== EnMessageSender.MEDINI
                            ? "primary.main"
                            : "grey.100",
                        color:
                          selectedPatient.sender !== EnMessageSender.MEDINI
                            ? "white"
                            : "inherit",
                      }}
                    >
                      {selectedPatient.sender !== EnMessageSender.MEDINI ? (
                        <Typography variant="body1">
                          {/* Hey! I just booked this patient{" "}
                            {selectedPatient.message} for an appointment on{" "}
                            {selectedPatient.message} at{" "}
                            {selectedPatient.message} o'clock with{" "} */}
                          {selectedPatient.message}
                        </Typography>
                      ) : (
                        <>
                          <Typography variant="body1">
                            {selectedPatient.message}
                          </Typography>
                        </>
                      )}
                    </Box>
                    {selectedPatient.sender !== EnMessageSender.MEDINI && (
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
                      ml:
                        selectedPatient.sender !== EnMessageSender.MEDINI
                          ? 0
                          : 0,
                    }}
                  >
                    <Typography variant="bodySmallExtraBold" ml={1}>
                      {selectedPatient.sender !== EnMessageSender.MEDINI
                        ? "You"
                        : selectedPatient.contactName}
                    </Typography>
                    <Typography variant="bodySmallMedium" color="grey.500">
                      {formatMessageTime(selectedPatient.timestamp)}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                // ))
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
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                // console.log(e.target.value, "ll");
              }}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage(e)}
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
              // onClick={handleSend}
              disabled={!newMessage.trim() || loadingSendMessage}
              loading={loadingSendMessage}
              onClick={handleSendMessage}
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
            You will get a message here when your AI books a call by phone
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Messages;
