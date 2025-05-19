# Notas Firebase App 📝

Aplicación web para tomar y gestionar notas personales con autenticación Firebase, foliador automático, control de acceso, y ahora con bloqueo inteligente por inactividad usando PIN local.

---

## 🔧 Tecnologías
- HTML + JavaScript
- Firebase Authentication
- Firebase Firestore
- GitHub Pages (Hosting)

---

## 🚀 Funcionalidades principales

### 📝 Gestión de notas
- Crear, editar, archivar y eliminar notas.
- Foliador automático (secuencial) por nota.
- Vista detallada por nota (`verNota.html`).
- Visualización separada: Notas activas y archivadas.

### 🔐 Autenticación y seguridad
- Inicio de sesión con correo y contraseña usando Firebase Auth.
- Protección de acceso: solo usuarios autenticados pueden ver o modificar notas.
- Cierre de sesión manual desde la interfaz.

### 🛡️ Bloqueo automático por inactividad
- A los 2 minutos sin actividad, se activa un **bloqueo por PIN local**, sin cerrar sesión.
- El PIN por defecto es `"1982"` y se puede cambiar fácilmente en el código.
- El PIN se solicita mediante `prompt()` al recargar si está bloqueado (`localStorage.bloqueado = "true"`).
- Si el PIN es incorrecto, se redirige al login para evitar accesos no autorizados.

### 🌐 Compatibilidad y despliegue
- Optimizado para navegación móvil y escritorio.
- Ideal para usarlo como aplicación personal desde el navegador móvil.
- Puede alojarse en GitHub Pages o cualquier hosting estático.

---

## 📁 Firebase

- **Colección de notas:** `notas`
- **Documento de foliador:** `config/folio`
- **Autenticación:** `Firebase Authentication`
- **Seguridad de Firestore:**
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
