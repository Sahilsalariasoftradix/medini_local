import {
  Avatar,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
  Pagination,
  Select,
  MenuItem,
} from "@mui/material";
import addIcon from "../../assets/icons/add-icn.svg";
import React, { useEffect, useState } from "react";
import CommonTextField from "../../components/common/CommonTextField";
import search from "../../assets/icons/Search.svg";
import CommonButton from "../../components/common/CommonButton";
import { stringToColor } from "../../utils/common";
import { IContact } from "../../utils/Interfaces";
import {
  getContactsByUserId,
  deleteContactById,
} from "../../firebase/AuthService";
import { useAuth } from "../../store/AuthContext";
import useDebounce from "../../hooks/useDebounce";
import AddContact from "../../components/Booking/Form/AddContact";
import DeleteContact from "./form/DeleteContact";
import clearIcon from "../../assets/icons/InputCross.svg";
import styled from "styled-components";

const Contacts = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [openNewContactDialog, setOpenNewContactDialog] =
    useState<boolean>(false);
  const { selectedUser } = useAuth();
  const user_id = selectedUser?.user_id;
  const debouncedSearchValue = useDebounce(searchValue, 800);
  const [contactToDelete, setContactToDelete] = useState<IContact | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [editContact, setEditContact] = useState<IContact | null>(null);
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const filteredContacts = React.useMemo(() => {
    if (!debouncedSearchValue) return contacts;

    return contacts.filter((contact) => {
      const fullName = `${contact.firstName} ${
        contact.lastName || ""
      }`.toLowerCase();
      return fullName.includes(debouncedSearchValue.toLowerCase());
    });
  }, [contacts, debouncedSearchValue]);

  const paginatedContacts = React.useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredContacts.slice(startIndex, endIndex);
  }, [filteredContacts, page, itemsPerPage]);

  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);

  //   const handlePageChange = (
  //     event: React.ChangeEvent<unknown>,
  //     value: number
  //   ) => {
  //     setPage(value);
  //   };

  const loadInitialData = async () => {
    if (!user_id) return;
    setLoading(true);
    const contacts = await getContactsByUserId(user_id);
    setContacts(contacts);
    setLoading(false);
  };
  useEffect(() => {
    loadInitialData();
  }, [user_id]);

  const handleDeleteClick = (contact: IContact) => {
    setContactToDelete(contact);
    setDeleteDialogOpen(true);
  };
  const handleEditClick = (contact: IContact) => {
    setEditContact(contact);
    setEditDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!contactToDelete || !contactToDelete.id) return;

    try {
      setDeleteLoading(true);
      await deleteContactById(contactToDelete.id);

      // Update the contacts list after deletion
      setContacts(
        contacts.filter((contact) => contact.id !== contactToDelete.id)
      );

      setDeleteDialogOpen(false);
      setContactToDelete(null);
    } catch (error) {
      console.error("Error deleting contact:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setContactToDelete(null);
  };

  const CustomPaper = styled(Paper)(() => ({
    borderRadius: "8px",
    height: "calc(100vh - 300px)",
    boxShadow: "none",
  }));
  return (
    <Box>
      <Box display={"flex"} gap={2} justifyContent={"space-between"}>
        <CommonTextField
          placeholder="Search..."
          sx={{
            "& .MuiInputBase-root": {
              height: "46px",
            },
          }}
          startIcon={<img src={search} alt="search" />}
          endIcon={
            searchValue && (
              <IconButton onClick={() => setSearchValue("")}>
                <img
                  style={{ width: "20px", height: "20px" }}
                  src={clearIcon}
                  alt="clear"
                />
              </IconButton>
            )
          }
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <CommonButton
          text="+ Add New Contact"
          onClick={() => setOpenNewContactDialog(true)}
          variant="contained"
          color="primary"
          startIcon={<img src={addIcon} alt="" />}
          sx={{ minWidth: "200px", height: "46px" }}
        />
      </Box>
      <Box>
        {filteredContacts.length === 0 && !loading ? (
          <Box
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            height={"calc(100vh - 300px)"}
          >
            <Typography variant="bodyLargeExtraBold">
              {searchValue
                ? "No contacts match your search"
                : "No contacts found, add a new contact"}
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                height: "calc(100vh - 290px)",
              }}
            >
              {loading ? (
                <Box
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}
                  height={"100%"}
               
                >
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <TableContainer component={CustomPaper} sx={{ mt: 2 }}>
                    <Table>
                      <TableBody>
                        {paginatedContacts.map((contact, index) => (
                          <TableRow
                            key={
                              index ||
                              `${contact.firstName}-${contact.lastName}`
                            }
                          >
                            <TableCell>
                              <Box
                                display={"flex"}
                                gap={2}
                                alignItems={"center"}
                              >
                                <Avatar
                                  sx={{
                                    bgcolor: stringToColor(contact.firstName),
                                    width: 40,
                                    height: 40,
                                  }}
                                >
                                  {contact.firstName.charAt(0).toUpperCase()}
                                  {contact.lastName?.charAt(0).toUpperCase()}
                                </Avatar>
                                <Typography variant="bodyLargeExtraBold">
                                  {contact.firstName} {contact.lastName}
                                </Typography>
                              </Box>
                            </TableCell>

                            <TableCell align="right">
                              <Box display="flex" gap={2} justifyContent="flex-end">
                                <CommonButton
                                  text="Edit"
                                  onClick={() => handleEditClick(contact)}
                                  variant="contained"
                                  color="primary"
                                  sx={{ minWidth: "120px", height: "46px" }}
                                />
                                <CommonButton
                                  text="Remove"
                                  onClick={() => handleDeleteClick(contact)}
                                  variant="contained"
                                  color="error"
                                  sx={{ minWidth: "120px", height: "46px" }}
                                  
                                />
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </Box>
            {/* {filteredContacts.length > itemsPerPage && ( */}
            <Box display="flex" justifyContent="space-between" p={2}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="bodyMediumMedium" color="grey.600">
                  Show result:
                </Typography>
                <Select
                  value={itemsPerPage}
                  //@ts-ignore
                  onChange={(e) => {
                    //@ts-ignore
                    setItemsPerPage(parseInt(e.target.value));
                    setPage(1);
                  }}
                  size="small"
                  sx={{
                    minWidth: "70px",
                    height: "36px",
                    "& .MuiSelect-select": {
                      py: "6px",
                    },
                  }}
                >
                  {/* <MenuItem value={5}>5</MenuItem> */}
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </Box>
              <Pagination
                variant="outlined"
                shape="rounded"
                count={totalPages}
                page={page} // MUI Pagination uses 1-based index
                //@ts-ignore
                onChange={(e, page) => setPage(page)}
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
              />
              {/* <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                /> */}
            </Box>
            {/* )} */}
          </>
        )}
      </Box>
      {/* Add Contact Dialog */}
      <AddContact
        fetchContacts={loadInitialData}
        openDialog={openNewContactDialog}
        setOpenDialog={setOpenNewContactDialog}
      />
      {/* Edit Dialog */}
      {editDialogOpen && editContact && (
        <AddContact
          fetchContacts={loadInitialData}
          openDialog={editDialogOpen}
          setOpenDialog={setEditDialogOpen}
          contact={editContact}
        />
      )}
      {/* Delete Dialog */}
      <DeleteContact
        deleteDialogOpen={deleteDialogOpen}
        cancelDelete={cancelDelete}
        confirmDelete={confirmDelete}
        contactToDelete={contactToDelete}
        deleteLoading={deleteLoading}
      />
    </Box>
  );
};

export default Contacts;
