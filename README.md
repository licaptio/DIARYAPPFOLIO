# Notas Firebase App 📝

Aplicación web para tomar y gestionar notas personales con autenticación, foliador automático y control de acceso basado en sesión.

## 🔧 Tecnologías
- HTML + JavaScript
- Firebase Authentication
- Firebase Firestore (Base de datos)
- GitHub Pages (Hosting)

## 🚀 Funcionalidades principales
- Registro e inicio de sesión con correo y contraseña
- Creación, edición, archivado y eliminación de notas
- Foliador automático (número único por nota, secuencial)
- Redirección automática si el usuario no está logueado
- Control de acceso seguro (Firestore solo permite usuarios autenticados)
- Cierre de sesión desde la interfaz
- Visualización de notas activas y archivadas
- Vista detallada de cada nota individual (verNota.html)

## 📁 Firebase
- Colección: `notas`
- Documento de control para foliador: `config/folio`
- Reglas de seguridad: Solo usuarios autenticados pueden acceder a los documentos

## 🔐 Seguridad
Las reglas activas en Firestore permiten únicamente el acceso a usuarios autenticados:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /notas/{noteId} {
      allow read, write: if request.auth != null;
    }
    match /config/folio {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🌐 Despliegue
La aplicación puede ser alojada en GitHub Pages o cualquier hosting estático compatible.
