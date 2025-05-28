import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { app } from './firebase'; // Assuming firebase.ts exports 'app'
import { UserDocument } from '../types/user-data';

// Initialize Firestore
const db = getFirestore(app);

const USER_DOCUMENTS_COLLECTION = 'userDocuments';

/**
 * Saves a new document to the "userDocuments" collection in Firestore.
 * @param userId The ID of the user creating the document.
 * @param documentContent The content of the document.
 * @param documentName Optional name for the document. Defaults to "Untitled Document".
 * @returns The ID of the newly created document, or null if an error occurred.
 */
export const saveUserDocument = async (
  userId: string,
  documentContent: string,
  documentName: string = "Untitled Document" 
): Promise<string | null> => {
  try {
    const docData: Omit<UserDocument, 'id' | 'createdAt' | 'updatedAt'> & { createdAt: any, updatedAt: any } = { // Type for data to be added
      userId,
      content: documentContent,
      name: documentName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, USER_DOCUMENTS_COLLECTION), docData);
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    return null;
  }
};

/**
 * Retrieves all documents for a given userId from the "userDocuments" collection.
 * @param userId The ID of the user whose documents are to be retrieved.
 * @returns An array of UserDocument objects, or an empty array if none found or an error occurred.
 */
export const getUserDocuments = async (userId: string): Promise<UserDocument[]> => {
  try {
    const q = query(collection(db, USER_DOCUMENTS_COLLECTION), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const documents: UserDocument[] = [];
    querySnapshot.forEach((snap: QueryDocumentSnapshot<DocumentData>) => {
      const data = snap.data();
      documents.push({
        id: snap.id,
        userId: data.userId,
        content: data.content,
        name: data.name,
        createdAt: data.createdAt as Timestamp, // Cast to Timestamp
        updatedAt: data.updatedAt as Timestamp  // Cast to Timestamp
      });
    });
    console.log(`Found ${documents.length} documents for user ${userId}`);
    return documents;
  } catch (error) {
    console.error("Error getting documents: ", error);
    return [];
  }
};

/**
 * Updates the content and optionally the name of an existing document.
 * @param documentId The ID of the document to update.
 * @param content The new content for the document.
 * @param name Optional new name for the document.
 * @returns True if the update was successful, false otherwise.
 */
export const updateUserDocument = async (
  documentId: string,
  content: string,
  name?: string
): Promise<boolean> => {
  try {
    const docRef = doc(db, USER_DOCUMENTS_COLLECTION, documentId);
    const updateData: { content: string; name?: string; updatedAt: any } = {
      content,
      updatedAt: serverTimestamp(),
    };
    if (name !== undefined) {
      updateData.name = name;
    }
    await updateDoc(docRef, updateData);
    console.log("Document updated successfully: ", documentId);
    return true;
  } catch (error) {
    console.error("Error updating document: ", error);
    return false;
  }
};

/**
 * Deletes a document from the "userDocuments" collection.
 * @param documentId The ID of the document to delete.
 * @returns True if the deletion was successful, false otherwise.
 */
export const deleteUserDocument = async (documentId: string): Promise<boolean> => {
  try {
    const docRef = doc(db, USER_DOCUMENTS_COLLECTION, documentId);
    await deleteDoc(docRef);
    console.log("Document deleted successfully: ", documentId);
    return true;
  } catch (error) {
    console.error("Error deleting document: ", error);
    return false;
  }
};

// Example usage (optional, for testing purposes):
/*
async function testFirestoreFunctions() {
  const testUserId = "testUser123";

  // Test saveUserDocument
  console.log("Testing saveUserDocument...");
  const newDocId = await saveUserDocument(testUserId, "This is the content of my first document.", "My First Doc");
  if (newDocId) {
    console.log("Saved new document with ID:", newDocId);

    // Test getUserDocuments
    console.log("\nTesting getUserDocuments...");
    let docs = await getUserDocuments(testUserId);
    console.log("Retrieved documents:", docs);

    // Test updateUserDocument
    if (docs.length > 0) {
      const docToUpdate = docs[0];
      console.log(`\nTesting updateUserDocument for doc ID: ${docToUpdate.id}...`);
      const updateSuccess = await updateUserDocument(docToUpdate.id, "This is updated content.", "My Updated First Doc");
      console.log("Update success:", updateSuccess);
      if (updateSuccess) {
        docs = await getUserDocuments(testUserId); // Re-fetch to see changes
        console.log("Documents after update:", docs);
      }

      // Test deleteUserDocument
      // console.log(`\nTesting deleteUserDocument for doc ID: ${docToUpdate.id}...`);
      // const deleteSuccess = await deleteUserDocument(docToUpdate.id);
      // console.log("Delete success:", deleteSuccess);
      // if (deleteSuccess) {
      //   docs = await getUserDocuments(testUserId); // Re-fetch to see changes
      //   console.log("Documents after delete:", docs);
      // }
    }
  } else {
    console.log("Failed to save new document, further tests might be affected.");
  }
}

// Call the test function (comment out when not actively testing)
// testFirestoreFunctions();
*/
