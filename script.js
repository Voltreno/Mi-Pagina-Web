// ==========================================
// 1. CONFIGURACIÓN BASE Y CONSTANTES
// ==========================================

// Configuración por defecto utilizada si el navegador aún no tiene datos guardados
const componentesPorDefecto = {
  lab1: { cpuMarca: "Q-one", proc: "Core i5", ram: "8 GB", tipoStorage: "SSD", capStorage: "512 GB", gpu: "Intel UHD", monMarca: "HP", monModelo: "Compaq LA1951g" },
  lab2: { cpuMarca: "HP", proc: "Core i7", ram: "16 GB", tipoStorage: "SSD", capStorage: "1 TB", gpu: "Intel UHD", monMarca: "Samsung", monModelo: "SyncMaster B1930" },
  lab3: { cpuMarca: "Ins", proc: "Core i3", ram: "4 GB", tipoStorage: "HDD", capStorage: "300 GB", gpu: "Intel UHD", monMarca: "LG", monModelo: "Flatron L1942SE" },
  lab4: { cpuMarca: "Lenovo", proc: "Core i5", ram: "8 GB", tipoStorage: "SSD", capStorage: "120 GB", gpu: "Intel UHD", monMarca: "Acer", monModelo: "V193HQ" }
};

const modelosPorMarca = {
  HP: ["Compaq LA1951g", "ProDisplay P201", "EliteDisplay E201", "S2031a"],
  Samsung: ["SyncMaster B1930", "SyncMaster 740N", "SyncMaster E1920", "SA300"],
  LG: ["Flatron L1942SE", "Flatron W1943SE", "Flatron E2011T", "20EN33"],
  Acer: ["V193HQ", "AL1916W", "V203H", "B193"],
  Dell: ["E198FP", "E1913S", "E2014H", "UltraSharp 1908FP"],
  ASUS: ["VW193T", "VS197DE", "VB191T", "VH192D"]
};

// ==========================================
// 2. RECUPERAR DATOS AL ABRIR/RESCATAR PÁGINA
// ==========================================

// Intenta leer los componentes guardados; si no existen en localStorage, usa el objeto por defecto
let componentesLab = JSON.parse(localStorage.getItem("componentesLab")) || componentesPorDefecto;

// Intenta leer la lista de PCs; si no existe, inicia como arreglo vacío []
let listaPCs = JSON.parse(localStorage.getItem("listaPCs")) || [];


// ==========================================
// 3. ELEMENTOS DEL DOM Y EVENTOS
// ==========================================

const selectMarcaMonitor = document.getElementById("marca-monitor");
const selectModeloMonitor = document.getElementById("modelo-monitor");

function actualizarModelosMonitor() {
  const marcaSeleccionada = selectMarcaMonitor.value;
  const listaModelos = modelosPorMarca[marcaSeleccionada] || [];

  selectModeloMonitor.innerHTML = "";

  listaModelos.forEach(modelo => {
    const opcion = document.createElement("option");
    opcion.value = modelo;
    opcion.textContent = modelo;
    selectModeloMonitor.appendChild(opcion);
  });
}

selectMarcaMonitor.addEventListener("change", actualizarModelosMonitor);


// ==========================================
// 4. FUNCIONES DE GUARDADO Y PERSISTENCIA
// ==========================================

// Guardar/Actualizar la configuración general de un laboratorio
function guardarComponentes(event) {
  event.preventDefault();

  const lab = document.getElementById("lab-config").value;
  componentesLab[lab] = {
    cpuMarca: document.getElementById("marca-cpu").value,
    proc: document.getElementById("procesador").value,
    ram: document.getElementById("ram").value,
    tipoStorage: document.getElementById("tipo-almacenamiento").value,
    capStorage: document.getElementById("capacidad-almacenamiento").value,
    gpu: "Intel UHD",
    monMarca: document.getElementById("marca-monitor").value,
    monModelo: document.getElementById("modelo-monitor").value
  };

  // Persistir los componentes actualizados
  localStorage.setItem("componentesLab", JSON.stringify(componentesLab));

  alert("¡Componentes del laboratorio guardados exitosamente!");
  actualizarTabla();
}

// Registrar PC o modificar estado existente
function registrarPC(event) {
  event.preventDefault();

  const lab = document.getElementById("lab-pc").value;
  const num = parseInt(document.getElementById("numero-pc").value, 10);
  const estado = document.getElementById("estado").value;

  const codigo = "GOE-PC-" + String(num).padStart(3, '0');

  const indice = listaPCs.findIndex(pc => pc.lab === lab && pc.num === num);

  if (indice !== -1) {
    listaPCs[indice].estado = estado;
  } else {
    listaPCs.push({ lab, num, codigo, estado });
  }

  listaPCs.sort((a, b) => a.num - b.num);

  // Persistir la lista de PCs en localStorage
  localStorage.setItem("listaPCs", JSON.stringify(listaPCs));

  actualizarTabla();
}

// Eliminar PC de la lista y actualizar localStorage
function borrarPC(index) {
  listaPCs.splice(index, 1);

  // Guardar cambios tras eliminar un ítem
  localStorage.setItem("listaPCs", JSON.stringify(listaPCs));

  actualizarTabla();
}

// Dibujar la tabla HTML según los datos almacenados
function actualizarTabla() {
  const tbody = document.getElementById("tabla-body");
  tbody.innerHTML = "";

  const nombresLab = {
    lab1: "Laboratorio 1",
    lab2: "Laboratorio 2",
    lab3: "Laboratorio 3",
    lab4: "Laboratorio 4"
  };

  listaPCs.forEach((pc, index) => {
    const comp = componentesLab[pc.lab];
    const hwText = `${comp.cpuMarca} | ${comp.proc} | ${comp.ram} | ${comp.tipoStorage} ${comp.capStorage} | ${comp.gpu}`;
    const monText = `${comp.monMarca} (${comp.monModelo})`;

    tbody.innerHTML += `
      <tr>
        <td><strong>${pc.codigo}</strong></td>
        <td>${nombresLab[pc.lab]}</td>
        <td>PC-${pc.num}</td>
        <td>Estudiantes</td>
        <td>${hwText}</td>
        <td>${monText}</td>
        <td><span class="estado ${pc.estado.toLowerCase()}">${pc.estado}</span></td>
        <td>
          <button type="button" class="btn-borrar" onclick="borrarPC(${index})">Borrar</button>
        </td>
      </tr>
    `;
  });
}

// ==========================================
// 5. FUNCIONES DE BORRADO Y REINICIO
// ==========================================

function reiniciarInventario() {
  const confirmacion = confirm(
    "¿Estás seguro de que deseas borrar TODOS los equipos registrados y reiniciar la configuración a los valores por defecto?"
  );

  if (confirmacion) {
    localStorage.removeItem("listaPCs");
    localStorage.removeItem("componentesLab");

    listaPCs = [];
    componentesLab = JSON.parse(JSON.stringify(componentesPorDefecto));

    actualizarTabla();
    alert("El inventario ha sido borrado e inicializado con éxito.");
  }
}


// ==============================================
// 6. INICIALIZACIÓN (DEBE SER SIEMPRE LO ÚLTIMO)
// ==============================================

// Estas dos líneas SIEMPRE van al final de todo el archivo:
actualizarModelosMonitor();
actualizarTabla();