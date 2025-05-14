  // Helper function to format timestamp based on if it's today or not
 export const formatMessageTime = (timestamp: any) => {
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
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    } else {
      // Show date and time for older messages
      return messageDate.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    }
  };