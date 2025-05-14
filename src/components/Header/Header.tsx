import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Container,
  Skeleton,
} from "@mui/material";
import { drawerWidth } from "../sidebar/Sidebar";
import Grid from "@mui/material/Grid2";
import { IHeaderProps, IUser, IUserDetails } from "../../utils/Interfaces";

import { useState, useEffect } from "react";
import down from "../../assets/icons/arrow-down.svg";
// import profile1 from "../../assets/images/profile-1.svg";
// import profile2 from "../../assets/images/profile-2.svg";
import { useAuth } from "../../store/AuthContext";
import { useLocation } from "react-router-dom";
import { getPageNameFromPath, stringToColor } from "../../utils/common";
import CommonDialog from "../common/CommonDialog";
import deleteIcon from "../../assets/icons/delete-tr.svg";
import editIcon from "../../assets/icons/edit-table.svg";
import AIEnabled from "../../assets/icons/AI-Enabled.svg";
// import AIPaused from "../../assets/icons/AI-Paused.svg";
import AIDisabled from "../../assets/icons/AI-Disabled.svg";
import { EnAIStatus } from "../../utils/enums";
import CommonTextField from "../common/CommonTextField";
import {
  createUser,
  deleteUserOnSecretary,
  joinUserViaSecretary,
  updateAIStatus,
} from "../../api/userApi";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  CalenderNameSchema,
  CalenderNameSchemaType,
} from "../../store/StepFormContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { MuiPhone } from "../Auth/SignUp/CustomPhoneInput";
import { useAuthHook } from "../../hooks/useAuth";
import {
  getCurrentUserId,
  updateUsersArray,
  getUserDetails,
} from "../../firebase/AuthService";
import { userNotSignedInErrorMessage } from "../../utils/errorHandler";
import CommonSnackbar from "../common/CommonSnackbar";

const AIStatus = () => [
  {
    Icon: AIEnabled,
    Status: EnAIStatus.ENABLED,
    Text: "Enable AI",
    Description: "Ai is active",
  },
  // {
  //   Icon: AIPaused,
  //   Status: EnAIStatus.PAUSED,
  //   Text: "AI Paused",
  //   Description: "Ai paused until tomorrow",
  // },
  {
    Icon: AIDisabled,
    Status: EnAIStatus.DISABLED,
    Text: "Disable AI",
    Description: "Ai is off",
  },
];

