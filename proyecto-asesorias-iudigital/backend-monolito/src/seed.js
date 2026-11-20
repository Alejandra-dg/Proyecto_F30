/**
 * Script idempotente de carga inicial de datos (Seed) para el Caso de Estudio 3 - IUDigital.
 * Inserta los 5 tipos de proyecto, las 4 etapas académicas, 3 universidades, 3 clientes
 * y 3 proyectos de asesoría interrelacionados.
 */
require('dotenv').config();
const { conectarBD, desconectarBD } = require('./config/db');
const TipoProyecto = require('./models/TipoProyecto');
const Cliente = require('./models/Cliente');
const Universidad = require('./models/Universidad');
const Etapa = require('./models/Etapa');
const Proyecto = require('./models/Proyecto');

const ejecutarSeed = async () => {
  try {
    await conectarBD();
    console.log('[Seed] Limpiando colecciones previas...');
    await Promise.all([
      Proyecto.deleteMany({}),
      TipoProyecto.deleteMany({}),
      Cliente.deleteMany({}),
      Universidad.deleteMany({}),
      Etapa.deleteMany({}),
    ]);

    // 1. Insertar los 5 Tipos de Proyecto del enum oficial
    const tiposInsertados = await TipoProyecto.insertMany([
      { nombre: 'ensayo' },
      { nombre: 'artículo' },
      { nombre: 'monografía' },
      { nombre: 'trabajo final de pregrado' },
      { nombre: 'trabajo final de especialización' },
    ]);
    console.log(`[Seed] Tipos de Proyecto insertados: ${tiposInsertados.length}`);

    // 2. Insertar las 4 Etapas del enum oficial
    const etapasInsertadas = await Etapa.insertMany([
      { nombre: 'anteproyecto' },
      { nombre: 'entrega parcial 1' },
      { nombre: 'entrega parcial 2' },
      { nombre: 'entrega final' },
    ]);
    console.log(`[Seed] Etapas insertadas: ${etapasInsertadas.length}`);

    // 3. Insertar Universidades
    const universidadesInsertadas = await Universidad.insertMany([
      {
        nombre: 'Institución Universitaria Digital de Antioquia - IUDigital',
        direccion: 'Carrera 55 # 42-90, Medellín, Antioquia',
        telefono: '6045200750',
      },
      {
        nombre: 'Universidad de Antioquia - UdeA',
        direccion: 'Calle 67 # 53-108, Medellín, Antioquia',
        telefono: '6042198332',
      },
      {
        nombre: 'Universidad Nacional de Colombia - Sede Medellín',
        direccion: 'Carrera 65 # 59A-110, Medellín, Antioquia',
        telefono: '6044309000',
      },
    ]);
    console.log(`[Seed] Universidades insertadas: ${universidadesInsertadas.length}`);

    // 4. Insertar Clientes
    const clientesInsertados = await Cliente.insertMany([
      {
        nombre: 'Alejandro Martínez Gómez',
        email: 'alejandro.martinez@est.iudigital.edu.co',
      },
      {
        nombre: 'Valentina Restrepo Cano',
        email: 'valentina.restrepo@udea.edu.co',
      },
      {
        nombre: 'Carlos Andrés Morales',
        email: 'camorales@unal.edu.co',
      },
    ]);
    console.log(`[Seed] Clientes insertados: ${clientesInsertados.length}`);

    // 5. Insertar Proyectos de Asesoría interrelacionados
    const proyectosInsertados = await Proyecto.insertMany([
      {
        numero: 'RAD-2026-001',
        titulo: 'Arquitectura de Microservicios y Despliegue Continuo en Plataformas Educativas',
        fechaIniciacion: new Date('2026-02-01T08:00:00.000Z'),
        fechaEntrega: new Date('2026-06-15T18:00:00.000Z'),
        valor: 2850000,
        cliente: clientesInsertados[0]._id,
        tipoProyecto: tiposInsertados[3]._id, // trabajo final de pregrado
        universidad: universidadesInsertadas[0]._id, // IUDigital
        etapa: etapasInsertadas[1]._id, // entrega parcial 1
      },
      {
        numero: 'RAD-2026-002',
        titulo: 'Modelo Predictivo de Deserción Estudiantil mediante Analítica de Datos',
        fechaIniciacion: new Date('2026-03-10T08:00:00.000Z'),
        fechaEntrega: new Date('2026-09-30T18:00:00.000Z'),
        valor: 4200000,
        cliente: clientesInsertados[1]._id,
        tipoProyecto: tiposInsertados[4]._id, // trabajo final de especialización
        universidad: universidadesInsertadas[1]._id, // UdeA
        etapa: etapasInsertadas[0]._id, // anteproyecto
      },
      {
        numero: 'RAD-2026-003',
        titulo: 'Impacto de los Contenedores Docker en la Automatización de Entornos Cloud',
        fechaIniciacion: new Date('2026-01-15T08:00:00.000Z'),
        fechaEntrega: new Date('2026-05-20T18:00:00.000Z'),
        valor: 1500000,
        cliente: clientesInsertados[2]._id,
        tipoProyecto: tiposInsertados[1]._id, // artículo
        universidad: universidadesInsertadas[2]._id, // UNAL
        etapa: etapasInsertadas[3]._id, // entrega final
      },
    ]);
    console.log(`[Seed] Proyectos de asesoría insertados: ${proyectosInsertados.length}`);
    console.log('[Seed] Poblado inicial finalizado con éxito.');
  } catch (error) {
    console.error('[Seed] Error durante la carga inicial:', error.message);
    process.exitCode = 1;
  } finally {
    await desconectarBD();
  }
};

if (require.main === module) {
  ejecutarSeed();
}

module.exports = { ejecutarSeed };
