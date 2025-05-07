
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

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

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
const auth = getAuth(app);

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
  const author = document.getElementById('author').value.trim() || 'Anónimo';
  const content = document.getElementById('content').value.trim();
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
    archived: false
  });

  alert("Nota guardada en Firebase con nuevo folio");
  document.getElementById("author").value = "";
  document.getElementById("content").value = "";
  renderSummaries();
}

async function renderSummaries() {
  const container = document.getElementById("notes-summary-container");
  if (!container) return;
  container.innerHTML = "";

  const q = query(collection(db, "notas"), orderBy("folio", "desc"));
  const snap = await getDocs(q);
  snap.forEach(docSnap => {
    const note = docSnap.data();
    if (!note.archived) {
      const div = document.createElement("div");
      div.className = "note-card";
      div.innerHTML = `<strong>${note.author}</strong><br><small>${note.date} ${note.time}</small>`;
      div.onclick = () => window.location.href = \`verNota.html?id=\${docSnap.id}\`;
      container.appendChild(div);
    }
  });
}

async function renderNotes(archived) {
  const container = document.getElementById(archived ? "archived-notes-container" : "active-notes-container");
  if (!container) return;
  container.innerHTML = "";

  const q = query(collection(db, "notas"), orderBy("folio", "desc"));
  const snap = await getDocs(q);
  snap.forEach(docSnap => {
    const note = docSnap.data();
    if (note.archived === archived) {
      const card = document.createElement("div");
      card.className = "note-card";
      card.innerHTML = `
        <h3>\${note.author}</h3>
        <p>\${note.content}</p>
        <small>\${note.date} \${note.time}</small><br>
        <button onclick="editNote('\${docSnap.id}')">Editar</button>
        <button onclick="toggleArchive('\${docSnap.id}', \${archived})">\${archived ? "Desarchivar" : "Archivar"}</button>
        <button onclick="deleteNote('\${docSnap.id}')">Eliminar</button>
      `;
      container.appendChild(card);
    }
  });
}

async function deleteNote(id) {
  if (!confirm("¿Eliminar esta nota?")) return;
  await deleteDoc(doc(db, "notas", id));
  renderNotes(true);
  renderNotes(false);
}

async function editNote(id) {
  const ref = doc(db, "notas", id);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const note = snap.data();
    document.getElementById("author").value = note.author || '';
    document.getElementById("content").value = note.content || '';
    editingId = id;
    showSection("menu");
  }
}

async function toggleArchive(id, archived) {
  const ref = doc(db, "notas", id);
  await updateDoc(ref, { archived: !archived });
  renderNotes(true);
  renderNotes(false);
}

function showSection(id) {
  const sections = ["menu", "activas", "archivadas"];
  sections.forEach(s => {
    const el = document.getElementById(s);
    if (el) el.style.display = s === id ? "flex" : "none";
  });
  if (id === "activas") renderNotes(false);
  if (id === "archivadas") renderNotes(true);
  if (id === "menu") renderSummaries();
}

window.saveNote = saveNote;
window.editNote = editNote;
window.toggleArchive = toggleArchive;
window.deleteNote = deleteNote;
window.showSection = showSection;

document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "login.html";
    } else {
      showSection("menu");
    }
  });
});
