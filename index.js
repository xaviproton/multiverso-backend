const express = require('express');
const cors = require('cors');
const fs = require('fs');

const { faker } = require('@faker-js/faker');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let db = require('./db.json');

//Funcion generar personaje aleatorio
function generarPersonaje() {
  const universos = [
    'Tierra-616',
    'Tierra-199999',
    'Multiverso-X',
    'Dimensión Fantasma',
    'Neo-Zion',
    'Tierra Invertida',
    'Universo Omega',
    'Realidad DistorSión',
  ];

  const habilidades = [
    'Teletransportación',
    'Invisibilidad',
    'Fuerza sobrehumana',
    'Control mental',
    'Manipulación del tiempo',
    'Vuelo',
    'Rayos láser',
    'Regeneración',
    'Control elemental',
    'Tecnopatía',
    'Magia arcana',
    'Crecimiento gigante',
    'Creación de portales',
    'Dominar sombras',
    'Velocidad sobrehumana',
  ];

  const frasesEpicas = [
    "¡Mi poder no conoce límites!",
    "El multiverso temblará ante mí.",
    "Hoy no es el día en que muero.",
    "¡Por la gloria de mi universo!",
    "Incluso los dioses me temen.",
    "No soy un héroe... soy una leyenda.",
    "Del caos, yo nací. Al caos, yo volveré.",
    "Solo yo puedo cambiar el destino.",
    "Nada es real, excepto mi voluntad.",
    "Soy el principio... y el final."
  ];
  

  const especies = [
    'Humano',
    'Alienígena',
    'Mutante',
    'Androide',
    'Dios cósmico',
    'Entidad dimensional',
    'Cyborg',
  ];

  const planetas = [
    'Tierra',
    'Krypton',
    'Namek',
    'Saturno Prime',
    'Vulcano',
    'Xandar',
    'Asgard',
    'Marte Negro',
    'Zebes',
  ];

  return {
    id: faker.number.int({ min: 1000, max: 9999 }).toString(),
    nombre: faker.person.firstName(),
    universo: faker.helpers.arrayElement(universos),
    especie: faker.helpers.arrayElement(especies),
    planetaOrigen: faker.helpers.arrayElement(planetas),
    nivelPoder: faker.number.int({ min: 1, max: 100 }),
    habilidades: faker.helpers.arrayElements(habilidades, { min: 2, max: 6 }),
    aliados: [faker.person.firstName(), faker.person.firstName()],
    enemigos: [faker.person.lastName()],
    fraseEpica: faker.helpers.arrayElement(frasesEpicas),
    imagen: faker.image.avatar(),
  };
}

//ENDPOINTS

app.get('/', (req, res) => {
  res.send('¡API del Multiverso funcionando! 🌌');
});


// Obtener todos los personajes
app.get('/personajes', (req, res) => {
  res.json(db.personajes || []);
});

//Devuelve un personaje aleatorio ya creado
app.get('/personajes/random', (req, res) => {
  const lista = db.personajes || [];
  if (lista.length === 0) {
    return res.status(404).json({ error: 'No hay personajes disponibles' });
  }

  const random = faker.helpers.arrayElement(lista);
  res.json(random);
});

//Buscar personajes en concreto
app.get('/personajes/buscar', (req, res) => {
  const { universo, especie, planeta, nivelPoderMin, nivelPoderMax } = req.query;
  let resultados = db.personajes || [];

  if (universo) {
    resultados = resultados.filter(p => p.universo === universo);
  }

  if (especie) {
    resultados = resultados.filter(p => p.especie === especie);
  }

  if (planeta) {
    resultados = resultados.filter(p => p.planetaOrigen === planeta);
  }

  if (nivelPoderMin) {
    resultados = resultados.filter(p => p.nivelPoder >= parseInt(nivelPoderMin));
  }

  if (nivelPoderMax) {
    resultados = resultados.filter(p => p.nivelPoder <= parseInt(nivelPoderMax));
  }

  res.json(resultados);
});


//Obtener personajes por id
app.get('/personajes/:id', (req, res) => {
  const { id } = req.params;
  const personaje = db.personajes?.find((p) => p.id === id);

  if (!personaje) {
    return res.status(404).json({ error: 'Personaje no encontrado' });
  }

  res.json(personaje);
});

// Crear un nuevo personaje
app.post('/personajes', (req, res) => {
  const nuevo = req.body;
  db.personajes = db.personajes || [];
  db.personajes.push(nuevo);

  fs.writeFileSync('./db.json', JSON.stringify(db, null, 2));
  res.status(201).json(nuevo);
});

