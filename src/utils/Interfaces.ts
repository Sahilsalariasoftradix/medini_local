import dayjs, { Dayjs } from "dayjs";
import { Dispatch, SetStateAction } from "react";
import { EnBookingType, EnMessageRole, EnShowPurposeUI } from "./enums";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
export interface LoginFormValues {
  email: string;
  password: string;
}

export interface UserFormValues {
  email: string;
  password: string;
  displayName: string;
}
export interface INewUserDetails {
  name: string;
}
//*  Step form
export interface IUserDetails {
  reasonForUsing: string;
  reasonForUsingStep: string;
  calendarName: string;
  collaborators: string[]; // For invited collaborators
  companyDetails: ICompanyDetails;
  handleBookings: number | null;
  [key: string]: any; // For dynamic fields if needed
}
export interface ICompanyDetails {
  company_name: string;
  address_line_one: string;
  address_line_two: string;
  city: string;
  country: string;
  in_person_appointments: boolean;
  max_appointment_time: number;
}
export interface IStepFormContextType {
  currentStep: number;
  userDetails: IUserDetails;
  goToNextStep: () => void;
  skipNextStep: () => void;
  goToPreviousStep: () => void;
  updateUserDetails: (updates: Partial<IUserDetails>) => void;
  resetForm: () => void;
  setCompanyId: Dispatch<SetStateAction<number | null>>;
  companyId: number | null;
  companyNumber: string;
  setCompanyNumber: Dispatch<SetStateAction<string>>;
}
export interface IEventLogEnum {
  id: number;
  name: string;
  icons: string;
}
export interface IChatContacts{
  id: string;
  contactName: string;
  createdAt: string;
  lastMessageAt: string;
}
export interface IHeaderProps {
  isMobile: boolean;
  open: boolean;
  toggleDrawer: () => void;
  pageName: string;
}
export interface INewContactData {
  user_id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}
export interface IFilm {
  title: string;
  year: number;
}

export interface IAvailability {
  day_of_week: string | null;
  phone_start_time: string | null;
  phone_end_time: string | null;
  in_person_start_time: string | null;
  in_person_end_time: string | null;
  break_start_time: string | null;
  break_end_time: string | null;
}
export interface ISlotBookingFormProps {
  control: any;
  errors: any;
  openContactSearch: boolean;
  handleOpen: () => void;
  handleClose: () => void;
  options: readonly IFilm[];
  loading: { input: boolean };
  shouldDisableDate: (date: Dayjs) => boolean;
  selectedDate: dayjs.Dayjs;
  selectedTime: string;
  isEditing?: boolean;
}
export interface Option {
  title: string;
  year?: number;
  [key: string]: any;
}
export interface ISearchInputProps {
  options: readonly Option[];
  loading?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  open?: boolean;
  placeholder?: string;
  onChange?: (value: Option | null) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  value?: any;
  defaultValue?: any;
  getOptionLabel?: (option: any) => string;
  isEditing?: boolean;
  setSelectedContact?: Dispatch<SetStateAction<null>>;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
}

export interface IAvailabilityRequest {
  user_id: number;
  availabilities: IAvailability[];
}
export interface IAvailabilitySpecific {
  user_id: number;
  date: string;
  phone_start_time: string;
  phone_end_time: string;
  in_person_start_time: string;
  in_person_end_time: string;
}
export interface IAvailabilityPayload {
  user_id: number;
  date: string;
  phone_start_time: string | null;
  phone_end_time: string | null;
  in_person_start_time: string | null;
  in_person_end_time: string | null;
  break_start_time?: string | null;
  break_end_time?: string | null;
}
export interface IDayAvailability {
  date: string;
  phone_start_time: string | null;
  break_start_time: string | null;
  break_end_time: string | null;
  phone_end_time: string | null;
  in_person_start_time: string | null;
  in_person_end_time: string | null;
}
export interface IDayHeaderProps {
  day: string;
  date: any;
  onEditAvailability: () => void;
  onClearDay: () => void;
  isAvailable: boolean;
  isToday: boolean;
  isBeforeToday?: boolean;
}
export interface ISchedule {
  day_of_week: string;
  phone_start_time: string;
  phone_end_time: string;
  in_person_start_time: string;
  in_person_end_time: string;
  break_start_time: string;
  break_end_time: string;
}
export interface ISelectedCell {
  dayIndex: number;
  type: "phone" | "in_person" | "break";
  isStart: boolean;
}
export interface IScheduleType {
  icon: string;
  bgColor: string;
}

