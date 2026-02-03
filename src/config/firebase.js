import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDbu9A11dLlwcD2dp97sKRNDmSS49ARwgw",
  authDomain: "driverfinder-ebb5c.firebaseapp.com",
  projectId: "driverfinder-ebb5c",
  storageBucket: "driverfinder-ebb5c.firebasestorage.app",
  messagingSenderId: "74157343828",
  appId: "1:74157343828:web:5ee6f675b81da0ccb259c1"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: 'BKNFs1hdYg7zDWN5K7p6ZUzSJdzP7KkSsZZHzzAim9iznj26x1YgooWSRb83tPvJVpEMW1TGDJVb40g1Cvm_uqE'
    });
    if (currentToken) {
      console.log('current token for client: ', currentToken);
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export { messaging };
