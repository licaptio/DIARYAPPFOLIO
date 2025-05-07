# Notas Firebase App 📝

Aplicación web para tomar y gestionar notas conectada a Firebase Firestore, con folios únicos y funciones de edición, archivado y eliminación.

## 🔧 Tecnologías
- HTML + JavaScript
- Firebase Firestore
- GitHub Pages

## 🚀 Uso
1. Abre la app
2. Crea, edita o elimina notas
3. Las notas se guardan automáticamente en Firestore

## 📁 Firebase
- Colección: `notas`
- Documento de control: `config/folio`

## 🔐 Seguridad
Usar reglas de prueba durante el desarrollo:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```