import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Container,
  Paper,
  CircularProgress,
  Popover,
  IconButton,
  Pagination,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
} from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import available from "../../assets/icons/available.svg";
import { getEventLogEnum, getUserEventLogs } from "../../api/userApi";
import { IEventLogEnum, IEventLogs } from "../../utils/Interfaces";
import { useAuth } from "../../store/AuthContext";
import calendarIcon from "../../assets/icons/calenderIcon.svg";
import { getStatusColor } from "../../utils/common";

const Events = () => {
  const [eventLogs, setEventLogs] = useState<IEventLogs[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const { selectedUser } = useAuth();
  const user_id = selectedUser?.user_id;
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [eventLogEnum, setEventLogEnum] = useState<IEventLogEnum[]>([]);
  const [selectedEventType, setSelectedEventType] = useState<string>("");

  // Pagination states
  const [page, setPage] = useState<number>(1);
  const [offset, setOffset] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const limit = 20; // Items per page

  // API base URL from environment variable
  const apiBaseUrl = import.meta.env.VITE_MEDINI_API_URL;

  useEffect(() => {
    const fetchEventLogEnum = async () => {
      const eventLogEnum = await getEventLogEnum();
      setEventLogEnum(eventLogEnum.eventLogEnum);
    };
    fetchEventLogEnum();
  }, []);

  // Format date string from ISO format to readable format
  const formatDate = (dateString: string): string => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid

    // Format: "HH:MM, Month DD, YYYY"
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const month = date.toLocaleString("default", { month: "long" });
    const day = date.getDate();
    const year = date.getFullYear();

    return `${hours}:${minutes}, ${month} ${day}, ${year}`;
  };

  // Format date for API request (YYYY-MM-DD)
  const formatDateForAPI = (date: Date | null): string | undefined => {
    if (!date) return undefined;
    return date.toISOString().split("T")[0];
  };

  // Clear date filters
  const clearDateFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedEventType("");
    setPage(1);
    setOffset(0);
  };

  // Handle page change
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);
    setOffset((newPage - 1) * limit);
  };

  // Handle event type filter change
  const handleEventTypeChange = (event: SelectChangeEvent) => {
    setSelectedEventType(event.target.value);
    setPage(1);
    setOffset(0);
  };

  // Fetch event logs
  useEffect(() => {
    const fetchEventLogs = async () => {
      if (!user_id) return;
      setLoading(true);
      try {
        // Only include dates in API call if both are provided
        const shouldIncludeDates = !startDate || (startDate && endDate);

        const fromDate = shouldIncludeDates
          ? formatDateForAPI(startDate)
          : undefined;
        const toDate = shouldIncludeDates
          ? formatDateForAPI(endDate)
          : undefined;
        const typeId = selectedEventType
          ? Number(selectedEventType)
          : undefined;

        const eventLogs = await getUserEventLogs(
          user_id,
          limit,
          offset,
          fromDate,
          toDate,
          typeId
        );
        setEventLogs(eventLogs.eventLog);

        // If the API returns a total count, use it for pagination
        if (eventLogs.totalCount !== undefined) {
          setTotal(eventLogs.totalCount);
        }
      } catch (error) {
        setEventLogs([]);
        console.error("Error fetching event logs:", error);
      } finally {
        setLoading(false);
      }
    };

    // If start date is selected but end date is not, don't call the API yet
    if (startDate && !endDate) {
      return;
    }

    fetchEventLogs();
  }, [user_id, startDate, endDate, offset, limit, selectedEventType]);

  // Function to get event type name based on event_type_id
  const getEventTypeName = (eventTypeId: number): string => {
    const eventType = eventLogEnum.find((item) => item.id === eventTypeId);
    return eventType ? eventType.name : "Unknown";
  };

  // Function to get event icon based on event_type_id with full URL
  const getEventTypeIcon = (eventTypeId: number): string | null => {
    const eventType = eventLogEnum.find((item) => item.id === eventTypeId);
    if (!eventType || !eventType.icons) return null;

    // If the icon path is already a full URL, return it as is
    if (eventType.icons.startsWith("http")) {
      return eventType.icons;
    }

    // Otherwise, prepend the API base URL
    return `${apiBaseUrl.split("api/v1")[0]}${eventType.icons.startsWith("/") ? "" : "/"
      }${eventType.icons.substring(1)}`;
  };

  return (
    <Container maxWidth={false} sx={{ p: 3 }}>
      <Box sx={{ width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1">
            Event Log
          </Typography>

          <Box display={"flex"} gap={2} alignItems="center">
            <Box position="relative">
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <img width={20} src={calendarIcon} alt="calendar" />
              </IconButton>
              {(startDate && endDate) && (
                <Box
                  position="absolute"
                  top={4}
                  right={4}
                  width={8}
                  height={8}
                  borderRadius="50%"
                  bgcolor="red"
                />
              )}
            </Box>
            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
            >
              <Box sx={{ p: 0 }}>
                <DatePicker
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => {
                    setStartDate(update[0]);
                    setEndDate(update[1]);
                    if (update[0] && update[1]) {
                      setAnchorEl(null);
                    }
                  }}
                  inline
                />
              </Box>
            </Popover>

            {/* Event Type Filter */}
            <FormControl sx={{ minWidth: 150 }} size="small">
              <InputLabel id="event-type-select-label">Event Type</InputLabel>
              <Select
                labelId="event-type-select-label"
                id="event-type-select"
                value={selectedEventType}
                label="Event Type"
                onChange={handleEventTypeChange}
              >
                {/* <MenuItem value="">
                  <em>All</em>
                </MenuItem> */}
                {eventLogEnum.map((eventType) => (
                  <MenuItem key={eventType.id} value={eventType.id.toString()}>
                    {eventType.name.charAt(0).toUpperCase() +
                      eventType.name.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {(startDate || endDate || selectedEventType) && (
              <Button
                onClick={clearDateFilters}
                variant="contained"
                color="primary"
                sx={{
                  bgcolor: "red",
                  "&:hover": {
                    bgcolor: "red",
                  },
                }}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        </Box>

        <Paper
          sx={{
            boxShadow: "0px 5px 10px 0px #0000001A",
            border: " 1px solid #E2E8F0",
            maxHeight: "calc(100vh - 310px)",
            overflow: "auto",
          }}
          elevation={2}
        >
          <Table sx={{ width: "100%" }}>
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "calc(100vh - 300px)",
                }}
              >
                <CircularProgress />
              </Box>
            ) : eventLogs.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "calc(100vh - 300px)",
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  {startDate || endDate || selectedEventType
                    ? "No events match your filter criteria"
                    : "User event log not found"}
                </Typography>
              </Box>
            ) : (
              <TableBody>
                {eventLogs.map((event) => (
                  <TableRow key={event.id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        {event.event_type_id && (
                          <img
                            height="50"
                            width="50"
                            src={
                              getEventTypeIcon(event.event_type_id) || available
                            }
                            alt={getEventTypeName(event.event_type_id)}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="bodyLargeMedium"
                        sx={{
                          bgcolor: getStatusColor(event.color),
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: "100px",
                          px: 2,
                          height: "31px",
                          maxWidth: "200px",
                          width: "auto",
                        }}
                      >
                        {event.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="bodyLargeMedium">
                        {event.event_type_id
                          ? getEventTypeName(event.event_type_id).charAt(0).toUpperCase() +
                          getEventTypeName(event.event_type_id).slice(1)
                          : event.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="bodyMediumMedium" color="grey.600">
                        {formatDate(event.created_at)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </Paper>
        {/* Pagination */}
        {eventLogs.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <Stack spacing={2}>
              <Pagination
                variant="outlined"
                shape="rounded"
                count={Math.ceil(total / limit) || 1}
                page={page}
                onChange={handlePageChange}
                color="primary"
                sx={{
                  "& .MuiPaginationItem-previousNext": {
                    border: "none",
                    "&:hover": {
                      backgroundColor: "transparent",
                      border: "none",
                    },
                  },
                }}
              // showFirstButton
              // showLastButton
              />
            </Stack>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Events;
