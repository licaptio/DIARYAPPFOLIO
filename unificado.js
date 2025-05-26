
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBbWF23OCSuc_RyX2nZVZxFPGkPrQsQXxE",
  authDomain: "notasfoliador.firebaseapp.com",
  projectId: "notasfoliador",
  storageBucket: "notasfoliador.firebasestorage.app",
  messagingSenderId: "449665263510",
  appId: "1:449665263510:web:b049e4c02babe203da1fb7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let editingId = null;

async function getNextFolio() {
  const ref = doc(db, "config", "folio");
  const snap = await getDoc(ref);
  let next = 1;
  if (snap.exists()) {
    next = (snap.data().current || 0) + 1;
  }
  await setDoc(ref, { current: next });
  return next;
}

async function saveNote() {
  const author = document.getElementById('author')?.value.trim() || 'Anónimo';
  const content = document.getElementById('content')?.value.trim();
  if (!content) return alert("Contenido vacío");

  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();

  if (editingId) {
    await deleteDoc(doc(db, "notas", editingId));
    editingId = null;
  }

  const folio = await getNextFolio();

  await addDoc(collection(db, "notas"), {
    author,
    content,
    date,
    time,
    timestamp: now.toISOString(),
    folio,
    archived: false,
    important: false
  });

  alert("Nota guardada");
  if (document.getElementById('author')) document.getElementById('author').value = "";
  if (document.getElementById('content')) document.getElementById('content').value = "";
}

window.saveNote = saveNote;
