# Documento de Especificación de Requisitos de Software (SRS)
## Proyecto: Asistente Digital de Terminología Técnica Bilingüe (v1.0)

Este documento define de manera formal los **Requisitos Funcionales (RF)** y **Requisitos No Funcionales (RNF)** del sistema, estructurados y redactados para fines académicos y de evaluación docente.

---

## 1. Introducción al Sistema
El **Asistente Digital de Terminología Técnica Bilingüe** es una plataforma web interactiva SPA (Single Page Application) orientada a estudiantes de informática y programación. Su objetivo principal es resolver la barrera del idioma y la confusión conceptual que sufren los alumnos al traducir términos técnicos del inglés al español (evitando traducciones literales incorrectas, como interpretar *String* como "cuerda" en lugar de "cadena de caracteres", o *Array* como "arreglo" en lugar de "vector/matriz").

El sistema permite buscar términos, visualizar explicaciones didácticas orientadas a estudiantes, examinar ejemplos prácticos de código en Python y Java, guardar favoritos, registrar nuevos conceptos en una base de datos en tiempo real (Firebase Cloud) y gestionar las aportaciones propias.

---

## 2. Requisitos Funcionales (RF)

Los requisitos funcionales describen las acciones, servicios y comportamiento que el sistema debe ejecutar ante las interacciones del usuario.

| Código | Requisito Funcional | Descripción Detallada |
| :--- | :--- | :--- |
| **RF-01** | **Buscador Reactivo e Inteligente** | El sistema debe filtrar en tiempo real los conceptos a medida que el usuario escribe en el campo de búsqueda. La búsqueda debe coincidir de forma insensible a mayúsculas/minúsculas tanto con el término en inglés como con su significado en español. |
| **RF-02** | **Filtro Dinámico por Categorías** | La interfaz debe proveer una barra de chips de categorías (*Todos, Lógica, POO, Bases de Datos, Redes y APIs, Sistemas, Backend*). Al hacer clic en un chip, el listado debe filtrarse inmediatamente para mostrar solo los términos clasificados bajo esa categoría técnica. |
| **RF-03** | **Visualización de Tarjetas Didácticas (Flip-Cards)** | Los conceptos se listarán como tarjetas interactivas. La cara frontal mostrará el término en inglés, su traducción y su significado técnico formal. Al hacer clic en "Ver Detalles", la tarjeta debe realizar una animación de rotación para revelar una explicación informal y cotidiana, además de pestañas interactivas de código de ejemplo (Python / Java). |
| **RF-04** | **Directorio General (Vista de Tabla)** | Para facilitar el análisis de datos masivos en pantallas grandes, el sistema debe incluir una vista tabular alternativa que liste todos los conceptos técnicos ordenados, mostrando columnas de término, traducción, categoría y descripción abreviada, junto con accesos rápidos. |
| **RF-05** | **Autenticación e Identificación de Estudiantes** | El sistema debe incluir un portal de acceso (registro e inicio de sesión) a través de Firebase Authentication (o fallback de simulación local). Se requiere nombre, correo electrónico y contraseña. Al estar autenticado, se mostrará el nombre del estudiante en el panel lateral. |
| **RF-06** | **Sistema de Repaso Personal (Favoritos)** | Los estudiantes autenticados podrán marcar términos como favoritos presionando el icono de corazón en las tarjetas. El sistema debe listar estos elementos guardados de forma persistente en una sección exclusiva ("Mis Favoritos"). |
| **RF-07** | **Aporte de Conceptos (Creación de Término)** | Todo usuario autenticado podrá añadir nuevos términos completando un formulario de validación que requiere: término en inglés, traducción, categoría, significado técnico, explicación didáctica opcional y fragmentos de código de ejemplo en Python y Java. |
| **RF-08** | **Administración de Aportes Propios (Editar y Eliminar)** | El sistema proveerá una sección ("Términos Añadidos") donde el usuario visualizará los términos que ha aportado. Se incluirán botones de acción para **Editar** (cargando los datos existentes en el formulario para su modificación) y **Eliminar** (removiendo de forma permanente el aporte tras confirmar la acción). Un usuario no podrá modificar ni borrar aportes de otros estudiantes. |
| **RF-09** | **Vinculación Dinámica a la Nube (Firebase Cloud)** | El sistema proveerá un panel de configuración donde el usuario o administrador podrá ingresar las credenciales de un proyecto de Firebase (API Key, Project ID, etc.). Si se vincula, los datos pasarán de almacenarse localmente a sincronizarse en la nube en tiempo real; si se limpian las credenciales, el sistema retornará de forma segura al modo de almacenamiento del navegador (*LocalStorage*). |

