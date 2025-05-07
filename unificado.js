
let currentlyEditingId = null;

function getStoredNotes() {
  return JSON.parse(localStorage.getItem("notasGuardadas") || "[]");
}

function saveStoredNotes(notes) {
  localStorage.setItem("notasGuardadas", JSON.stringify(notes));
}

function getNextFolio() {
  const current = parseInt(localStorage.getItem("folioCounter") || "0");
  const next = current + 1;
  localStorage.setItem("folioCounter", next);
  return next;
}

function showSection(id) {
  const sections = ['menu', 'activas', 'archivadas'];
  sections.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    section.style.display = (sectionId === id) ? 'flex' : 'none';
  });

  if (id === 'activas') renderNotes(false);
  if (id === 'archivadas') renderNotes(true);
  if (id === 'menu') renderNoteSummaries();
}

function saveNote() {
  const author = document.getElementById('author').value.trim() || 'Anónimo';
  const content = document.getElementById('content').value.trim();
  if (!content) return alert("Contenido vacío");

  const now = new Date();
  const notes = getStoredNotes();

  if (currentlyEditingId) {
    notes.splice(notes.findIndex(n => n.id === currentlyEditingId), 1);
    currentlyEditingId = null;
  }

  const note = {
    id: getNextFolio().toString(),
    author,
    content,
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
    timestamp: now.toISOString(),
    archived: false
  };

  notes.push(note);
  saveStoredNotes(notes);

  document.getElementById('author').value = '';
  document.getElementById('content').value = '';
  alert("Nota guardada con nuevo folio");
  renderNoteSummaries();
}

function renderNoteSummaries() {
  const container = document.getElementById('notes-summary-container');
  container.innerHTML = '';

  const notes = getStoredNotes().filter(note => !note.archived);
  notes.sort((a, b) => parseInt(b.id) - parseInt(a.id));

  notes.forEach(note => {
    const div = document.createElement('div');
    div.className = 'note-card';
    div.innerHTML = `<strong>${note.author}</strong><br><small>${note.date} ${note.time}</small>`;
    div.onclick = () => window.location.href = `verNota.html?id=${note.id}`;
    container.appendChild(div);
  });
}

function renderNotes(archived) {
  const container = document.getElementById(archived ? 'archived-notes-container' : 'active-notes-container');
  container.innerHTML = '';
  const notes = getStoredNotes().filter(note => note.archived === archived);
  notes.sort((a, b) => parseInt(b.id) - parseInt(a.id));

  notes.forEach(note => {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.innerHTML = `
      <h3>${note.author}</h3>
      <p>${note.content}</p>
      <small>${note.date} ${note.time}</small><br>
      <button onclick="editNote('${note.id}')">Editar</button>
      <button onclick="toggleArchive('${note.id}', ${archived})">${archived ? 'Desarchivar' : 'Archivar'}</button>
      <button onclick="deleteNote('${note.id}')">Eliminar</button>
    `;
    container.appendChild(card);
  });
}

function deleteNote(id) {
  if (!confirm("¿Eliminar esta nota?")) return;
  const notes = getStoredNotes().filter(n => n.id !== id);
  saveStoredNotes(notes);
  renderNotes(true);
  renderNotes(false);
}

function editNote(id) {
  const note = getStoredNotes().find(n => n.id === id);
  if (note) {
    document.getElementById('author').value = note.author || '';
    document.getElementById('content').value = note.content || '';
    currentlyEditingId = id;
    showSection('menu');
  } else {
    alert("Nota no encontrada.");
  }
}

function toggleArchive(id, archived) {
  const notes = getStoredNotes();
  const index = notes.findIndex(n => n.id === id);
  if (index !== -1) {
    notes[index].archived = !archived;
    saveStoredNotes(notes);
    renderNotes(true);
    renderNotes(false);
  }
}

window.saveNote = saveNote;
window.showSection = showSection;
window.editNote = editNote;
window.toggleArchive = toggleArchive;
window.deleteNote = deleteNote;

document.addEventListener("DOMContentLoaded", () => {
  showSection('menu');
});
