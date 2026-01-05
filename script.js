// Variables globales
let tareas = {};
let paginaActual = 0;
let mesActual = new Date().getMonth();
let anoActual = new Date().getFullYear();
let libroAbierto = false;

// Elementos del DOM
const libro = document.getElementById('libro');
const portada = document.getElementById('portada');
const paginasLibro = document.getElementById('paginasLibro');
const controlesNav = document.getElementById('controlesNav');
const indicePestanas = document.getElementById('indicePestanas');
const btnAnterior = document.getElementById('btnAnterior');
const btnSiguiente = document.getElementById('btnSiguiente');
const indicadorPagina = document.getElementById('indicadorPagina');
const btnCerrar = document.getElementById('btnCerrar');

// Abrir libro
portada.addEventListener('click', function() {
    if (!libroAbierto) {
        libroAbierto = true;
        portada.classList.add('oculta');
        controlesNav.classList.add('visible');
        indicePestanas.classList.add('visible');
        btnCerrar.classList.add('visible');
        generarPaginas();
        mostrarPagina(0);
    }
});

// Cerrar libro
btnCerrar.addEventListener('click', function() {
    if (libroAbierto) {
        libroAbierto = false;
        portada.classList.remove('oculta');
        controlesNav.classList.remove('visible');
        indicePestanas.classList.remove('visible');
        btnCerrar.classList.remove('visible');
        
        // Ocultar todas las páginas
        const paginas = document.querySelectorAll('.pagina');
        paginas.forEach(p => p.classList.remove('activa'));
        
        paginaActual = 0;
    }
});

// Navegación
btnAnterior.addEventListener('click', () => {
    if (paginaActual > 0) {
        mostrarPagina(paginaActual - 1);
    }
});

btnSiguiente.addEventListener('click', () => {
    const totalPaginas = document.querySelectorAll('.pagina').length;
    if (paginaActual < totalPaginas - 1) {
        mostrarPagina(paginaActual + 1);
    }
});

// Generar todas las páginas del libro
function generarPaginas() {
    paginasLibro.innerHTML = '';
    
    // Página 1: Formulario para agregar tareas
    crearPaginaFormulario();
    
    // Página 2: Calendario
    crearPaginaCalendario();
    
    // Páginas de días con tareas
    const fechasOrdenadas = Object.keys(tareas).sort();
    fechasOrdenadas.forEach(fecha => {
        crearPaginaDia(fecha);
    });
    
    // Actualizar índice de pestañas
    actualizarIndicePestanas();
}

// Crear página de formulario
function crearPaginaFormulario() {
    const pagina = document.createElement('div');
    pagina.className = 'pagina pagina-formulario';
    pagina.innerHTML = `
        <h2>✍️ Nueva Tarea</h2>
        <div class="form-group">
            <label>Tarea:</label>
            <input type="text" id="inputTarea" placeholder="¿Qué necesitas hacer?">
        </div>
        <div class="form-group">
            <label>Fecha (DD/MM/AAAA):</label>
            <input type="text" id="inputFecha" placeholder="01/01/2026">
        </div>
        <div class="form-group">
            <label>Hora (HH:MM):</label>
            <input type="text" id="inputHora" placeholder="14:30">
        </div>
        <button class="btn-agregar" id="btnAgregar">Agregar Tarea</button>
    `;
    paginasLibro.appendChild(pagina);
    
    // Event listener para agregar tarea
    setTimeout(() => {
        const btnAgregar = document.getElementById('btnAgregar');
        btnAgregar.addEventListener('click', agregarTarea);
    }, 100);
}

// Crear página de calendario
function crearPaginaCalendario() {
    const pagina = document.createElement('div');
    pagina.className = 'pagina pagina-calendario';
    pagina.innerHTML = `
        <h2>📅 Calendario</h2>
        <div class="selector-mes">
            <button id="btnMesAnterior">◀</button>
            <span id="nombreMes"></span>
            <button id="btnMesSiguiente">▶</button>
        </div>
        <div class="calendario-grid" id="calendarioGrid"></div>
    `;
    paginasLibro.appendChild(pagina);
    
    setTimeout(() => {
        document.getElementById('btnMesAnterior').addEventListener('click', () => cambiarMes(-1));
        document.getElementById('btnMesSiguiente').addEventListener('click', () => cambiarMes(1));
        renderizarCalendario();
    }, 100);
}