const Header = ({ isMobile, open }: Omit<IHeaderProps, "pageName">) => {
  const {
    companyDetails,
    loadingCompanyDetails,
    setTimer,
    setSelectedUser: setGlobalSelectedUser,
    selectedUserId,
    loadingSecretaryUsers,
    secretaryUsers,
    selectedUser: newSelectedUser,
    userDetails: userInfo,
    logout,
    fetchSecretaryUsers,
  } = useAuth();
  // console.log(secretaryUsers)
  //* Firebase based secretary users
  // const {

  //   newUserInfo,

  // } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [aiStatusAnchorEl, setAiStatusAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CalenderNameSchemaType>({
    resolver: zodResolver(CalenderNameSchema),
  });
  const [currentAiStatus, setCurrentAiStatus] = useState<EnAIStatus>(
    companyDetails?.ai_enabled === EnAIStatus.ENABLED
      ? EnAIStatus.ENABLED
      : EnAIStatus.DISABLED
  );
  //* Fetch secretary users initially
  useEffect(() => {
    fetchSecretaryUsers();
  }, []);

  //* Delete user from secretary
  const deleteUser = async (userId: number) => {
    if (secretaryUsers.length === 1) return;
    setIsLoading(true);
    try {
      await deleteUserOnSecretary(userId);
      await fetchSecretaryUsers();
      setSnackbarSeverity("success");
      setSnackbarMessage("User deleted successfully");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error deleting user on secretary:", error);
      setSnackbarSeverity("error");
      setSnackbarMessage("Error deleting user");
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (companyDetails?.ai_enabled !== undefined) {
      setCurrentAiStatus(
        companyDetails.ai_enabled === 1
          ? EnAIStatus.ENABLED
          : EnAIStatus.DISABLED
      );
    }
  }, [companyDetails?.ai_enabled]);

  const [isEditUser, setIsEditUser] = useState(false);
  //@ts-ignore

  const [selectedUser, setSelectedUser] = useState<IUserDetails | null>(null);

  const {
    setSnackbarOpen,
    setSnackbarMessage,
    setSnackbarSeverity,
    handleSnackbarClose,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
  } = useAuthHook();
  const [phone, setPhone] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [addNewUser, setAddNewUser] = useState(false);
  const [isDeleteUser, setIsDeleteUser] = useState(false);
  const location = useLocation();
  const pageName = getPageNameFromPath(location.pathname);
  const openMenu = Boolean(anchorEl);
  const openAiMenu = Boolean(aiStatusAnchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAiClick = (event: React.MouseEvent<HTMLElement>) => {
    setAiStatusAnchorEl(event.currentTarget);
  };

  const handleAiClose = () => {
    setAiStatusAnchorEl(null);
  };

  const handleAiStatusChange = (status: EnAIStatus) => {
    if (!companyDetails?.id) return;
    try {
      updateAIStatus(
        companyDetails?.id,
        status === EnAIStatus.ENABLED ? true : false
      );
      setCurrentAiStatus(status);
      setSnackbarSeverity("success");
      setSnackbarMessage(
        status === EnAIStatus.ENABLED
          ? "AI enabled successfully"
          : "AI disabled successfully"
      );
      setSnackbarOpen(true);
      setTimer(60000);
      handleAiClose();
    } catch (error) {
      console.error("Error updating AI status:", error);
    }
  };

  const onSubmit: SubmitHandler<CalenderNameSchemaType> = async (data) => {
    setFormSubmitted(true);
    if (phone.length < 12) {
      setSnackbarSeverity("error");
      setSnackbarMessage("Please enter a valid phone number");
      setSnackbarOpen(true);
      return;
    }
    setIsLoading(true);
    try {
      const userData: IUser = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: phone,
        company_id: userInfo.company_id!,
      };

      const responseData = await createUser(userData);
      await joinUserViaSecretary(
        userInfo.secretaryID!,
        responseData.user.user_id!
      );
      // Step 1: Get the current user ID
      const userId = getCurrentUserId();
      if (!userId) {
        setIsLoading(false);
        throw new Error(userNotSignedInErrorMessage);
      }

      // Get current user details to access existing users array
      const currentUserDetails = await getUserDetails(userId);

      // Create the new user object
      const newUser = {
        ...userData,
        user_id: responseData.user.user_id!,
        company_id: userInfo.company_id!,
      };

      // Prepare the updated users array by combining existing users with the new one
      const updatedUsers = [...(currentUserDetails?.users || []), newUser];

      // Update the users array in Firebase with the combined array
      await updateUsersArray(userId, updatedUsers);
      // await refreshUserDetails();
      await fetchSecretaryUsers();

      // Close dialog and show success message
      reset({
        firstName: "",
        lastName: "",
        email: "",
      });
      setPhone("");
      setIsLoading(false);
      setSnackbarSeverity("success");
      setSnackbarMessage("Calendar added successfully");
      setSnackbarOpen(true);
      setTimeout(() => {
        setAddNewUser(false);
      }, 1000);
    } catch (error: any) {
      setSnackbarSeverity("error");
      setSnackbarMessage(error.message);
      setSnackbarOpen(true);
      setIsLoading(false);
    }
  };

  // Add function to handle selecting a user for edit/delete
  const handleSelectUser = (user: IUserDetails, action: "edit" | "delete") => {
    setSelectedUser(user);
    if (action === "edit") {
      setIsEditUser(true);
    } else {
      if (secretaryUsers.length === 1) return;
      setIsDeleteUser(true);
    }
  };

  // Function to handle user selection for the global context
  const handleUserSelection = (user: IUserDetails) => {
    setGlobalSelectedUser(user.user_id.toString());
    handleClose();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: isMobile ? "100%" : `calc(100% - ${open ? drawerWidth : 80}px)`,
        transition: "0.3s",
        borderRadius: 0,
        backgroundColor: "#fff",
        boxShadow: "none",
      }}
    >
      {/* Delete user dialog */}
      <CommonDialog
        open={isDeleteUser}
        onClose={() => setIsDeleteUser(false)}
        title="Delete User"
        confirmButtonType="error"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => {
          if (!selectedUser?.user_id) return;
          deleteUser(selectedUser?.user_id);
          setIsDeleteUser(false);
        }}
        loading={isLoading}
        disabled={isLoading}
      >
        <Typography variant="bodyXLargeSemiBold">
          Are you sure you want to delete{" "}
          <span style={{ color: "#000", fontWeight: "bold" }}>
            {selectedUser?.first_name} {selectedUser?.last_name} ?
          </span>{" "}
        </Typography>
        <Box
          sx={{
            display: "flex",
            bgcolor: "#FFF3E0", // Light orange background
            border: "1px solid #FFE0B2",
            borderRadius: "4px",
            mb: 2,
            overflow: "hidden",
            mt: 2,
          }}
        >
          <Box
            sx={{
              width: "8px",
              bgcolor: "#FF5722", // Orange/red sidebar
              mr: 2,
            }}
          />
          <Box py={2} pr={2}>
            <Typography
              variant="bodyLargeExtraBold"
              color="#D84315"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <span style={{ fontSize: "20px" }}>⚠</span> Warning
            </Typography>
            <Typography variant="body1">
              By deleting this user, you won't be able to access their
              information.
            </Typography>
          </Box>
        </Box>
      </CommonDialog>
      {/* Edit user dialog */}
      <CommonDialog
        open={isEditUser}
        onClose={() => setIsEditUser(false)}
        title="Edit User"
        confirmButtonType="primary"
        confirmText="Save"
        cancelText="Cancel"
        onConfirm={() => setIsEditUser(false)}
        disabled={isLoading}
        loading={isLoading}
      >
        <CommonTextField
          value={selectedUser?.first_name || ""}
          onChange={(e: any) =>
            setSelectedUser(
              selectedUser
                ? { ...selectedUser, first_name: e.target.value }
                : null
            )
          }
        />
        <CommonTextField
          sx={{ mt: 1 }}
          value={selectedUser?.last_name || ""}
          onChange={(e: any) =>
            setSelectedUser(
              selectedUser
                ? { ...selectedUser, last_name: e.target.value }
                : null
            )
          }
        />
        <CommonTextField
          sx={{ mt: 1 }}
          value={selectedUser?.email || ""}
          onChange={(e: any) =>
            setSelectedUser(
              selectedUser ? { ...selectedUser, email: e.target.value } : null
            )
          }
        />
        <Box mt={1}>
          <MuiPhone
            value={selectedUser?.phone || ""}
            onChange={(phone) =>
              setSelectedUser(
                selectedUser ? { ...selectedUser, phone: phone } : null
              )
            }
            error={formSubmitted && (!phone || phone.length < 12)}
          />
        </Box>
      </CommonDialog>

      {/* Add new calendar dialog */}
      <CommonDialog
        open={addNewUser}
        onClose={() => setAddNewUser(false)}
        title="Add New Calendar"
        confirmButtonType="primary"
        confirmText="Add"
        cancelText="Cancel"
        onConfirm={handleSubmit(onSubmit)}
        loading={isLoading}
        disabled={isLoading}
      >
        <Grid container spacing={2}>
          <Grid size={6}>
            <Typography variant="bodyMediumSemiBold" color="grey.600">
              First Name
            </Typography>
            <CommonTextField
              sx={{ mt: 1 }}
              placeholder="First name"
              register={register("firstName")}
              errorMessage={errors.firstName?.message}
            />
          </Grid>
          <Grid size={6}>
          <Typography variant="bodyMediumSemiBold" color="grey.600">
              Last Name
            </Typography>
            <CommonTextField
              sx={{ mt: 1 }}
              placeholder="Last name"
              register={register("lastName")}
              errorMessage={errors.lastName?.message}
            />
          </Grid>
        </Grid>
        <Typography mt={1} variant="bodyMediumSemiBold" color="grey.600">
          Email
        </Typography>
        <CommonTextField
          sx={{ mt: 1 }}
          placeholder="Email"
          register={register("email")}
          errorMessage={errors.email?.message}
        />
         <Typography mt={1} variant="bodyMediumSemiBold" color="grey.600">
          Phone
        </Typography>
        <Box mt={1}>
          <MuiPhone
            error={formSubmitted && (!phone || phone.length < 12)}
            value={phone}
            onChange={(phone) => setPhone(phone)}
          />
        </Box>
        <CommonSnackbar
          open={snackbarOpen}
          message={snackbarMessage}
          severity={snackbarSeverity}
          onClose={handleSnackbarClose}
        />
      </CommonDialog>
      <Container disableGutters maxWidth="xl" sx={{ m: 0 }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h4" color="secondary.main" noWrap>
            {pageName}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* <IconButton>
              <img src={bell} alt="bell" />
            </IconButton> */}

            {/* AI Status Dropdown */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                cursor: "pointer",
                borderRadius: 28,
                bgcolor: "grey.50",
                py: 1,
                px: 1.5,
                "&:hover": {
                  bgcolor: "grey.200",
                },
                height: 48,
              }}
              onClick={handleAiClick}
            >
              {loadingCompanyDetails ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Skeleton variant="circular" width={32} height={32} />
                  <Skeleton variant="text" width={100} height={20} />
                </Box>
              ) : (
                <>
                  <Avatar
                    variant="square"
                    sx={{
                      width: 18,
                      height: 18,
                      ml: 1,
                    }}
                    src={
                      currentAiStatus == EnAIStatus.ENABLED
                        ? AIEnabled
                        : AIDisabled
                    }
                  />
                  <Typography variant="bodyLargeMedium" color="secondary.main">
                    {currentAiStatus === EnAIStatus.ENABLED
                      ? "AI Enabled"
                      : "AI Disabled"}
                  </Typography>
                  <IconButton
                    size="small"
                    sx={{
                      p: 0,
                    }}
                  >
                    <img src={down} alt="down" />
                  </IconButton>
                </>
              )}
            </Box>

            <Menu
              anchorEl={aiStatusAnchorEl}
              open={openAiMenu}
              onClose={handleAiClose}
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    py: 0,
                    px: 0,
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                    border: 1,
                    borderColor: "primary.main",
                    boxShadow: "0px 5px 10px 0px #0000001A",
                    backdropFilter: "blur(12px)",
                    bgcolor: "grey.200",
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              {AIStatus()
                .filter((status) => status.Status !== currentAiStatus)
                .map((status) => (
                  <MenuItem
                    key={status.Status}
                    onClick={() => handleAiStatusChange(status.Status)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      component="img"
                      src={status.Icon}
                      alt={status.Text}
                      width={14}
                      height={14}
                    />
                    {status.Text}
                  </MenuItem>
                ))}
            </Menu>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                cursor: "pointer",
                borderRadius: 28,
                bgcolor: "grey.50",
                py: 1,
                px: 1,
                "&:hover": {
                  bgcolor: "grey.200",
                },
              }}
              onClick={handleClick}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: stringToColor(newSelectedUser?.first_name || ""),
                }}
              >
                <Typography variant="bodyLargeSemiBold" color="white">
                  {newSelectedUser?.first_name?.charAt(0).toUpperCase()}
                  {newSelectedUser?.last_name?.charAt(0).toUpperCase()}
                </Typography>
              </Avatar>
              <Typography variant="bodyLargeExtraBold" color="secondary.main">
                {newSelectedUser ? newSelectedUser?.first_name : "Username"}
              </Typography>
              <IconButton
                size="small"
                sx={{
                  p: 0,
                }}
              >
                <img src={down} alt="down" />
              </IconButton>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleClose}
              onClick={handleClose}
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    py: 0,
                    px: 0,
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                    // mt: 1.5,
                    "& .MuiAvatar-root": {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    "&::before": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: "background.paper",
                      transform: "translateY(-50%) rotate(45deg)",
                      zIndex: 0,
                    },
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <Typography variant="bodyMediumSemiBold" sx={{ px: 2, py: 1 }}>
                Calendars
              </Typography>
              {loadingSecretaryUsers ? (
                <Skeleton variant="text" width={200} height={40} />
              ) : (
                <>
                  {secretaryUsers?.map((user) => (
                    <MenuItem
                      key={user.user_id}
                      sx={{
                        justifyContent: "space-between",
                        bgcolor:
                          selectedUserId === user.user_id.toString()
                            ? "primary.light"
                            : "transparent",
                        color:
                          selectedUserId === user.user_id.toString()
                            ? "#fff"
                            : "secondary.main",
                        "&:hover": {
                          bgcolor:
                            selectedUserId === user.user_id.toString()
                              ? "primary.light"
                              : "transparent",
                          color:
                            selectedUserId === user.user_id.toString()
                              ? "#fff"
                              : "secondary.main",
                        },
                      }}
                      onClick={() => handleUserSelection(user)}
                    >
                      <Typography
                        variant="bodyLargeMedium"
                        noWrap
                        maxWidth={150}
                      >
                        {user.first_name} {user.last_name}
                      </Typography>
                      <Box>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the parent MenuItem onClick
                            handleSelectUser(user, "edit");
                          }}
                          size="small"
                        >
                          <Box
                            component="img"
                            src={editIcon}
                            alt="edit"
                            width={16}
                            height={16}
                          />
                        </IconButton>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the parent MenuItem onClick
                            handleSelectUser(user, "delete");
                          }}
                          size="small"
                        >
                          <Box
                            component="img"
                            src={deleteIcon}
                            alt="delete"
                            width={16}
                            height={16}
                          />
                        </IconButton>
                      </Box>
                    </MenuItem>
                  ))}
                </>
              )}

              <MenuItem
                onClick={() => setAddNewUser(true)}
                sx={{ color: "primary.main" }}
              >
                <Typography variant="bodyLargeMedium">
                  + Add New Calendar
                </Typography>
              </MenuItem>

              <Box sx={{ borderTop: 1, borderColor: "divider", my: 1 }} />

              {/* <MenuItem onClick={() => (window.location.href = "/profile")}>
                Profile
              </MenuItem>
              <MenuItem onClick={() => (window.location.href = "/profile")}>
                Settings
              </MenuItem> */}

              <MenuItem
                onClick={() => {
                  // Handle logout
                  setIsLogoutModalOpen(true);
                }}
                sx={{
                  color: "error.main",
                  bgcolor: "transparent",
                  "&:hover": { bgcolor: "transparent" },
                  "&:focus": { bgcolor: "transparent" },
                }}
              >
                Logout
              </MenuItem>
            </Menu>
            <CommonDialog
              open={isLogoutModalOpen}
              onClose={() => setIsLogoutModalOpen(false)}
              confirmButtonType="error"
              confirmText="Logout"
              onConfirm={() => {
                setIsLogoutModalOpen(false);
                logout();
              }}
              cancelText="Cancel"
              title="Logout"
            >
              <Typography variant="bodyLargeExtraBold" color="grey.600">
                Are you sure you want to logout?
              </Typography>
            </CommonDialog>
          </Box>
          <CommonSnackbar
            open={snackbarOpen}
            message={snackbarMessage}
            severity={snackbarSeverity}
            onClose={handleSnackbarClose}
          />
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
