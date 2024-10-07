import { getAuth } from 'firebase-admin/auth';

require('dotenv').config();

import admin from "firebase-admin";

if(!process.env.FIREBASE_CREDENTIALS){
  throw new Error("firebase credential aunotherized")
}
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
console.log(serviceAccount)
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const adminAuth = getAuth();