// Crear página de día
function crearPaginaDia(fechaISO) {
    const pagina = document.createElement('div');
    pagina.className = 'pagina pagina-dia';
    pagina.dataset.fecha = fechaISO;
    
    const fechaFormateada = formatearFecha(fechaISO);
    const tareasDelDia = tareas[fechaISO];
    
    pagina.innerHTML = `
        <div class="pagina-dia-header">
            <div class="pagina-dia-fecha">${fechaFormateada.completa}</div>
            <div class="pagina-dia-semana">${fechaFormateada.diaSemana}</div>
        </div>
        <div class="tareas-container">
            ${tareasDelDia.map(tarea => `
                <div class="tarea-item">
                    <div class="tarea-info">
                        <div class="tarea-hora">🕐 ${tarea.hora}</div>
                        <div class="tarea-texto">${tarea.texto}</div>
                    </div>
                    <button class="btn-eliminar" onclick="eliminarTarea('${fechaISO}', ${tarea.id})">Eliminar</button>
                </div>
            `).join('')}
        </div>
    `;
    
    paginasLibro.appendChild(pagina);
}

// Mostrar página específica
function mostrarPagina(numeroPagina) {
    const paginas = document.querySelectorAll('.pagina');
    paginas.forEach((p, index) => {
        if (index === numeroPagina) {
            p.classList.add('activa');
        } else {
            p.classList.remove('activa');
        }
    });
    
    paginaActual = numeroPagina;
    actualizarControlesNavegacion();
    actualizarPestanasActivas();
}

// Actualizar controles de navegación
function actualizarControlesNavegacion() {
    const totalPaginas = document.querySelectorAll('.pagina').length;
    
    btnAnterior.disabled = (paginaActual === 0);
    btnSiguiente.disabled = (paginaActual === totalPaginas - 1);
    
    let nombrePagina = '';
    if (paginaActual === 0) nombrePagina = 'Nueva Tarea';
    else if (paginaActual === 1) nombrePagina = 'Calendario';
    else {
        const paginaActiva = document.querySelector('.pagina.activa');
        if (paginaActiva && paginaActiva.dataset.fecha) {
            const fecha = formatearFecha(paginaActiva.dataset.fecha);
            nombrePagina = fecha.corta;
        }
    }
    
    indicadorPagina.textContent = `${nombrePagina} (${paginaActual + 1}/${totalPaginas})`;
}

// Actualizar índice de pestañas
function actualizarIndicePestanas() {
    indicePestanas.innerHTML = '';
    
    const paginas = document.querySelectorAll('.pagina');
    paginas.forEach((pagina, index) => {
        const pestana = document.createElement('div');
        pestana.className = 'pestana';
        
        if (index === 0) pestana.textContent = '✍️ Nueva';
        else if (index === 1) pestana.textContent = '📅 Cal.';
        else if (pagina.dataset.fecha) {
            const partes = pagina.dataset.fecha.split('-');
            pestana.textContent = `${partes[2]}/${partes[1]}`;
        }
        
        pestana.addEventListener('click', () => mostrarPagina(index));
        indicePestanas.appendChild(pestana);
    });
}

// Actualizar pestañas activas
function actualizarPestanasActivas() {
    const pestanas = document.querySelectorAll('.pestana');
    pestanas.forEach((p, index) => {
        if (index === paginaActual) {
            p.classList.add('activa');
        } else {
            p.classList.remove('activa');
        }
    });
}

// Agregar nueva tarea
function agregarTarea() {
    const inputTarea = document.getElementById('inputTarea');
    const inputFecha = document.getElementById('inputFecha');
    const inputHora = document.getElementById('inputHora');
    
    const textoTarea = inputTarea.value.trim();
    const fechaInput = inputFecha.value.trim();
    const horaInput = inputHora.value.trim();

    if (!textoTarea || !fechaInput || !horaInput) {
        alert('Por favor completa todos los campos');
        return;
    }

    const fechaISO = validarFecha(fechaInput);
    if (!fechaISO) {
        alert('Fecha inválida. Usa el formato DD/MM/AAAA (ejemplo: 15/03/2026)');
        return;
    }

    const horaValida = validarHora(horaInput);
    if (!horaValida) {
        alert('Hora inválida. Usa el formato HH:MM (ejemplo: 14:30)');
        return;
    }

    if (!tareas[fechaISO]) {
        tareas[fechaISO] = [];
    }

    tareas[fechaISO].push({
        texto: textoTarea,
        hora: horaValida,
        id: Date.now()
    });

    tareas[fechaISO].sort((a, b) => a.hora.localeCompare(b.hora));

    inputTarea.value = '';
    inputFecha.value = '';
    inputHora.value = '';

    generarPaginas();
    
    // Ir a la página del día recién creado
    const paginas = document.querySelectorAll('.pagina');
    paginas.forEach((p, index) => {
        if (p.dataset.fecha === fechaISO) {
            mostrarPagina(index);
        }
    });
}

