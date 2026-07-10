// استيراد الدوال الأساسية السحابية (CDN) لتتوافق مع نظام الـ Modules في موقعك
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// مفاتيح الربط الخاصة بمشروع ديوان المعارف الفعلي من شاشتك
const firebaseConfig = {
  apiKey: "AIzaSyCrQfqGqsReOTblvAKO6aQ9BNn2rilZ2-E",
  authDomain: "chaterrr-abcd7.firebaseapp.com",
  projectId: "chaterrr-abcd7",
  storageBucket: "chaterrr-abcd7.firebasestorage.app",
  messagingSenderId: "163828603452",
  appId: "1:163828603452:web:af0df6464bd6af8c594139",
  measurementId: "G-DFD9P3R01B"
};

// تهيئة المشروع وقاعدة البيانات ونظام الحسابات
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// تصدير المتغيرات لتقرأها صفحة تسجيل الدخول بنجاح
export { 
  auth, 
  db, 
  doc, 
  getDoc, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
};