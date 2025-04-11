import { Box, Typography } from "@mui/material";
import OTPInput from "../../common/CommonOtp";
import CommonButton from "../../common/CommonButton";
import { useAppointmentChecker } from "../../../store/AppointmentCheckerContext";
import { useState } from "react";
import {
  getCustomerBookings,
  createBooking,
} from "../../../api/userApi";
import { EnOTPType } from "../../../utils/enums";
import dayjs from "dayjs";

const OtpReceiver = ({
  // phoneNumber,
  required,
  // closePopup,
  resendCode,
  // onSuccessfulVerification,
  type,
}: {
  phoneNumber: string;
  required: boolean;
  closePopup: () => void;
  resendCode: () => void;
  onSuccessfulVerification?: () => void;
  type: "existing" | "new";
}) => {
  const { setStep, step } = useAppointmentChecker();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    timer,
    isResendDisabled,
    existingAppointmentData,
    existingPhone,
    setUserBookings,
    newAppointmentData,
    setReferenceNumber,
    setSnackbar,
    setSubmitting,
    setConfirmPopup,
  } = useAppointmentChecker();

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setError(false); // Clear error when user starts typing
  };

  const handleExistingOTP = async () => {
    try {
      const bookings = await getCustomerBookings(
        Number(existingAppointmentData?.appointment_location?.id),
        existingPhone,
        otp
      );
      setUserBookings(bookings);
      setSuccess(true);
      setStep(4);
    } catch (apiError: any) {
      if (apiError.response?.status === 401) {
        setError(true);
        setErrorMessage(apiError.response?.data?.error || "Invalid OTP");
      } else {
        setSuccess(true);
        setStep(4);
      }
    }
  };

  const handleNewOTP = async () => {
    setSubmitting(true);
    try {
      const timeArray = newAppointmentData?.time?.split(":").map(Number) || [
        0, 0,
      ];
      const [hours, minutes] = timeArray;
      const startTime = dayjs(newAppointmentData?.day).toDate();
      startTime.setHours(hours, minutes, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(
        endTime.getMinutes() + Number(newAppointmentData?.appointmentLength)
      );

      const payload = {
        //@ts-ignore
        user_id: newAppointmentData?.practitioner?.id,
        date: dayjs(newAppointmentData?.day).format("YYYY-MM-DD"),
        start_time: newAppointmentData?.time,
        end_time: `${endTime.getHours()}:${String(
          endTime.getMinutes()
        ).padStart(2, "0")}`,
        details: newAppointmentData?.details,
        booking_type: newAppointmentData?.appointmentType,
        email: newAppointmentData?.email,
        first_name: newAppointmentData?.firstName,
        last_name: newAppointmentData?.lastName,
        phone: newAppointmentData?.phone,
        code: otp,
      };
      //@ts-ignore
      const resp = await createBooking(payload);
      setReferenceNumber(resp.booking_id);
      setTimeout(() => {
        //@ts-ignore
        setStep((prev) => prev + 1);
      }, 500);
      setSnackbar({
        open: true,
        message: "Appointment created successfully",
        severity: "success",
      });
      setSuccess(true);
      setError(false);
      setConfirmPopup(false);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error",
      });
      setError(true);
      setErrorMessage(error.message);
      setSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  // const verifyCode = async () => {
  //   setLoading(true);
  //   try {
  //     if (type === EnOTPType.EXISTING) {
  //       const resp = await getCustomerBookings(
  //         Number(existingAppointmentData?.appointment_location?.id),
  //         existingPhone,
  //         otp
  //       ).then((bookings) => {
  //         setUserBookings(bookings);
  //         setStep(4);
  //       });
  //       //@ts-ignore
  //       if (resp?.status === 401) {
  //         setError(true);
  //         setErrorMessage("Invalid OTP");
  //         setLoading(false);
  //         setStep(step - 1);
  //         return;
  //       } else {
  //         setStep(step + 1);
  //         setSuccess(true);
  //       }
  //       setSuccess(true);
  //     } else if (type === EnOTPType.NEW) {
  //       // Define and immediately execute the booking function
  //       const submitBookingData = async () => {
  //         setSubmitting(true);
  //         try {
  //           // Convert time string (e.g., "14:30") to Date object
  //           const timeArray = newAppointmentData?.time
  //             ?.split(":")
  //             .map(Number) || [0, 0];
  //           const [hours, minutes] = timeArray;
  //           const startTime = new Date(newAppointmentData?.day || new Date());
  //           startTime.setHours(hours, minutes, 0, 0); // Set start time

  //           // Add appointment length (in minutes)
  //           const endTime = new Date(startTime);
  //           endTime.setMinutes(
  //             endTime.getMinutes() +
  //               Number(newAppointmentData?.appointmentLength)
  //           );

  //           const payload = {
  //             //@ts-ignore
  //             user_id: newAppointmentData?.practitioner?.id,
  //             date: dayjs(newAppointmentData?.day).format("YYYY-MM-DD"),
  //             start_time: newAppointmentData?.time,
  //             end_time: `${endTime.getHours()}:${String(
  //               endTime.getMinutes()
  //             ).padStart(2, "0")}`, // Format as HH:mm
  //             details: newAppointmentData?.details,
  //             booking_type: newAppointmentData?.appointmentType,
  //             email: newAppointmentData?.email,
  //             first_name: newAppointmentData?.firstName,
  //             last_name: newAppointmentData?.lastName,
  //             phone: newAppointmentData?.phone,
  //             code: otp,
  //           };

  //           //@ts-ignore
  //           const resp = await createBooking(payload);
  //           setReferenceNumber(resp.booking_id);
  //           setTimeout(() => {
  //             setStep(step + 1);
  //           }, 500);
  //           setSnackbar({
  //             open: true,
  //             message: "Appointment created successfully",
  //             severity: "success",
  //           });
  //           setSuccess(true);
  //           setError(false);
  //           setConfirmPopup(false);
  //         } catch (error: any) {
  //           setSnackbar({
  //             open: true,
  //             message: error.message as string,
  //             severity: "error",
  //           });
  //           setSuccess(false);
  //           setErrorMessage(error.message as string);
  //           setError(true);
  //         } finally {
  //           setSubmitting(false);
  //         }
  //       };
  //       // Call the function immediately
  //       await submitBookingData();
  //     }
  //   } catch (error: any) {
  //     setError(true);
  //     setErrorMessage(error.response?.data?.error || "Verification failed");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const verifyCode = async () => {
    setLoading(true);
    try {
      if (type === EnOTPType.EXISTING) {
        await handleExistingOTP();
      } else if (type === EnOTPType.NEW) {
        await handleNewOTP();
      }
    } catch (error: any) {
      // This will now only catch truly unhandled errors
      setError(true);
      setErrorMessage(error.response?.data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const sendAgain = async () => {
    setLoading(true);
    setSuccess(false);
    resendCode();
    setOtp("");
    setErrorMessage("");
    setLoading(false);
  };
  const handleProceed = () => {
    if (!otp.trim() || otp.length != 6) {
      setError(true);
      return;
    }
    verifyCode();
    // onSuccessfulVerification?.();
    // setStep(step + 1);
  };

  return (
    <Box>
      <Typography
        my={2}
        sx={{ fontSize: { xs: 24, md: 24 } }}
        align="center"
        variant="h3"
      >
        Enter the OTP sent to your phone
      </Typography>
      <Box my={4} display={"flex"} justifyContent={"center"}>
        <OTPInput value={otp} onChange={handleOtpChange} error={error} />
      </Box>
      {error && (
        <Typography align="center" color="error" variant="bodyMediumExtraBold">
          {errorMessage}
        </Typography>
      )}
      {success && !error && (
        <Typography
          align="center"
          color="success"
          variant="bodyMediumExtraBold"
        >
          OTP verified successfully.
        </Typography>
      )}

      <Typography
        align="center"
        mt={2}
        variant="bodyMediumExtraBold"
        color="grey.600"
      >
        Didn't receive the OTP?
      </Typography>
      <Box my={1} sx={{ textAlign: "center" }}>
        <Typography
          align="center"
          my={2}
          variant="bodyMediumExtraBold"
          color={"primary"}
          onClick={isResendDisabled ? undefined : sendAgain}
          sx={{
            cursor: isResendDisabled ? "not-allowed" : "pointer",
            display: "inline",
          }}
        >
          {isResendDisabled ? `Resend OTP in ${timer}s` : "Resend OTP"}
        </Typography>
      </Box>

      <Box display={"flex"} gap={2} pt={2} pb={3}>
        {!required && (
          <CommonButton
            fullWidth
            text="Back"
            variant="contained"
            color="secondary"
            onClick={() => setStep(step - 1)}
            disabled={loading}
            loading={loading}
          />
        )}
        <CommonButton
          type="submit"
          text="Proceed"
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleProceed}
          disabled={!otp.trim() || loading}
          loading={loading}
        />
      </Box>
    </Box>
  );
};

export default OtpReceiver;
