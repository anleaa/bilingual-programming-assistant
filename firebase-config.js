// Configuración de Firebase y Fallback de LocalStorage (Mock)
// Este archivo actúa como un puente inteligente. Si el usuario ingresa credenciales reales de Firebase,
// la aplicación se conecta a Firebase Auth y Firebase Realtime Database en tiempo real. Si no, funciona localmente.

// --------------------------------------------------------------------------
// CONFIGURACIÓN PREDETERMINADA DE FIREBASE (HARDCODEADA)
// Coloca tus credenciales aquí para que la app se conecte automáticamente
// en todos los dispositivos de tus estudiantes sin tener que configurarlo a mano.
// --------------------------------------------------------------------------
const FIREBASE_DEFAULT_CONFIG = {
  apiKey: "AIzaSyDvwwpqaQoA_mBLq6QFnoXvjtEeIKy-JVA",
  authDomain: "bilingual-tech-assistant.firebaseapp.com",
  projectId: "bilingual-tech-assistant",
  appId: "1:130221492619:web:5667481447a2f689d2c78e"
};

class FirebaseBridge {
  constructor() {
    this.useMock = true;
    this.config = null;
    this.auth = null;
    this.db = null;
    
    // Sesión del usuario y escuchadores
    this.currentUser = null;
    this.authListeners = [];
    
    // Cachés de datos en tiempo real (para evitar consultas asíncronas lentas)
    this.favoritesCache = [];
    this.customTermsCache = [];
    
    // Referencias para desuscribirse
    this.favoritesUnsubscribe = null;
    this.customTermsUnsubscribe = null;

    this.init();
  }

  init() {
    // Intentar leer la configuración guardada en LocalStorage o usar la predeterminada hardcodeada
    let configToUse = null;
    const savedConfig = localStorage.getItem('firebase_config');
    
    if (savedConfig) {
      configToUse = JSON.parse(savedConfig);
    } else if (FIREBASE_DEFAULT_CONFIG && FIREBASE_DEFAULT_CONFIG.apiKey && FIREBASE_DEFAULT_CONFIG.projectId) {
      configToUse = FIREBASE_DEFAULT_CONFIG;
    }
    
    if (configToUse && window.firebase) {
      try {
        this.config = configToUse;
        
        // Inicializar Firebase SDK si no ha sido inicializado antes
        if (window.firebase.apps.length === 0) {
          window.firebase.initializeApp(this.config);
        }
        
        this.auth = window.firebase.auth();
        this.db = window.firebase.database(); // Usando Firebase Realtime Database
        this.useMock = false;
        
        console.log("⚡ Firebase Realtime Database inicializado con éxito.");

        // Escuchar cambios de sesión reales de Firebase Auth (Persistente por defecto)
        this.auth.onAuthStateChanged(user => {
          if (user) {
            this.currentUser = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email.split('@')[0]
            };
            // Activar suscripciones en tiempo real para favoritos
            this.setupRealtimeListeners();
          } else {
            this.currentUser = null;
            this.cleanupRealtimeListeners();
          }
          this.triggerAuthStateChange();
        });

        // Activar escuchador global de términos personalizados de la comunidad
        this.setupCustomTermsListener();

      } catch (e) {
        console.error("⚠️ Error al inicializar Firebase real, rebotando a modo local:", e);
        this.useMock = true;
      }
    } else {
      this.useMock = true;
      console.log("🔌 Operando en modo local (Mock LocalStorage) - Sin credenciales de Firebase.");
    }

