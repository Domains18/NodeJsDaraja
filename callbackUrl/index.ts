import functions from 'firebase-functions';
import admin from 'firebase-admin'
import { v4 as uuidv4 } from 'uuid';



admin.initializeApp(functions.config().firebase)
