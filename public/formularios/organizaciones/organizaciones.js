(() => {
    const form = document.getElementById('orgForm');
    const resultado = document.getElementById('resultado');

    if (!form || !resultado) {
        return;
    }

    const inputId = document.getElementById('orgId');
    const inputNombre = document.getElementById('nombre');
    const inputContacto = document.getElementById('contacto');
    const inputTipoConvenio = document.getElementById('tipo_convenio');

    const btnActualizar = form.querySelector('.btn-actualizar');
    const btnEliminar = form.querySelector('.btn-eliminar');
    const btnListar = form.querySelector('.btn-listar');

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

    const cargarEnFormulario = (organizacion) => {
        inputId.value = organizacion.id;
        inputNombre.value = organizacion.nombre || '';
        inputContacto.value = organizacion.contacto || '';
        inputTipoConvenio.value = organizacion.tipo_convenio || '';
    };

    const limpiarFormulario = () => {
        form.reset();
        inputId.value = '';
    };

    const renderizarListado = (organizaciones) => {
        if (!Array.isArray(organizaciones) || !organizaciones.length) {
            resultado.innerHTML = '<p>No hay organizaciones registradas.</p>';
            return;
        }

        const filas = organizaciones.map((organizacion) => `
            <tr>
                <td>${organizacion.id}</td>
                <td>${escaparHtml(organizacion.nombre)}</td>
                <td>${escaparHtml(organizacion.contacto || '-')}</td>
                <td>${escaparHtml(organizacion.tipo_convenio || '-')}</td>
                <td>
                    <button type="button" class="btn-seleccionar" data-id="${organizacion.id}">Seleccionar</button>
                </td>
            </tr>
        `).join('');

        resultado.innerHTML = `
            <table class="tabla-organizaciones">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Contacto</th>
                        <th>Tipo de Convenio</th>
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

    const obtenerPayloadFormulario = () => ({
        nombre: normalizarTexto(inputNombre.value),
        contacto: normalizarTexto(inputContacto.value),
        tipo_convenio: normalizarTexto(inputTipoConvenio.value)
    });

    const listarOrganizaciones = async () => {
        try {
            const response = await fetch('/api/organizaciones');
            const organizaciones = await manejarRespuesta(response);
            renderizarListado(organizaciones);
        } catch (error) {
            mostrarMensaje(error.message, 'error');
        }
    };

    const obtenerOrganizacionPorId = async (id) => {
        const response = await fetch(`/api/organizaciones/${id}`);
        return manejarRespuesta(response);
    };

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        try {
            const payload = obtenerPayloadFormulario();
            const response = await fetch('/api/organizaciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            await manejarRespuesta(response);
            mostrarMensaje('Organización guardada correctamente', 'ok');
            limpiarFormulario();
            await listarOrganizaciones();
        } catch (error) {
            mostrarMensaje(error.message, 'error');
        }
    });

    btnActualizar.addEventListener('click', async () => {
        const id = Number(inputId.value);

        if (!Number.isInteger(id) || id <= 0) {
            mostrarMensaje('Selecciona una organización para actualizar', 'error');
            return;
        }

        try {
            const payload = obtenerPayloadFormulario();
            const response = await fetch(`/api/organizaciones/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            await manejarRespuesta(response);
            mostrarMensaje('Organización actualizada correctamente', 'ok');
            limpiarFormulario();
            await listarOrganizaciones();
        } catch (error) {
            mostrarMensaje(error.message, 'error');
        }
    });

    btnEliminar.addEventListener('click', async () => {
        const id = Number(inputId.value);

        if (!Number.isInteger(id) || id <= 0) {
            mostrarMensaje('Selecciona una organización para eliminar', 'error');
            return;
        }

        const confirmar = window.confirm(`Se eliminara la organización #${id}. Deseas continuar?`);
        if (!confirmar) {
            return;
        }

        try {
            const response = await fetch(`/api/organizaciones/${id}`, { method: 'DELETE' });
            await manejarRespuesta(response);
            mostrarMensaje('Organización eliminada correctamente', 'ok');
            limpiarFormulario();
            await listarOrganizaciones();
        } catch (error) {
            mostrarMensaje(error.message, 'error');
        }
    });

    btnListar.addEventListener('click', listarOrganizaciones);

    resultado.addEventListener('click', async (event) => {
        const boton = event.target.closest('.btn-seleccionar');
        if (!boton) {
            return;
        }

        const id = Number(boton.dataset.id);
        if (!Number.isInteger(id) || id <= 0) {
            mostrarMensaje('ID de organización invalido', 'error');
            return;
        }

        try {
            const organizacion = await obtenerOrganizacionPorId(id);
            cargarEnFormulario(organizacion);
            mostrarMensaje(`Organización #${id} cargada en el formulario`, 'ok');
        } catch (error) {
            mostrarMensaje(error.message, 'error');
        }
    });

    listarOrganizaciones();
})();