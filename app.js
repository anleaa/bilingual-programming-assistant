/* ==========================================================================
   LÓGICA CONTROLADORA - ASISTENTE DIGITAL DE TERMINOLOGÍA BILINGÜE
   ========================================================================== */

// --- VARIABLES DE ESTADO GLOBAL ---
let activeView = 'home';
let activeCategory = 'all';
let searchQuery = '';
let currentAuthTab = 'login';
let termCardsTiltListeners = []; // Para limpiar listeners si es necesario
let editingTermId = null; // ID del término que se está editando

// --- INICIALIZACIÓN DEL SISTEMA ---
document.addEventListener('DOMContentLoaded', () => {
  initRouting();
  initAuthEvents();
  initDbConfigEvents();
  initSearchAndFilterEvents();
  initFormEvents();
  initWelcomeEvents();
  
  // Escuchar cambios de estado de sesión de Firebase
  window.FirebaseService.onAuthStateChanged(handleAuthStateChange);
  
  // Renderizar contenido inicial
  renderAllViews();
});

// ==========================================================================
// 1. SISTEMA DE RUTAS (SPA VIEW ROUTING)
// ==========================================================================

function initRouting() {
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const viewId = link.getAttribute('data-view');
      // Cancelar edición si el usuario navega a través del menú lateral
      if (viewId === 'add') {
        cancelEditMode();
      }
      switchView(viewId);
    });
  });
}

function switchView(viewId) {
  activeView = viewId;
  
  // Actualizar clases activas en los enlaces de navegación ("botes")
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('data-view') === viewId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Mostrar la sección correspondiente y ocultar las demás
  document.querySelectorAll('.app-view').forEach(view => {
    if (view.id === `view-${viewId}`) {
      view.classList.add('active');
    } else {
      view.classList.remove('active');
    }
  });

  // Ajustar cabecera y filtros según la vista activa
  const viewTitle = document.getElementById('view-title');
  const viewSubtitle = document.getElementById('view-subtitle');
  const categoryBar = document.getElementById('categories-filter-bar');
  const searchWrapper = document.getElementById('search-controls-wrapper');

  // Valores predeterminados de visualización
  categoryBar.style.display = 'none';
  searchWrapper.style.display = 'flex';

  switch (viewId) {
    case 'home':
      viewTitle.innerHTML = '<i class="fa-solid fa-cube text-cyan"></i> Portal de Terminología';
      viewSubtitle.textContent = 'Explora el significado real y contextual de palabras técnicas en inglés.';
      categoryBar.style.display = 'flex';
      break;
      
    case 'list':
      viewTitle.innerHTML = '<i class="fa-solid fa-server text-cyan"></i> Directorio Completo';
      viewSubtitle.textContent = 'Consulta todos los términos del sistema ordenados en una rejilla de datos.';
      break;
      
    case 'add':
      viewTitle.innerHTML = '<i class="fa-solid fa-square-plus text-cyan"></i> Registrar Nuevo Concepto';
      viewSubtitle.textContent = 'Aporta nuevos términos y códigos de ejemplo a la comunidad estudiantil.';
      searchWrapper.style.display = 'none'; // Ocultar buscador en el formulario
      break;
      
    case 'favorites':
      viewTitle.innerHTML = '<i class="fa-solid fa-heart-pulse text-magenta"></i> Términos Favoritos';
      viewSubtitle.textContent = 'Tus conceptos guardados para repaso y consulta veloz.';
      break;
      
    case 'my-terms':
      viewTitle.innerHTML = '<i class="fa-solid fa-book-bookmark text-cyan"></i> Términos Añadidos';
      viewSubtitle.textContent = 'Administra los conceptos técnicos que has aportado a la base de datos.';
  }

  // Cerrar el menú móvil al seleccionar una vista
  const menu = document.querySelector('.nav-menu');
  if (menu) {
    menu.classList.remove('mobile-active');
  }

  // Control del formulario de agregar para usuarios invitados
  const guestBanner = document.getElementById('add-term-guest-banner');
  const formFields = document.querySelectorAll('#form-add-term input, #form-add-term select, #form-add-term textarea, #form-add-term button');

  if (viewId === 'add') {
    if (!window.FirebaseService.currentUser) {
      if (guestBanner) guestBanner.style.display = 'flex';
      formFields.forEach(field => {
        if (field.id !== 'btn-reset-form') {
          field.disabled = true;
        }
      });
    } else {
      if (guestBanner) guestBanner.style.display = 'none';
      formFields.forEach(field => field.disabled = false);
    }
  } else {
    if (guestBanner) guestBanner.style.display = 'none';
  }

  // Refrescar renderizado al cambiar de vista
  renderAllViews();
}

