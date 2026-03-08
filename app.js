const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');




const app = express();
app.use(express.static('public')); //para leer el index.html  

// insertando rutas
const voluntariosRoutes = require('./routes/route.voluntarios');
const organizacionesRoutes = require('./routes/route.organizaciones');
const proyectosRoutes = require('./routes/route.proyectos');
const proyectosVoluntariosRoutes = require('./routes/route.proyectos_voluntarios');
const beneficiariosRoutes = require('./routes/route.beneficiarios');
const actividadesRoutes = require('./routes/route.actividades');


// Middleware
app.use(cors());              // Permite peticiones externas
app.use(bodyParser.json());   // Lee JSON del body

//utilizanod las rutas de los controladores
app.use('/api/voluntarios', voluntariosRoutes);
app.use('/api/organizaciones', organizacionesRoutes);
app.use('/api/proyectos', proyectosRoutes);
app.use('/api/proyectos-voluntarios', proyectosVoluntariosRoutes);
app.use('/api/beneficiarios', beneficiariosRoutes);
app.use('/api/actividades', actividadesRoutes);

// Rutas


// Puerto del servidor
const PORT = 3000;
// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor activo en http://localhost:${PORT}`);
});
