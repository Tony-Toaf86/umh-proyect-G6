const Proyectos = require('../models/model.proyectos');

const limpiarTexto = (valor) => {
	if (valor === undefined || valor === null) {
		return null;
	}

	const limpio = String(valor).trim();
	return limpio.length ? limpio : null;
};

const parsearId = (valor) => {
	const id = Number(valor);
	return Number.isInteger(id) && id > 0 ? id : null;
};

const normalizarFecha = (valor) => {
	const texto = limpiarTexto(valor);
	if (!texto) {
		return null;
	}

	const fecha = new Date(texto);
	if (Number.isNaN(fecha.getTime())) {
		return undefined;
	}

	return texto;
};

const manejarErrorBD = (res, err) => {
	if (err && err.code === 'ER_NO_REFERENCED_ROW_2') {
		return res.status(400).json({ error: 'La organizacion seleccionada no existe' });
	}

	return res.status(500).json({ error: err.message || 'Error de base de datos' });
};

exports.insertar = (req, res) => {
	const nombre = limpiarTexto(req.body.nombre);
	const descripcion = limpiarTexto(req.body.descripcion);
	const fecha_inicio = normalizarFecha(req.body.fecha_inicio);
	const organizacion_id = parsearId(req.body.organizacion_id);

	if (!nombre) {
		return res.status(400).json({ error: 'El nombre es obligatorio' });
	}

	if (fecha_inicio === undefined) {
		return res.status(400).json({ error: 'La fecha de inicio es invalida' });
	}

	Proyectos.crear(nombre, descripcion, fecha_inicio, organizacion_id, (err, result) => {
		if (err) {
			return manejarErrorBD(res, err);
		}

		return res.status(201).json({
			mensaje: 'Proyecto insertado correctamente',
			id: result.insertId
		});
	});
};

exports.listar = (req, res) => {
	Proyectos.listar((err, result) => {
		if (err) {
			return manejarErrorBD(res, err);
		}

		return res.json(result);
	});
};

exports.obtenerPorId = (req, res) => {
	const id = parsearId(req.params.id);

	if (!id) {
		return res.status(400).json({ error: 'ID invalido' });
	}

	Proyectos.obtenerPorId(id, (err, result) => {
		if (err) {
			return manejarErrorBD(res, err);
		}

		if (!result.length) {
			return res.status(404).json({ error: 'Proyecto no encontrado' });
		}

		return res.json(result[0]);
	});
};

exports.actualizar = (req, res) => {
	const id = parsearId(req.params.id);
	const nombre = limpiarTexto(req.body.nombre);
	const descripcion = limpiarTexto(req.body.descripcion);
	const fecha_inicio = normalizarFecha(req.body.fecha_inicio);
	const organizacion_id = parsearId(req.body.organizacion_id);

	if (!id) {
		return res.status(400).json({ error: 'ID invalido' });
	}

	if (!nombre) {
		return res.status(400).json({ error: 'El nombre es obligatorio' });
	}

	if (fecha_inicio === undefined) {
		return res.status(400).json({ error: 'La fecha de inicio es invalida' });
	}

	Proyectos.actualizar(id, nombre, descripcion, fecha_inicio, organizacion_id, (err, result) => {
		if (err) {
			return manejarErrorBD(res, err);
		}

		if (!result.affectedRows) {
			return res.status(404).json({ error: 'Proyecto no encontrado' });
		}

		return res.json({ mensaje: 'Proyecto actualizado correctamente' });
	});
};

exports.eliminar = (req, res) => {
	const id = parsearId(req.params.id);

	if (!id) {
		return res.status(400).json({ error: 'ID invalido' });
	}

	Proyectos.eliminar(id, (err, result) => {
		if (err) {
			return manejarErrorBD(res, err);
		}

		if (!result.affectedRows) {
			return res.status(404).json({ error: 'Proyecto no encontrado' });
		}

		return res.json({ mensaje: 'Proyecto eliminado correctamente' });
	});
};