// Generar y guardar un personaje automáticamente
app.post('/personajes/auto', (req, res) => {
  const nuevo = generarPersonaje();
  db.personajes = db.personajes || [];
  db.personajes.push(nuevo);

  fs.writeFileSync('./db.json', JSON.stringify(db, null, 2));
  res.status(201).json(nuevo);
});

//Editar personaje(put)
app.put('/personajes/:id', (req, res) => {
  const { id } = req.params;
  const index = db.personajes?.findIndex((p) => p.id === id);

  if (index === -1 || index === undefined) {
    return res.status(404).json({ error: 'Personaje no encontrado' });
  }

  // Reemplaza el personaje con los nuevos datos del cuerpo
  db.personajes[index] = { ...db.personajes[index], ...req.body };

  fs.writeFileSync('./db.json', JSON.stringify(db, null, 2));
  res.json(db.personajes[index]);
});

//Eliminar personaje(delete)
app.delete('/personajes/:id', (req, res) => {
  const { id } = req.params;
  const originalLength = db.personajes?.length || 0;
  db.personajes = db.personajes?.filter((p) => p.id !== id);

  if (db.personajes.length === originalLength) {
    return res.status(404).json({ error: 'Personaje no encontrado' });
  }

  fs.writeFileSync('./db.json', JSON.stringify(db, null, 2));
  res.json({ mensaje: 'Personaje eliminado con éxito' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

//Ver estadisticas de personajes
app.get('/estadisticas', (req, res) => {
  const personajes = db.personajes || [];

  if (personajes.length === 0) {
    return res.status(404).json({ error: 'No hay personajes para analizar' });
  }

  const total = personajes.length;
  const nivelPromedio = Math.round(
    personajes.reduce((sum, p) => sum + p.nivelPoder, 0) / total
  );

  const contar = (prop) => {
    const mapa = {};
    personajes.forEach(p => {
      const valor = p[prop];
      if (!mapa[valor]) mapa[valor] = 0;
      mapa[valor]++;
    });
    return mapa;
  };

  const universoFrecuente = Object.entries(contar('universo')).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  const especieFrecuente = Object.entries(contar('especie')).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  const planetasUnicos = new Set(personajes.map(p => p.planetaOrigen)).size;

  res.json({
    totalPersonajes: total,
    nivelPoderPromedio: nivelPromedio,
    universoMasComun: universoFrecuente,
    especieMasComun: especieFrecuente,
    totalPlanetasDistintos: planetasUnicos
  });
});

//Batalla de cartas
app.post('/batalla', (req, res) => {
  const { id1, id2 } = req.body;
  const personajes = db.personajes || [];

  const p1 = personajes.find(p => p.id === id1);
  const p2 = personajes.find(p => p.id === id2);

  if (!p1 || !p2) {
    return res.status(404).json({ error: 'Uno o ambos personajes no existen' });
  }

  const dado1 = Math.floor(Math.random() * 21); // 0 a 20
  const dado2 = Math.floor(Math.random() * 21); // 0 a 20

  let ganador = null;
  let fraseBatalla = '';

  // ⚔️ Lógica con crítico 19 o 20
  if (p1.nivelPoder > p2.nivelPoder) {
    if (dado2 >= 19) {
      ganador = p2;
      fraseBatalla = `${p2.nombre} hizo un GOLPE CRÍTICO con un ${dado2} y venció contra todo pronóstico.`;
    } else {
      ganador = p1;
      fraseBatalla = `${p1.nombre} dominó el combate con poder puro.`;
    }
  } else if (p2.nivelPoder > p1.nivelPoder) {
    if (dado1 >= 19) {
      ganador = p1;
      fraseBatalla = `${p1.nombre} desató un GOLPE CRÍTICO (${dado1}) y cambió el destino.`;
    } else {
      ganador = p2;
      fraseBatalla = `${p2.nombre} barrió el campo sin dejar oportunidad.`;
    }
  } else {
    fraseBatalla = `¡Empate perfecto! Ambos lucharon con igual fuerza.`;
  }

  res.json({
    personaje1: { nombre: p1.nombre, nivelPoder: p1.nivelPoder, dado: dado1 },
    personaje2: { nombre: p2.nombre, nivelPoder: p2.nivelPoder, dado: dado2 },
    resultado: ganador ? `${ganador.nombre} es el ganador` : "Empate",
    fraseBatalla
  });
});



