import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Icon,
  Badge,
  Typography,
  AlertColor,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
} from "@mui/material";
import { SidebarIcons } from "../../utils/Icons";
import { Link } from "react-router-dom";
import { externalLinks, routes } from "../../utils/links";
import { overRideSvgColor } from "../../utils/filters";
import CommonLink from "../common/CommonLink";
import CommonDialog from "../common/CommonDialog";
import { useState, useEffect } from "react";
import CommonTextField from "../common/CommonTextField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formErrorMessage } from "../../utils/errorHandler";
import { useAuth } from "../../store/AuthContext";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  postUserQuery,
  postAISchedule,
  getAISchedule,
} from "../../api/userApi";
import CommonSnackbar from "../common/CommonSnackbar";
import dayjs from "dayjs";
import { IAISchedule } from "../../utils/Interfaces";

export const drawerWidth = 240;
const Sidebar = ({
  open,
  isMobile,
  isActive,
  closeDrawerOnMobile,
}: {
  open: boolean;
  nestedOpen: boolean;
  isMobile: boolean;
  handleNestedMenuToggle: () => void;
  isActive: (link: string) => boolean;
  closeDrawerOnMobile: () => void;
}) => {
  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const helpSchema = z.object({
    email: z
      .string()
      .min(1, { message: formErrorMessage.email.required })
      .max(100, "Max 100 characters.") // Checks if the field is empty
      .email({ message: formErrorMessage.email.invalid }), // Checks for a valid email format
    issue: z.string().min(1, "Issue is required"),
  });
  type HelpFormData = z.infer<typeof helpSchema>;
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<HelpFormData>({
    resolver: zodResolver(helpSchema),
  });

  const { socketData, selectedUser } = useAuth();
  const company_id = selectedUser?.company_id;
  const [helpModal, setHelpModal] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Initialize schedule state with default values for each day
  const [schedule, setSchedule] = useState<IAISchedule[]>(
    weekDays.map((day) => ({
      day_of_week: day,
      is_ai_on_all_day: true,
      is_custom: false,
      start_time: "hh:mm",
      end_time: "hh:mm",
    }))
  );

  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  // console.log(schedule);
  useEffect(() => {
    const fetchSchedule = async () => {
      if (!company_id) return;
      const response = await getAISchedule(Number(company_id));
      setSchedule(
        response?.config ??
          weekDays.map((day) => ({
            day_of_week: day,
            is_ai_on_all_day: false,
            is_custom: false,
            start_time: "hh:mm",
            end_time: "hh:mm",
          }))
      );
    };
    fetchSchedule();
  }, [company_id, settingsModal]);

  // Handle AI schedule submission
  const handleSubmitAISchedule = async () => {
    // Validate custom times
    const errors: { [key: string]: string } = {};
    let hasError = false;

    schedule.forEach((day) => {
      if (day.is_custom) {
        // Check if times are either the default "hh:mm" or not in the expected format
        if (
          day.start_time === "hh:mm" ||
          day.end_time === "hh:mm" ||
          !day.start_time ||
          !day.end_time ||
          !/^\d{2}:\d{2}:\d{2}$/.test(day.start_time) ||
          !/^\d{2}:\d{2}:\d{2}$/.test(day.end_time) ||
          day.start_time === day.end_time ||
          day.start_time > day.end_time
        ) {
          errors[day.day_of_week] = "Please select a valid time range";
          hasError = true;
        }
      }
    });

    setValidationErrors(errors);

    if (hasError) return;

    try {
      setSettingsLoading(true);

      // Prepare the schedule data to send to the API
      const formattedSchedule = schedule.map((day) => {
        // For "off" days, remove time values
        if (!day.is_ai_on_all_day && !day.is_custom) {
          return {
            day_of_week: day.day_of_week,
            is_ai_on_all_day: false,
            is_custom: false,
            start_time: null,
            end_time: null,
          };
        }

        // For "all day", remove time values
        if (day.is_ai_on_all_day && !day.is_custom) {
          return {
            day_of_week: day.day_of_week,
            is_ai_on_all_day: true,
            is_custom: false,
            start_time: null,
            end_time: null,
          };
        }

        // For "custom", keep time values
        return day;
      });

      await postAISchedule(Number(company_id), formattedSchedule);
      setSnackbar({
        open: true,
        message: "AI schedule saved successfully",
        severity: "success",
      });
      setSettingsModal(false);
    } catch (error) {
      console.error("Error saving AI schedule:", error);
      setSnackbar({
        open: true,
        message: "Failed to save AI schedule",
        severity: "error",
      });
    } finally {
      setSettingsLoading(false);
    }
  };

  // Get current option value for radio buttons
  const getScheduleOptionValue = (day: IAISchedule) => {
    if (day.is_ai_on_all_day) return "allDay";
    if (day.is_custom) return "custom";
    return "off";
  };

  const onSubmit = async (data: HelpFormData) => {
    setIsLoading(true);
    try {
      await postUserQuery(data.email, data.issue);
      reset({
        email: "",
        issue: "",
      });
      setHelpModal(false);
      setSnackbar({
        open: true,
        message: "A team member will get back to you by email in 2-3 business days",
        severity: "success",
      });
    } catch (error) {
      console.log(error);
      setSnackbar({
        open: true,
        message: "Message sent failed",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleOptionChange = (day: string, value: string) => {
    setSchedule((prev) =>
      prev.map((item) => {
        if (item.day_of_week === day) {
          return {
            ...item,
            is_ai_on_all_day: value === "allDay",
            is_custom: value === "custom",
            start_time: value === "custom" ? item.start_time : "hh:mm",
            end_time: value === "custom" ? item.end_time : "hh:mm",
          };
        }
        return item;
      })
    );
  };

  // Handle time change for start and end times
  const handleTimeChange = (
    day: string,
    field: "start_time" | "end_time",
    value: dayjs.Dayjs | null
  ) => {
    if (!value) return;

    const timeString = value.format("HH:mm:00");

    // Clear validation error when a valid time is selected
    if (validationErrors[day]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[day];
        return newErrors;
      });
    }

    setSchedule((prev) =>
      prev.map((item) => {
        if (item.day_of_week === day) {
          return {
            ...item,
            [field]: timeString,
          };
        }
        return item;
      })
    );
  };

  const closeSettingsModal = () => {
    setSettingsModal(false);
    setSchedule(
      weekDays.map((day) => ({
        day_of_week: day,
        is_ai_on_all_day: false,
        is_custom: false,
        start_time: "hh:mm",
        end_time: "hh:mm",
      }))
    );
  };
  const drawerStyles = {
    width: open ? drawerWidth : isMobile ? 0 : 80,
    position: "relative",
    flexShrink: 0,
    transition: "width 0.3s",
    "& .MuiDrawer-paper": {
      width: open ? drawerWidth : isMobile ? 0 : 80,
      borderRadius: 0,
      borderColor: "transparent",
      boxShadow: "none",
      transition: "width 0.3s",
      overflow: "visible !important",
      justifyContent: "center",
      backgroundColor: "#FAFAFA",
    },
  };
  const listItemStyles = { alignItems: "center", gap: 2 };
  // const nestedListItemTextStyles = {
  //   "&.MuiListItemText-root span": { fontSize: "12px" },
  // };
  const listContainerStyles = {
    height: "calc(100vh - 70px)",
    boxShadow: "0px 5px 10px 0px #0000001A",
    position: "absolute",
    background: "#fff",
    borderRadius: "16px",
    right: "-10px",
    p: 2,
    border: "2px solid #E2E8F0",
  };
  const renderListItem = (
    iconSrc?: string,
    text?: string,
    badgeContent?: number,
    link?: string
  ) => (
    <ListItem
      sx={{
        ...listItemStyles,
        pl: iconSrc ? 1 : 5.5,
        backgroundColor: link && isActive(link) ? "#358FF7" : "transparent",
        color: link && isActive(link) ? "#fff" : "#718096",
        "& img": {
          filter: link && isActive(link) ? overRideSvgColor.white : "",
          transition: "filter 0.3s", // Smooth transition for image color change
        },
      }}
      component={link ? Link : "div"}
      to={link || "#"}
      onClick={
        text === "Get Help"
          ? () => setHelpModal(true)
          : text === "Settings"
          ? () => setSettingsModal(true)
          : closeDrawerOnMobile
      }
    >
      {iconSrc && <img alt={"logo"} src={iconSrc} />}
      <ListItemText primary={text} />
      {badgeContent && <Badge badgeContent={badgeContent} color="primary" />}
    </ListItem>
  );

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={open}
      sx={drawerStyles}
    >
      {/* <Toolbar /> */}
      <List sx={listContainerStyles}>
        <Box
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"space-between"}
          height={"100%"}
          sx={{
            "&::before": {
              width: "80px",
              content: '""',
              position: "absolute",
              zIndex: -3,
              borderRadius: "30px",
              height: "80px",
              top: "-25px",
              background: "#358FF7",
            },
          }}
        >
          <Box>
            <Box sx={{ px: 0, mb: 4, mt: 2 }}>
              <Icon sx={{ width: 200, height: 35 }}>
                <img alt="edit" src={SidebarIcons.logo} />
              </Icon>
            </Box>
            {renderListItem(
              SidebarIcons.home,
              "Schedule",
              undefined,
              routes.sidebar.schedule.link
            )}
            {renderListItem(
              undefined,
              "Bookings",
              undefined,
              routes.sidebar.bookings.link
            )}
            {renderListItem(
              undefined,
              "Call Center",
              undefined,
              routes.sidebar.callCenter.link
            )}
            {/* Nested Menu */}
            {/* <ListItem
              sx={{ ...listItemStyles, pl: 1 }}
              onClick={handleNestedMenuToggle}
            >
              <img alt="edit" src={SidebarIcons.activity} />
              {open && <ListItemText primary="Activity" />}
              {open && (
                <img
                  alt="edit"
                  src={SidebarIcons.arrow}
                  className={nestedOpen ? "rotate" : ""}
                />
              )}
            </ListItem> */}

            {/* <Collapse in={nestedOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderListItem(
                  undefined,
                  "Activity 1",
                  undefined,
                  routes.sidebar.activity1.link
                )}
                {renderListItem(
                  undefined,
                  "Activity 2",
                  undefined,
                  routes.sidebar.activity2.link
                )}
              </List>
            </Collapse> */}

            {/* {renderListItem(
              SidebarIcons.billing,
              "Billing",
              undefined,
              routes.sidebar.billing.link
            )} */}
            {/* {renderListItem(
              SidebarIcons.patients,
              "Patients",
              undefined,
              routes.sidebar.patients.link
            )} */}
            {/* {renderListItem(
              SidebarIcons.history,
              "Task History",
              undefined,
              routes.sidebar.history.link
            )} */}
            {renderListItem(
              SidebarIcons.messages,
              "Messages",
              socketData?.length || "",
              routes.sidebar.messages.link
            )}
            {renderListItem(
              undefined,
              "Contacts",
              undefined,
              routes.sidebar.contacts.link
            )}
            {renderListItem(
              undefined,
              "History",
              undefined,
              routes.sidebar.events.link
            )}
          </Box>
          <Box>
            {renderListItem(SidebarIcons.settings, "Settings", undefined, "#")}
            {renderListItem(SidebarIcons.help, "Get Help", undefined, "#")}
            <CommonDialog
              open={helpModal}
              onClose={() => setHelpModal(false)}
              cancelText="Cancel"
              confirmButtonType="primary"
              confirmText="Send"
              onConfirm={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
              title="Help"
              // hideCloseIcon
            >
              <Box>
                <Typography variant="bodyMediumMedium" color="grey.600">
                  Describe your issue and we will get back to you by email
                </Typography>
                <Typography variant="bodyLargeMedium" mt={2} mb={1}>
                  Email
                </Typography>
                <CommonTextField
                  errorMessage={errors.email?.message}
                  register={register("email")}
                  placeholder="Enter your email"
                />
                <Typography variant="bodyLargeMedium" mt={2} mb={1}>
                  Issue
                </Typography>
                <CommonTextField
                  placeholder="Enter your email"
                  multiline
                  rows={6}
                  errorMessage={errors.issue?.message}
                  register={register("issue")}
                />
                {/* <CommonButton text="Submit" /> */}
              </Box>
            </CommonDialog>
            <CommonDialog
              maxWidth="sm"
              title="Operating Hours for AI Assistant"
              open={settingsModal}
              cancelText="Cancel"
              confirmButtonType="primary"
              confirmText="Save"
              onClose={closeSettingsModal}
              onConfirm={handleSubmitAISchedule}
              loading={settingsLoading}
              disabled={settingsLoading}
            >
              <Box>
                <Typography variant="bodyMediumMedium" mb={2} color="grey.600">
                  Set the hours the assistant will be active on your phone line
                </Typography>
                {schedule.map((daySchedule) => (
                  <Box
                    key={daySchedule.day_of_week}
                    display={"flex"}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                    gap={2}
                  >
                    <Typography
                      variant="bodySmallMedium"
                      py={1}
                      minWidth={"70px"}
                    >
                      {daySchedule.day_of_week}
                    </Typography>
                    <FormControl>
                      <Box display={"flex"} gap={2}>
                        <RadioGroup
                          row
                          sx={{
                            flexWrap: "nowrap",
                          }}
                          aria-labelledby="demo-radio-buttons-group-label"
                          value={getScheduleOptionValue(daySchedule)}
                          onChange={(e) =>
                            handleScheduleOptionChange(
                              daySchedule.day_of_week,
                              e.target.value
                            )
                          }
                          name={`radio-buttons-${daySchedule.day_of_week}`}
                        >
                           <FormControlLabel
                            value="allDay"
                            control={<Radio size="small" />}
                            label={
                              <Typography
                                variant="bodySmallMedium"
                                color="textSecondary"
                              >
                                All Day
                              </Typography>
                            }
                          />
                          <FormControlLabel
                            value="off"
                            control={<Radio size="small" />}
                            label={
                              <Typography
                                variant="bodySmallMedium"
                                color="textSecondary"
                              >
                                Off
                              </Typography>
                            }
                          />
                         
                          <FormControlLabel
                            value="custom"
                            control={<Radio size="small" />}
                            label={
                              <Typography
                                variant="bodySmallMedium"
                                color="textSecondary"
                              >
                                Custom
                              </Typography>
                            }
                          />
                        </RadioGroup>
                      </Box>
                    </FormControl>
                    <Box py={1} maxWidth={"250px"}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Box
                          display={"flex"}
                          flexDirection="column"
                          width="100%"
                        >
                          <Box display={"flex"} justifyContent={"end"} gap={2}>
                            <TimePicker
                              sx={{ width: "50%" }}
                              format="HH:mm"
                              disabled={!daySchedule.is_custom}
                              value={
                                daySchedule.start_time
                                  ? dayjs(daySchedule.start_time, "HH:mm:ss")
                                  : null
                              }
                              onChange={(newValue) =>
                                handleTimeChange(
                                  daySchedule.day_of_week,
                                  "start_time",
                                  newValue
                                )
                              }
                            />
                            <TimePicker
                              sx={{ width: "50%" }}
                              format="HH:mm"
                              disabled={!daySchedule.is_custom}
                              value={
                                daySchedule.end_time
                                  ? dayjs(daySchedule.end_time, "HH:mm:ss")
                                  : null
                              }
                              onChange={(newValue) =>
                                handleTimeChange(
                                  daySchedule.day_of_week,
                                  "end_time",
                                  newValue
                                )
                              }
                            />
                          </Box>
                          {validationErrors[daySchedule.day_of_week] && (
                            <Typography color="error" variant="caption">
                              {validationErrors[daySchedule.day_of_week]}
                            </Typography>
                          )}
                        </Box>
                      </LocalizationProvider>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CommonDialog>
            <CommonSnackbar
              open={snackbar.open}
              message={snackbar.message}
              severity={snackbar.severity as AlertColor}
              onClose={() =>
                setSnackbar({ open: false, message: "", severity: "success" })
              }
            />
            <Box display={"flex"} justifyContent={"space-between"} px={2}>
              <CommonLink to={externalLinks.termsOfService}>Terms</CommonLink>|
              <CommonLink to={externalLinks.privacyPolicy}>Privacy</CommonLink>
            </Box>
          </Box>
        </Box>
      </List>
    </Drawer>
  );
};

export default Sidebar;
