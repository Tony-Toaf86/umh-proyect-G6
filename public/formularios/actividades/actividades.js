(() => {
    const form = document.getElementById('actividadForm');
    const resultado = document.getElementById('resultado');

    if (!form || !resultado) {
        return;
    }

    const inputId = document.getElementById('actividadId');
    const inputProyectoId = document.getElementById('proyecto_id');
    const inputTitulo = document.getElementById('titulo');
    const inputDescripcion = document.getElementById('descripcion');
    const inputFechaHora = document.getElementById('fecha_hora');

    const btnActualizar = form.querySelector('.btn-actualizar');
    const btnEliminar = form.querySelector('.btn-eliminar');
    const btnListar = form.querySelector('.btn-listar');

    let proyectosPorId = new Map();

    const normalizarTexto = (valor) => {
        const texto = String(valor || '').trim();
        return texto.length ? texto : null;
    };

    const escaparHtml = (valor) => String(valor || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const mostrarMensaje = (mensaje, tipo = 'info') => {
        resultado.innerHTML = `<p class="mensaje-${tipo}">${escaparHtml(mensaje)}</p>`;
    };

    const convertirAInputDateTime = (valor) => {
        if (!valor) {
            return '';
        }

        const fecha = new Date(valor);
        if (Number.isNaN(fecha.getTime())) {
            return '';
        }

        const offset = fecha.getTimezoneOffset() * 60000;
        const local = new Date(fecha.getTime() - offset);
        return local.toISOString().slice(0, 16);
    };

    const formatearFecha = (valor) => {
        if (!valor) {
            return '-';
        }

        const fecha = new Date(valor);
        if (Number.isNaN(fecha.getTime())) {
            return escaparHtml(valor);
        }

        return fecha.toLocaleString('es-ES');
    };

    const cargarEnFormulario = (actividad) => {
        inputId.value = actividad.id;
        inputProyectoId.value = actividad.proyecto_id ?? '';
        inputTitulo.value = actividad.titulo || '';
        inputDescripcion.value = actividad.descripcion || '';
        inputFechaHora.value = convertirAInputDateTime(actividad.fecha_hora);
    };

    const limpiarFormulario = () => {
        form.reset();
        inputId.value = '';
    };

    const obtenerNombreProyecto = (proyectoId) => {
        const proyecto = proyectosPorId.get(Number(proyectoId));
        if (!proyecto) {
            return proyectoId ? `#${proyectoId}` : '-';
        }

        return proyecto.nombre || `#${proyecto.id}`;
    };

    const renderizarListado = (actividades) => {
        if (!Array.isArray(actividades) || !actividades.length) {
            resultado.innerHTML = '<p>No hay actividades registradas.</p>';
            return;
        }

        const filas = actividades.map((actividad) => `
            <tr>
                <td>${actividad.id}</td>
                <td>${escaparHtml(obtenerNombreProyecto(actividad.proyecto_id))}</td>
                <td>${escaparHtml(actividad.titulo || '-')}</td>
                <td>${escaparHtml(actividad.descripcion || '-')}</td>
                <td>${formatearFecha(actividad.fecha_hora)}</td>
                <td>
                    <button type="button" class="btn-seleccionar" data-id="${actividad.id}">Seleccionar</button>
                </td>
            </tr>
        `).join('');

        resultado.innerHTML = `
            <table class="tabla-actividades">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Proyecto</th>
                        <th>Titulo</th>
                        <th>Descripcion</th>
                        <th>Fecha y Hora</th>
                        <th>Accion</th>
                    </tr>
                </thead>
                <tbody>${filas}</tbody>
            </table>
        `;
    };

    const manejarRespuesta = async (response) => {
        const texto = await response.text();
        let payload = {};

        if (texto) {
            try {
                payload = JSON.parse(texto);
            } catch (error) {
                throw new Error('Respuesta invalida del servidor');
            }
        }

        if (!response.ok) {
            const mensaje = payload.error || payload.mensaje || 'No se pudo completar la operacion';
            throw new Error(mensaje);
        }

        return payload;
    };

    const obtenerPayloadFormulario = () => {
        const proyectoTexto = normalizarTexto(inputProyectoId.value);
        const titulo = normalizarTexto(inputTitulo.value);
        const descripcion = normalizarTexto(inputDescripcion.value);
        const fecha_hora = normalizarTexto(inputFechaHora.value);

        if (!proyectoTexto) {
            throw new Error('Selecciona un proyecto');
        }

        const proyecto_id = Number(proyectoTexto);
        if (!Number.isInteger(proyecto_id) || proyecto_id <= 0) {
            throw new Error('Selecciona un proyecto valido');
        }

        if (!titulo) {
            throw new Error('El titulo es obligatorio');
        }

        return {
            proyecto_id,
            titulo,
            descripcion,
            fecha_hora
        };
    };

    const cargarProyectos = async () => {
        const response = await fetch('/api/proyectos');
        const proyectos = await manejarRespuesta(response);

        proyectosPorId = new Map(
            (Array.isArray(proyectos) ? proyectos : []).map((proyecto) => [Number(proyecto.id), proyecto])
        );

        const opciones = (Array.isArray(proyectos) ? proyectos : []).map((proyecto) => `
            <option value="${proyecto.id}">${escaparHtml(proyecto.nombre || `Proyecto #${proyecto.id}`)}</option>
        `).join('');

        inputProyectoId.innerHTML = `
            <option value="">Selecciona un proyecto</option>
            ${opciones}
        `;
    };

    const listarActividades = async () => {
        try {
            const response = await fetch('/api/actividades');
            const actividades = await manejarRespuesta(response);
            renderizarListado(actividades);
        } catch (error) {
            mostrarMensaje(error.message, 'error');
        }
    };

    const obtenerActividadPorId = async (id) => {
        const response = await fetch(`/api/actividades/${id}`);
        return manejarRespuesta(response);
    };

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        try {
            const payload = obtenerPayloadFormulario();
            const response = await fetch('/api/actividades', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            await manejarRespuesta(response);
            mostrarMensaje('Actividad programada correctamente', 'ok');
            limpiarFormulario();
            await listarActividades();
        } catch (error) {
            mostrarMensaje(error.message, 'error');
        }
    });

    if (btnActualizar) {
        btnActualizar.addEventListener('click', async () => {
            const id = Number(inputId.value);

            if (!Number.isInteger(id) || id <= 0) {
                mostrarMensaje('Selecciona una actividad para actualizar', 'error');
                return;
            }

            try {
                const payload = obtenerPayloadFormulario();
                const response = await fetch(`/api/actividades/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                await manejarRespuesta(response);
                mostrarMensaje('Actividad actualizada correctamente', 'ok');
                limpiarFormulario();
                await listarActividades();
            } catch (error) {
                mostrarMensaje(error.message, 'error');
            }
        });
    }

    if (btnEliminar) {
        btnEliminar.addEventListener('click', async () => {
            const id = Number(inputId.value);

            if (!Number.isInteger(id) || id <= 0) {
                mostrarMensaje('Selecciona una actividad para eliminar', 'error');
                return;
            }

            const confirmar = window.confirm(`Se eliminara la actividad #${id}. Deseas continuar?`);
            if (!confirmar) {
                return;
            }

            try {
                const response = await fetch(`/api/actividades/${id}`, { method: 'DELETE' });
                await manejarRespuesta(response);
                mostrarMensaje('Actividad eliminada correctamente', 'ok');
                limpiarFormulario();
                await listarActividades();
            } catch (error) {
                mostrarMensaje(error.message, 'error');
            }
        });
    }

    if (btnListar) {
        btnListar.addEventListener('click', listarActividades);
    }

    resultado.addEventListener('click', async (event) => {
        const boton = event.target.closest('.btn-seleccionar');
        if (!boton) {
            return;
        }

        const id = Number(boton.dataset.id);
        if (!Number.isInteger(id) || id <= 0) {
            mostrarMensaje('ID de actividad invalido', 'error');
            return;
        }

        try {
            const actividad = await obtenerActividadPorId(id);
            cargarEnFormulario(actividad);
            mostrarMensaje(`Actividad #${id} cargada en el formulario`, 'ok');
        } catch (error) {
            mostrarMensaje(error.message, 'error');
        }
    });

    (async () => {
        try {
            await cargarProyectos();
            await listarActividades();
        } catch (error) {
            mostrarMensaje(error.message, 'error');
        }
    })();
})();