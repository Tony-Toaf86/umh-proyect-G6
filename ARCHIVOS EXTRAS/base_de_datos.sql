CREATE TABLE organizaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    contacto VARCHAR(100),
    tipo_convenio VARCHAR(50)
);

CREATE TABLE proyectos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE,
    organizacion_id INT,
    FOREIGN KEY (organizacion_id) REFERENCES organizaciones(id) ON DELETE SET NULL
);

CREATE TABLE voluntarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre_completo VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE,
    telefono VARCHAR(20)
);

CREATE TABLE proyectos_voluntarios (
    proyecto_id INT,
    voluntario_id INT,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (proyecto_id, voluntario_id),
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (voluntario_id) REFERENCES voluntarios(id) ON DELETE CASCADE
);

CREATE TABLE actividades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    proyecto_id INT,
    titulo VARCHAR(100),
    descripcion TEXT,
    fecha_hora DATETIME,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE
);

CREATE TABLE beneficiarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre_completo VARCHAR(100) NOT NULL,
    edad INT,
    proyecto_id INT,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE
);