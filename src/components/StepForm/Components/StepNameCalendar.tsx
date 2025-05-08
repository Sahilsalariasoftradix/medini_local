import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import {
  CalenderNameSchema,
  CalenderNameSchemaType,
  useStepForm,
} from "../../../store/StepFormContext";
import Grid from "@mui/material/Grid2";
import { staticText } from "../../../utils/staticText";
import CommonButton from "../../common/CommonButton";
import CommonTextField from "../../common/CommonTextField";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import StepFormLayout from "../StepFormLayout";
import { MuiPhone } from "../../Auth/SignUp/CustomPhoneInput";
import { useAuthHook } from "../../../hooks/useAuth";
import { IUser } from "../../../utils/Interfaces";
import { createUser, joinUserViaSecretary } from "../../../api/userApi";
import { useAuth } from "../../../store/AuthContext";
import {
  getCurrentUserId,
  updateUsersArray,
} from "../../../firebase/AuthService";
import { userNotSignedInErrorMessage } from "../../../utils/errorHandler";
import CommonSnackbar from "../../common/CommonSnackbar";

const NameYourCalendar: React.FC = () => {
  const { skipNextStep } = useStepForm();
  const { userDetails, setUserDetails } = useAuth();
  const [phone, setPhone] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const {
    setSnackbarOpen,
    snackbarMessage,
    setSnackbarMessage,
    snackbarSeverity,
    handleSnackbarClose,
    setSnackbarSeverity,
    snackbarOpen,
    isLoading,
    setIsLoading,
  } = useAuthHook();
  // Validate hook
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CalenderNameSchemaType>({
    resolver: zodResolver(CalenderNameSchema),
  });

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
        company_id: userDetails.company_id!,
      };

      const responseData = await createUser(userData);
      await joinUserViaSecretary(
        userDetails.secretaryID!,
        responseData.user.user_id!
      );
      // Step 1: Get the current user ID
      const userId = getCurrentUserId();
      if (!userId) {
        setIsLoading(false);
        throw new Error(userNotSignedInErrorMessage);
      }
      updateUsersArray(userId, [
        {
          ...userData,
          user_id: responseData.user.user_id!,
          company_id: userDetails.company_id!,
        },
      ]);
      setUserDetails({
        ...userDetails,
        users: Array.isArray(userDetails.users)
          ? [
              ...userDetails.users,
              {
                ...userData,
                user_id: responseData.user.user_id!,
              },
            ]
          : [
              {
                ...userData,
                user_id: responseData.user.user_id!,
              },
            ],
      });
      // updateUserDetailsInFirestore(userId, {
      //   ...userData,
      //   user_id: responseData.user.user_id,
      // });
      skipNextStep();
    } catch (error: any) {
      console.log(error.message);
      setSnackbarSeverity("error");
      setSnackbarMessage(error.message);
      setSnackbarOpen(true);
      setIsLoading(false);
    }
    // updateUserDetails({
    //   firstName: data.firstName,
    //   lastName: data.lastName,
    //   email: data.email,
    //   phone: phone,
    // });
  };

  return (
    <StepFormLayout>
      <Typography variant="h3" align="center" mb={2}>
        {staticText.auth.nameYourCalenderText}
      </Typography>
      <Typography
        variant="bodyLargeMedium"
        mb={4}
        color="grey.600"
        align="center"
      >
        {" "}
        {staticText.auth.nameYourCalenderDescription}
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid size={6}>
            <CommonTextField
              sx={{ mt: 1 }}
              placeholder="First name"
              register={register("firstName")}
              errorMessage={errors.firstName?.message}
            />
          </Grid>
          <Grid size={6}>
            <CommonTextField
              sx={{ mt: 1 }}
              placeholder="Last name"
              register={register("lastName")}
              errorMessage={errors.lastName?.message}
            />
          </Grid>
        </Grid>

        <CommonTextField
          sx={{ mt: 1 }}
          placeholder="Email"
          register={register("email")}
          errorMessage={errors.email?.message}
        />
        <Box mt={1}>
          <MuiPhone
            error={formSubmitted && (!phone || phone.length < 12)}
            value={phone}
            onChange={(phone) => setPhone(phone)}
          />
        </Box>

        <CommonButton
          text={staticText.auth.stepContinueText}
          sx={{ mt: 5 }}
          type="submit"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
        />
        {/* <Button variant="contained" onClick={goToPreviousStep} sx={{ mr: 2 }}>
          Back
        </Button> */}
      </form>
      <CommonSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={handleSnackbarClose}
      />
    </StepFormLayout>
  );
};

export default NameYourCalendar;