// ==========================================================================
// 2. OBTENCIÓN Y FILTRADO DE DATOS (DATA CONTROLLER)
// ==========================================================================

// Obtiene la lista combinada de términos iniciales + términos agregados por usuarios
function getCombinedTerms() {
  const customs = window.FirebaseService.getCustomTerms();
  return [...INITIAL_TERMS, ...customs];
}

// Filtra la lista combinada según búsqueda y categoría
function getFilteredTerms() {
  let terms = getCombinedTerms();

  // Filtrado por Categoría
  if (activeCategory !== 'all') {
    terms = terms.filter(t => t.category === activeCategory);
  }

  // Filtrado por Búsqueda Bilingüe
  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    terms = terms.filter(t => 
      t.english.toLowerCase().includes(q) ||
      t.spanish.toLowerCase().includes(q) ||
      t.meaning.toLowerCase().includes(q) ||
      t.explanation.toLowerCase().includes(q)
    );
  }

  // Filtrado exclusivo de Favoritos
  if (activeView === 'favorites') {
    const favs = window.FirebaseService.getFavorites();
    terms = terms.filter(t => favs.includes(t.id));
  }

  // Filtrado exclusivo de Términos Añadidos
  if (activeView === 'my-terms') {
    if (window.FirebaseService.currentUser) {
      terms = terms.filter(t => t.createdBy === window.FirebaseService.currentUser.uid);
    } else {
      terms = [];
    }
  }

  return terms;
}

// ==========================================================================
// 3. RENDERIZACIÓN DE VISTAS (VIEW RENDERING)
// ==========================================================================

function renderAllViews() {
  const filtered = getFilteredTerms();
  const currentUser = window.FirebaseService.currentUser;

  if (activeView === 'home') {
    renderGrid(filtered, 'terms-grid-home');
  } else if (activeView === 'list') {
    renderTable(filtered);
  } else if (activeView === 'favorites') {
    if (currentUser) {
      renderGrid(filtered, 'terms-grid-favorites');
    } else {
      renderGuestOverlay('terms-grid-favorites', 'Inicia sesión como estudiante para guardar tus conceptos favoritos y repasar con rapidez.');
    }
  } else if (activeView === 'my-terms') {
    if (currentUser) {
      renderGrid(filtered, 'terms-grid-my-terms');
    } else {
      renderGuestOverlay('terms-grid-my-terms', 'Inicia sesión como estudiante para administrar y editar los conceptos técnicos que has aportado.');
    }
  }
}