    // Inicialización del Modo Local / Fallback
    if (this.useMock) {
      if (!localStorage.getItem('mock_users')) {
        localStorage.setItem('mock_users', JSON.stringify([]));
      }
      if (!localStorage.getItem('mock_favorites')) {
        localStorage.setItem('mock_favorites', JSON.stringify({}));
      }
      if (!localStorage.getItem('mock_custom_terms')) {
        localStorage.setItem('mock_custom_terms', JSON.stringify([]));
      }

      // Cargar sesión persistente local si existe
      const session = localStorage.getItem('mock_session');
      if (session) {
        this.currentUser = JSON.parse(session);
      }
    }
  }

  // --- ESCUCHADORES EN TIEMPO REAL (FIREBASE REALTIME DATABASE) ---

  setupCustomTermsListener() {
    if (this.customTermsUnsubscribe && this.db) {
      this.db.ref('custom_terms').off('value', this.customTermsUnsubscribe);
    }
    
    // Escuchador de cambios en la rama 'custom_terms'
    this.customTermsUnsubscribe = (snapshot) => {
      this.customTermsCache = [];
      snapshot.forEach(childSnapshot => {
        this.customTermsCache.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });
      // Invertir para mostrar términos más nuevos primero
      this.customTermsCache.reverse();
      console.log("☁️ Términos en tiempo real sincronizados (Realtime DB):", this.customTermsCache.length);
      
      // Forzar re-renderizado de la UI
      if (window.renderAllViews) window.renderAllViews();
    };

    this.db.ref('custom_terms').on('value', this.customTermsUnsubscribe, err => {
      console.error("Error en escuchador en tiempo real de Realtime DB:", err);
    });
  }

  setupRealtimeListeners() {
    if (this.favoritesUnsubscribe && this.db) {
      this.db.ref(`users/${this.currentUser.uid}/favorites`).off('value', this.favoritesUnsubscribe);
    }
    
    // Escuchar favoritos en tiempo real para el usuario activo
    this.favoritesUnsubscribe = (snapshot) => {
      this.favoritesCache = snapshot.val() || [];
      console.log("💖 Favoritos sincronizados en tiempo real (Realtime DB):", this.favoritesCache.length);
      
      if (window.renderAllViews) window.renderAllViews();
    };

    this.db.ref(`users/${this.currentUser.uid}/favorites`).on('value', this.favoritesUnsubscribe, err => {
      console.error("Error en escuchador de favoritos Realtime DB:", err);
    });
  }

  cleanupRealtimeListeners() {
    if (this.favoritesUnsubscribe && this.db && this.currentUser) {
      this.db.ref(`users/${this.currentUser.uid}/favorites`).off('value', this.favoritesUnsubscribe);
      this.favoritesUnsubscribe = null;
    }
    this.favoritesCache = [];
  }

  // Comprobar si está usando Firebase real o local
  isMockActive() {
    return this.useMock;
  }

  // Guardar configuración de Firebase desde la UI
  saveConfig(newConfig) {
    if (!newConfig || !newConfig.apiKey || !newConfig.projectId) {
      // Si se pasa vacío, limpia la configuración y vuelve al Mock
      localStorage.removeItem('firebase_config');
      this.useMock = true;
      this.config = null;
      
      // Detener escuchadores reales
      if (this.customTermsUnsubscribe && this.db) {
        this.db.ref('custom_terms').off('value', this.customTermsUnsubscribe);
        this.customTermsUnsubscribe = null;
      }
      this.cleanupRealtimeListeners();
      this.currentUser = null;
      localStorage.removeItem('mock_session');
      
      this.init();
      this.triggerAuthStateChange();
      return { success: true, message: "Regresado a base de datos local." };
    }

    try {
      localStorage.setItem('firebase_config', JSON.stringify(newConfig));
      this.config = newConfig;
      this.useMock = false;
      this.init();
      return { success: true, message: "¡Configuración de Firebase guardada correctamente!" };
    } catch (e) {
      return { success: false, message: "Error al guardar: " + e.message };
    }
  }

  // --- MÓDULO DE AUTENTICACIÓN ---

  onAuthStateChanged(callback) {
    this.authListeners.push(callback);
    // Ejecutar inmediatamente con el estado actual
    callback(this.currentUser);
    return () => {
      this.authListeners = this.authListeners.filter(l => l !== callback);
    };
  }

  triggerAuthStateChange() {
    this.authListeners.forEach(callback => callback(this.currentUser));
  }

  async registerUser(email, password, displayName) {
    if (!email || !password || !displayName) {
      throw new Error("Todos los campos son obligatorios.");
    }

    if (this.useMock) {
      await new Promise(r => setTimeout(r, 600));
      const users = JSON.parse(localStorage.getItem('mock_users'));
      if (users.find(u => u.email === email)) {
        throw new Error("Este correo ya está registrado.");
      }

      const newUser = {
        uid: 'usr_' + Math.random().toString(36).substr(2, 9),
        email: email,
        displayName: displayName
      };

      users.push(newUser);
      localStorage.setItem('mock_users', JSON.stringify(users));
      
      // Autologin en Mock
      this.currentUser = newUser;
      localStorage.setItem('mock_session', JSON.stringify(newUser));
      this.triggerAuthStateChange();
      return newUser;
    } else {
      // Registro en Firebase Auth real
      try {
        const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({ displayName: displayName });
        
        this.currentUser = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: displayName
        };
        return this.currentUser;
      } catch (error) {
        throw new Error(this.translateFirebaseError(error.code));
      }
    }
  }

  async loginUser(email, password) {
    if (!email || !password) {
      throw new Error("Ingresa correo y contraseña.");
    }

    if (this.useMock) {
      await new Promise(r => setTimeout(r, 400));
      const users = JSON.parse(localStorage.getItem('mock_users'));
      const user = users.find(u => u.email === email);
      
      if (!user || password !== "123456") {
        if (!user) {
          throw new Error("Usuario no encontrado. Regístrate o introduce la contraseña '123456' si ya existe.");
        } else {
          throw new Error("Contraseña incorrecta. (Prueba con '123456' para desarrollo).");
        }
      }

      this.currentUser = user;
      localStorage.setItem('mock_session', JSON.stringify(user));
      this.triggerAuthStateChange();
      return user;
    } else {
      // Iniciar sesión en Firebase Auth real (Persistente nativo)
      try {
        const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
        this.currentUser = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName || userCredential.user.email.split('@')[0]
        };
        return this.currentUser;
      } catch (error) {
        throw new Error(this.translateFirebaseError(error.code));
      }
    }
  }

  async logoutUser() {
    if (this.useMock) {
      await new Promise(r => setTimeout(r, 200));
      this.currentUser = null;
      localStorage.removeItem('mock_session');
      this.triggerAuthStateChange();
    } else {
      try {
        await this.auth.signOut();
        this.currentUser = null;
        this.cleanupRealtimeListeners();
      } catch (error) {
        throw new Error("Error al cerrar sesión: " + error.message);
      }
    }
  }

  // --- MÓDULO DE BASE DE DATOS (REALTIME DATABASE) ---

  // Obtener favoritos de forma síncrona desde caché
  getFavorites() {
    if (!this.currentUser) return [];
    
    if (this.useMock) {
      const favorites = JSON.parse(localStorage.getItem('mock_favorites'));
      return favorites[this.currentUser.uid] || [];
    } else {
      return this.favoritesCache;
    }
  }

  // Agregar/Eliminar de favoritos en tiempo real (Toggle)
  async toggleFavorite(termId) {
    if (!this.currentUser) {
      throw new Error("Debes iniciar sesión para guardar favoritos.");
    }

    if (this.useMock) {
      const favorites = JSON.parse(localStorage.getItem('mock_favorites'));
      const userFavs = favorites[this.currentUser.uid] || [];

      let isAdded = false;
      let index = userFavs.indexOf(termId);
      if (index > -1) {
        userFavs.splice(index, 1);
        isAdded = false;
      } else {
        userFavs.push(termId);
        isAdded = true;
      }

      favorites[this.currentUser.uid] = userFavs;
      localStorage.setItem('mock_favorites', JSON.stringify(favorites));
      return isAdded;
    } else {
      // Toggle en Realtime Database
      try {
        const userFavRef = this.db.ref(`users/${this.currentUser.uid}/favorites`);
        const isAdded = !this.favoritesCache.includes(termId);
        
        let newFavs;
        if (isAdded) {
          newFavs = [...this.favoritesCache, termId];
        } else {
          newFavs = this.favoritesCache.filter(id => id !== termId);
        }
        
        await userFavRef.set(newFavs);
        return isAdded;
      } catch (error) {
        throw new Error("Error al actualizar favoritos en Realtime DB: " + error.message);
      }
    }
  }

  // Obtener términos creados por la comunidad (síncrono desde caché en Firebase)
  getCustomTerms() {
    if (this.useMock) {
      return JSON.parse(localStorage.getItem('mock_custom_terms')) || [];
    } else {
      return this.customTermsCache;
    }
  }

  // Agregar un término técnico
  async addCustomTerm(term) {
    if (!this.currentUser) {
      throw new Error("Debes iniciar sesión para registrar nuevos términos.");
    }

    if (!term.english || !term.spanish || !term.meaning || !term.category) {
      throw new Error("Todos los campos obligatorios deben completarse.");
    }

    const newTerm = {
      english: term.english,
      spanish: term.spanish,
      category: term.category,
      meaning: term.meaning,
      explanation: term.explanation || "Término aportado por la comunidad de estudiantes.",
      codePython: term.codePython || "# Ejemplo de sintaxis no disponible en Python",
      codeJava: term.codeJava || "// Ejemplo de sintaxis no disponible en Java",
      createdBy: this.currentUser.uid,
      creatorName: this.currentUser.displayName,
      createdAt: new Date().toISOString()
    };

    if (this.useMock) {
      await new Promise(r => setTimeout(r, 400));
      const customTerms = JSON.parse(localStorage.getItem('mock_custom_terms'));
      newTerm.id = 'custom_' + Math.random().toString(36).substr(2, 9);
      
      customTerms.push(newTerm);
      localStorage.setItem('mock_custom_terms', JSON.stringify(customTerms));
      return newTerm;
    } else {
      // Subir a Realtime Database Cloud
      try {
        const termRef = this.db.ref('custom_terms').push();
        await termRef.set(newTerm);
        return newTerm;
      } catch (error) {
        throw new Error("Error al publicar en la nube: " + error.message);
      }
    }
  }

  // Actualizar un término personalizado
  async updateCustomTerm(termId, term) {
    if (!this.currentUser) {
      throw new Error("Debes iniciar sesión para editar términos.");
    }

    if (!term.english || !term.spanish || !term.meaning || !term.category) {
      throw new Error("Todos los campos obligatorios deben completarse.");
    }

    if (this.useMock) {
      await new Promise(r => setTimeout(r, 400));
      const customTerms = JSON.parse(localStorage.getItem('mock_custom_terms'));
      const index = customTerms.findIndex(t => t.id === termId);

      if (index === -1) throw new Error("El término no existe.");
      if (customTerms[index].createdBy !== this.currentUser.uid) {
        throw new Error("Solo el creador puede editar este término.");
      }

      customTerms[index] = {
        ...customTerms[index],
        english: term.english,
        spanish: term.spanish,
        category: term.category,
        meaning: term.meaning,
        explanation: term.explanation || "Término aportado por la comunidad de estudiantes.",
        codePython: term.codePython || "# Ejemplo de sintaxis no disponible en Python",
        codeJava: term.codeJava || "// Ejemplo de sintaxis no disponible en Java",
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem('mock_custom_terms', JSON.stringify(customTerms));
      
      if (window.renderAllViews) window.renderAllViews();
      return customTerms[index];
    } else {
      // Modificar en Realtime Database Cloud
      try {
        const termRef = this.db.ref('custom_terms').child(termId);
        const snapshot = await termRef.once('value');
        
        if (!snapshot.exists()) throw new Error("El término no existe.");
        if (snapshot.val().createdBy !== this.currentUser.uid) {
          throw new Error("Solo el creador puede editar este término.");
        }

        const updatedTerm = {
          ...snapshot.val(),
          english: term.english,
          spanish: term.spanish,
          category: term.category,
          meaning: term.meaning,
          explanation: term.explanation || "Término aportado por la comunidad de estudiantes.",
          codePython: term.codePython || "# Ejemplo de sintaxis no disponible en Python",
          codeJava: term.codeJava || "// Ejemplo de sintaxis no disponible en Java",
          updatedAt: new Date().toISOString()
        };

        await termRef.set(updatedTerm);
        return updatedTerm;
      } catch (error) {
        throw new Error("Error al editar en la nube: " + error.message);
      }
    }
  }

  // Eliminar un término personalizado
  async deleteCustomTerm(termId) {
    if (!this.currentUser) {
      throw new Error("Debes iniciar sesión para borrar términos.");
    }

    if (this.useMock) {
      const customTerms = JSON.parse(localStorage.getItem('mock_custom_terms'));
      const term = customTerms.find(t => t.id === termId);

      if (!term) throw new Error("El término no existe.");
      if (term.createdBy !== this.currentUser.uid) throw new Error("Solo el creador puede eliminarlo.");

      const filtered = customTerms.filter(t => t.id !== termId);
      localStorage.setItem('mock_custom_terms', JSON.stringify(filtered));
      return true;
    } else {
      // Borrar de Realtime Database Cloud
      try {
        const termRef = this.db.ref('custom_terms').child(termId);
        const snapshot = await termRef.once('value');
        
        if (!snapshot.exists()) throw new Error("El término no existe.");
        if (snapshot.val().createdBy !== this.currentUser.uid) {
          throw new Error("Solo el creador puede eliminarlo.");
        }

        await termRef.remove();
        return true;
      } catch (error) {
        throw new Error("Error al borrar en la nube: " + error.message);
      }
    }
  }

  // Traducción amigable de errores comunes de Firebase Auth
  translateFirebaseError(code) {
    switch (code) {
      case 'auth/invalid-email':
        return 'El correo electrónico ingresado no tiene un formato válido.';
      case 'auth/user-disabled':
        return 'Esta cuenta ha sido inhabilitada por un administrador.';
      case 'auth/user-not-found':
        return 'No existe ningún estudiante registrado con este correo.';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta. Inténtalo de nuevo.';
      case 'auth/email-already-in-use':
        return 'El correo electrónico ya está registrado por otro estudiante.';
      case 'auth/weak-password':
        return 'La contraseña es muy débil. Elige una de al menos 6 caracteres.';
      case 'auth/operation-not-allowed':
        return 'El método de inicio de sesión con correo y contraseña no está habilitado en la consola de Firebase.';
      default:
        return 'Ocurrió un error de conexión con el servidor. Código: ' + code;
    }
  }
}

// Instanciar y exportar el servicio global
const FirebaseService = new FirebaseBridge();
window.FirebaseService = FirebaseService;
