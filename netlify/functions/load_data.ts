import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getFirestore, collection, getDocs, orderBy, query } from "firebase/firestore";
import { Handler } from "@netlify/functions";

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY!,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.FIREBASE_PROJECT_ID!,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.FIREBASE_APP_ID!,
};

const app = initializeApp(firebaseConfig);
const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(process.env.RECAPTCHA_SITE_KEY!),
    isTokenAutoRefreshEnabled: true
});
const db = getFirestore(app);

const handler: Handler = async () => {
    try {
        const q = query(collection(db, "results"), orderBy("duration"));
        const snapshot = await getDocs(q);
        const data = snapshot.empty ? [] : snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        };
    }
    catch (error: any) {
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Error loading data", error: error.message }),
        };
    }
};

module.exports = { handler };
