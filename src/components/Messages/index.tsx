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
import {
  getPatientsWithLatestMessage,
  sendMessageToPatient,
  subscribeToDoctorMessages,
} from "../../firebase/AuthService";
import { formatDate, stringToColor } from "../../utils/common";
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
  const [searchValue, setSearchValue] = useState<string>("");
  // const [messageHistory, setMessageHistory] = useState<{
  //   [contactId: string]: any[];
  // }>({});
  const [patients, setPatients] = useState<any>({});
  console.log(patients);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  console.log(selectedPatient);
  const [loading, setLoading] = useState(true);
  const [loadingSendMessage, setLoadingSendMessage] = useState(false);
  //@ts-ignore
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messageAreaRef = useRef<HTMLDivElement>(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const initialPatients = await getPatientsWithLatestMessage();
        setPatients(initialPatients);
        if (Object.keys(initialPatients).length > 0) {
          setSelectedPatient(Object.keys(initialPatients)[0]);
        }
      } catch (err: any) {
        console.error("❌ Error loading initial data:", err);
        setError(err.message || "Failed to load initial data");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);
  // Set up real-time subscription
  useEffect(() => {
    const unsubscribe = subscribeToDoctorMessages((updaterFn: any) => {
      setPatients((current: any) => {
        const updated = updaterFn(current);
        return updated;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handlePatientSelect = useCallback((patientId: string) => {
    setSelectedPatient(patientId);
  }, []);

  const handleSendMessage = async (e: any) => {
  setLoadingSendMessage(true)
    e.preventDefault();
    if (!selectedPatient || !newMessage.trim()) return;

  
    try {
      await sendMessageToPatient(selectedPatient.details?.name, newMessage.trim());
      setNewMessage("");
    } catch (err) {
      console.error("❌ Error sending message:", err);
      setError("Failed to send message");
    } finally {
      setLoadingSendMessage(false);
    }
  };
  const patientIds = Object.keys(patients);

  //@ts-ignore
  const debouncedSearchValue = useDebounce(searchValue, 300);
  //@ts-ignore
  const { socketData, socket, message, setMessage, userDetails } = useAuth();
  console.log(socketData);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [selectedPatient?.messages]);

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
          {patients &&
            patientIds.length > 0 &&
            Object.values(patients).map((contact: any, index: number) => (
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
                  ...(selectedPatient === contact.details.name
                    ? { bgcolor: "rgba(0, 0, 0, 0.04)" }
                    : {}),
                }}
                onClick={() => handlePatientSelect(contact)}
              >
                <Avatar
                  sx={{
                    bgcolor: stringToColor(contact.details.name),
                    width: 40,
                    height: 40,
                  }}
                >
                  {contact.details.name.charAt(0)}
                  {contact.details.name.charAt(0)}
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
                      {contact.details.name}
                    </Typography>
                    <Typography variant="bodyMediumMedium">
                      {formatDate(contact.messages[0]?.timestamp)}
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
          {patients && Object.keys(patients).length === 0 && (
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
          {loading && !patients && (
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
              {selectedPatient.details?.name.charAt(0)}
            </Avatar>
            <Typography variant="subtitle1" fontWeight="bold">
              {selectedPatient.details?.name}
            </Typography>
          </Box>

          {/* Messages area */}
          <Box sx={messageAreaStyles} ref={messageAreaRef}>
            {selectedPatient &&
              (selectedPatient.messages?.length > 0 ? (
                [...selectedPatient.messages].reverse().map((msg: any) => (
                  <Box
                    key={msg.id}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: msg.sender !== EnMessageSender.MEDINI ? "flex-end" : "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          msg.sender !== EnMessageSender.MEDINI
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
                            msg.sender !== EnMessageSender.MEDINI ? 0 : "16px",
                          borderBottomLeftRadius:
                            msg.sender !== EnMessageSender.MEDINI ? "16px" : 0,
                          bgcolor:
                            msg.sender !== EnMessageSender.MEDINI
                              ? "primary.main"
                              : "grey.100",
                          color:
                            msg.sender !== EnMessageSender.MEDINI ? "white" : "inherit",
                        }}
                      >
                        {msg.sender !== EnMessageSender.MEDINI ? (
                          <Typography variant="body1">
                            {/* Hey! I just booked this patient{" "}
                            {selectedPatient.message} for an appointment on{" "}
                            {selectedPatient.message} at{" "}
                            {selectedPatient.message} o'clock with{" "} */}
                            {msg.message}
                          </Typography>
                        ) : (
                          <Typography variant="body1">{msg.message}</Typography>
                        )}
                      </Box>
                      {msg.sender !== EnMessageSender.MEDINI && (
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
                        ml: msg.sender !== EnMessageSender.MEDINI ? 0 : 0,
                      }}
                    >
                      <Typography variant="bodySmallExtraBold" ml={1}>
                        {msg.sender !== EnMessageSender.MEDINI
                          ? "You"
                          : selectedPatient.message}
                      </Typography>
                      <Typography variant="bodySmallMedium" color="grey.500">
                        {formatDate(msg?.timestamp)}
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