---

## 3. Requisitos No Funcionales (RNF)

Los requisitos no funcionales definen los atributos de calidad, restricciones y propiedades del sistema (cómo se comporta y bajo qué condiciones opera).

### 3.1. Usabilidad y Experiencia de Usuario (UX/UI)
* **RNF-01.1 (Estética Premium)**: La interfaz debe presentar un diseño futurista oscuro (*cyber-glassmorphism*) mediante una combinación de colores slate (`#0f172a`, `#1e293b`), degradados suaves en tonos cyan, púrpura y magenta, y desenfoque de fondo en contenedores (*backdrop-filter*).
* **RNF-01.2 (Micro-animaciones)**: Las interacciones críticas (hovers en botones de navegación, clic en flip-cards, transiciones de vistas SPA y alertas emergentes) deben ejecutarse con animaciones suaves de transición (`all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)`).
* **RNF-01.3 (Retroalimentación Visual - Toasts)**: Cada acción importante (iniciar sesión, guardar un término, agregar un favorito, error de servidor o actualización de datos) debe reportarse al usuario con un banner de alerta dinámico (*Toast Notification*) que se despliega desde la parte inferior derecha durante 3 segundos.

### 3.2. Adaptabilidad y Responsividad (RWD)
* **RNF-02.1 (Diseño Líquido Responsivo)**: La aplicación debe ser 100% adaptable a cualquier tamaño de pantalla.
  * **Pantalla de Escritorio (>992px)**: Menú de navegación lateral vertical fijo (280px), cuadrícula de tarjetas de 3 columnas con efecto de volteo 3D en tres dimensiones.
  * **Dispositivos Móviles (<=992px)**: Menú de navegación colapsado en una cabecera fija de 60px con logotipo centrado. Se activa un menú descendente tipo cajón accionado por un botón de tres puntos (`⋮`) a la izquierda y el botón de usuario a la derecha.
* **RNF-02.2 (Prevención de Recortes de Texto)**: En celulares, debido al espacio reducido, las tarjetas desactivarán la perspectiva de giro 3D en favor de un toggle de visualización 2D (mostrando una cara u otra) y su altura se redefinirá a `auto`, permitiendo que la tarjeta crezca verticalmente para evitar que el texto técnico o código de ejemplo se corte o desborde.

### 3.3. Rendimiento y Velocidad de Carga
* **RNF-03.1 (Single Page Application - SPA)**: La navegación entre las vistas (*Inicio, Directorio, Añadir, Favoritos*) debe realizarse de manera interna en el navegador sin recargar la página, brindando una experiencia instantánea.
* **RNF-03.2 (Optimización de Carga - Cache Busting)**: Las referencias de assets locales (CSS, JS) en el documento HTML principal deben incluir versiones parametrizadas (`href="style.css?v=1.0.5"`) para evitar que el almacenamiento en caché de navegadores móviles muestre estilos rotos u obsoletos tras actualizaciones.

### 3.4. Portabilidad y Compatibilidad
* **RNF-04.1 (Estándar Web Puro)**: El sistema debe desarrollarse utilizando estándares web puros (HTML5, Vanilla CSS, Vanilla Javascript ES6+) sin dependencias de frameworks pesados (como React, Angular o Vue) ni compiladores. Esto garantiza su portabilidad inmediata en servidores básicos.
* **RNF-04.2 (Compatibilidad Multiplataforma)**: La interfaz debe funcionar de manera idéntica y sin distorsiones en los principales navegadores modernos del mercado: Google Chrome, Apple Safari, Mozilla Firefox, y Microsoft Edge.

### 3.5. Persistencia y Robustez
* **RNF-05.1 (Fallback Local)**: En caso de que no haya conexión a Internet o no se configure una base de datos Firebase, el sistema debe ser capaz de persistir los datos de manera íntegra utilizando la API *LocalStorage* del navegador, asegurando que la aplicación sea plenamente funcional sin conexión.
* **RNF-05.2 (Control de Seguridad en Edición)**: El sistema debe verificar a nivel de código de cliente que el identificador del usuario autenticado coincida estrictamente con la propiedad `createdBy` del término antes de permitir la edición o borrado, impidiendo la manipulación no autorizada.
