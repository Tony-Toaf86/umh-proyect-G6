(() => {
    const form = document.getElementById('voluntarioForm');
    const resultado = document.getElementById('resultado');

    if (!form || !resultado) {
        return;
    }

    const inputId = document.getElementById('voluntarioId');
    const inputNombre = document.getElementById('nombre_completo');
    const inputCorreo = document.getElementById('correo');
    const inputTelefono = document.getElementById('telefono');

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

    const cargarEnFormulario = (voluntario) => {
        inputId.value = voluntario.id;
        inputNombre.value = voluntario.nombre_completo || '';
        inputCorreo.value = voluntario.correo || '';
        inputTelefono.value = voluntario.telefono || '';
    };

    const limpiarFormulario = () => {
        form.reset();
        inputId.value = '';
    };

    const renderizarListado = (voluntarios) => {
        if (!Array.isArray(voluntarios) || !voluntarios.length) {
            resultado.innerHTML = '<p>No hay voluntarios registrados.</p>';
            return;
        }

        const filas = voluntarios.map((voluntario) => `
            <tr>
                <td>${voluntario.id}</td>
                <td>${escaparHtml(voluntario.nombre_completo)}</td>
                <td>${escaparHtml(voluntario.correo || '-')}</td>
                <td>${escaparHtml(voluntario.telefono || '-')}</td>
                <td>
                    <button type="button" class="btn-seleccionar" data-id="${voluntario.id}">Seleccionar</button>
                </td>
            </tr>
        `).join('');

        resultado.innerHTML = `
            <table class="tabla-voluntarios">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Telefono</th>
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
        nombre_completo: normalizarTexto(inputNombre.value),
        correo: normalizarTexto(inputCorreo.value),
        telefono: normalizarTexto(inputTelefono.value)
    });

    const listarVoluntarios = async () => {
        try {
            const response = await fetch('/api/voluntarios');
            const voluntarios = await manejarRespuesta(response);
            renderizarListado(voluntarios);
        } catch (error) {
            mostrarMensaje(error.message, 'error');
        }
    };

    const obtenerVoluntarioPorId = async (id) => {
        const response = await fetch(`/api/voluntarios/${id}`);
        return manejarRespuesta(response);
    };

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        try {
            const payload = obtenerPayloadFormulario();
            const response = await fetch('/api/voluntarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            await manejarRespuesta(response);
            mostrarMensaje('Voluntario guardado correctamente', 'ok');
            limpiarFormulario();
            await listarVoluntarios();
        } catch (error) {
            mostrarMensaje(error.message, 'error');
        }
    });

    btnActualizar.addEventListener('click', async () => {
        const id = Number(inputId.value);

        if (!Number.isInteger(id) || id <= 0) {
            mostrarMensaje('Selecciona un voluntario para actualizar', 'error');
            return;
        }

        try {
            const payload = obtenerPayloadFormulario();
            const response = await fetch(`/api/voluntarios/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            await manejarRespuesta(response);
            mostrarMensaje('Voluntario actualizado correctamente', 'ok');
            limpiarFormulario();
            await listarVoluntarios();
        } catch (error) {
            mostrarMensaje(error.message, 'error');
        }
    });

    btnEliminar.addEventListener('click', async () => {
        const id = Number(inputId.value);

        if (!Number.isInteger(id) || id <= 0) {
            mostrarMensaje('Selecciona un voluntario para eliminar', 'error');
            return;
        }

        const confirmar = window.confirm(`Se eliminara el voluntario #${id}. Deseas continuar?`);
        if (!confirmar) {
            return;
        }

        try {
            const response = await fetch(`/api/voluntarios/${id}`, { method: 'DELETE' });
            await manejarRespuesta(response);
            mostrarMensaje('Voluntario eliminado correctamente', 'ok');
            limpiarFormulario();
            await listarVoluntarios();
        } catch (error) {
            mostrarMensaje(error.message, 'error');
        }
    });

    btnListar.addEventListener('click', listarVoluntarios);

    resultado.addEventListener('click', async (event) => {
        const boton = event.target.closest('.btn-seleccionar');
        if (!boton) {
            return;
        }

        const id = Number(boton.dataset.id);
        if (!Number.isInteger(id) || id <= 0) {
            mostrarMensaje('ID de voluntario invalido', 'error');
            return;
        }

        try {
            const voluntario = await obtenerVoluntarioPorId(id);
            cargarEnFormulario(voluntario);
            mostrarMensaje(`Voluntario #${id} cargado en el formulario`, 'ok');
        } catch (error) {
            mostrarMensaje(error.message, 'error');
        }
    });

    listarVoluntarios();
})();