// Eliminar tarea
function eliminarTarea(fecha, id) {
    tareas[fecha] = tareas[fecha].filter(t => t.id !== id);
    
    if (tareas[fecha].length === 0) {
        delete tareas[fecha];
    }
    
    generarPaginas();
    mostrarPagina(Math.min(paginaActual, document.querySelectorAll('.pagina').length - 1));
}

window.eliminarTarea = eliminarTarea;

// Validar fecha
function validarFecha(fechaStr) {
    const partes = fechaStr.split('/');
    if (partes.length !== 3) return null;
    
    const dia = parseInt(partes[0]);
    const mes = parseInt(partes[1]);
    const ano = parseInt(partes[2]);
    
    if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return null;
    if (mes < 1 || mes > 12) return null;
    if (dia < 1 || dia > 31) return null;
    if (ano < 2020 || ano > 2100) return null;
    
    return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

// Validar hora
function validarHora(horaStr) {
    const partes = horaStr.split(':');
    if (partes.length !== 2) return null;
    
    const horas = parseInt(partes[0]);
    const minutos = parseInt(partes[1]);
    
    if (isNaN(horas) || isNaN(minutos)) return null;
    if (horas < 0 || horas > 23) return null;
    if (minutos < 0 || minutos > 59) return null;
    
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}

// Formatear fecha
function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO + 'T00:00:00');
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const diaSemana = dias[fecha.getDay()];
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const ano = fecha.getFullYear();
    
    return {
        completa: `${dia} de ${mes} de ${ano}`,
        diaSemana: diaSemana,
        corta: `${dia}/${mes.substring(0, 3)}`
    };
}

// Renderizar calendario
function renderizarCalendario() {
    const nombreMes = document.getElementById('nombreMes');
    const calendarioGrid = document.getElementById('calendarioGrid');
    
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    nombreMes.textContent = `${meses[mesActual]} ${anoActual}`;
    
    calendarioGrid.innerHTML = '';
    
    // Días de la semana
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    diasSemana.forEach(dia => {
        const div = document.createElement('div');
        div.className = 'dia-semana';
        div.textContent = dia;
        calendarioGrid.appendChild(div);
    });
    
    // Primer día del mes
    const primerDia = new Date(anoActual, mesActual, 1).getDay();
    
    // Días vacíos antes del primer día
    for (let i = 0; i < primerDia; i++) {
        const div = document.createElement('div');
        div.className = 'dia-mes vacio';
        calendarioGrid.appendChild(div);
    }
    
    // Días del mes
    const diasEnMes = new Date(anoActual, mesActual + 1, 0).getDate();
    for (let dia = 1; dia <= diasEnMes; dia++) {
        const fechaISO = `${anoActual}-${String(mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        const tieneTareas = tareas[fechaISO] && tareas[fechaISO].length > 0;
        
        const div = document.createElement('div');
        div.className = `dia-mes ${tieneTareas ? 'con-tareas' : ''}`;
        div.textContent = dia;
        
        if (tieneTareas) {
            div.addEventListener('click', () => irAPaginaDia(fechaISO));
        }
        
        calendarioGrid.appendChild(div);
    }
}

// Cambiar mes en calendario
function cambiarMes(direccion) {
    mesActual += direccion;
    
    if (mesActual > 11) {
        mesActual = 0;
        anoActual++;
    } else if (mesActual < 0) {
        mesActual = 11;
        anoActual--;
    }
    
    renderizarCalendario();
}

// Ir a página de día específico
function irAPaginaDia(fechaISO) {
    const paginas = document.querySelectorAll('.pagina');
    paginas.forEach((p, index) => {
        if (p.dataset.fecha === fechaISO) {
            mostrarPagina(index);
        }
    });
}