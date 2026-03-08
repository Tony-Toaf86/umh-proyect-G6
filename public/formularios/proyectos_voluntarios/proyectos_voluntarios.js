(() => {
	const form = document.getElementById('proyectoVoluntarioForm');
	const resultado = document.getElementById('resultado');

	if (!form || !resultado) {
		return;
	}

	const inputOriginalProyectoId = document.getElementById('original_proyecto_id');
	const inputOriginalVoluntarioId = document.getElementById('original_voluntario_id');
	const selectProyecto = document.getElementById('proyecto_id');
	const selectVoluntario = document.getElementById('voluntario_id');
	const inputFechaAsignacion = document.getElementById('fecha_asignacion');

	const btnActualizar = form.querySelector('.btn-actualizar');
	const btnEliminar = form.querySelector('.btn-eliminar');
	const btnListar = form.querySelector('.btn-listar');

	const escaparHtml = (valor) => String(valor || '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');

	const normalizarTexto = (valor) => {
		const texto = String(valor || '').trim();
		return texto.length ? texto : null;
	};

	const parsearId = (valor) => {
		const id = Number(valor);
		return Number.isInteger(id) && id > 0 ? id : null;
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

	const mostrarMensaje = (mensaje, tipo = 'info') => {
		resultado.innerHTML = `<p class="mensaje-${tipo}">${escaparHtml(mensaje)}</p>`;
	};

	const limpiarFormulario = () => {
		form.reset();
		inputOriginalProyectoId.value = '';
		inputOriginalVoluntarioId.value = '';
	};

	const cargarEnFormulario = (asignacion) => {
		const proyectoId = String(asignacion.proyecto_id || '');
		const voluntarioId = String(asignacion.voluntario_id || '');

		inputOriginalProyectoId.value = proyectoId;
		inputOriginalVoluntarioId.value = voluntarioId;
		selectProyecto.value = proyectoId;
		selectVoluntario.value = voluntarioId;
		inputFechaAsignacion.value = convertirAInputDateTime(asignacion.fecha_asignacion);
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

	const poblarSelect = (elemento, opciones, campoId, campoTexto, placeholder) => {
		const opcionesHtml = opciones.map((item) => {
			const id = item[campoId];
			const texto = item[campoTexto] || `ID ${id}`;
			return `<option value="${id}">${escaparHtml(texto)}</option>`;
		}).join('');

		elemento.innerHTML = `<option value="">${escaparHtml(placeholder)}</option>${opcionesHtml}`;
	};

	const cargarProyectos = async () => {
		const response = await fetch('/api/proyectos');
		const proyectos = await manejarRespuesta(response);
		poblarSelect(selectProyecto, proyectos, 'id', 'nombre', 'Selecciona un proyecto');
	};

	const cargarVoluntarios = async () => {
		const response = await fetch('/api/voluntarios');
		const voluntarios = await manejarRespuesta(response);
		poblarSelect(selectVoluntario, voluntarios, 'id', 'nombre_completo', 'Selecciona un voluntario');
	};

	const renderizarListado = (asignaciones) => {
		if (!Array.isArray(asignaciones) || !asignaciones.length) {
			resultado.innerHTML = '<p>No hay asignaciones registradas.</p>';
			return;
		}

		const filas = asignaciones.map((asignacion) => `
			<tr>
				<td>${asignacion.proyecto_id}</td>
				<td>${escaparHtml(asignacion.proyecto_nombre || '-')}</td>
				<td>${asignacion.voluntario_id}</td>
				<td>${escaparHtml(asignacion.voluntario_nombre || '-')}</td>
				<td>${formatearFecha(asignacion.fecha_asignacion)}</td>
				<td>
					<button
						type="button"
						class="btn-seleccionar"
						data-proyecto-id="${asignacion.proyecto_id}"
						data-voluntario-id="${asignacion.voluntario_id}"
					>Seleccionar</button>
				</td>
			</tr>
		`).join('');

		resultado.innerHTML = `
			<table class="tabla-proyectos-voluntarios">
				<thead>
					<tr>
						<th>ID Proyecto</th>
						<th>Proyecto</th>
						<th>ID Voluntario</th>
						<th>Voluntario</th>
						<th>Fecha Asignacion</th>
						<th>Accion</th>
					</tr>
				</thead>
				<tbody>${filas}</tbody>
			</table>
		`;
	};

	const listarAsignaciones = async () => {
		try {
			const response = await fetch('/api/proyectos-voluntarios');
			const asignaciones = await manejarRespuesta(response);
			renderizarListado(asignaciones);
		} catch (error) {
			mostrarMensaje(error.message, 'error');
		}
	};

	const obtenerAsignacionPorId = async (proyectoId, voluntarioId) => {
		const response = await fetch(`/api/proyectos-voluntarios/${proyectoId}/${voluntarioId}`);
		return manejarRespuesta(response);
	};

	const obtenerPayloadFormulario = () => ({
		proyecto_id: parsearId(selectProyecto.value),
		voluntario_id: parsearId(selectVoluntario.value),
		fecha_asignacion: normalizarTexto(inputFechaAsignacion.value)
	});

	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		try {
			const payload = obtenerPayloadFormulario();

			if (!payload.proyecto_id || !payload.voluntario_id) {
				mostrarMensaje('Selecciona un proyecto y un voluntario', 'error');
				return;
			}

			const response = await fetch('/api/proyectos-voluntarios', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			await manejarRespuesta(response);
			mostrarMensaje('Asignacion guardada correctamente', 'ok');
			limpiarFormulario();
			await listarAsignaciones();
		} catch (error) {
			mostrarMensaje(error.message, 'error');
		}
	});

	btnActualizar.addEventListener('click', async () => {
		const originalProyectoId = parsearId(inputOriginalProyectoId.value);
		const originalVoluntarioId = parsearId(inputOriginalVoluntarioId.value);

		if (!originalProyectoId || !originalVoluntarioId) {
			mostrarMensaje('Selecciona una asignacion para actualizar', 'error');
			return;
		}

		try {
			const payload = obtenerPayloadFormulario();

			if (!payload.proyecto_id || !payload.voluntario_id) {
				mostrarMensaje('Selecciona un proyecto y un voluntario', 'error');
				return;
			}

			const response = await fetch(
				`/api/proyectos-voluntarios/${originalProyectoId}/${originalVoluntarioId}`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				}
			);

			await manejarRespuesta(response);
			mostrarMensaje('Asignacion actualizada correctamente', 'ok');
			limpiarFormulario();
			await listarAsignaciones();
		} catch (error) {
			mostrarMensaje(error.message, 'error');
		}
	});

	btnEliminar.addEventListener('click', async () => {
		const proyectoId = parsearId(inputOriginalProyectoId.value);
		const voluntarioId = parsearId(inputOriginalVoluntarioId.value);

		if (!proyectoId || !voluntarioId) {
			mostrarMensaje('Selecciona una asignacion para eliminar', 'error');
			return;
		}

		const confirmar = window.confirm(
			`Se eliminara la asignacion Proyecto #${proyectoId} - Voluntario #${voluntarioId}. Deseas continuar?`
		);

		if (!confirmar) {
			return;
		}

		try {
			const response = await fetch(`/api/proyectos-voluntarios/${proyectoId}/${voluntarioId}`, {
				method: 'DELETE'
			});

			await manejarRespuesta(response);
			mostrarMensaje('Asignacion eliminada correctamente', 'ok');
			limpiarFormulario();
			await listarAsignaciones();
		} catch (error) {
			mostrarMensaje(error.message, 'error');
		}
	});

	btnListar.addEventListener('click', listarAsignaciones);

	resultado.addEventListener('click', async (event) => {
		const boton = event.target.closest('.btn-seleccionar');
		if (!boton) {
			return;
		}

		const proyectoId = parsearId(boton.dataset.proyectoId);
		const voluntarioId = parsearId(boton.dataset.voluntarioId);

		if (!proyectoId || !voluntarioId) {
			mostrarMensaje('IDs invalidos para cargar la asignacion', 'error');
			return;
		}

		try {
			const asignacion = await obtenerAsignacionPorId(proyectoId, voluntarioId);
			cargarEnFormulario(asignacion);
			mostrarMensaje('Asignacion cargada en el formulario', 'ok');
		} catch (error) {
			mostrarMensaje(error.message, 'error');
		}
	});

	const iniciar = async () => {
		try {
			await Promise.all([cargarProyectos(), cargarVoluntarios()]);
			await listarAsignaciones();
		} catch (error) {
			mostrarMensaje(error.message, 'error');
		}
	};

	iniciar();
})();
