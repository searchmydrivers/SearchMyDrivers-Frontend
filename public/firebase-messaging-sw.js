importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

const firebaseConfig = {
  apiKey: "AIzaSyDbu9A11dLlwcD2dp97sKRNDmSS49ARwgw",
  authDomain: "driverfinder-ebb5c.firebaseapp.com",
  projectId: "driverfinder-ebb5c",
  storageBucket: "driverfinder-ebb5c.firebasestorage.app",
  messagingSenderId: "74157343828",
  appId: "1:74157343828:web:5ee6f675b81da0ccb259c1"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
