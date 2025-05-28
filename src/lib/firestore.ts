// src/lib/firebase.ts
import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDoUNegqcrP0HSDZz8n3ot_e2hXPFesziQ",
  authDomain: "agent-computer.firebaseapp.com",
  projectId: "agent-computer",
  storageBucket: "agent-computer.firebasestorage.app",
  messagingSenderId: "627986652994",
  appId: "1:627986652994:web:b26017ecebb0c49c5ff2db"
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]; 
}

const auth: Auth = getAuth(app);

export { app, auth };
