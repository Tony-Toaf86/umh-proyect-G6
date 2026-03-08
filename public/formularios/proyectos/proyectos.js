(() => {
    const form = document.getElementById('proyectoForm');
    const resultado = document.getElementById('resultado');

    if (!form || !resultado) {
        return;
    }

    const inputId = document.getElementById('proyectoId');
    const inputNombre = document.getElementById('nombre');
    const inputDescripcion = document.getElementById('descripcion');
    const inputFechaInicio = document.getElementById('fecha_inicio');
    const inputOrganizacionId = document.getElementById('organizacion_id');

    const btnActualizar = form.querySelector('.btn-actualizar');
    const btnEliminar = form.querySelector('.btn-eliminar');
    const btnListar = form.querySelector('.btn-listar');

    let organizacionesPorId = new Map();

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

    const cargarEnFormulario = (proyecto) => {
        inputId.value = proyecto.id;
        inputNombre.value = proyecto.nombre || '';
        inputDescripcion.value = proyecto.descripcion || '';
        inputFechaInicio.value = proyecto.fecha_inicio ? String(proyecto.fecha_inicio).slice(0, 10) : '';
        inputOrganizacionId.value = proyecto.organizacion_id ?? '';
    };

    const limpiarFormulario = () => {
        form.reset();
        inputId.value = '';
    };

    const obtenerNombreOrganizacion = (organizacionId) => {
        const organizacion = organizacionesPorId.get(Number(organizacionId));
        if (!organizacion) {
            return organizacionId ? `#${organizacionId}` : '-';
        }

        return organizacion.nombre || `#${organizacion.id}`;
    };

    const renderizarListado = (proyectos) => {
        if (!Array.isArray(proyectos) || !proyectos.length) {
            resultado.innerHTML = '<p>No hay proyectos registrados.</p>';
            return;
        }

        const filas = proyectos.map((proyecto) => `
            <tr>
                <td>${proyecto.id}</td>
                <td>${escaparHtml(proyecto.nombre)}</td>
                <td>${escaparHtml(proyecto.descripcion || '-')}</td>
                <td>${escaparHtml(proyecto.fecha_inicio ? String(proyecto.fecha_inicio).slice(0, 10) : '-')}</td>
                <td>${escaparHtml(obtenerNombreOrganizacion(proyecto.organizacion_id))}</td>
                <td>
                    <button type="button" class="btn-seleccionar" data-id="${proyecto.id}">Seleccionar</button>
                </td>
            </tr>
        `).join('');

        resultado.innerHTML = `
            <table class="tabla-proyectos">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripcion</th>
                        <th>Fecha Inicio</th>
                        <th>Organizacion</th>
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
        const nombre = normalizarTexto(inputNombre.value);
        const descripcion = normalizarTexto(inputDescripcion.value);
        const fecha_inicio = normalizarTexto(inputFechaInicio.value);
        const organizacionTexto = normalizarTexto(inputOrganizacionId.value);

        if (!nombre) {
            throw new Error('El nombre del proyecto es obligatorio');
        }

        const organizacion_id = organizacionTexto ? Number(organizacionTexto) : null;
        if (organizacionTexto && (!Number.isInteger(organizacion_id) || organizacion_id <= 0)) {
            throw new Error('Selecciona una organizacion valida');
        }

        return {
            nombre,
            descripcion,
            fecha_inicio,
            organizacion_id
        };
    };

    const cargarOrganizaciones = async () => {
        const response = await fetch('/api/organizaciones');
        const organizaciones = await manejarRespuesta(response);

        organizacionesPorId = new Map(
            (Array.isArray(organizaciones) ? organizaciones : []).map((organizacion) => [Number(organizacion.id), organizacion])
        );

        const opciones = (Array.isArray(organizaciones) ? organizaciones : []).map((organizacion) => `
            <option value="${organizacion.id}">${escaparHtml(organizacion.nombre || `Organizacion #${organizacion.id}`)}</option>
        `).join('');

        inputOrganizacionId.innerHTML = `
            <option value="">Selecciona una organizacion</option>
            ${opciones}
        `;
    };

    const listarProyectos = async () => {
        try {
            const response = await fetch('/api/proyectos');
            const proyectos = await manejarRespuesta(response);
            renderizarListado(proyectos);
        } catch (error) {
            mostrarMensaje(error.message, 'error');
        }
    };

    const obtenerProyectoPorId = async (id) => {
        const response = await fetch(`/api/proyectos/${id}`);
        return manejarRespuesta(response);
    };

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        try {
            const payload = obtenerPayloadFormulario();
            const response = await fetch('/api/proyectos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            await manejarRespuesta(response);
            mostrarMensaje('Proyecto guardado correctamente', 'ok');
            limpiarFormulario();
            await listarProyectos();
        } catch (error) {
            mostrarMensaje(error.message, 'error');
        }
    });

    if (btnActualizar) {
        btnActualizar.addEventListener('click', async () => {
            const id = Number(inputId.value);

            if (!Number.isInteger(id) || id <= 0) {
                mostrarMensaje('Selecciona un proyecto para actualizar', 'error');
                return;
            }

            try {
                const payload = obtenerPayloadFormulario();
                const response = await fetch(`/api/proyectos/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                await manejarRespuesta(response);
                mostrarMensaje('Proyecto actualizado correctamente', 'ok');
                limpiarFormulario();
                await listarProyectos();
            } catch (error) {
                mostrarMensaje(error.message, 'error');
            }
        });
    }

    if (btnEliminar) {
        btnEliminar.addEventListener('click', async () => {
            const id = Number(inputId.value);

            if (!Number.isInteger(id) || id <= 0) {
                mostrarMensaje('Selecciona un proyecto para eliminar', 'error');
                return;
            }

            const confirmar = window.confirm(`Se eliminara el proyecto #${id}. Deseas continuar?`);
            if (!confirmar) {
                return;
            }

            try {
                const response = await fetch(`/api/proyectos/${id}`, { method: 'DELETE' });
                await manejarRespuesta(response);
                mostrarMensaje('Proyecto eliminado correctamente', 'ok');
                limpiarFormulario();
                await listarProyectos();
            } catch (error) {
                mostrarMensaje(error.message, 'error');
            }
        });
    }

    if (btnListar) {
        btnListar.addEventListener('click', listarProyectos);
    }

    resultado.addEventListener('click', async (event) => {
        const boton = event.target.closest('.btn-seleccionar');
        if (!boton) {
            return;
        }

        const id = Number(boton.dataset.id);
        if (!Number.isInteger(id) || id <= 0) {
            mostrarMensaje('ID de proyecto invalido', 'error');
            return;
        }

        try {
            const proyecto = await obtenerProyectoPorId(id);
            cargarEnFormulario(proyecto);
            mostrarMensaje(`Proyecto #${id} cargado en el formulario`, 'ok');
        } catch (error) {
            mostrarMensaje(error.message, 'error');
        }
    });

    (async () => {
        try {
            await cargarOrganizaciones();
            await listarProyectos();
        } catch (error) {
            mostrarMensaje(error.message, 'error');
        }
    })();
})();