import { Typography } from "@mui/material";
import React, { useState } from "react";
import CommonDialog from "../../common/CommonDialog";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createNewContact } from "../../../firebase/AppointmentService";
import CommonTextField from "../../common/CommonTextField";
import { z } from "zod";
import { formErrorMessage } from "../../../utils/errorHandler";
import { useAuthHook } from "../../../hooks/useAuth";
import CommonSnackbar from "../../common/CommonSnackbar";
import { useAuth } from "../../../store/AuthContext";
import { MuiPhone } from "../../Auth/SignUp/CustomPhoneInput";
import { IContact } from "../../../utils/Interfaces";
import { updateContact } from "../../../firebase/AuthService";

const contactSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  email: z
    .string()
    .min(1, { message: formErrorMessage.email.required }) // Checks if the field is empty
    .email({ message: formErrorMessage.email.invalid }),
});

export type ContactData = z.infer<typeof contactSchema>;

const AddContact = ({
  openDialog,
  setOpenDialog,
  fetchContacts, // Add this as a prop to call fetchContacts
  contact,
}: // formType,
{
  openDialog: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  fetchContacts: () => void; // This will be the fetchContacts function passed from parent
  contact?: IContact;
}) => {
  const {
    setSnackbarOpen,
    snackbarMessage,
    setSnackbarMessage,
    snackbarSeverity,
    handleSnackbarClose,
    setSnackbarSeverity,
    snackbarOpen,
    setIsLoading,
  } = useAuthHook();
  const {
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting, errors: contactErrors },
  } = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: contact?.firstName || "",
      lastName: contact?.lastName || "",
      email: contact?.email || "",
    },
  });
  const { selectedUser } = useAuth();
  const user_id = selectedUser?.user_id;
  const [phone, setPhone] = useState(contact?.phone || "");
  const [formSubmitted, setFormSubmitted] = useState(false);

  const onSubmit: SubmitHandler<ContactData> = async (data) => {
    setFormSubmitted(true);
    if (phone.length < 12) {
      setSnackbarSeverity("error");
      setSnackbarMessage("Please enter a valid phone number");
      setSnackbarOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      await createNewContact({ ...data, user_id: user_id!, phone });
      setSnackbarOpen(true);
      setSnackbarSeverity("success");
      setSnackbarMessage("Contact created successfully!");
      setTimeout(() => {
        setOpenDialog(false);
        reset();
        setPhone("");
        setIsLoading(false);
        setSnackbarOpen(false);
      }, 500);
      fetchContacts();
    } catch (error: any) {
      setSnackbarMessage(
        "Phone number already exists. Please use a different number."
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      console.error("Error submitting form:", error);
      setIsLoading(false);
    } finally {
      setFormSubmitted(false);
    }
  };

  const editContact = async (data: ContactData) => {
    setIsLoading(true);
    try {
      await updateContact({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: phone,
        id: contact?.id || "",
      });
      setSnackbarOpen(true);
      setSnackbarSeverity("success");
      setSnackbarMessage("Contact updated successfully!");
      setTimeout(() => {
        setOpenDialog(false);
        reset();
        setPhone("");
        setIsLoading(false);
        setSnackbarOpen(false);
      }, 500);
      fetchContacts();
    } catch (error: any) {
      setSnackbarMessage("Failed to update contact");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      console.error("Error updating contact:", error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <CommonDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          reset();
        }}
        confirmButtonType="primary"
        title={contact ? "Edit Contact" : "New Contact"}
        confirmText={contact ? "Update" : "Confirm"}
        cancelText="Cancel"
        onConfirm={handleSubmit(contact ? editContact : onSubmit)}
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        <Typography variant="bodyMediumExtraBold" color="grey.600">
          First Name
        </Typography>
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <CommonTextField
              helperText={contactErrors.firstName?.message}
              error={!!contactErrors.firstName}
              {...field}
              fullWidth
            />
          )}
        />

        <Typography variant="bodyMediumExtraBold" color="grey.600">
          Last Name
        </Typography>
        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <CommonTextField
              helperText={contactErrors.lastName?.message}
              error={!!contactErrors.lastName}
              {...field}
              fullWidth
            />
          )}
        />

        <Typography variant="bodyMediumExtraBold" color="grey.600">
          Email
        </Typography>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <CommonTextField
              error={!!contactErrors.email}
              helperText={contactErrors.email?.message}
              {...field}
              fullWidth
            />
          )}
        />

        <Typography variant="bodyMediumExtraBold" color="grey.600">
          Phone
        </Typography>
        <MuiPhone
          error={formSubmitted && (!phone || phone.length < 12)}
          value={phone}
          onChange={(phone) => setPhone(phone)}
        />
        {/* Snackbar */}
        <CommonSnackbar
          open={snackbarOpen}
          onClose={handleSnackbarClose}
          message={snackbarMessage}
          severity={snackbarSeverity}
        />
      </CommonDialog>
    </>
  );
};

export default AddContact;
