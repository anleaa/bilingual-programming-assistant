const INITIAL_TERMS = [
  {
    id: "string",
    english: "String",
    spanish: "Cadena de texto",
    category: "logic",
    meaning: "Secuencia ordenada de caracteres que representa texto en programación.",
    explanation: "Aunque un traductor común lo traduce como 'cuerda', en programación es una cadena de caracteres. Imagínalo como cuentas en un collar, donde cada cuenta es una letra, número o espacio.",
    codePython: `# En Python se crean con comillas simples o dobles
mensaje = "Hola Mundo"
print(mensaje[0]) # Imprime 'H'
print(len(mensaje)) # Imprime 10 (longitud)`,
    codeJava: `// En Java es una clase objeto y se define con comillas dobles
String mensaje = "Hola Mundo";
System.out.println(mensaje.charAt(0)); // Imprime 'H'
System.out.println(mensaje.length()); // Imprime 10`
  },
  {
    id: "array",
    english: "Array",
    spanish: "Arreglo / Vector",
    category: "logic",
    meaning: "Estructura de datos que almacena una colección de elementos del mismo tipo en posiciones de memoria contiguas.",
    explanation: "No significa 'arreglo' de reparar algo. Es una fila ordenada de casilleros numerados que empiezan desde el índice 0, donde guardas información del mismo tipo.",
    codePython: `# Python usa listas dinámicas como arrays
frutas = ["manzana", "banana", "cereza"]
print(frutas[1]) # Imprime 'banana'
frutas.append("naranja")`,
    codeJava: `// En Java tienen un tamaño fijo al definirse
String[] frutas = {"manzana", "banana", "cereza"};
System.out.println(frutas[1]); // Imprime 'banana'
// Para cambiar el tamaño se requiere usar ArrayList`
  },
  {
    id: "thread",
    english: "Thread",
    spanish: "Hilo de ejecución",
    category: "systems",
    meaning: "La unidad de ejecución más pequeña que un sistema operativo puede planificar dentro de un proceso.",
    explanation: "Un traductor común te dirá 'hilo' de coser. En informática, representa una tarea que el procesador ejecuta. Si tu programa tiene varios hilos (multithreading), puede realizar varias acciones a la vez (como descargar un archivo mientras responde clics).",
    codePython: `import threading
import time

def tarea():
    print("Hilo secundario activo")
    time.sleep(1)

hilo = threading.Thread(target=tarea)
hilo.start() # Inicia el hilo paralelo`,
    codeJava: `// En Java extendemos de Thread o implementamos Runnable
class Tarea extends Thread {
    public void run() {
        System.out.println("Hilo secundario activo");
    }
}

Tarea hilo = new Tarea();
hilo.start(); // Inicia el hilo`
  },
  {
    id: "api",
    english: "API (Application Programming Interface)",
    spanish: "Interfaz de Programación de Aplicaciones",
    category: "networks",
    meaning: "Conjunto de definiciones y protocolos que permite a dos aplicaciones de software comunicarse entre sí.",
    explanation: "Es como el camarero en un restaurante. Tú (el cliente) ordenas comida del menú, el camarero (la API) lleva tu pedido a la cocina (el servidor) y luego te trae la comida de vuelta. No necesitas saber cómo cocina el chef, solo cómo pedirle al camarero.",
    codePython: `import requests
# Consumir una API en Python
response = requests.get("https://api.github.com/users/octocat")
datos = response.json()
print(datos["name"]) # Muestra el nombre del usuario`,
    codeJava: `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

// Consumir API en Java (HttpClient de Java 11+)
HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.github.com/users/octocat"))
    .build();
client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
    .thenApply(HttpResponse::body)
    .thenAccept(System.out.println);`
  },
  {
    id: "recursion",
    english: "Recursion",
    spanish: "Recursividad",
    category: "logic",
    meaning: "Técnica de programación donde una función se llama a sí misma para resolver un problema dividiéndolo en subproblemas más pequeños.",
    explanation: "Es una función que se invoca a sí misma. Para evitar un bucle infinito, siempre debe tener una condición de salida muy clara (caso base). Imagínalo como una muñeca rusa (Matrioska): abres una y hay otra más pequeña dentro, hasta llegar a la última que ya no se abre.",
    codePython: `def factorial(n):
    if n == 1: # Caso base
        return 1
    return n * factorial(n - 1) # Llamada recursiva

print(factorial(5)) # Imprime 120`,
    codeJava: `int factorial(int n) {
    if (n == 1) { // Caso base
        return 1;
    }
    return n * factorial(n - 1); // Llamada recursiva
}
// Uso: System.out.println(factorial(5)); // 120`
  },
  {
    id: "inheritance",
    english: "Inheritance",
    spanish: "Herencia",
    category: "oop",
    meaning: "Mecanismo que permite a una clase (clase hija) adquirir los atributos y métodos de otra clase (clase padre).",
    explanation: "Igual que heredas los ojos de tus padres, una clase 'Hijo' puede heredar variables y funciones de una clase 'Padre'. Esto te evita tener que reescribir el mismo código en varias partes de tu programa.",
    codePython: `class Animal:
    def comer(self):
        print("Este animal come")

class Perro(Animal): # Perro hereda de Animal
    def ladrar(self):
        print("Guau!")

firulais = Perro()
firulais.comer()  # Heredado: Imprime 'Este animal come'
firulais.ladrar() # Propio: Imprime 'Guau!'`,
    codeJava: `class Animal {
    void comer() {
        System.out.println("Este animal come");
    }
}

class Perro extends Animal { // extends significa herencia en Java
    void ladrar() {
        System.out.println("Guau!");
    }
}
// Uso: Perro p = new Perro(); p.comer(); p.ladrar();`
  },
  {
    id: "polymorphism",
    english: "Polymorphism",
    spanish: "Polimorfismo",
    category: "oop",
    meaning: "Capacidad de diferentes clases de responder al mismo mensaje o llamada a un método de maneras personalizadas.",
    explanation: "Significa 'muchas formas'. Permite que una sola acción (ej. 'hacerSonido') se ejecute de formas distintas según el objeto que la realice (un perro ladra, un gato maúlla).",
    codePython: `class Gato:
    def hacer_sonido(self):
        return "Miau"

class Perro:
    def hacer_sonido(self):
        return "Guau"

# Una misma función maneja diferentes objetos
def emitir_sonido(animal):
    print(animal.hacer_sonido())

emitir_sonido(Gato())  # Imprime Miau
emitir_sonido(Perro()) # Imprime Guau`,
    codeJava: `abstract class Animal {
    abstract void hacerSonido();
}
class Gato extends Animal {
    void hacerSonido() { System.out.println("Miau"); }
}
class Perro extends Animal {
    void hacerSonido() { System.out.println("Guau"); }
}
// Uso: Animal a = new Gato(); a.hacerSonido(); // Imprime Miau`
  },
  {
    id: "encapsulation",
    english: "Encapsulation",
    spanish: "Encapsulamiento",
    category: "oop",
    meaning: "Ocultamiento del estado interno y detalles de implementación de un objeto, exponiendo solo lo necesario mediante una interfaz pública.",
    explanation: "Consiste en meter los datos dentro de una 'cápsula' protectora para que nadie pueda modificarlos por accidente desde fuera. Solo se puede interactuar con ellos a través de métodos seguros especiales conocidos como getters (obtener) y setters (modificar).",
    codePython: `class CuentaBancaria:
    def __init__(self, saldo_inicial):
        self.__saldo = saldo_inicial # __ hace la variable privada

    def obtener_saldo(self): # Getter seguro
        return self.__saldo

cuenta = CuentaBancaria(100)
# cuenta.__saldo dará error. Acceso correcto:
print(cuenta.obtener_saldo()) # Imprime 100`,
    codeJava: `class CuentaBancaria {
    private double saldo; // Variable privada

    public CuentaBancaria(double saldoInicial) {
        this.saldo = saldoInicial;
    }
    public double getSaldo() { // Getter público
        return this.saldo;
    }
}
// Uso: CuentaBancaria c = new CuentaBancaria(100); c.getSaldo();`
  },
  {
    id: "class",
    english: "Class",
    spanish: "Clase",
    category: "oop",
    meaning: "Plantilla o molde a partir del cual se crean los objetos individuales, definiendo sus propiedades y comportamientos.",
    explanation: "No es una clase de escuela. Es el plano o molde de diseño de un objeto. Imagina que es el plano de un arquitecto para construir casas. El plano en sí no es una casa física, pero define cómo serán todas las casas construidas a partir de él.",
    codePython: `class Coche: # La clase (el plano)
    def __init__(self, marca, color):
        self.marca = marca
        self.color = color

mi_coche = Coche("Toyota", "Rojo") # El objeto (la casa física)`,
    codeJava: `class Coche { // La clase
    String marca;
    String color;
    
    Coche(String marca, String color) {
        this.marca = marca;
        this.color = color;
    }
}
// Uso: Coche miCoche = new Coche("Toyota", "Rojo");`
  },
  {
    id: "variable",
    english: "Variable",
    spanish: "Variable",
    category: "logic",
    meaning: "Espacio de memoria reservado en el ordenador para almacenar un valor que puede cambiar durante la ejecución del programa.",
    explanation: "Visualízalo como una caja etiquetada donde puedes guardar cosas. Le pegas un nombre por fuera (ej. 'edad') y metes un valor dentro (ej. 20). Si cumples años, sacas el 20 y guardas un 21 en la misma caja.",
    codePython: `# Python define tipos automáticamente
edad = 20
edad = edad + 1
nombre = "Pedro"`,
    codeJava: `// Java requiere definir el tipo de antemano (estático)
int edad = 20;
edad = edad + 1;
String nombre = "Pedro";`
  },
  {
    id: "exception",
    english: "Exception",
    spanish: "Excepción",
    category: "logic",
    meaning: "Evento inusual o error que ocurre durante la ejecución de un programa y que interrumpe el flujo normal de sus instrucciones.",
    explanation: "Es un error controlado. En lugar de que el programa se cuelgue o 'explote' cuando algo sale mal (como dividir por cero o no encontrar un archivo), el sistema lanza una 'excepción' que podemos capturar para arreglar la situación elegantemente.",
    codePython: `try:
    resultado = 10 / 0
except ZeroDivisionError:
    print("¡No puedes dividir entre cero!")
finally:
    print("Bloque de limpieza terminado")`,
    codeJava: `try {
    int resultado = 10 / 0;
} catch (ArithmeticException e) {
    System.out.println("¡No puedes dividir entre cero!");
} finally {
    System.out.println("Bloque de limpieza terminado");
}`
  },
  {
    id: "callback",
    english: "Callback",
    spanish: "Retorno de llamada",
    category: "logic",
    meaning: "Función que se pasa a otra función como argumento para ser ejecutada después de que se complete una determinada tarea.",
    explanation: "Es como dejarle tu número a una tienda para que te llamen cuando llegue el producto que quieres. Tú continúas haciendo tu vida y, en cuanto el producto está listo, ejecutan la llamada (el callback) con la novedad.",
    codePython: `def procesar_compra(producto, callback_funcion):
    print(f"Procesando pago de {producto}...")
    # ... simula proceso ...
    callback_funcion() # Ejecuta el callback

def avisar_usuario():
    print("¡Tu pedido ha sido enviado!")

procesar_compra("Laptop", avisar_usuario)`,
    codeJava: `// En Java se suelen usar interfaces funcionales o lambdas
interface Callback {
    void ejecutar();
}

class Tienda {
    void procesarCompra(String prod, Callback cb) {
        System.out.println("Procesando pago...");
        cb.ejecutar(); // Llama al callback
    }
}
// Uso: new Tienda().procesarCompra("Laptop", () -> System.out.println("Enviado!"));`
  },
  {
    id: "promise",
    english: "Promise",
    spanish: "Promesa",
    category: "logic",
    meaning: "Objeto que representa la terminación o el fracaso eventual de una operación asíncrona.",
    explanation: "Es una promesa real. Si pides comida a domicilio, te dan un ticket. Ese ticket es una promesa de que obtendrás comida en el futuro. Puede cumplirse (llega la comida caliente) o rechazarse (se quemó la pizza y cancelan tu pedido).",
    codePython: `# Python usa asyncio y Future para simular promesas
import asyncio

async def traer_comida():
    await asyncio.sleep(2) # Simula retraso de red
    return "Pizza de Pepperoni"

# Uso en bucle asíncrono:
# comida = await traer_comida()`,
    codeJava: `import java.util.concurrent.CompletableFuture;

// Java usa CompletableFuture para flujos asíncronos tipo promesa
CompletableFuture<String> promesaComida = CompletableFuture.supplyAsync(() -> {
    try { Thread.sleep(2000); } catch(Exception e) {}
    return "Pizza de Pepperoni";
});

// Al completarse:
// promesaComida.thenAccept(comida -> System.out.println("Llegó " + comida));`
  },
  {
    id: "query",
    english: "Query",
    spanish: "Consulta",
    category: "database",
    meaning: "Instrucción formal de solicitud de información a una base de datos para extraer, insertar, actualizar o borrar datos.",
    explanation: "No es una simple pregunta lingüística. Es una línea de código escrita bajo un formato estricto (usualmente en SQL) que le ordena a una base de datos que busque y filtre exactamente los registros que necesitas.",
    codePython: `# Uso de SQLite3 en Python para hacer una Query
import sqlite3
conn = sqlite3.connect("academia.db")
cursor = conn.cursor()
cursor.execute("SELECT nombre FROM alumnos WHERE promedio >= 9.0")
estudiantes = cursor.fetchall()`,
    codeJava: `// Query usando JDBC estándar en Java
Connection conn = DriverManager.getConnection("jdbc:mysql://localhost/db", "user", "pass");
Statement stmt = conn.createStatement();
ResultSet rs = stmt.executeQuery("SELECT nombre FROM alumnos WHERE promedio >= 9.0");
while (rs.next()) {
    System.out.println(rs.getString("nombre"));
}`
  },
  {
    id: "schema",
    english: "Schema",
    spanish: "Esquema",
    category: "database",
    meaning: "Estructura lógica que define la organización y las relaciones de los datos (tablas, campos, relaciones) en una base de datos.",
    explanation: "Es el mapa o plano estructural de tu base de datos. Define qué tablas existen, qué columnas tiene cada tabla (ej: ID de tipo entero, Nombre de tipo texto) y cómo se conectan unas tablas con otras.",
    codePython: `# Definición de un esquema en Python usando SQLAlchemy (ORM)
from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
Base = declarative_base()

class Usuario(Base):
    __tablename__ = 'usuarios'
    id = Column(Integer, primary_key=True)
    nombre = Column(String(50))`,
    codeJava: `// En Java (Hibernate/JPA) los esquemas se definen con anotaciones
import javax.persistence.*;

@Entity
@Table(name = "usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "nombre", length = 50)
    private String nombre;
}`
  },
  {
    id: "transaction",
    english: "Transaction",
    spanish: "Transacción",
    category: "database",
    meaning: "Conjunto de operaciones que se ejecutan como una única unidad lógica de trabajo indivisible (o se aplican todas o ninguna).",
    explanation: "Es una operación de 'todo o nada'. Si transfieres dinero a un amigo, ocurren dos pasos: 1) Te quitan dinero a ti, 2) Se lo suman a él. Si el paso 2 falla por falta de luz, la transacción cancela el paso 1 (hace un Rollback) para que tu dinero no desaparezca en el limbo.",
    codePython: `# Control de transacciones en SQLite
import sqlite3
conn = sqlite3.connect("banco.db")
try:
    cursor = conn.cursor()
    cursor.execute("UPDATE cuentas SET saldo = saldo - 50 WHERE id = 1")
    cursor.execute("UPDATE cuentas SET saldo = saldo + 50 WHERE id = 2")
    conn.commit() # Se guardan ambos cambios con éxito
except Exception:
    conn.rollback() # Si falla algo, revierte todo`,
    codeJava: `// Transacción JDBC en Java
Connection conn = DriverManager.getConnection("jdbc:mysql://localhost/db", "user", "pass");
try {
    conn.setAutoCommit(false); // Iniciamos transacción manualmente
    // ... ejecutar sentencias SQL ...
    conn.commit(); // Confirmamos todos los cambios
} catch (SQLException e) {
    conn.rollback(); // En caso de error, cancelamos todo
}`
  },
  {
    id: "dns",
    english: "DNS (Domain Name System)",
    spanish: "Sistema de Nombres de Dominio",
    category: "networks",
    meaning: "Servicio de red que traduce los nombres de dominio legibles por humanos (ej. google.com) en direcciones IP numéricas.",
    explanation: "Es la agenda de contactos de Internet. Los servidores y páginas web se ubican mediante números complejos llamados direcciones IP (ej. 142.250.190.46). Para que no tengas que memorizar números, el DNS traduce 'google.com' al número de IP correcto de forma invisible.",
    codePython: `# Resolviendo un dominio a IP en Python
import socket
ip = socket.gethostbyname("google.com")
print(ip) # Imprime la dirección IP numérica del servidor`,
    codeJava: `import java.net.InetAddress;

// Resolviendo un dominio a IP en Java
try {
    InetAddress address = InetAddress.getByName("google.com");
    System.out.println(address.getHostAddress()); // Imprime la IP
} catch (Exception e) {
    e.printStackTrace();
}`
  },
  {
    id: "middleware",
    english: "Middleware",
    spanish: "Software intermedio / Middleware",
    category: "backend",
    meaning: "Capa de software que se sitúa entre el sistema operativo y las aplicaciones, o entre el cliente y el servidor, para gestionar peticiones y respuestas.",
    explanation: "Es como el guardia de seguridad en la entrada de una fiesta VIP. Cuando alguien hace una petición a tu servidor, el middleware la intercepta primero para verificar si tiene invitación (autenticación), si está llevando equipaje prohibido (validar datos) o simplemente para anotar quién entró (logs) antes de dejarlo pasar al backend principal.",
    codePython: `# Middleware simple en Python con Flask
from flask import Flask, request, abort

app = Flask(__name__)

@app.before_request
def verificar_token():
    token = request.headers.get("Authorization")
    if token != "mi-token-secreto":
        abort(401) # Detiene la petición y responde Acceso No Autorizado`,
    codeJava: `// Filtro interceptor (Middleware) en un Servidor Java Spring Boot
import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

public class SecurityFilter implements Filter {
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) 
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        String auth = request.getHeader("Authorization");
        if ("mi-token-secreto".equals(auth)) {
            chain.doFilter(req, res); // Autorizado, continúa la petición
        }
        // De lo contrario se corta la petición
    }
}`
  },
  {
    id: "socket",
    english: "Socket",
    spanish: "Conector de red / Socket",
    category: "networks",
    meaning: "Punto final de un enlace de comunicación bidireccional entre dos programas que se ejecutan a través de una red.",
    explanation: "No es un tomacorriente físico de la pared. Imagina que es un 'teléfono' de software que abre una línea directa de comunicación en tiempo real entre tu ordenador y otro dispositivo en Internet para mandarse mensajes constantemente sin colgar la llamada.",
    codePython: `# Servidor socket simple en Python
import socket
server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind(('localhost', 8080))
server.listen(1)
print("Esperando conexión...")
conexion, direccion = server.accept()
conexion.send(b"Hola Cliente conectado!")`,
    codeJava: `import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;

// Servidor socket simple en Java
ServerSocket server = new ServerSocket(8080);
System.out.println("Esperando conexión...");
Socket socket = server.accept();
PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
out.println("Hola Cliente conectado!");`
  },
  {
    id: "endpoint",
    english: "Endpoint",
    spanish: "Punto final / Endpoint",
    category: "networks",
    meaning: "URL o dirección específica en una API a la que un cliente puede acceder para realizar operaciones o recuperar recursos concretos.",
    explanation: "Es el canal o ruta específica de una API. Si la API es un edificio corporativo, los endpoints son las oficinas: la oficina de contabilidad `/api/usuarios`, la de recursos humanos `/api/comentarios`, etc. Visitas cada oficina para hacer una gestión distinta.",
    codePython: `# Creación de endpoints en Python con FastAPI
from fastapi import FastAPI
app = FastAPI()

@app.get("/usuarios") # Endpoint de consulta de usuarios
def obtener_usuarios():
    return [{"id": 1, "nombre": "Juan"}]`,
    codeJava: `// Creación de endpoints en Java Spring Boot
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
public class UsuarioController {
    @GetMapping("/usuarios") // Endpoint de consulta
    public List<Map<String, Object>> obtenerUsuarios() {
        return List.of(Map.of("id", 1, "nombre", "Juan"));
    }
}`
  },
  {
    id: "boolean",
    english: "Boolean",
    spanish: "Booleano",
    category: "logic",
    meaning: "Tipo de dato primitivo que solo puede tener uno de dos valores posibles: verdadero (true) o falso (false).",
    explanation: "Llamado así por el matemático George Boole. Es un interruptor de luz lógico. O está encendido (`True` / Verdadero) o está apagado (`False` / Falso). No existen términos medios ni grises.",
    codePython: `activo = True
tiene_permiso = False

if activo and not tiene_permiso:
    print("El usuario está activo pero no tiene permisos.")`,
    codeJava: `boolean activo = true;
boolean tienePermiso = false;

if (activo && !tienePermiso) {
    System.out.println("El usuario está activo pero no tiene permisos.");
}`
  },
  {
    id: "loop",
    english: "Loop",
    spanish: "Bucle / Ciclo",
    category: "logic",
    meaning: "Estructura de control que repite un bloque de código mientras se cumpla una condición específica.",
    explanation: "Es una instrucción de repetición. Le dice al ordenador: 'Haz esta misma tarea una y otra vez hasta que te diga que pares'. Es la herramienta favorita para recorrer listas de datos gigantescas en milisegundos.",
    codePython: `# Bucle for y while en Python
for i in range(3):
    print(f"Repetición {i}")

contador = 0
while contador < 3:
    print(f"Contador {contador}")
    contador += 1`,
    codeJava: `// Bucle for y while en Java
for (int i = 0; i < 3; i++) {
    System.out.println("Repetición " + i);
}

int contador = 0;
while (contador < 3) {
    System.out.println("Contador " + contador);
    contador++;
}`
  },
  {
    id: "compiler",
    english: "Compiler",
    spanish: "Compilador",
    category: "systems",
    meaning: "Programa especial que traduce todo el código fuente escrito en un lenguaje de alto nivel a lenguaje máquina de bajo nivel antes de ejecutarlo.",
    explanation: "Es un traductor de libros profesional. Toma todo tu manuscrito (el archivo con el código que escribiste) y genera un libro traducido por completo en otro idioma (un archivo ejecutable `.exe` o `.bin` en idioma de ceros y unos) listo para leerse directamente.",
    codePython: `# Python es interpretado, no se compila directamente en binario.
# Se ejecuta línea por línea usando su intérprete.
print("Código interpretado al vuelo")`,
    codeJava: `// Java se pre-compila a un paso intermedio (bytecode) usando javac
// javac MiPrograma.java -> Genera MiPrograma.class
public class MiPrograma {
    public static void main(String[] args) {
        System.out.println("Compilado a Bytecode");
    }
}`
  },
  {
    id: "pointer",
    english: "Pointer",
    spanish: "Puntero / Apuntador",
    category: "systems",
    meaning: "Variable cuyo valor es la dirección física de memoria de otra variable.",
    explanation: "En lugar de guardar un valor como '5', un puntero guarda la dirección del casillero de memoria donde se encuentra ese '5'. Es como tener un papelito que dice: 'Tu regalo está guardado en el casillero número 304B'.",
    codePython: `# Python gestiona la memoria automáticamente y no tiene punteros directos.
# Todo es una referencia a un objeto.
a = [1, 2]
b = a # 'b' apunta al mismo arreglo que 'a' en memoria.
b.append(3)
print(a) # Imprime [1, 2, 3] porque ambos apuntan al mismo lugar`,
    codeJava: `// Java no permite manipular punteros directamente por seguridad.
// Al igual que Python, utiliza referencias a objetos de forma implícita.
int[] a = {1, 2};
int[] b = a; // Ambos apuntan a la misma dirección
b[0] = 99;
System.out.println(a[0]); // Imprime 99`
  },
  {
    id: "deprecation",
    english: "Deprecation",
    spanish: "Deprecación / Obsolescencia",
    category: "systems",
    meaning: "Declaración oficial de que una característica, función o librería de software ya no se recomienda y quedará obsoleta en futuras versiones.",
    explanation: "Es una señal de advertencia. El creador de un código te está diciendo: 'Esta función todavía funciona hoy, pero la hemos rediseñado de una forma mejor. Deja de usarla porque la borraremos pronto en la siguiente actualización'.",
    codePython: `import warnings

def funcion_antigua():
    warnings.warn(
        "Esta función está deprecada (deprecated). Usa funcion_nueva()", 
        DeprecationWarning
    )
    print("Haciendo cosas a la antigua...")

funcion_antigua()`,
    codeJava: `class Sistema {
    // Java usa la anotación @Deprecated
    @Deprecated
    void funcionAntigua() {
        System.out.println("Haciendo cosas a la antigua...");
    }
}
// Al compilar, Java mostrará advertencias de código deprecado.`
  },
  {
    id: "garbage-collector",
    english: "Garbage Collector",
    spanish: "Recolector de basura",
    category: "systems",
    meaning: "Mecanismo automático de gestión de memoria que detecta y destruye objetos que el programa ya no necesita ni utiliza.",
    explanation: "Es el encargado de la limpieza del ordenador. A medida que creas variables y objetos, consumen memoria. El Recolector de Basura revisa constantemente qué variables han dejado de usarse, limpia ese espacio físico y lo deja libre para nuevas tareas, evitándote fugas de memoria (`Memory Leaks`).",
    codePython: `import gc
# Python usa conteo de referencias y un Recolector de Basura automático.
# Puedes forzar la recolección manualmente:
gc.collect()`,
    codeJava: `// Java cuenta con un Garbage Collector (GC) altamente optimizado.
// Corre de fondo en la máquina virtual. Puedes sugerirle correr:
System.gc(); // Es solo una sugerencia, la JVM decide cuándo ejecutarlo.`
  },
  {
    id: "framework",
    english: "Framework",
    spanish: "Marco de trabajo / Entorno de desarrollo",
    category: "backend",
    meaning: "Estructura conceptual y tecnológica que proporciona un conjunto de herramientas, librerías y patrones de diseño predefinidos para agilizar el desarrollo.",
    explanation: "No es solo una librería pequeña. Es como comprar una casa prefabricada donde los cimientos, tuberías y estructura ya están listos. Tú solo te encargas de decidir el color de las paredes y colocar tus muebles (escribir tus reglas de negocio) bajo las normas de la estructura existente.",
    codePython: `# Django y Flask son Frameworks populares en Python.
# Obligan a seguir una arquitectura ordenada (como MVC/MVT).`,
    codeJava: `// Spring y Hibernate son los Frameworks más robustos en Java.
// Manejan la inyección de dependencias y patrones de diseño de gran escala.`
  },
  {
    id: "index",
    english: "Index",
    spanish: "Índice",
    category: "database",
    meaning: "Estructura de datos que mejora la velocidad de las operaciones de búsqueda y recuperación en una tabla de base de datos a costa de almacenamiento extra.",
    explanation: "Es exactamente como el índice al final de un libro pesado. En lugar de tener que hojear las 500 páginas del libro una por una (un 'Table Scan') buscando la palabra 'Herencia', vas al índice al final, ves que está en la página 340 y abres directamente esa página.",
    codePython: `# Crear un índice en SQLite usando Python
import sqlite3
conn = sqlite3.connect("tienda.db")
cursor = conn.cursor()
# Acelera las búsquedas por el correo del cliente
cursor.execute("CREATE INDEX idx_cliente_email ON clientes(email)")`,
    codeJava: `// En JPA/Hibernate podemos definir índices en la propia entidad Java
@Table(name = "clientes", indexes = {
    @Index(name = "idx_cliente_email", columnList = "email", unique = true)
})
public class Cliente {
    private String email;
}`
  },
  {
    id: "object",
    english: "Object",
    spanish: "Objeto",
    category: "oop",
    meaning: "Instancia concreta de una clase que posee un estado (datos/atributos) y un comportamiento (métodos/funciones) definidos por su plano constructor.",
    explanation: "Si la **Clase** es el plano de un coche impreso en un papel, el **Objeto** es el coche de verdad que construiste con ese plano: de metal físico, de color rojo, con gasolina en el motor, que puedes encender y conducir.",
    codePython: `# Instanciación de objeto en Python
class Perro:
    def __init__(self, nombre):
        self.nombre = nombre

mi_perro = Perro("Firulais") # 'mi_perro' es el objeto concreto
print(mi_perro.nombre) # Acceso a su estado`,
    codeJava: `// Instanciación de objeto en Java usando 'new'
class Perro {
    String nombre;
    Perro(String nombre) { this.nombre = nombre; }
}

Perro miPerro = new Perro("Firulais"); // 'miPerro' es el objeto concreto
System.out.println(miPerro.nombre);`
  },
  {
    id: "interface",
    english: "Interface",
    spanish: "Interfaz / Contrato de comportamiento",
    category: "oop",
    meaning: "Colección de firmas de métodos abstractos que definen un contrato de comportamiento obligatorio para cualquier clase que decida implementarla.",
    explanation: "Es como el control remoto universal de la televisión. Define que todos los controles deben tener un botón de 'Encender' y otro de 'Subir Volumen'. No importa si la televisión es marca Sony o LG, ambas deben saber cómo reaccionar a esos botones porque firmaron el mismo contrato de interfaz.",
    codePython: `# Python no tiene la palabra clave 'interface'. Usa clases abstractas abstractas
from abc import ABC, abstractmethod

class ConectorBD(ABC):
    @abstractmethod
    def conectar(self):
        pass

class MySQLConector(ConectorBD):
    def conectar(self):
        print("Conectando a MySQL...")`,
    codeJava: `// Java tiene soporte nativo usando la palabra clave 'interface'
interface ConectorBD {
    void conectar(); // Método abstracto por defecto
}

class MySQLConector implements ConectorBD {
    public void conectar() {
        System.out.println("Conectando a MySQL...");
    }
}`
  },
  {
    id: "protocol",
    english: "Protocol",
    spanish: "Protocolo de comunicación",
    category: "networks",
    meaning: "Conjunto formal de reglas, sintaxis y semántica que determina cómo se intercambian los datos a través de una red de computadoras.",
    explanation: "Es un reglamento de cortesía y comunicación. Imagina que te encuentras con un extranjero: para entenderse, acuerdan hablar en español (idioma/protocolo) y seguir un orden: uno saluda, el otro responde, uno habla y el otro escucha. En redes, protocolos como HTTP, FTP o TCP deciden esas mismas reglas para los ordenadores.",
    codePython: `# Petición HTTP simple en Python (HTTP es un protocolo de capa de aplicación)
import urllib.request
response = urllib.request.urlopen("http://example.com")
print(response.status) # Devuelve 200 (Código de éxito del protocolo)`,
    codeJava: `import java.net.HttpURLConnection;
import java.net.URL;

// Conexión usando protocolo HTTP en Java
URL url = new URL("http://example.com");
HttpURLConnection conn = (HttpURLConnection) url.openConnection();
conn.setRequestMethod("GET");
System.out.println(conn.getResponseCode()); // Devuelve 200`
  },
  {
    id: "primary-key",
    english: "Primary Key",
    spanish: "Clave Primaria / Llave Primaria",
    category: "database",
    meaning: "Campo o combinación de campos que identifica de manera única e irrepetible a cada registro o fila dentro de una tabla de base de datos.",
    explanation: "Es el número de DNI o Cédula de Identidad de un registro de datos. En una tabla de 'Alumnos', puede haber 5 personas que se llamen 'Juan Pérez', pero cada una tendrá una clave primaria única (`ID`) que la diferencia completamente de las demás.",
    codePython: `# Definición de Primary Key en un script SQL de Python
import sqlite3
conn = sqlite3.connect("universidad.db")
cursor = conn.cursor()
cursor.execute("""
CREATE TABLE IF NOT EXISTS estudiantes (
    matricula INTEGER PRIMARY KEY, -- Llave única autoincremental
    nombre TEXT NOT NULL
)
""")`,
    codeJava: `// Anotación de Primary Key en JPA Java
import javax.persistence.*;

public class Estudiante {
    @Id // Marca como Clave Primaria
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long matricula;
    
    private String nombre;
}`
  }
];
