// استيراد الدوال الأساسية السحابية (CDN) لتتوافق مع نظام الـ Modules في موقعك
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs, runTransaction } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// مفاتيح الربط الخاصة بمشروع ديوان المعارف الفعلي من شاشتك
const firebaseConfig = {
  apiKey: "AIzaSyCrQfqGqsReOTblvAKO6aQ9BNn2rilZ2-E",
  authDomain: "chaterr-dbcd7.firebaseapp.com",
  projectId: "chaterr-dbcd7",
  storageBucket: "chaterr-dbcd7.firebasestorage.app",
  messagingSenderId: "163828603452",
  appId: "1:163828603452:web:af0df6464bd6af8c594139",
  measurementId: "G-DFD9P3R01B"
};

// تهيئة المشروع وقاعدة البيانات ونظام الحسابات والتخزين
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/**
 * رفع ملف (صورة أو PDF) إلى Firebase Storage وإرجاع رابط التحميل النهائي
 * @param {string} path - المسار داخل الـ bucket (مثال: students/DA-0001/photo.jpg)
 * @param {File} file - الملف المراد رفعه
 * @returns {Promise<string>} رابط التحميل العمومي
 */
async function uploadToStorage(path, file) {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

/**
 * توليد رقم تسجيل (matricule) فريد ومتسلسل باستخدام عداد Firestore transactional
 * الوثيقة counters/students تحتفظ بآخر رقم مستعمل
 * @returns {Promise<string>} matricule بصيغة DA-2026-0001
 */
async function generateMatricule() {
  const counterRef = doc(db, "counters", "students");
  const year = new Date().getFullYear();

  const newNumber = await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(counterRef);
    let current = 0;
    if (counterSnap.exists() && counterSnap.data().year === year) {
      current = counterSnap.data().count || 0;
    }
    const next = current + 1;
    transaction.set(counterRef, { count: next, year }, { merge: true });
    return next;
  });

  const padded = String(newNumber).padStart(4, "0");
  return `DA-${year}-${padded}`;
}

/**
 * حارس الدخول لصفحات الأدمين: يتحقق من وجود جلسة تسجيل دخول نشطة
 * ويتحكم تلقائيا فإظهار/إخفاء العناصر #dashboard و #noSessionGate
 * (يجب أن تحتوي كل صفحة أدمين على هذين المعرّفين فالـ HTML)
 * @param {(user: import('firebase/auth').User) => void} onAuthenticated - تنفذ فقط إذا كانت هناك جلسة صالحة
 */
function requireAdmin(onAuthenticated) {
  onAuthStateChanged(auth, (user) => {
    const gate = document.getElementById('noSessionGate');
    const dashboard = document.getElementById('dashboard');

    if (user) {
      if (gate) gate.classList.add('hidden');
      if (dashboard) dashboard.classList.remove('hidden');
      onAuthenticated(user);
    } else {
      if (dashboard) dashboard.classList.add('hidden');
      if (gate) gate.classList.remove('hidden');
    }
  });
}

// تصدير المتغيرات والدوال لتقرأها صفحات الموقع (تسجيل الدخول والتسجيل ورفع الملفات ولوحات الأدمين)
export {
  auth,
  db,
  storage,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  uploadToStorage,
  generateMatricule,
  requireAdmin
};
