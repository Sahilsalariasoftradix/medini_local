import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  deleteDoc,
} from "firebase/firestore";
import { firebaseAuth, firebaseFirestore } from "./BaseConfig";
import {
  emailCheckingError,
  emailCheckingErrorPlaceholder,
  emailNotExistMessage,
  emailNotVerifiedMessage,
  errorFetchingReasonsMessage,
  errorFetchingReasonsMessageText,
  getAuthErrorMessage,
  onBoardingFieldNotFoundMessage,
  onboardingStatusError,
  onboardingStatusErrorMessage,
  updateUserError,
  updateUserErrorPlaceholder,
  userDocDoesNotExistMessage,
} from "../utils/errorHandler";
import { IContact, IUserDetails } from "../utils/Interfaces";
import { staticText } from "../utils/staticText";
import {
  EnFirebaseCollections,
  EnMessageSender,
  EnOnboardingStatus,
  EnSocialLogin,
  EnVerifiedStatus,
} from "../utils/enums";
import { createSecretary } from "../api/userApi";
import { generateRandomString } from "../utils/helper";

//* Function to get the Onboarding Status
export const getOnboardingStatus = async (userId: string): Promise<number> => {
  try {
    // Reference to the user's document in Firestore using the provided userId
    const userRef = doc(firebaseFirestore, EnFirebaseCollections.USERS, userId); // Replace "users" with the correct collection name if needed

    // Fetch the document snapshot for the specified user
    const userDoc = await getDoc(userRef);

    // Check if the user document exists in the Firestore database
    if (userDoc.exists()) {
      // Retrieve the onboardingStatus field from the document data
      const onboardingStatus = userDoc.data()?.onboardingStatus; // Assuming the field is called "onboardingStatus"
      // If onboardingStatus exists, return its value
      if (onboardingStatus !== undefined) {
        return onboardingStatus; // Return the onboarding status
      } else {
        // If onboardingStatus is missing in the document, throw an error
        throw new Error(onBoardingFieldNotFoundMessage); // Custom error message for missing field
      }
    } else {
      // If the document does not exist (user not found), throw an error
      throw new Error(userDocDoesNotExistMessage); // Custom error message for missing user document
    }
  } catch (error: any) {
    // Log any errors that occur during the process for debugging purposes
    console.error(onboardingStatusErrorMessage, error.message);
    // Rethrow the error with a generic error message
    throw new Error(onboardingStatusError); // Generic error message to be thrown after logging
  }
};

//* Get User Details
export const getUserDetails = async (userId: string) => {
  const userRef = doc(firebaseFirestore, EnFirebaseCollections.USERS, userId);
  const userDoc = await getDoc(userRef);
  return userDoc.data();
};

//* Function to check if the email exists in the Firestore 'users' collection
const checkIfEmailExists = async (email: string) => {
  // Get a reference to the Firestore database
  const db = getFirestore();
  // Reference to the 'users' collection in Firestore
  const usersRef = collection(db, EnFirebaseCollections.USERS);
  // Create a query to search for a document where the 'email' field matches the provided email
  const q = query(usersRef, where("email", "==", email));

  try {
    // Execute the query and get the querySnapshot, which contains the results
    const querySnapshot = await getDocs(q);
    // If querySnapshot is not empty, it means an email match was found in the collection
    return !querySnapshot.empty; // Returns true if the email exists, false otherwise
  } catch (error) {
    // Log any errors that occur during the check for debugging purposes
    console.error(emailCheckingErrorPlaceholder, error);
    // Rethrow the error with a generic message if something goes wrong
    throw new Error(emailCheckingError); // Custom error message for the email checking operation
  }
};

//* Function to get the current user's UID from Firebase Authentication
export const getCurrentUserId = (): string | null => {
  // Access the currently authenticated user from Firebase Authentication
  const user = firebaseAuth.currentUser;
  // If a user is authenticated, return their UID; otherwise, return null
  return user ? user.uid : null; // user.uid contains the unique identifier for the authenticated user
};

