
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
  archived: false,
  important: false // ← esto es lo nuevo
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
div.dataset.id = docSnap.id;
div.innerHTML = `
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
    <strong>${note.author}</strong>
    <input type="checkbox" onchange="toggleImportant(this)" ${note.important ? 'checked' : ''}>
  </div>
  <small style="display: block; margin-bottom: 10px;">${note.date} ${note.time}</small>
  <div style="cursor:pointer;" onclick="window.location.href='verNota.html?id=${docSnap.id}'">
    <em>Haz clic para ver nota...</em>
  </div>
`;


if (note.important) {
  div.classList.add('important');
}
container.appendChild(div); // asegúrate de que esto esté presente también
}
}); // ← cierre de snap.forEach
} // ← cierre de renderSummaries()



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
        <h3>${note.author}</h3>
        <p>${note.content}</p>
        <small>${note.date} ${note.time}</small><br>
        <button onclick="editNote('${docSnap.id}')">Editar</button>
        <button onclick="toggleArchive('${docSnap.id}', ${archived})">${archived ? "Desarchivar" : "Archivar"}</button>
        <button onclick="deleteNote('${docSnap.id}')">Eliminar</button>
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
    showSection("resumen");
  }
}

async function toggleArchive(id, archived) {
  const ref = doc(db, "notas", id);
  await updateDoc(ref, { archived: !archived });
  renderNotes(true);
  renderNotes(false);
}

function showSection(id) {
  const sections = ["menu", "activas", "archivadas", "resumen"];
  sections.forEach(s => {
    const el = document.getElementById(s);
    if (el) el.style.display = s === id ? "flex" : "none";
  });
  if (id === "activas") renderNotes(false);
  if (id === "archivadas") renderNotes(true);
  if (id === "menu") renderSummaries();
  if (id === "resumen") renderSummaries();
}

window.saveNote = saveNote;
window.editNote = editNote;
window.toggleArchive = toggleArchive;
window.deleteNote = deleteNote;
window.showSection = showSection;

document.addEventListener("DOMContentLoaded", () => {
  showSection("resumen");
});

import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
const auth = getAuth(app);

window.logout = async function () {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (error) {
    alert("Error al cerrar sesión: " + error.message);
  }
};

window.toggleImportant = async function (checkbox) {
  const card = checkbox.closest('.note-card');
  const id = card.dataset.id;

  if (checkbox.checked) {
    card.classList.add('important');
  } else {
    card.classList.remove('important');
  }

  // Actualiza en Firebase
  const ref = doc(db, "notas", id);
  try {
    await updateDoc(ref, {
      important: checkbox.checked
    });
  } catch (e) {
    console.error("Error actualizando importancia:", e);
    alert("No se pudo guardar el cambio de importancia");
  }
};
