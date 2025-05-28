import { Timestamp } from 'firebase/firestore';

/**
 * Represents a document stored for a user.
 */
export interface UserDocument {
  id: string;          // Document ID (e.g., Firestore document ID)
  userId: string;      // Firebase User UID to associate the document with
  content: string;     // Content of the document, similar to documentContent
  name: string;        // A user-defined name or title for the document
  createdAt: Timestamp;  // Firestore Timestamp for when the document was created
  updatedAt: Timestamp;  // Firestore Timestamp for when the document was last updated
  // Future additions could include:
  // - type: string; (e.g., 'text-document', 'diagram', 'spreadsheet')
  // - tags: string[];
  // - sharedWith: string[]; (user IDs of users this document is shared with)
}

/**
 * Represents user-specific preferences.
 * Placeholder for now, can be expanded later.
 */
export interface UserPreferences {
  userId: string;          // Firebase User UID to associate preferences with
  theme?: 'light' | 'dark' | 'system'; // User's preferred theme
  sidebarOpen?: boolean;   // Whether the sidebar was last open or closed
  // Future additions could include:
  // - language?: string;
  // - notifications?: {
  //     email?: boolean;
  //     inApp?: boolean;
  //   };
  // - lastAccessedTool?: string;
  updatedAt: Timestamp;    // Firestore Timestamp for when preferences were last updated
}

// Example of how a collection of documents for a user might look
// This is just for conceptualization, not a strict type to be stored directly
// export interface UserDataCollection {
//   documents: UserDocument[];
//   preferences: UserPreferences;
// }