//* Function to update a user's details in the Firestore database
export const updateUserDetailsInFirestore = async (
  userId: string, // User ID to identify the document to update
  userDetails: Partial<IUserDetails>, // Using Partial to allow updating only some of the user's details
  companyId?: number // Added companyId as a parameter
): Promise<void> => {
  try {
    // Create an update object by spreading the provided userDetails
    // Add the updated timestamp and set the onboardingStatus to a default value
    const userDocUpdate: any = {
      ...userDetails, // Merge the provided user details with other fields
      // company_id: companyId, // Add companyId to the update
      updatedAt: serverTimestamp(), // Add a server-generated timestamp for the update time

      // onboardingStatus: EnOnboardingStatus.STATUS_1, // Set onboarding status to a default value (STATUS_1)
    };
    // Add company_id to the update only if it is provided
    if (companyId !== undefined) {
      userDocUpdate.company_id = companyId;
    }
    // Reference to the specific user's document in Firestore using the userId
    const userRef = doc(firebaseFirestore, EnFirebaseCollections.USERS, userId);

    // Update the user document in Firestore with the new details
    await updateDoc(userRef, userDocUpdate);

    // console.log("User details successfully updated in Firestore!");
  } catch (error) {
    // Log any errors that occur during the update process for debugging
    console.error(updateUserErrorPlaceholder, error);
    // Rethrow the error with a custom error message
    throw new Error(updateUserError); // Custom error message for failed update operation
  }
};

//* Function to fetch all reasons from the Firestore 'reasons' collection
export const getReasons = async () => {
  // Get a reference to the Firestore database
  const db = getFirestore();
  // Reference to the 'reasons' collection in Firestore
  const reasonsCollection = collection(db, EnFirebaseCollections.REASONS);

  try {
    // Fetch all documents from the 'reasons' collection
    const snapshot = await getDocs(reasonsCollection);
    // Map through the documents in the snapshot and create an array of reason objects
    const reasonsList = snapshot.docs.map((doc) => ({
      id: doc.id, // Include the document ID for each reason
      ...doc.data(), // Include the rest of the document's data
    }));
    // Return the list of reasons
    return reasonsList;
  } catch (error) {
    // Log an error message if something goes wrong during the fetch
    console.error(errorFetchingReasonsMessage, error);
    // Rethrow the error with a custom error message
    throw new Error(errorFetchingReasonsMessageText); // Custom error message for failed fetching operation
  }
};
//* Function to fetch all contacts from the Firestore 'contacts' collection
export const getContactsByUserId = async (
  userId: string | number,
  //@ts-ignore
  isTable?: boolean
): Promise<IContact[]> => {
  const db = getFirestore();
  const contactsCollection = collection(db, EnFirebaseCollections.CONTACTS);

  try {
    // Query Firestore to filter contacts by user_id
    const contactsQuery = query(
      contactsCollection,
      where("user_id", "==", userId)
    );
    const snapshot = await getDocs(contactsQuery);

    // Map through the documents and return the filtered contacts
    const contactsList = snapshot.docs.map((doc) => ({
      id: doc.id, // Add the document ID to each contact
      ...doc.data(), // Spread document data
    }));

    return contactsList as IContact[];
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw new Error("Could not fetch contacts for the given user ID");
  }
};

