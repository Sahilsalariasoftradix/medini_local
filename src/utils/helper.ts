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

  /**
 * Generates a cryptographically secure random string for use as a nonce
 * @param length Length of the random string to generate
 */
export const generateRandomString = (length: number): string => {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let result = "";

  // Use crypto API for better randomness if available
  if (window.crypto && window.crypto.getRandomValues) {
    const values = new Uint32Array(length);
    window.crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      result += charset[values[i] % charset.length];
    }
    return result;
  }

  // Fallback to Math.random if crypto API is not available
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}