// Renderiza los términos en una Grilla de Tarjetas 3D
function renderGrid(terms, containerId) {
  const grid = document.getElementById(containerId);
  grid.innerHTML = '';

  if (terms.length === 0) {
    grid.innerHTML = getEmptyStateHTML();
    return;
  }

  const favorites = window.FirebaseService.getFavorites();

  terms.forEach(term => {
    const isFav = favorites.includes(term.id);
    const isCustom = !!term.createdBy;
    const isCreator = isCustom && window.FirebaseService.currentUser && term.createdBy === window.FirebaseService.currentUser.uid;
    
    const cardHTML = `
      <div class="term-card-container" data-id="${term.id}">
        <div class="term-card" id="card-${term.id}">
          
          <!-- CARA FRONTAL -->
          <div class="card-front">
            <div class="card-header">
              <span class="category-tag tag-${term.category}">${getCategoryLabel(term.category)}</span>
              <div class="card-actions">
                ${isCreator ? `
                  <button class="btn-card-action btn-edit" onclick="handleEditTerm('${term.id}', event)" title="Editar tu término"><i class="fa-solid fa-pen-to-square"></i></button>
                  <button class="btn-card-action btn-delete" onclick="handleDeleteTerm('${term.id}', event)" title="Borrar tu término"><i class="fa-solid fa-trash-can"></i></button>
                ` : ''}
                <button class="btn-card-action btn-fav ${isFav ? 'active' : ''}" onclick="handleToggleFavorite('${term.id}', event)">
                  <i class="fa-solid fa-heart"></i>
                </button>
              </div>
            </div>
            
            <div class="card-body">
              <h3 class="term-title">${term.english}</h3>
              <div class="term-translation-badge">
                <i class="fa-solid fa-language"></i> ${term.spanish}
              </div>
              <p class="term-meaning">${term.meaning}</p>
            </div>
            
            <div class="card-footer">
              <span class="creator-tag">
                ${isCustom ? `Por: <span>${term.creatorName}</span>` : 'Sistema Técnico'}
              </span>
              <button class="btn-flip-trigger" onclick="flipCard(this, true, event)">
                <span>Ver Detalles</span> <i class="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
          
          <!-- CARA TRASERA (DETALLES Y CÓDIGO) -->
          <div class="card-back">
            <div class="back-header">
              <span class="back-title">${term.english}</span>
              <button class="btn-card-action" onclick="flipCard(this, false, event)">
                <i class="fa-solid fa-rotate-left"></i>
              </button>
            </div>
            
            <div class="back-explanation-section">
              <div class="back-explanation-title">💡 Explicación Sencilla</div>
              <p class="back-explanation">${term.explanation}</p>
            </div>
            
            <!-- Bloque de Código de Programación -->
            <div class="code-module">
              <div class="code-tabs">
                <button class="tab-btn active" data-lang="python" onclick="switchCodeTab(this, '${term.id}', 'python', event)">
                  <i class="fa-brands fa-python"></i> Python
                </button>
                <button class="tab-btn" data-lang="java" onclick="switchCodeTab(this, '${term.id}', 'java', event)">
                  <i class="fa-brands fa-java"></i> Java
                </button>
              </div>
              
              <div class="code-wrapper" id="code-wrap-${term.id}">
                <button class="btn-copy-code" onclick="copyCodeSnippet(this, event)" title="Copiar código">
                  <i class="fa-solid fa-copy"></i>
                </button>
                <pre><code id="code-content-${term.id}">${escapeHtml(term.codePython)}</code></pre>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
    grid.insertAdjacentHTML('beforeend', cardHTML);
  });

  // Re-inicializar efectos físicos 3D sobre las nuevas tarjetas
  apply3DTiltEffect();
}

// Renderiza los términos en formato Tabla de Datos Completa
function renderTable(terms) {
  const tableBody = document.getElementById('terms-table-body');
  const totalCountText = document.getElementById('table-total-count');
  
  tableBody.innerHTML = '';
  totalCountText.textContent = `${terms.length} Términos`;

  if (terms.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 40px 0;">
          <div class="empty-state-icon"><i class="fa-solid fa-database"></i></div>
          <p style="margin-top: 10px; color: var(--text-secondary);">No se encontraron términos coincidentes en el directorio.</p>
        </td>
      </tr>
    `;
    return;
  }

  terms.forEach(term => {
    const isCustom = !!term.createdBy;
    const row = `
      <tr>
        <td class="term-name-td">${term.english}</td>
        <td>${term.spanish}</td>
        <td><span class="category-tag tag-${term.category}">${getCategoryLabel(term.category)}</span></td>
        <td>${term.meaning}</td>
        <td class="action-btn-td">
          <button class="btn-flip-trigger" style="padding: 6px 12px; font-size: 0.75rem;" onclick="viewTermDetailsFromTable('${term.id}')">
            <i class="fa-solid fa-eye"></i> Explorar
          </button>
        </td>
      </tr>
    `;
    tableBody.insertAdjacentHTML('beforeend', row);
  });
}

// Devuelve plantilla HTML para estados vacíos de búsqueda o favoritos
function getEmptyStateHTML() {
  return `
    <div class="empty-state" style="grid-column: 1 / -1;">
      <div class="empty-state-icon"><i class="fa-solid fa-satellite"></i></div>
      <h4>Sin Coincidencias Holográficas</h4>
      <p>Prueba buscando con palabras clave diferentes o comprueba si has seleccionado la categoría correcta. También puedes agregar un término tú mismo.</p>
    </div>
  `;
}

// ==========================================================================
// 4. ANIMACIONES E INTERACTIVIDAD 3D (3D ANIMATIONS & TILT PHYSICS)
// ==========================================================================

// Efecto Tilt 3D Holográfico que sigue el puntero del ratón
function apply3DTiltEffect() {
  const cards = document.querySelectorAll('.term-card-container');
  
  cards.forEach(container => {
    const card = container.querySelector('.term-card');
    
    // Evitar añadir múltiples listeners si ya existen
    container.addEventListener('mousemove', (e) => {
      // Si la tarjeta está volteada (flipped), no aplicar inclinación para no distorsionar el reverso
      if (card.classList.contains('flipped')) {
        card.style.transform = 'rotateY(180deg)';
        return;
      }

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left; // posición X del cursor en el elemento
      const y = e.clientY - rect.top;  // posición Y del cursor en el elemento
      
      const width = rect.width;
      const height = rect.height;
      
      // Calcular la inclinación angular (-15deg a +15deg máx)
      const rotateX = ((y / height) - 0.5) * -20;
      const rotateY = ((x / width) - 0.5) * 20;
      
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(12px)`;
    });
    
    container.addEventListener('mouseleave', () => {
      if (card.classList.contains('flipped')) {
        card.style.transform = 'rotateY(180deg)';
      } else {
        card.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0deg)';
      }
    });
  });
}

// Voltear la tarjeta 3D (soporta elemento DOM o id de cadena)
function flipCard(target, isFlip, event) {
  if (event) event.stopPropagation();

  let card;
  if (typeof target === 'string') {
    // Buscar por ID, preferiendo el de la vista activa si hay duplicados
    const activeViewEl = document.getElementById(`view-${activeView}`);
    if (activeViewEl) {
      card = activeViewEl.querySelector(`[id="card-${target}"]`);
    }
    if (!card) {
      card = document.getElementById(`card-${target}`);
    }
  } else if (target && typeof target.closest === 'function') {
    card = target.closest('.term-card');
  }

  if (!card) return;

  if (isFlip) {
    card.classList.add('flipped');
    card.style.transform = 'rotateY(180deg)';
  } else {
    card.classList.remove('flipped');
    card.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0deg)';
  }
}

// Ver término desde la tabla (nos redirige a inicio y busca dicho término)
function viewTermDetailsFromTable(termId) {
  const combined = getCombinedTerms();
  const term = combined.find(t => t.id === termId);
  if (!term) return;

  searchQuery = term.english;
  document.getElementById('search-input').value = term.english;
  activeCategory = 'all';
  
  // Limpiar chips activos
  document.querySelectorAll('.category-chip').forEach(c => {
    if (c.getAttribute('data-category') === 'all') c.classList.add('active');
    else c.classList.remove('active');
  });

  switchView('home');

  // Dar una leve pausa y auto-voltear la tarjeta encontrada
  setTimeout(() => {
    flipCard(termId, true);
  }, 300);
}

// Cambiar la pestaña de lenguaje de código en el reverso de la tarjeta (robusto a duplicados)
function switchCodeTab(target, termId, lang, event) {
  if (event) event.stopPropagation(); // Evitar voltear la tarjeta al hacer clic en pestañas
  
  let card;
  if (target instanceof HTMLElement) {
    card = target.closest('.term-card');
  } else {
    card = document.getElementById(`card-${termId}`);
  }
  if (!card) return;

  const tabs = card.querySelectorAll('.tab-btn');
  const codeContent = card.querySelector('code');
  if (!codeContent) return;
  
  const combined = getCombinedTerms();
  const term = combined.find(t => t.id === termId);
  if (!term) return;

  tabs.forEach(tab => {
    if (tab.getAttribute('data-lang') === lang) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  if (lang === 'python') {
    codeContent.innerHTML = escapeHtml(term.codePython);
  } else {
    codeContent.innerHTML = escapeHtml(term.codeJava);
  }
}

// Copiar código al portapapeles (robusto a duplicados)
function copyCodeSnippet(target, event) {
  if (event) event.stopPropagation(); // Evitar voltear la tarjeta
  
  let card;
  if (target instanceof HTMLElement) {
    card = target.closest('.term-card');
  }
  
  const codeEl = card ? card.querySelector('code') : null;
  if (!codeEl) return;
  
  const codeContent = codeEl.textContent;
  
  navigator.clipboard.writeText(codeContent).then(() => {
    showToast("Código de ejemplo copiado al portapapeles.", "success");
  }).catch(err => {
    showToast("Error al copiar código.", "error");
  });
}

// ==========================================================================
// 5. EVENTOS DE AUTENTICACIÓN (AUTH MODAL & FLOW)
// ==========================================================================

function initAuthEvents() {
  const btnAuthAction = document.getElementById('btn-auth-action');
  
  btnAuthAction.addEventListener('click', () => {
    const user = window.FirebaseService.currentUser;
    if (user) {
      // Al cerrar sesión, resetear el modo invitado para que vuelvan a ver la pantalla de inicio
      isGuestMode = false;
      window.FirebaseService.logoutUser().then(() => {
        showToast("Sesión cerrada correctamente.", "success");
      });
    } else {
      // Abrir modal de Login
      openModal('modal-auth');
    }
  });

  // Forms submit
  document.getElementById('form-login').addEventListener('submit', handleLogin);
  document.getElementById('form-register').addEventListener('submit', handleRegister);
}

function handleAuthStateChange(user) {
  const userProfile = document.getElementById('user-profile');
  const userAvatar = document.getElementById('user-avatar');
  const userDisplayName = document.getElementById('user-display-name');
  const authBtnText = document.getElementById('auth-btn-text');

  if (user) {
    // Configurar perfil visible
    userDisplayName.textContent = user.displayName;
    userAvatar.textContent = user.displayName.charAt(0).toUpperCase();
    userProfile.style.display = 'flex';
    authBtnText.textContent = "Cerrar Sesión";
    
    // Ocultar pantalla de bienvenida automáticamente al iniciar sesión
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) {
      welcomeScreen.classList.add('hidden');
    }
    const appContainer = document.getElementById('app-container');
    if (appContainer) {
      appContainer.style.opacity = '1';
      appContainer.style.pointerEvents = 'auto';
    }
  } else {
    // Limpiar perfil
    userProfile.style.display = 'none';
    authBtnText.textContent = "Iniciar Sesión";
    
    // Si no está en modo invitado y no hay usuario, mostrar la pantalla de bienvenida
    if (!isGuestMode) {
      const welcomeScreen = document.getElementById('welcome-screen');
      if (welcomeScreen) {
        welcomeScreen.classList.remove('hidden');
      }
      const appContainer = document.getElementById('app-container');
      if (appContainer) {
        appContainer.style.opacity = '0.08'; // Difuminado de fondo muy tenue
        appContainer.style.pointerEvents = 'none';
      }
    }
    
    // Si estábamos en Favoritos, Añadir o Términos Añadidos, y cerramos sesión, devolver a inicio
    if (activeView === 'favorites' || activeView === 'add' || activeView === 'my-terms') {
      switchView('home');
    }
  }

  // Refrescar vistas para sincronizar favoritos y visibilidad de botones
  renderAllViews();
}

async function handleLogin() {
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-password').value;
  const submitBtn = document.getElementById('btn-login-submit');

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Autenticando...';

  try {
    const user = await window.FirebaseService.loginUser(email, pass);
    showToast(`¡Bienvenido de nuevo, ${user.displayName}!`, "success");
    closeModal('modal-auth');
    document.getElementById('form-login').reset();
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Conectar Cuenta";
  }
}

async function handleRegister() {
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const pass = document.getElementById('register-password').value;
  const submitBtn = document.getElementById('btn-register-submit');

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registrando...';

  try {
    const user = await window.FirebaseService.registerUser(email, pass, name);
    showToast(`¡Registro exitoso! Cuenta creada para ${user.displayName}.`, "success");
    closeModal('modal-auth');
    document.getElementById('form-register').reset();
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Crear Credenciales";
  }
}

function switchAuthTab(tab) {
  currentAuthTab = tab;
  
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const panelLogin = document.getElementById('panel-login');
  const panelRegister = document.getElementById('panel-register');

  if (tab === 'login') {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    panelLogin.classList.add('active');
    panelRegister.classList.remove('active');
  } else {
    tabLogin.classList.remove('active');
    tabRegister.classList.add('active');
    panelLogin.classList.remove('active');
    panelRegister.classList.add('active');
  }
}

// ==========================================================================
// 6. ACCIONES DE FAVORITOS & BASE DE DATOS
// ==========================================================================

async function handleToggleFavorite(termId, event) {
  event.stopPropagation(); // Evitar voltear la tarjeta

  try {
    const isAdded = await window.FirebaseService.toggleFavorite(termId);
    if (isAdded) {
      showToast("Término guardado en favoritos.", "success");
    } else {
      showToast("Término eliminado de favoritos.", "success");
    }
    
    // Sincronizar UI de corazones
    renderAllViews();
  } catch (error) {
    showToast(error.message, "error");
    // Si requiere sesión, abrir modal de auth
    if (error.message.includes("iniciar sesión")) {
      openModal('modal-auth');
    }
  }
}

async function handleDeleteTerm(termId, event) {
  event.stopPropagation(); // Evitar voltear

  if (!confirm("¿Estás seguro de que deseas eliminar este término personalizado de forma permanente?")) {
    return;
  }

  try {
    await window.FirebaseService.deleteCustomTerm(termId);
    showToast("Término eliminado correctamente.", "success");
    renderAllViews();
  } catch (error) {
    showToast(error.message, "error");
  }
}

// Iniciar flujo de edición prellenando el formulario
function handleEditTerm(termId, event) {
  if (event) event.stopPropagation(); // Evitar voltear la tarjeta
  
  const combined = getCombinedTerms();
  const term = combined.find(t => t.id === termId);
  if (!term) return;

  editingTermId = termId;

  // Rellenar formulario con los datos actuales
  document.getElementById('input-english').value = term.english;
  document.getElementById('input-spanish').value = term.spanish;
  document.getElementById('select-category').value = term.category;
  document.getElementById('input-meaning').value = term.meaning;
  
  // Limpiar descripciones/códigos predeterminados para mayor comodidad del usuario
  document.getElementById('input-explanation').value = 
    term.explanation === "Término aportado por la comunidad de estudiantes." ? "" : term.explanation;
  
  const isDefaultPy = term.codePython === "# Ejemplo de sintaxis no disponible en Python" || term.codePython.startsWith("# Ejemplo de sintaxis no disponible");
  document.getElementById('input-code-py').value = isDefaultPy ? "" : term.codePython;
  
  const isDefaultJava = term.codeJava === "// Ejemplo de sintaxis no disponible en Java" || term.codeJava.startsWith("// Ejemplo de sintaxis no disponible");
  document.getElementById('input-code-java').value = isDefaultJava ? "" : term.codeJava;

  // Cambiar elementos de la interfaz al modo edición
  document.querySelector('#view-add .form-header-area h3').innerHTML = '<i class="fa-solid fa-pen-to-square text-cyan"></i> Editar Término';
  document.querySelector('#view-add .form-header-area p').textContent = 'Modifica los datos del término que subiste anteriormente. Los cambios se guardarán.';
  document.getElementById('btn-submit-term').textContent = 'Guardar Cambios';
  document.getElementById('btn-reset-form').textContent = 'Cancelar Edición';

  // Cambiar pestaña del SPA
  switchView('add');
  
  // Re-ajustar cabecera dinámica de forma personalizada
  document.getElementById('view-title').innerHTML = '<i class="fa-solid fa-pen-to-square text-cyan"></i> Editar Concepto';
  document.getElementById('view-subtitle').textContent = 'Modifica un término técnico que hayas agregado.';
}

// Cancelar edición y restaurar textos originales del formulario
function cancelEditMode() {
  editingTermId = null;
  const form = document.getElementById('form-add-term');
  if (form) form.reset();
  
  const h3 = document.querySelector('#view-add .form-header-area h3');
  const p = document.querySelector('#view-add .form-header-area p');
  const submitBtn = document.getElementById('btn-submit-term');
  const resetBtn = document.getElementById('btn-reset-form');
  
  if (h3) h3.innerHTML = '<i class="fa-solid fa-square-plus text-cyan"></i> Insertar Nuevo Término';
  if (p) p.textContent = 'Aporta a la base de datos técnica. Todos los usuarios registrados podrán visualizar tus contribuciones.';
  if (submitBtn) submitBtn.textContent = 'Registrar Término';
  if (resetBtn) resetBtn.textContent = 'Limpiar Campos';
}

// ==========================================================================
// 7. CONFIGURACIÓN DE FIREBASE (SETTINGS VIEW/MODAL)
// ==========================================================================

function initDbConfigEvents() {
  const btnOpenConfig = document.getElementById('btn-open-config');
  btnOpenConfig.addEventListener('click', () => {
    // Rellenar formulario si ya hay configuraciones
    const cfg = window.FirebaseService.config;
    if (cfg) {
      document.getElementById('cfg-api-key').value = cfg.apiKey || '';
      document.getElementById('cfg-project-id').value = cfg.projectId || '';
      document.getElementById('cfg-auth-domain').value = cfg.authDomain || '';
      document.getElementById('cfg-app-id').value = cfg.appId || '';
    }

    // Actualizar indicador de estado visual en el modal
    updateDbIndicatorUI();
    openModal('modal-config');
  });

  // Guardar configuración
  document.getElementById('form-firebase-config').addEventListener('submit', () => {
    const apiKey = document.getElementById('cfg-api-key').value;
    const projectId = document.getElementById('cfg-project-id').value;
    const authDomain = document.getElementById('cfg-auth-domain').value;
    const appId = document.getElementById('cfg-app-id').value;

    const btnSave = document.getElementById('btn-save-config');
    btnSave.disabled = true;
    btnSave.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Vinculando...';

    setTimeout(() => {
      let res;
      if (!apiKey && !projectId) {
        res = window.FirebaseService.saveConfig(null); // Borra y vuelve a mock
      } else {
        res = window.FirebaseService.saveConfig({ apiKey, projectId, authDomain, appId });
      }

      if (res.success) {
        showToast(res.message, "success");
        closeModal('modal-config');
        updateDbIndicatorUI();
      } else {
        showToast(res.message, "error");
      }
      btnSave.disabled = false;
      btnSave.textContent = "Vincular Firebase";
    }, 800);
  });
}

function updateDbIndicatorUI() {
  const isMock = window.FirebaseService.isMockActive();
  const indicator = document.getElementById('db-indicator-container');
  const title = document.getElementById('db-status-title');
  const desc = document.getElementById('db-status-desc');

  if (isMock) {
    indicator.className = "db-indicator-box mock-active";
    title.textContent = "Base de datos Local Activa";
    desc.textContent = "Seguro, offline y sin internet (LocalStorage).";
  } else {
    indicator.className = "db-indicator-box firebase-active";
    title.textContent = "Conexión Firebase Nube";
    desc.textContent = "Enlazado con el servidor Firebase Firestore & Auth en tiempo real.";
  }
}

function clearFirebaseConfig() {
  document.getElementById('form-firebase-config').reset();
  const res = window.FirebaseService.saveConfig(null);
  showToast(res.message, "success");
  closeModal('modal-config');
  updateDbIndicatorUI();
}

// ==========================================================================
// 8. BÚSQUEDA Y FILTRADO (SEARCH & FILTERS ENGINE)
// ==========================================================================

function initSearchAndFilterEvents() {
  const searchInput = document.getElementById('search-input');
  
  // Búsqueda en tiempo real
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderAllViews();
  });

  // Selector de chips de categorías
  const chips = document.querySelectorAll('.category-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      
      activeCategory = chip.getAttribute('data-category');
      renderAllViews();
    });
  });
}

// ==========================================================================
// 9. FORMULARIO DE INSERCIÓN (CREACIÓN DE TÉRMINOS)
// ==========================================================================

function initFormEvents() {
  const form = document.getElementById('form-add-term');
  
  // Manejar botón Cancelar / Limpiar en modo edición
  const btnReset = document.getElementById('btn-reset-form');
  if (btnReset) {
    btnReset.addEventListener('click', (e) => {
      if (editingTermId) {
        e.preventDefault(); // Evitar el reset del form manual si cancelamos
        cancelEditMode();
        switchView('home');
      }
    });
  }
  
  form.addEventListener('submit', async (e) => {
    if (e) e.preventDefault(); // Detener envío por defecto
    
    const english = document.getElementById('input-english').value;
    const spanish = document.getElementById('input-spanish').value;
    const category = document.getElementById('select-category').value;
    const meaning = document.getElementById('input-meaning').value;
    const explanation = document.getElementById('input-explanation').value;
    const codePy = document.getElementById('input-code-py').value;
    const codeJava = document.getElementById('input-code-java').value;

    const btnSubmit = document.getElementById('btn-submit-term');
    btnSubmit.disabled = true;
    
    if (editingTermId) {
      btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Actualizando...';
      try {
        await window.FirebaseService.updateCustomTerm(editingTermId, {
          english,
          spanish,
          category,
          meaning,
          explanation: explanation || undefined,
          codePython: codePy || undefined,
          codeJava: codeJava || undefined
        });

        showToast(`¡Término "${english}" actualizado exitosamente!`, "success");
        cancelEditMode();
        switchView('home');
      } catch (error) {
        showToast(error.message, "error");
        if (error.message.includes("iniciar sesión")) {
          openModal('modal-auth');
        }
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Guardar Cambios";
      }
    } else {
      btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registrando...';
      try {
        await window.FirebaseService.addCustomTerm({
          english,
          spanish,
          category,
          meaning,
          explanation: explanation || undefined,
          codePython: codePy || undefined,
          codeJava: codeJava || undefined
        });

        showToast(`¡Término "${english}" guardado exitosamente!`, "success");
        form.reset();
        switchView('home');
      } catch (error) {
        showToast(error.message, "error");
        
        // Si requiere inicio de sesión, abrir modal automáticamente
        if (error.message.includes("iniciar sesión")) {
          openModal('modal-auth');
        }
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Registrar Término";
      }
    }
  });
}

// ==========================================================================
// 10. UTILIDADES GLOBALES (HELPERS)
// ==========================================================================

// Abrir una ventana modal holográfica
function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

// Cerrar una ventana modal holográfica
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// Lanzar notificación flotante tipo Cyber Toast
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast-notification');
  const toastMsg = document.getElementById('toast-message');
  
  toastMsg.textContent = message;
  toast.className = `success active`; // Resetea clase activa
  
  if (type === 'error') {
    toast.className = `error active`;
    toast.querySelector('i').className = "fa-solid fa-triangle-exclamation";
  } else {
    toast.className = `success active`;
    toast.querySelector('i').className = "fa-solid fa-shield-halved";
  }

  // Desvanecer después de 3.5 segundos
  setTimeout(() => {
    toast.classList.remove('active');
  }, 3500);
}

// Mapear identificador de categoría con etiqueta legible en español
function getCategoryLabel(category) {
  const mapping = {
    'logic': 'Lógica y Estructuras',
    'oop': 'POO',
    'database': 'Bases de Datos',
    'networks': 'Redes y APIs',
    'systems': 'Sistemas',
    'backend': 'Backend'
  };
  return mapping[category] || category.toUpperCase();
}

// Escapar etiquetas HTML para evitar rotura de maquetación en inserciones de código
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// --- SOPORTE DE MENÚ MÓVIL (TRES PUNTOS) ---
function toggleMobileMenu(event) {
  if (event) event.stopPropagation();
  const menu = document.querySelector('.nav-menu');
  if (menu) {
    menu.classList.toggle('mobile-active');
  }
}

// Cerrar menú móvil al hacer click fuera
document.addEventListener('click', (e) => {
  const menu = document.querySelector('.nav-menu');
  const trigger = document.getElementById('btn-mobile-toggle');
  if (menu && menu.classList.contains('mobile-active')) {
    const isClickInsideMenu = menu.contains(e.target);
    const isClickInsideTrigger = trigger && trigger.contains(e.target);
    if (!isClickInsideMenu && !isClickInsideTrigger) {
      menu.classList.remove('mobile-active');
    }
  }
});

// ==========================================================================
// 11. SISTEMA DE BIENVENIDA / ACCESO DE INVITADO (WELCOME SYSTEM)
// ==========================================================================

let isGuestMode = false;

function initWelcomeEvents() {
  const btnWelcomeAuth = document.getElementById('btn-welcome-auth');
  const btnWelcomeGuest = document.getElementById('btn-welcome-guest');

  if (btnWelcomeAuth) {
    btnWelcomeAuth.addEventListener('click', () => {
      openModal('modal-auth');
    });
  }

  if (btnWelcomeGuest) {
    btnWelcomeGuest.addEventListener('click', () => {
      enterAppAsGuest();
    });
  }
}

function enterAppAsGuest() {
  isGuestMode = true;
  const welcomeScreen = document.getElementById('welcome-screen');
  if (welcomeScreen) {
    welcomeScreen.classList.add('hidden');
  }
  const appContainer = document.getElementById('app-container');
  if (appContainer) {
    appContainer.style.opacity = '1';
    appContainer.style.pointerEvents = 'auto';
  }
  renderAllViews();
}

function renderGuestOverlay(containerId, message) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = `
    <div class="empty-state" style="grid-column: 1 / -1; padding: 50px 30px; border-style: solid;">
      <div class="empty-state-icon"><i class="fa-solid fa-user-astronaut text-magenta"></i></div>
      <h4>Acceso Restringido</h4>
      <p style="margin-bottom: 20px; max-width: 380px; line-height: 1.5;">${message}</p>
      <button class="btn-form-primary" onclick="openModal('modal-auth')" style="padding: 12px 24px; font-size: 0.85rem; display: flex; align-items: center; gap: 10px; margin: 0 auto;">
        <i class="fa-solid fa-key"></i> Iniciar Sesión / Registrarse
      </button>
    </div>
  `;
}