export interface IGetAvailability {
  user_id: number;
  date: string;
  range: "week" | "month" | "day";
}
// Interface for GetAvailability extends from IGetRangeData
export type TGetBooking = IGetAvailability;
export interface IContact {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  user_id?: string;
}
export interface IAvailability {
  day_of_week: string | null;
  phone_start_time: string | null;
  phone_end_time: string | null;
  in_person_start_time: string | null;
  in_person_end_time: string | null;
  break_start_time: string | null;
  break_end_time: string | null;
}
export interface IGetBookingFiltered {
  id: number;
  start_time: string;
  end_time: string;
  booking_type: EnBookingType.IN_PERSON | EnBookingType.PHONE;
}
export interface IBooking {
  booking_id?: number;
  user_id: number;
  date: string;
  start_time: string;
  end_time: string;
  details: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  booking_type: EnBookingType.IN_PERSON | EnBookingType.PHONE;
  code?: string;
}
export interface IUpdateBooking {
  booking_type: EnBookingType.IN_PERSON | EnBookingType.PHONE;
  user_id: number;
  booking_id: number;
  date: string;
  start_time: string;
  end_time: string;
  details: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}
export interface IBookingIds {
  booking_ids: number[];
}
export interface IBookingResponse {
  booking_id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  date: string;
  start_time: string;
  end_time: string;
  details: string;
  user_id: number;
  status: string;
  booking_type: EnBookingType.IN_PERSON | EnBookingType.PHONE;
}
export interface IAppointment {
  id: string;
  startTime: string;
  status: string;
  length: string;
  parentId?: string;
}

export interface ITimeSlot {
  from: string;
  to: string;
}

export interface IDayAvailability {
  phone?: ITimeSlot;
  in_person?: ITimeSlot;
  break?: ITimeSlot;
}

export type IGetContacts = IContact[];
export interface IUser {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  // password: string;
  company_id?: number;
}
export interface IUserDetails extends IUser {
  user_id: number;
}
export interface ISecretary extends IUser {
  company_id?: number;
  password: string;
}

export interface ICall {
  call_id?: number;
  user_id: number;
  is_scheduled_call?: boolean;
  scheduled_call_time: string;
  to: string;
  from: string;
  agenda: string; // BOOK_APPOINTMENT, CANCEL_APPOINTMENT, RESCHEDULE_APPOINTMENT, INFORM_PATIENT
  customer_name: string;
  // # request_info
  call_reason?: string;
  // # book_appointment
  appointment_reason?: string;
  is_in_person?: boolean;
  book_from_date?: string;
  book_till_date?: string;
  appointment_length?: number;
  // # cancel_appointment
  booking_id_to_cancel?: number;
  reason_for_cancellation?: string;
  // # reschedule_appointment
  reschedule_appointment_reason?: string;
  reschedule_is_in_person?: boolean;
  reschedule_book_from_date?: string;
  reschedule_book_till_date?: string;
  reschedule_appointment_length?: number;
  reschedule_booking_id?: number;
  // # inform_patient
  info_to_patient?: string;
}
export interface Data {
  id: number;
  contact: string | null;
  patientId: string;
  date: string;
  callPurpose?: string;
  length: string;
  details: string;
  status?: EnShowPurposeUI;
}
export interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  numeric: boolean;
  sortable: boolean; // Add this property
}
export type Order = "asc" | "desc";
export interface EnhancedTableProps {
  // numSelected: number;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => void;
  // onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  // rowCount: number;
}
export interface IGetBookingsByUser {
  bookings: IBooking[];
}
export interface ICallHistory {
  id: number;
  user_id: number;
  time: string;
  from_phone: string;
  to_phone: string;
  duration: number;
  caller: string | null;
  call_purpose: string;
  scheduled_time?: string;
  call_failed?: boolean;
  payload: {
    call_reason: string;
    appointment_length: number;
    appointment_reason: string;
    book_from_date: string;
    book_till_date: string;
    is_in_person: boolean;
    appointment_id: number;
    booking_id_to_cancel: number;
    reschedule_appointment_reason: string;
    reschedule_is_in_person: boolean;
    reschedule_book_from_date: string;
    reschedule_book_till_date: string;
    reschedule_appointment_length: number;
    reschedule_booking_id: number;
  } | null;
}
export interface ICompanyUsers {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}
export interface ICompanyData {
  company_id: number;
  company_name: string;
  max_appointment_time: number;
  users: ICompanyUsers[];
}
export interface IGetCustomerBookings {
  booking_id: number;
  user_first_name: string;
  user_last_name: string;
  booking_first_name: string;
  booking_last_name: string;
  booking_type: EnBookingType.IN_PERSON | EnBookingType.PHONE;
  phone: string;
  email: string;
  date: string;
  start_time: string;
  end_time: string;
  details: string;
  user_id: number;
  company_id: number;
}
export interface IAISchedule {
  day_of_week: string;
  is_ai_on_all_day: boolean;
  is_custom: boolean;
  start_time: string | null;
  end_time: string | null;
}
export interface ICompany {
  id: number;
  address_line_one: string;
  address_line_two: string;
  ai_enabled:number;
  city:string;
  country:string;
  in_person_appointments:number;
  max_appointment_time:number;
  company_name:string;
  phone_number:string;
  company_code:string;
}
export interface IEventLogs{
  id:number;
  user_id:number;
  color:string;
  name:string;
  type:string;
  created_at:string;
  event_type_id:number;
  event_type_name:string;
  event_type_icon:string;
}

export interface IMessage {
  id: string;
  // sender: EnMessageRole;
  content: string;
  timestamp: string;
  role: EnMessageRole;
}
