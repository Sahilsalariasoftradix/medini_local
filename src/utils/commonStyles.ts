export const sidebarStyles = {
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
 export const messageAreaStyles = {
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