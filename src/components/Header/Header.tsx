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
} from "@mui/material";
import { drawerWidth } from "../sidebar/Sidebar";
import { IHeaderProps, INewUserDetails } from "../../utils/Interfaces";
// import bell from "../../assets/icons/notifications.svg";
import { useState } from "react";
import down from "../../assets/icons/arrow-down.svg";
// import profile1 from "../../assets/images/profile-1.svg";
import profile2 from "../../assets/images/profile-2.svg";
import { useAuth } from "../../store/AuthContext";
import { useLocation } from "react-router-dom";
import { getPageNameFromPath } from "../../utils/common";
import CommonDialog from "../common/CommonDialog";
import deleteIcon from "../../assets/icons/delete-tr.svg";
import editIcon from "../../assets/icons/edit-table.svg";
import AIEnabled from "../../assets/icons/AI-Enabled.svg";
import AIPaused from "../../assets/icons/AI-Paused.svg";
import AIDisabled from "../../assets/icons/AI-Disabled.svg";
import { EnAIStatus } from "../../utils/enums";
import CommonTextField from "../common/CommonTextField";

const AIStatus = () => [
  {
    Icon: AIEnabled,
    Status: EnAIStatus.ENABLED,
    Text: "AI Enabled",
    Description: "Ai is active",
  },
  {
    Icon: AIPaused,
    Status: EnAIStatus.PAUSED,
    Text: "AI Paused",
    Description: "Ai paused until tomorrow",
  },
  {
    Icon: AIDisabled,
    Status: EnAIStatus.DISABLED,
    Text: "AI Disabled",
    Description: "Ai is off",
  },
];

const Header = ({ isMobile, open }: Omit<IHeaderProps, "pageName">) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [aiStatusAnchorEl, setAiStatusAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [currentAiStatus, setCurrentAiStatus] = useState<EnAIStatus>(
    EnAIStatus.ENABLED
  );
  const [isEditUser, setIsEditUser] = useState(false);
  const [newUserInfo, setNewUserInfo] = useState<INewUserDetails | null>({
    name: "John Doe",
  });
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
    setCurrentAiStatus(status);
    handleAiClose();
  };

  // Get current AI status details
  const currentAiStatusDetails = AIStatus().find(
    (status) => status.Status === currentAiStatus
  );

  const { userDetails: userInfo, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
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
        onConfirm={() => setIsDeleteUser(false)}
      >
        <Typography variant="bodyXLargeSemiBold">
          Are you sure you want to delete{" "}
          <span style={{ color: "#000", fontWeight: "bold" }}>
            {newUserInfo?.name} ?
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
      >
        <CommonTextField
          value={newUserInfo?.name}
          onChange={(e: any) =>
            setNewUserInfo({ ...newUserInfo, name: e.target.value })
          }
        />
      </CommonDialog>
      {/* Add new calendar dialog */}
      <CommonDialog
        open={addNewUser}
        onClose={() => setAddNewUser(false)}
        title="Add New Calendar"
        confirmButtonType="primary"
        confirmText="Add"
        cancelText="Cancel"
        onConfirm={() => setAddNewUser(false)}
      >
        <CommonTextField
          placeholder="Enter calendar name"
          onChange={(e: any) =>
            setNewUserInfo({ ...newUserInfo, name: e.target.value })
          }
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
              <Avatar
                variant="square"
                sx={{
                  width: 18,
                  height: 18,
                  ml: 1,
                }}
                src={currentAiStatusDetails?.Icon}
              />
              <Typography variant="bodyLargeMedium" color="secondary.main">
                {currentAiStatusDetails?.Description}
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
              {AIStatus().map((status) => (
                <MenuItem
                  key={status.Status}
                  onClick={() => handleAiStatusChange(status.Status)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    bgcolor:
                      currentAiStatus === status.Status
                        ? "grey.100"
                        : "transparent",
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
                }}
                src={profile2}
              />
              <Typography variant="bodyLargeExtraBold" color="secondary.main">
                {userInfo ? userInfo.firstName : "Username"}
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
              <MenuItem sx={{ justifyContent: "space-between" }}>
                {newUserInfo?.name}
                <Box>
                  <IconButton onClick={() => setIsEditUser(true)} size="small">
                    <Box
                      component="img"
                      src={editIcon}
                      alt="edit"
                      width={16}
                      height={16}
                    />
                  </IconButton>
                  <IconButton
                    onClick={() => setIsDeleteUser(true)}
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

              <MenuItem onClick={() => setAddNewUser(true)} sx={{ color: "primary.main" }}>
                + Add New Calendar
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
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