export const generateSequentialId = async (
  collectionName: string
): Promise<number> => {
  const counterRef = doc(
    firebaseFirestore,
    EnFirebaseCollections.COUNTERS,
    collectionName
  );

  return await runTransaction(firebaseFirestore, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    let newId = 1; // Default starting ID

    if (counterDoc.exists()) {
      newId = counterDoc.data().lastId + 1;
    }

    // Update Firestore counter document
    transaction.set(counterRef, { lastId: newId });

    return newId;
  });
};
export const signUpWithEmail = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  // user_id: number,
  secretary_id: number
): Promise<string | void> => {
  try {
    // Step 1: Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );
    const user = userCredential.user;
    await signOut(firebaseAuth); // Sign out the user immediately after creation (optional)

    // Step 2: Generate auto-incrementing `prop` ID using a Firestore transaction

    // Step 3: Save user details in Firestore
    const userData = {
      id: user.uid,
      // uuid: newPropId, // Auto-incremented ID
      // user_id: user_id,
      email: user.email,
      firstName,
      lastName,
      createdAt: Timestamp.now().seconds,
      updatedAt: null,
      deletedAt: null,
      status: EnVerifiedStatus.UNVERIFIED,
      onboardingStatus: EnOnboardingStatus.STATUS_0,
      secretaryID: secretary_id,
    };

    await setDoc(
      doc(firebaseFirestore, EnFirebaseCollections.USERS, user.uid),
      userData
    );

    // Step 4: Send email verification
    await sendEmailVerification(user);

    // Step 5: Return success message
    return `Welcome, ${firstName} ${lastName}! ${staticText.firestore.accountSucceededMessage}`;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};
//* Function to sign in a user with email and password, verify email, and update Firestore status
export const signInWithEmail = async (
  email: string, // User's email address
  password: string // User's password
): Promise<string> => {
  try {
    // Step 1: Attempt to sign the user in with Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(
      firebaseAuth, // Firebase Auth instance
      email, // User's email
      password // User's password
    );
    // Get the user object from the credential
    const user = userCredential.user;

    // Step 2: Check if email is verified
    if (!user.emailVerified) {
      await signOut(firebaseAuth); // Immediately sign out the user if the email is not verified
      const message = emailNotVerifiedMessage; // Message you return when email isn't verified
      throw new Error(message); // Throw an error so it can be caught in your `onSubmit` handler
    }

    // Step 3: If email is verified, update the user's status in Firestore
    const userRef = doc(
      firebaseFirestore,
      EnFirebaseCollections.USERS,
      user.uid
    );
    // Update the status to "verified" in the Firestore document
    await updateDoc(userRef, { status: EnVerifiedStatus.VERIFIED });

    // Step 4: Return success message
    const successMessage = staticText.firestore.successLoggedInMessage; // Custom success message
    return successMessage; // Return the success message after successful login
  } catch (error: any) {
    if (error.message === emailNotVerifiedMessage) {
      throw error;
    }

    // Step 5: Handle errors and log them for debugging
    const errorMessage = getAuthErrorMessage(error.code); // Map the Firebase error code to a user-friendly message
    console.error(errorMessage); // Log the error message to the console for debugging
    throw new Error(errorMessage); // Rethrow the error with the custom error message for handling in the UI
  }
};

// * Function to reset a user's password by sending a password reset email
export const resetPasswordWithEmail = async (
  email: string // User's email address to send the reset link to
): Promise<string> => {
  try {
    // Step 1: Check if the email exists in Firestore
    const emailExists = await checkIfEmailExists(email); // Check if the email is registered

    if (!emailExists) {
      // If the email is not found in Firestore, throw an error
      throw new Error(emailNotExistMessage); // Custom error message when email doesn't exist
    }

    // Step 2: If the email exists, send the password reset email
    await sendPasswordResetEmail(firebaseAuth, email); // Firebase function to send the reset email
    // Return a success message after the email is sent
    return staticText.firestore.passwordResetText; // Custom success message (e.g., "Password reset email sent")
  } catch (error: any) {
    // Step 3: Handle any errors that occur during the process
    // Convert Firebase error codes to user-friendly error messages
    throw new Error(getAuthErrorMessage(error.code)); // Throw a custom error for UI handling
  }
};

//* Google sign-in function using Firebase Authentication
export const signInWithGoogle = async (
  setUserDetails: (details: any) => void,
  setLoading: (loading: boolean) => void
): Promise<string | void> => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(firebaseAuth, provider);

    const user = result.user;

    if (!user) throw new Error("Google sign-in failed");
    setLoading(true);
    const userRef = doc(
      firebaseFirestore,
      EnFirebaseCollections.USERS,
      user.uid
    );
    const userSnap = await getDoc(userRef);

    let userDetails;

    if (!userSnap.exists()) {
      // Step 2: Generate auto-incrementing `prop` ID using a Firestore transaction

      const newPropId = await generateSequentialId(EnFirebaseCollections.USERS);
      // Extract first and last name
      const fullName = user.displayName?.split(" ") || ["", ""];
      const firstName = fullName[0] || "";
      const lastName = fullName.slice(1).join(" ") || firstName; // Handles multi-word last names

      // Create secretary in API
      try {
        // Import at the top of the file

        const payload = {
          first_name: firstName,
          last_name: lastName,
          email: user.email,
          password: "medini-ai",
        };
        //@ts-ignore
        const response = await createSecretary(payload);

        // Get the secretary ID from the response
        const secretaryId = response.secretary.secretary_id;

        userDetails = {
          uid: user.uid,
          uuid: newPropId, // Auto-incremented ID
          firstName,
          lastName,
          email: user.email || "",
          photoURL: user.photoURL || "",
          createdAt: Timestamp.now().seconds, // Store as seconds
          updatedAt: null,
          deletedAt: null,
          status: EnVerifiedStatus.VERIFIED,
          onboardingStatus: EnOnboardingStatus.STATUS_0,
          loginType: EnSocialLogin.GOOGLE,
          secretaryID: secretaryId, // Add secretary ID to user details
        };
      } catch (apiError) {
        console.error("Failed to create secretary record:", apiError);

        // Proceed with user creation without secretary ID if API call fails
        userDetails = {
          uid: user.uid,
          uuid: newPropId,
          firstName,
          lastName,
          email: user.email || "",
          photoURL: user.photoURL || "",
          createdAt: Timestamp.now().seconds,
          updatedAt: null,
          deletedAt: null,
          status: EnVerifiedStatus.VERIFIED,
          onboardingStatus: EnOnboardingStatus.STATUS_0,
          loginType: EnSocialLogin.GOOGLE,
        };
      }

      await setDoc(userRef, userDetails);
    } else {
      userDetails = userSnap.data();
    }

    setUserDetails(userDetails); // ✅ Update context immediately after signing in

    return "Successfully signed in with Google";
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

