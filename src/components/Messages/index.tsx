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
import comingSoon from "../../assets/icons/coming-soon.svg";
import search from "../../assets/icons/Search.svg";
import CommonTextField from "../common/CommonTextField";
import useDebounce from "../../hooks/useDebounce";
import { useAuth } from "../../store/AuthContext";
import pin from "../../assets/icons/Pin.svg";
import {
  getChatMessages,
  // sendMessageToPatient,
} from "../../firebase/AuthService";
import { stringToColor } from "../../utils/common";
import {
  EnMessageRole,
  EnMessageSender,
  EnMessageType,
} from "../../utils/enums";
import { IChatContacts, IMessage } from "../../utils/Interfaces";
import dayjs from "dayjs";
import CommonDialog from "../common/CommonDialog";
import { messageAreaStyles, sidebarStyles } from "../../utils/commonStyles";
import { formatMessageTime } from "../../utils/helper";

const Messages = () => {
  const {
    chatContacts,
    messages,
    loadingChatContacts,
    selectedUser,
    fetchChatContacts,
  } = useAuth();
  const [userMessages, setUserMessages] = useState<any>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [aiMessages, setAiMessages] = useState<any>([]);
  const [isAiSelected, setIsAiSelected] = useState(false);

  const [searchValue, setSearchValue] = useState<string>("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [openComingSoon, setOpenComingSoon] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const selectedFirstName = selectedPatient?.contactName?.split(" ")[0];
  const selectedLastName = selectedPatient?.contactName?.split(" ")[1];

  // Add effect to set initial selected patient from messages
  useEffect(() => {
    if (messages && messages.length > 0 && !selectedPatient) {
      setSelectedPatient(messages[0]);
    }
  }, [messages, selectedPatient]);

  //* Initially fetch chat contacts on this page we were using snapshot before
  useEffect(() => {
    if (selectedUser?.user_id) {
      fetchChatContacts();
    }
  }, [selectedUser?.user_id]);

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

  const handlePatientSelect = useCallback((patient: IChatContacts) => {
    setSelectedPatient(patient);
    setUserMessages([]);
    setIsAiSelected(false);
  }, []);

  // Add handler for Medini AI selection
  const handleAiSelect = useCallback(() => {
    setSelectedPatient(null);
    setIsAiSelected(true);
    // Initialize AI chat with default messages if empty
    // if (aiMessages.length === 0) {
    //   setAiMessages([
    //     {
    //       id: "initial-user",
    //       message: "hello",
    //       sender: "user",
    //       timestamp: new Date(),
    //     },
    //     {
    //       id: "initial-assistant",
    //       message: "Hello! How can I assist you today?",
    //       sender: "assistant",
    //       timestamp: new Date(),
    //     },
    //   ]);
    // }
  }, [aiMessages.length]);

  //Commented out for now as we are using websocket for sending messages
  // const handleSendMessage = async (e: any) => {
  //   setLoadingSendMessage(true);
  //   e.preventDefault();
  //   if (!selectedPatient || !newMessage.trim()) return;

  //   try {
  //     await sendMessageToPatient(
  //       selectedPatient.details?.name,
  //       newMessage.trim()
  //     );

  //     if (socket && socketConnected) {
  //       socket.send(
  //         JSON.stringify({
  //           type: "message",
  //           contactName: selectedPatient.contactName,
  //           message: newMessage.trim(),
  //           userId: selectedUser?.user_id,
  //         })
  //       );
  //     }

  //     setNewMessage("");
  //   } catch (err) {
  //     console.error("❌ Error sending message:", err);
  //     setError("Failed to send message");
  //   } finally {
  //     setLoadingSendMessage(false);
  //   }
  // };

  //@ts-ignore
  const debouncedSearchValue = useDebounce(searchValue, 300);

  // Filter messages based on search term
  const filteredMessages =
  chatContacts && chatContacts.length > 0
      ? chatContacts.filter((contact: any) =>
          contact.contactName
            .toLowerCase()
            .includes(debouncedSearchValue.toLowerCase())
        )
      : [];
  //* Scroll to bottom of messages when messages change
  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [selectedPatient?.messages, aiMessages]);

  // Fetch messages for the selected patient from Firebase
  useEffect(() => {
    setLoadingMessages(true);
    // Check both selectedUser and selectedPatient exist and have the required properties
    if (selectedUser?.user_id && selectedPatient?.contactName) {
      const fetchChatMessages = async () => {
        try {
          // Ensure user_id is converted to string properly
          const userId = String(selectedUser.user_id);

          // Log what we're trying to fetch for debugging
          // console.log(
          //   `Fetching messages for user ${userId} and contact ${selectedPatient.contactName}`
          // );

          const messages = await getChatMessages(
            userId,
            selectedPatient.contactName
          );
          // console.log("Fetched messages:", messages);
          setUserMessages(
            messages.map((message) => ({
              ...message,
              sender: EnMessageSender.MEDINI,
            }))
          );
        } catch (error) {
          console.error("Error fetching chat messages:", error);
        } finally {
          setLoadingMessages(false);
        }
      };

      fetchChatMessages();
    } else {
      console.log(
        "Missing data for fetching messages:"
        //   {
        //   userId: selectedUser?.user_id,
        //   contactName: selectedPatient?.contactName,
        // }
      );
    }
  }, [selectedUser?.user_id, selectedPatient?.contactName]);

  //* WebSocket setup for chatting with the AI
  useEffect(() => {
    // Only connect if we have a selected user
    // if (!selectedUser?.user_id) return;

    if (socketConnected) {
      return;
    }

    const wsUrl = import.meta.env.VITE_MEDINI_WEBSOCKET_URL;
    if (!wsUrl) {
      console.error("WebSocket URL not defined in environment variables");
      return;
    }

    // Create WebSocket connection
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      console.log("WebSocket connection established");
      setSocketConnected(true);
    };

    // Connection opened
    //@ts-ignore
    newSocket.addEventListener("open", (event) => {
      // console.log("WebSocket connection established");
      // setSocketConnected(true);
      // Send the AI conversation payload
      // const aiConvoPayload = {
      //   type: "ai_convo",
      //   payload: {
      //     messages: [
      //       {
      //         role: "user",
      //         content: "hello",
      //       },
      //     ],
      //   },
      // };
      // console.log("Sending initial AI conversation payload:", aiConvoPayload);
      // newSocket.send(JSON.stringify(aiConvoPayload));
    });

    // Listen for messages
    newSocket.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);
        // console.log("Message from server:", data);

        // Handle AI conversation responses
        if (data.type === EnMessageType.AI_CONVO && data.payload) {
          // Process the AI conversation messages
          const messages = data.payload.map((msg: IMessage, index: number) => ({
            id: `ai-msg-${index}-${Date.now()}`,
            message: msg.content,
            sender: msg.role,
            timestamp: new Date(),
          }));

          setAiMessages(messages);
        }

        // If this is a chat message and it's for the current selected patient will handle it here later
        // if (
        //   data.type === EnMessageType.MESSAGE &&
        //   selectedPatient?.contactName === data.contactName
        // ) {
        //   // Existing message handling...
        // }

        // If this is a notification about a new chat, refresh contacts
        // if (data.type === "new_chat") {
        //   fetchChatContacts();
        // }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    });

    //@ts-ignore
    newSocket.addEventListener("close", (event) => {
      console.log("WebSocket connection closed");
      setSocketConnected(false);
    });

    // Error handling
    newSocket.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
      setSocketConnected(false);
    });

    // Update socket reference
    setSocket(newSocket);

    // Clean up on unmount
    // return () => {
    //   if (newSocket && newSocket.readyState === WebSocket.OPEN) {
    //     newSocket.close();
    //   }
    // };
  }, [socketConnected]);

  //* Handle sending messages to AI
  const handleSendAiMessage = (e: any) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoadingSendMessage(true);

    // Add user message to AI chat
    const userMessage = {
      id: `user-${Date.now()}`,
      message: newMessage.trim(),
      sender: EnMessageRole.USER,
      timestamp: new Date(),
    };

    setAiMessages((prev: IMessage[]) => [...prev, userMessage]);

    // Send message to WebSocket
    if (socket && socketConnected) {
      // Format messages for AI conversation
      const messages = [...aiMessages, userMessage].map((msg) => ({
        role: msg.sender,
        content: msg.message,
      }));
      socket.send(
        JSON.stringify({
          type: EnMessageType.AI_CONVO,
          payload: {
            messages,
          },
        })
      );
    }

    setNewMessage("");
    setLoadingSendMessage(false);
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
        {/* Fixed AI chatBot */}
        <Box
          sx={{
            display: "flex",
            p: 2,
            borderBottom: "1px solid #f5f5f5",
            cursor: "pointer",
            "&:hover": {
              bgcolor: "rgba(0, 0, 0, 0.04)",
            },
            ...(isAiSelected ? { bgcolor: "rgba(0, 0, 0, 0.04)" } : {}),
          }}
          onClick={handleAiSelect}
        >
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 40,
              height: 40,
            }}
          >
            M
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
                Medini AI
              </Typography>
              <Box
                component="img"
                sx={{
                  position: "relative",
                  top: 0,
                  right: 0,
                  height: 20,
                  width: 20,
                }}
                alt="Pin."
                src={pin}
              />
            </Box>
          </Box>
        </Box>
        <Box>
          {filteredMessages &&
            filteredMessages.length > 0 &&
            filteredMessages.map((contact: IChatContacts, index: number) => (
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
                  {contact.contactName.split(" ")[0].charAt(0).toUpperCase()}
                  {contact.contactName.split(" ")[1].charAt(0).toUpperCase()}
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
                      {formatMessageTime(contact.lastMessageAt)}
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
          {!loadingChatContacts &&  filteredMessages && filteredMessages.length === 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 4,
              }}
            >
              <Box sx={{ width: "300px" }}>
                <Typography className="truncate" variant="bodyLargeExtraBold">
                  No contacts found matching "{searchValue}"
                </Typography>
              </Box>
            </Box>
          )}
          {/* {!loadingChatContacts &&
            chatContacts &&
            chatContacts.length === 0 && (
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
            )} */}
          {loadingChatContacts && chatContacts.length === 0 && (
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
      {isAiSelected ? (
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          {/* AI Chat header */}
          <Box
            sx={{
              px: 4,
              py: 3,
              borderBottom: "1px solid #E2E8F0",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Avatar
              sx={{
                bgcolor: "primary.main",
                mr: 2,
              }}
            >
              M
            </Avatar>
            <Typography variant="subtitle1" fontWeight="bold">
              Medini AI
            </Typography>
          </Box>

          {/* AI Messages area */}
          <Box sx={messageAreaStyles} ref={messageAreaRef}>
            {aiMessages.map((msg: any) => (
              <Box
                key={msg.id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems:
                    msg.sender === EnMessageRole.USER
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
                      msg.sender === EnMessageRole.USER
                        ? "flex-end"
                        : "flex-start",
                  }}
                >
                  {msg.sender === EnMessageRole.ASSISTANT && (
                    <Avatar
                      sx={{
                        bgcolor: "primary.main",
                        mr: 2,
                      }}
                    >
                      M
                    </Avatar>
                  )}
                  <Box
                    sx={{
                      maxWidth: "100%",
                      p: 1.5,
                      borderRadius: "16px",
                      borderBottomRightRadius:
                        msg.sender === EnMessageRole.USER ? 0 : "16px",
                      borderBottomLeftRadius:
                        msg.sender === EnMessageRole.USER ? "16px" : 0,
                      bgcolor:
                        msg.sender === EnMessageRole.USER
                          ? "primary.main"
                          : "grey.100",
                      color:
                        msg.sender === EnMessageRole.USER ? "white" : "inherit",
                    }}
                  >
                    <Typography variant="body1">{msg.message}</Typography>
                  </Box>
                  {msg.sender === EnMessageRole.USER && (
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
                    ml: msg.sender === EnMessageRole.USER ? 0 : 0,
                  }}
                >
                  <Typography variant="bodySmallExtraBold" ml={1}>
                    {msg.sender === EnMessageRole.USER ? "You" : "Medini AI"}
                  </Typography>
                  <Typography variant="bodySmallMedium" color="grey.500">
                    {dayjs(msg.timestamp).format("hh:mm A")}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Message input for AI chat */}
          <Box sx={{ px: 6 }}>
            <CommonTextField
              placeholder="Ask Medini AI something..."
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
              }}
              onKeyPress={(e) => e.key === "Enter" && handleSendAiMessage(e)}
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
              disabled={!newMessage.trim() || loadingSendMessage}
              loading={loadingSendMessage}
              onClick={handleSendAiMessage}
              sx={{ width: "150px" }}
            />
          </Box>
        </Box>
      ) : selectedPatient ? (
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
            <Avatar
              sx={{
                bgcolor: stringToColor(selectedPatient.contactName),
                mr: 2,
              }}
            >
              {selectedFirstName.charAt(0).toUpperCase()}
              {selectedLastName.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="subtitle1" fontWeight="bold">
              {selectedPatient.contactName}
            </Typography>
          </Box>

          {/* Messages area */}
          <Box sx={messageAreaStyles} ref={messageAreaRef}>
            {loadingMessages ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <CircularProgress size={40} />
              </Box>
            ) : (
              userMessages &&
              (userMessages.length > 0 ? (
                userMessages.map((msg: any) => (
                  <Box
                    key={msg.id}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems:
                        msg.sender !== EnMessageSender.MEDINI
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
                          msg.sender !== EnMessageSender.MEDINI
                            ? "flex-end"
                            : "flex-start",
                      }}
                    >
                      {msg.sender === EnMessageSender.MEDINI && (
                        <Avatar
                          sx={{
                            bgcolor: stringToColor(selectedPatient.contactName),
                            mr: 2,
                          }}
                        >
                          M
                        </Avatar>
                      )}
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
                            msg.sender !== EnMessageSender.MEDINI
                              ? "white"
                              : "inherit",
                        }}
                      >
                        <Typography variant="body1">{msg.message}</Typography>
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
                        {msg.sender === EnMessageSender.MEDINI
                          ? "Medini"
                          : msg.contactName}
                      </Typography>
                      <Typography variant="bodySmallMedium" color="grey.500">
                        {dayjs(msg.timestamp).format("YYYY-MM-DD HH:mm:ss")}
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
              ))
            )}
          </Box>

          {/* Message input area */}
          <Box sx={{ px: 6 }}>
            <CommonTextField
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
              }}
              // onKeyPress={(e) => e.key === "Enter" && handleSendMessage(e)}
              onKeyPress={(e) => e.key === "Enter" && setOpenComingSoon(true)}
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
              // onClick={handleSendMessage}
              onClick={() => setOpenComingSoon(true)}
              sx={{ width: "150px" }}
            />
            <CommonDialog
              open={openComingSoon}
              onClose={() => setOpenComingSoon(false)}
              // title="Coming Soon"
              cancelText=""
              confirmText="Got it!"
              maxWidth="sm"
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  py: 2,
                  px: 1,
                }}
              >
                <Box sx={{ mb: 3 }}>
                  <img
                    src={comingSoon}
                    alt="coming soon"
                    style={{ width: 100, height: 100 }}
                  />
                </Box>

                <Typography
                  variant="bodyXLargeExtraBold"
                  gutterBottom
                  align="center"
                >
                  Two-way conversation with your AI assistant is coming soon!
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  align="center"
                  sx={{ mt: 1, mb: 2 }}
                >
                  We're working hard to enable interactive messaging with
                  Medini. You'll be notified as soon as this feature is
                  available.
                </Typography>
              </Box>
            </CommonDialog>
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
            Select a conversation or start chatting with Medini AI
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Messages;
