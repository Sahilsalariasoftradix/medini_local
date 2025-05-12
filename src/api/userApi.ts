import {
  IAISchedule,
  IAvailabilityRequest,
  IAvailabilitySpecific,
  IBooking,
  IBookingIds,
  ICall,
  ICompanyDetails,
  IGetAvailability,
  ISecretary,
  IUpdateBooking,
  IUser,
  TGetBooking,
} from "../utils/Interfaces";
import apiClient from "./apiClient";

// Company details posting API
export const postCompanyDetails = async (companyData: ICompanyDetails) => {
  try {
    const response = await apiClient.post("company", companyData);
    return response.data;
  } catch (error) {
    console.error("Error posting company details:", error);
    throw error;
  }
};
// Posting the availability in general API
export const postAvailabilityGeneral = async (
  availabilityData: IAvailabilityRequest
): Promise<any> => {
  try {
    const response = await apiClient.post(
      "availability/general",
      availabilityData
    );
    return response.data;
  } catch (error) {
    console.error("Error posting availability data:", error);
    throw error;
  }
};
// Changing the availability in specific dates API
export const postAvailabilitySpecific = async (
  availabilityData: IAvailabilitySpecific
): Promise<any> => {
  try {
    const response = await apiClient.post(
      "availability/specific",
      availabilityData
    );
    return response.data;
  } catch (error) {
    console.error("Error posting specific availability data:", error);
    throw error;
  }
};
// Changing the unavailability in specific dates API
export const postUnAvailabilitySpecific = async (
  availabilityData: IAvailabilitySpecific
): Promise<any> => {
  try {
    const response = await apiClient.post(
      "unavailability/specific",
      availabilityData
    );
    return response.data;
  } catch (error) {
    console.error("Error posting unavailability data:", error);
    throw error;
  }
};
// Getting the company unique number API
export const getCompanyUniqueNumber = async (uid: number) => {
  try {
    const response = await apiClient.get(`company/phone/${uid}`);
    return response.data;
  } catch (error) {
    console.error("Error getting company details:", error);
    throw error;
  }
};
// Getting the availabilities API
export const getAvailability = async (data: IGetAvailability) => {
  try {
    const resp = await apiClient.get(
      `availability?user_id=${data.user_id}&date=${data.date}&view=${data.range}`
    );
    return resp.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
// Getting the bookings API
export const getBookings = async (bookings: TGetBooking) => {
  try {
    const resp = await apiClient.get(
      `bookings?user_id=${bookings.user_id}&date=${bookings.date}&range=${bookings.range}`
    );
    return resp.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
// Updating a booking API
export const updateBooking = async (booking: IUpdateBooking) => {
  try {
    const resp = await apiClient.post(`bookings/update`, booking);
    return resp.data;
  } catch (error: any) {
    console.error(error);
    throw new Error(error.response?.data?.error || "Booking update failed.");
  }
};
// Creating a booking API
export const createBooking = async (booking: IBooking) => {
  try {
    const resp = await apiClient.post(`booking`, booking);
    return resp.data;
  } catch (error: any) {
    console.error(error);
    throw new Error(error.response?.data?.error || "Booking creation failed.");
  }
};
// Cancelling the booking API
export const cancelBooking = async (bookingID: number) => {
  try {
    const bookingId = {
      booking_id: bookingID,
    };
    const resp = await apiClient.post("bookings/cancel", bookingId);
    return resp.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Creating the new user API
export const createUser = async (userData: IUser) => {
  try {
    const response = await apiClient.post("users/create", userData);
    return response.data;
  } catch (error: any) {
    console.error("Error creating user:", error);
    throw new Error(error.response?.data?.error || "User creation failed.");
  }
};
// Create Secretary API
export const createSecretary = async (secretaryData: ISecretary) => {
  try {
    const response = await apiClient.post("secretary/create", secretaryData);
    return response.data;
  } catch (error: any) {
    console.error("Error creating secretary:", error);
    throw new Error(
      error.response?.data?.error || "Secretary creation failed."
    );
  }
};

// Company details posting API
export const createCall = async (callData: ICall) => {
  try {
    const response = await apiClient.post("outbound-call-grok", callData);
    return response.data;
  } catch (error) {
    console.error("Error posting company details:", error);
    throw error;
  }
};
// Clear booking API
export const clearBooking = async (bookingIds: IBookingIds) => {
  try {
    const response = await apiClient.post(`bookings/clear`, bookingIds);
    return response.data;
  } catch (error: any) {
    console.error("Error clearing booking:", error);
    throw new Error(error.response?.data?.error || "Booking clearing failed.");
  }
};

// Getting the bookings by user API
export const getBookingsByUser = async (
  userId: number,
  phoneNumber: string
) => {
  try {
    const response = await apiClient.get(
      `bookings/user?user_id=${userId}&phone=${phoneNumber}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting bookings by user:", error);
    throw error;
  }
};

export const getCallHistoryData = async (
  userId: number,
  status: string,
  offset: number = 0,
  limit: number = 10,
  search: string = ""
) => {
  try {
    const response = await apiClient.get(
      `call-history?user_id=${userId}&status=${status}&offset=${offset}&limit=${limit}${
        search ? `&search=${search}` : ""
      }`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting call history:", error);
    throw error;
  }
};
// Delete call API
export const deleteCall = async (callId: number) => {
  try {
    const response = await apiClient.delete(`outbound-call-grok`, {
      data: {
        call_id: callId,
      },
    });
    return response.data?.data;
  } catch (error) {
    console.error("Error deleting call:", error);
    throw error;
  }
};
// Get company details API
export const getCompanyDetails = async (page = 1) => {
  try {
    const response = await apiClient.get(`company/users?page=${page}&limit=20`);
    return response.data;
  } catch (error) {
    console.error("Error fetching company details:", error);
    throw error;
  }
};
// Send verification code API
export const sendVerificationCode = async (
  phoneNumber: string,
  customerName: string
) => {
  try {
    const response = await apiClient.post(`customer/send-verification-code`, {
      phoneNumber: phoneNumber,
      customerName: customerName,
    });

    return response.data;
  } catch (error) {
    console.error("Error sending verification code:", error);
    throw error;
  }
};
// Verify verification code API
export const verifyVerificationCode = async (
  phoneNumber: string,
  verificationCode: string
) => {
  try {
    const response = await apiClient.post(`customer/verify-code`, {
      phoneNumber: phoneNumber,
      code: verificationCode,
    });
    return response.data;
  } catch (error) {
    console.error("Error verifying verification code:", error);
    throw error;
  }
};
// Get customer bookings API
export const getCustomerBookings = async (
  companyId: number,
  phoneNumber: string,
  code?: string
) => {
  try {
    const response = await apiClient.get(
      `bookings/customer?phone=${phoneNumber}&company_id=${companyId}&code=${code}`
    );
    return response.data.bookings;
  } catch (error) {
    console.error("Error getting customer bookings:", error);
    throw error;
  }
};
// Post user query API
export const postUserQuery = async (email: string, message: string) => {
  try {
    const resp = await apiClient.post(`users/inquiry`, {
      email: email,
      message: message,
    });
    return resp.data;
  } catch (error) {
    console.error("Error posting user query:", error);
    throw error;
  }
};
// Post AI schedule API
export const postAISchedule = async (
  companyId: number,
  schedule: IAISchedule[]
) => {
  try {
    const response = await apiClient.post(`config/aischedule`, {
      company_id: companyId,
      schedule: schedule,
    });
    return response.data;
  } catch (error) {
    console.error("Error posting AI schedule:", error);
    throw error;
  }
};
// Get AI schedule API
export const getAISchedule = async (companyId: number) => {
  try {
    const response = await apiClient.get(`config?company_id=${companyId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting AI schedule:", error);
    throw error;
  }
};

// Get Company Details API
export const getCompany = async (companyId: number) => {
  try {
    const response = await apiClient.get(`company/${companyId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting company details:", error);
    throw error;
  }
};

// Update AI Status API.
export const updateAIStatus = async (companyId: number, aiStatus: boolean) => {
  try {
    const response = await apiClient.post(`company/ai-status`, {
      company_id: companyId,
      ai_enabled: aiStatus,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating AI status:", error);
    throw error;
  }
};
// Get user event logs API
export const getUserEventLogs = async (
  userId: number,
  limit?: number,
  offset?: number,
  fromDate?: string,
  toDate?: string,
  typeId?: number
) => {
  try {
    let url = `user/event-log/${userId}?`;
    const params = new URLSearchParams();

    if (limit !== undefined) params.append("limit", limit.toString());
    if (offset !== undefined) params.append("offset", offset.toString());
    if (fromDate) params.append("from_date", fromDate);
    if (toDate) params.append("to_date", toDate);
    if (typeId !== undefined) params.append("type_id", typeId.toString());

    url += params.toString();

    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error getting user event logs:", error);
    throw error;
  }
};
// Event log Enum API
export const getEventLogEnum = async () => {
  try {
    const response = await apiClient.get(`user/event-log/enum`);
    return response.data;
  } catch (error) {
    console.error("Error getting event log enum:", error);
    throw error;
  }
};
// Join Company API
export const joinCompany = async (companyCode: string, secretaryId: number) => {
  try {
    const response = await apiClient.post(`company/join`, {
      company_code: companyCode,
      secretary_id: secretaryId,
    });
    return response.data;
  } catch (error) {
    console.error("Error joining company:", error);
    throw error;
  }
};
// Join user via secretary API
export const joinUserViaSecretary = async (
  secretaryId: number,
  userId: number
) => {
  try {
    const response = await apiClient.post(`secretary/user`, {
      secretary_id: secretaryId,
      user_id: userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error joining user via secretary:", error);
    throw error;
  }
};
// Get users by secretary ID API
export const getUsersBySecretaryId = async (secretaryId: number) => {
  try {
    const response = await apiClient.get(
      `secretary/users?secretary_id=${secretaryId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting users:", error);
    throw error;
  }
};
// Delete user on secretary API
export const deleteUserOnSecretary = async (userId: number) => {
  try {
    const response = await apiClient.delete(`secretary/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting user on secretary:", error);
    throw error;
  }
};