//* Apple sign-in function using Firebase Authentication
export const signInWithApple = async (
  setUserDetails: (details: any) => void,
  setLoading: (loading: boolean) => void
): Promise<string | void> => {
  try {
    // Step 1: Create an instance of the Apple OAuth provider
    const provider = new OAuthProvider(EnSocialLogin.APPLE);

    // Add scopes to request profile information
    provider.addScope("email");
    provider.addScope("name");

    // Add a nonce for security (generate a random string)
    const nonce = generateRandomString(32); // Implement this function
    provider.setCustomParameters({
      nonce: nonce,
    });

    // Step 2: Trigger Apple sign-in popup
    const result = await signInWithPopup(firebaseAuth, provider);
    const user = result.user;

    if (!user) throw new Error("Apple sign-in failed. No user data found.");
    setLoading(true);

    // Step 3: Check if user already exists in Firestore
    const userRef = doc(
      firebaseFirestore,
      EnFirebaseCollections.USERS,
      user.uid
    );
    const userSnap = await getDoc(userRef);

    let userDetails;

    if (!userSnap.exists()) {
      // Generate auto-incrementing ID
      const newPropId = await generateSequentialId(EnFirebaseCollections.USERS);

      // Extract first and last name
      // const fullName = user.displayName?.split(" ") || ["", ""];
      // const firstName = fullName[0] || "";
      // const lastName = fullName.slice(1).join(" ") || firstName; // Handles multi-word last names
      //@ts-ignore
      const fullName = result._tokenResponse?.fullName;
      const firstName = fullName?.givenName || "Apple";
      const lastName = fullName?.familyName || "User";

      // Create secretary in API
      try {
        const payload = {
          first_name: firstName,
          last_name: lastName,
          email: user.email,
          password: "medini-ai",
        };
        //@ts-ignore
        const response = await createSecretary(payload);

        // Get the secretary ID from the response
        const secretaryId = response.secretary.secretary_id;

        userDetails = {
          uid: user.uid,
          uuid: newPropId, // Auto-incremented ID
          firstName,
          lastName,
          email: user.email || "",
          photoURL: user.photoURL || "",
          createdAt: Timestamp.now().seconds,
          updatedAt: null,
          deletedAt: null,
          status: EnVerifiedStatus.VERIFIED,
          onboardingStatus: EnOnboardingStatus.STATUS_0,
          loginType: EnSocialLogin.APPLE,
          secretaryID: secretaryId, // Add secretary ID to user details
        };
      } catch (apiError) {
        console.error("Failed to create secretary record:", apiError);

        // Proceed with user creation without secretary ID if API call fails
        userDetails = {
          uid: user.uid,
          uuid: newPropId,
          firstName,
          lastName,
          email: user.email || "",
          photoURL: user.photoURL || "",
          createdAt: Timestamp.now().seconds,
          updatedAt: null,
          deletedAt: null,
          status: EnVerifiedStatus.VERIFIED,
          onboardingStatus: EnOnboardingStatus.STATUS_0,
          loginType: EnSocialLogin.APPLE,
        };
      }

      await setDoc(userRef, userDetails);
    } else {
      userDetails = userSnap.data();
    }

    setUserDetails(userDetails);

    return "Successfully signed in with Apple";
  } catch (error: any) {
    console.error("Apple Sign-In Failed:", error.message);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Sends a new message to a specific patient's chat.
 */
export const sendMessageToPatient = async (
  patientName: string,
  messageText: string
) => {
  try {
    const messageCollectionRef = collection(
      firebaseFirestore,
      EnFirebaseCollections.MESSAGES,
      "141",
      EnFirebaseCollections.CUSTOMERS,
      patientName,
      EnFirebaseCollections.MESSAGES
    );
    const docRef = await addDoc(messageCollectionRef, {
      message: messageText,
      sender: EnMessageSender.DOCTOR,
      timestamp: new Date(),
    });
    console.log(":white_check_mark: Message sent successfully");
    return docRef.id;
  } catch (error) {
    console.error(
      `:x: Error sending message to patient ${patientName}:`,
      error
    );
    throw error;
  }
};

/**
 * Subscribes to messages for a specific patient's chat.
 */
export const subscribeToPatientMessages = (
  patientName: string,
  callback: any
) => {
  const messageCollectionRef = collection(
    firebaseFirestore,
    EnFirebaseCollections.MESSAGES,
    "141",
    "patients",
    patientName,
    "message"
  );
  const q = query(messageCollectionRef, orderBy("timestamp", "desc"));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      console.log(
        `:incoming_envelope: Real-time update received for ${patientName}`
      );

      // Log any changes in this update
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          console.log("New message:", change.doc.data());
        }
        if (change.type === "modified") {
          console.log("Modified message:", change.doc.data());
        }
        if (change.type === "removed") {
          console.log("Removed message:", change.doc.data());
        }
      });

      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      }));

      callback(messages);
    },
    (error) => {
      console.error(
        `:x: Subscription error for patient ${patientName}:`,
        error
      );
    }
  );

  return unsubscribe;
};

