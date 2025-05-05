import { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Container,
  Paper,
} from "@mui/material";
import available from "../../assets/icons/available.svg";
import active from "../../assets/icons/active.svg";
import { availabilityIcons } from "../../utils/Icons";
import active1 from "../../assets/icons/active.svg";
import { RoundCheckbox } from "../../components/common/RoundCheckbox";

// Mock event data
const mockEvents = [
  {
    id: 1,
    type: "inbound",
    name: "MacDonald, J",
    time: "9:00, December 25, 2025",
    status: "success",
    icon1: "person",
    icon2: "document",
  },
  {
    id: 2,
    type: "inbound",
    name: "MacDonald, J",
    time: "9:00, December 25, 2025",
    status: "error",
    icon1: "person",
    icon2: "source",
  },
  {
    id: 3,
    type: "inbound",
    name: "MacDonald, J",
    time: "9:00, December 25, 2025",
    status: "error",
    icon1: "person",
    icon2: "document",
  },
  {
    id: 4,
    type: "outbound",
    name: "MacDonald, J",
    time: "9:00, December 25, 2025",
    status: "success",
    icon1: "person",
    icon2: "source",
  },
  {
    id: 5,
    type: "outbound",
    name: "MacDonald, J",
    time: "9:00, December 25, 2025",
    status: "warning",
    icon1: "person",
    icon2: "document",
  },
];

const Events = () => {
  const [inboundChecked, setInboundChecked] = useState<boolean>(true);
  const [outboundChecked, setOutboundChecked] = useState<boolean>(false);

  // Function to handle inbound checkbox changes
  const handleInboundChange = () => {
    // Only allow unchecking if outbound is checked
    if (inboundChecked && !outboundChecked) {
      return; // Prevent unchecking when it's the only one checked
    }
    setInboundChecked(!inboundChecked);
  };

  // Function to handle outbound checkbox changes
  const handleOutboundChange = () => {
    // Only allow unchecking if inbound is checked
    if (outboundChecked && !inboundChecked) {
      return; // Prevent unchecking when it's the only one checked
    }
    setOutboundChecked(!outboundChecked);
  };

  // Filter events based on selected checkboxes
  const filteredEvents = mockEvents.filter((event) => {
    if (inboundChecked && event.type === "inbound") return true;
    if (outboundChecked && event.type === "outbound") return true;
    return false;
  });

  // Get appropriate icon component
  const getIcon = (iconType: string | null) => {
    switch (iconType) {
      case "person":
        return availabilityIcons.in_person;
      case "document":
        return active;
      case "source":
        return available;
      default:
        return null;
    }
  };

  // Get appropriate background color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "#22C55E"; // Green
      case "error":
        return "#FF4747"; // Red
      case "warning":
        return "#FACC15"; // Yellow
      default:
        return "#e0e0e0"; // Grey
    }
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

          <Box display={"flex"} gap={2}>
            <RoundCheckbox
              checked={inboundChecked}
              onChange={handleInboundChange}
              checkedIconSize={30}
              label="Inbound"
              iconSize={30}
            />
            <RoundCheckbox
              checked={outboundChecked}
              onChange={handleOutboundChange}
              checkedIconSize={30}
              label="Outbound"
              iconSize={30}
            />
          </Box>
        </Box>

        <Paper
          sx={{
            boxShadow: "0px 5px 10px 0px #0000001A",
            border: " 1px solid #E2E8F0",
          }}
          elevation={2}
        >
          <Table sx={{ width: "100%" }}>
            {/* <TableHead>
              <TableRow>
                <TableCell width="50px">Event</TableCell>
                <TableCell width="50px"></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead> */}
            <TableBody>
              {filteredEvents.map((event) => (
                <TableRow key={event.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <img src={active1} alt={event.icon2} width="16" />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <img
                      //@ts-ignore
                        src={getIcon(event?.icon1)}
                        alt={event?.icon1}
                        width="16"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="bodyLargeMedium"
                      sx={{
                        bgcolor: getStatusColor(event.status),
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: "100px",
                        px: 2,
                        height: "31px",
                        maxWidth: "170px",
                        width: "auto",
                      }}
                    >
                      {event.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="bodyMediumMedium" color="grey.600">
                      {event.time}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Container>
  );
};

export default Events;
