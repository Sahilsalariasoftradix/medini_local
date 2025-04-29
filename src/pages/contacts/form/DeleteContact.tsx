import { Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material'
import CommonButton from '../../../components/common/CommonButton'
import { IContact } from '../../../utils/Interfaces';

const DeleteContact = ({
  deleteDialogOpen,
  cancelDelete,
  confirmDelete,
  contactToDelete,
  deleteLoading,
}: {
  deleteDialogOpen: boolean;
  cancelDelete: () => void;
  confirmDelete: () => void;
  contactToDelete: IContact | null;
  deleteLoading: boolean;
}) => {
  return (
    <Dialog open={deleteDialogOpen} onClose={cancelDelete}>
    <DialogTitle sx={{ textAlign: "center" }}>
      <Typography variant="h4">Delete Contact</Typography>
    </DialogTitle>
    <DialogContent>
      <DialogContentText mb={2}>

        <Typography variant="bodyXLargeSemiBold">
          Are you sure you want to delete{" "}
          <span style={{ color: "#000", fontWeight: "bold" }}>
            {contactToDelete?.firstName} {contactToDelete?.lastName} ?
          </span>{" "}
        </Typography>
      </DialogContentText>
      <Box
        sx={{
          display: "flex",
          bgcolor: "#FFF3E0", // Light orange background
          border: "1px solid #FFE0B2",
          borderRadius: "4px",
          mb: 2,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: "8px",
            bgcolor: "#FF5722", // Orange/red sidebar
            mr: 2,
          }}
        />
        <Box py={2} pr={2}>
          <Typography
            variant="bodyLargeExtraBold"
            color="#D84315"
            display="flex"
            alignItems="center"
            gap={1}
          >
            <span style={{ fontSize: "20px" }}>⚠</span> Warning
          </Typography>
          <Typography variant="body1">
            By deleting this contact, you won't be able to access their
            information.
          </Typography>
        </Box>
      </Box>
    </DialogContent>
    <DialogActions sx={{ display: "block" }}>
      <Box display={"flex"} gap={2}>
        <CommonButton

          text="Cancel"
          onClick={cancelDelete}
          variant="outlined"
          color="primary"
          sx={{ width: "100%" }}
        />
        <CommonButton
          loading={deleteLoading}
          disabled={deleteLoading}
          text="Delete"
          onClick={confirmDelete}
          variant="contained"
          color="error"
          sx={{ width: "100%" }}
        />
      </Box>
    </DialogActions>
  </Dialog>
  )
}

export default DeleteContact