/**
 * Retrieves the list of patients and their latest messages.
 */
export const getPatientsWithLatestMessage = async ({
  userId,
}: {
  userId: string;
}) => {
  try {
    const patientsCollectionRef = collection(
      firebaseFirestore,
      EnFirebaseCollections.MESSAGES,
      `user_${userId}`,
      EnFirebaseCollections.CUSTOMERS
    );
    const patientsSnapshot = await getDocs(patientsCollectionRef);

    console.log(
      `:open_file_folder: Found ${patientsSnapshot.docs.length} patients`
    );

    const patients = {};

    for (const patientDoc of patientsSnapshot.docs) {
      const patientName = patientDoc.id;
      console.log(`\n:bust_in_silhouette: Processing patient: ${patientName}`);

      try {
        const messageCollectionRef = collection(
          firebaseFirestore,
          EnFirebaseCollections.MESSAGES,
          `user_${userId}`,
          EnFirebaseCollections.CUSTOMERS,
          patientName,
          EnFirebaseCollections.MESSAGES
        );

        const messagesSnapshot = await getDocs(
          query(messageCollectionRef, orderBy("timestamp", "desc"))
        );

        const messages = messagesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate(),
          message: doc.data().message,
        }));

        if (messages.length > 0) {
          //@ts-ignore
          patients[patientName] = {
            details: { name: patientName },
            messages: messages,
          };
        } else {
          //@ts-ignore
          patients[patientName] = {
            details: { name: patientName },
            messages: [],
          };
        }
      } catch (error) {
        console.error(
          `:x: Error fetching messages for patient ${patientName}:`,
          error
        );
        //@ts-ignore
        patients[patientName] = {
          details: { name: patientName },
          messages: [],
        };
      }
    }

    return patients;
  } catch (error) {
    console.error(":x: Error fetching patients:", error);
    return {};
  }
};

/**
 * Subscribes to updates for all patients.
 */
