/*  Firebase Admin singleton  (server-only)  */
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const {
  FB_PROJECT_ID,
  FB_CLIENT_EMAIL,
  FB_PRIVATE_KEY,
} = process.env;

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId  : FB_PROJECT_ID,
      clientEmail: FB_CLIENT_EMAIL,
      // env var has literal "\n" – restore real line-breaks
      privateKey : FB_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

export const db = getFirestore();