export const subscribeToDoctorMessages = (callback: any) => {
  // Subscribe to the patients collection for new patient additions
  const patientsCollectionRef = collection(
    firebaseFirestore,
    EnFirebaseCollections.MESSAGES,
    "141",
    "patients"
  );
  const patientSubscriptions = new Map();

  // Main subscription to watch for patient collection changes
  const unsubscribePatients = onSnapshot(patientsCollectionRef, (snapshot) => {
    console.log(":satellite_antenna: Patient collection changed");

    // Handle patient collection changes
    snapshot.docChanges().forEach((change) => {
      const patientName = change.doc.id;

      if (change.type === "added" || change.type === "modified") {
        // Remove existing subscription if any
        if (patientSubscriptions.has(patientName)) {
          patientSubscriptions.get(patientName)();
        }
        // Set up new subscription
        const unsubscribe = subscribeToPatientMessages(
          patientName,
          (messages: any) => {
            callback((currentPatients: any) => ({
              ...currentPatients,
              [patientName]: {
                details: { name: patientName },
                messages: messages,
              },
            }));
          }
        );

        patientSubscriptions.set(patientName, unsubscribe);
      }

      if (change.type === "removed") {
        console.log(`:x: Removing subscription for patient: ${patientName}`);
        if (patientSubscriptions.has(patientName)) {
          patientSubscriptions.get(patientName)();
          patientSubscriptions.delete(patientName);
        }
      }
    });
  });

  // Return cleanup function
  return () => {
    unsubscribePatients();
    patientSubscriptions.forEach((unsubscribe) => unsubscribe());
    patientSubscriptions.clear();
  };
};

//* Function to delete a contact from Firestore
export const deleteContactById = async (contactId: string): Promise<void> => {
  try {
    const db = getFirestore();
    const contactRef = doc(db, EnFirebaseCollections.CONTACTS, contactId);
    await deleteDoc(contactRef);
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw new Error("Failed to delete contact");
  }
};

//* Function to update a contact in Firestore
export const updateContact = async (contact: IContact): Promise<void> => {
  try {
    const db = getFirestore();
    const contactRef = doc(db, EnFirebaseCollections.CONTACTS, contact.id);

    await updateDoc(contactRef, {
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
    });
  } catch (error) {
    console.error("Error updating contact:", error);
    throw new Error("Failed to update contact");
  }
};

export const getMessages = (
  { userId }: { userId: string },
  callback: (messages: any[]) => void,
  errorCallback?: (error: any) => void
) => {
  const messagesCollectionRef = collection(
    firebaseFirestore,
    EnFirebaseCollections.MESSAGES
  );

  const messagesQuery = query(
    messagesCollectionRef,
    where("userId", "==", userId) // only messages with matching user_id
  );

  const unsubscribe = onSnapshot(
    messagesQuery,
    (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(messages);
    },
    (error) => {
      console.error("Error listening to messages:", error);
      if (errorCallback) errorCallback(error);
    }
  );

  return unsubscribe; // call this to stop listening
};

/**
 * Updates the "users" array field in a user document with the provided user objects
 * @param userId The ID of the main user document to update
 * @param users Array of user objects to store in the "users" field
 */
export const updateUsersArray = async (
  userId: string,
  users: Array<{
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    company_id: number;
  }>
): Promise<void> => {
  try {
    // Reference to the user document in Firestore
    const userRef = doc(firebaseFirestore, EnFirebaseCollections.USERS, userId);

    // Update the document with the users array
    await updateDoc(userRef, {
      users: users,
      updatedAt: serverTimestamp(), // Update the timestamp
    });

    console.log("Users array successfully updated in user document");
  } catch (error) {
    console.error("Error updating users array:", error);
    throw new Error("Failed to update users array in the user document");
  }
};

export const getChatContacts = async (userId: string): Promise<any[]> => {
  try {
    // Reference the contactList subcollection within the user document
    const contactsCollectionRef = collection(
      firebaseFirestore,
      EnFirebaseCollections.CHAT_CONTACTS,
      `user_${userId}`,
      EnFirebaseCollections.CONTACT_LIST
    );

    // Get all documents in the contactList subcollection
    const contactsSnapshot = await getDocs(contactsCollectionRef);

    // Map the documents to an array of contact objects
    const contacts = contactsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return contacts;
  } catch (error) {
    console.error("Error fetching chat contacts:", error);
    throw new Error("Failed to retrieve chat contacts");
  }
};

export const getChatMessages = async (
  userId: string,
  collectionName: string
): Promise<any[]> => {
  try {
    const messagesCollectionRef = collection(
      firebaseFirestore,
      EnFirebaseCollections.MESSAGES,
      `user_${userId}`,
      collectionName
    );

    // Create a query ordered by timestamp
    const messagesQuery = query(
      messagesCollectionRef,
      orderBy("timestamp", "asc")
    );

    // Get the documents
    const messagesSnapshot = await getDocs(messagesQuery);

    // Map the documents to an array of message objects
    const messages = messagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate(), // Convert Firestore timestamp to JS Date
    }));

    return messages;
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    throw new Error("Failed to retrieve chat messages");
  }
};


