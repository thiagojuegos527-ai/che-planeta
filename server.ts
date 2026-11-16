import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Middleware for parsing large base64 image payloads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Shared Gemini client instance
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback mock database for instant offline/demo analysis if API key is absent or fallback is triggered
const SAMPLE_ANALYSES: Record<string, any> = {
  default: {
    objectName: "Botella de Plástico PET",
    category: "Plásticos y Envases",
    probableMaterial: "Polietileno Tereftalato (PET - Código 1)",
    materialDetails: "Termoplástico rígido, transparente y 100% reciclable en circuitos mecánicos tradicionales.",
    recyclabilityScore: 92,
    recyclabilityBadge: "Altamente Reciclable",
    badgeColor: "emerald",
    summary: "Es uno de los plásticos más recuperados a nivel global. Con una adecuada limpieza y separación, se transforma en nueva resina para envases o fibras textiles.",
    diyIdeas: [
      {
        id: "diy-1",
        title: "Maceta de Auto-Riego Colgante",
        subtitle: "Ideal para hierbas aromáticas o suculentas",
        difficulty: "Fácil",
        timeMinutes: 15,
        materialsNeeded: ["Botella PET vacía y limpia", "Cúter o tijera", "Cordón de algodón o mecha", "Tierra y plantita"],
        steps: [
          "Cortá la botella por la mitad en sentido transversal.",
          "Perforá la tapa con cuidado y pasá el cordón de algodón dejando unos 10 cm hacia adentro y 5 cm hacia abajo.",
          "Colocá la parte superior boca abajo dentro de la base (como un embudo).",
          "Llená la base con 3 dedos de agua y la parte superior con tierra y tu plantita; la mecha absorberá agua automáticamente."
        ],
        ecoBenefit: "Ahorra agua por capilaridad y evita que el plástico termine en un relleno sanitario."
      },
      {
        id: "diy-2",
        title: "Dispensador de Bolsas o Comedero de Aves",
        subtitle: "Organizador práctico o refugio para aves de ciudad",
        difficulty: "Fácil",
        timeMinutes: 20,
        materialsNeeded: ["Botella PET grande", "Cuchara de madera o palito", "Semillas para aves o bolsas", "Cuerda"],
        steps: [
          "Perforá dos orificios opuestos a 5 cm de la base y cruzá la cuchara de madera.",
          "Hacé una pequeña apertura de 1 cm sobre la cuchara para que caigan las semillas al apoyarse el ave.",
          "Atá un hilo resistente al cuello de la botella y colgala en una rama o balcón."
        ],
        ecoBenefit: "Fomenta la biodiversidad urbana y reutiliza el envase sin consumo energético."
      }
    ],
    disposalGuide: {
      containerColor: "Verde",
      containerColorHex: "#10B981",
      containerName: "Contenedor Verde / Puntos Limpios (Reciclables Secos)",
      preparationSteps: [
        "Vaciá completamente cualquier residuo líquido.",
        "Enjuagá con un toque mínimo de agua (no derroches agua potable).",
        "Aplastala de la base a la tapa para reducir el 70% de su volumen.",
        "Colocá la tapita nuevamente (las tapas de polipropileno se reciclan junto a la botella o en campañas benéficas)."
      ],
      warnings: [
        "No la arrojes con restos de líquidos azucarados o lácteos.",
        "No la quemes: emite compuestos orgánicos volátiles perjudiciales."
      ],
      recyclingCategory: "Plásticos Limpios y Secos",
      recyclingCenterType: "Campanas verdes, Puntos Verdes comunales y cooperativas de recuperadores urbanos."
    },
    environmentalImpact: {
      yearsToDegrade: "450 a 500 años",
      yearsNumericRange: [450, 500],
      carbonFootprint: "Aprox. 82.8 g de CO2 equivalente por botella de 500 ml.",
      wildlifeDanger: "En ambientes acuáticos se fragmenta en microplásticos ingeridos por peces, aves y tortugas marinas.",
      oceanImpact: "El 80% de los residuos que flotan en ríos y mares son plásticos de un solo uso.",
      conservationTip: "Llevá tu botella térmica de acero reutilizable para eliminar más de 160 botellas plásticas al año."
    },
    reliableSources: [
      {
        name: "Guía de Gestión Integral de RSU",
        organization: "Ministerio de Ambiente y Desarrollo Sostenible",
        url: "https://www.argentina.gob.ar/ambiente/cambio-climatico",
        topic: "Clasificación en origen y economía circular",
        fact: "El reciclaje de PET ahorra hasta un 60% de energía en comparación con la producción de plástico virgen."
      },
      {
        name: "Informe Global sobre Plásticos",
        organization: "Programa de las Naciones Unidas para el Medio Ambiente (PNUMA)",
        url: "https://www.unep.org/",
        topic: "Microplásticos y ecosistemas marinos",
        fact: "Menos del 10% del plástico producido históricamente ha sido efectivamente reciclado."
      },
      {
        name: "Campaña Mares Limpios",
        organization: "Greenpeace Internacional",
        url: "https://www.greenpeace.org",
        topic: "Impacto en biodiversidad",
        fact: "Más de 100.000 mamíferos marinos mueren cada año por ingesta o enredo en plásticos descartables."
      }
    ],
    cheConsejo: "¡Che, acordate! Una simple botella bien reciclada puede terminar convertida en una remera deportiva, en bancos de plaza o en un nuevo envase. ¡Cada botella que separás marca la diferencia!"
  }
};

// Recycling points catalog (covers major hubs with sample coordinates and metadata)
const GREEN_POINTS = [
  {
    id: "pv-1",
    name: "Punto Verde Parque Centenario",
    address: "Av. Díaz Vélez y Leopoldo Marechal",
    neighborhood: "Caballito",
    city: "Buenos Aires",
    distanceKm: 0.8,
    acceptedMaterials: ["Plásticos", "Vidrio", "Cartón y Papel", "Metales", "Pilas en desuso", "Aceite vegetal usado"],
    schedule: "Martes a Sábados: 11:00 a 17:00 hs",
    phone: "147",
    coordinates: { lat: -34.606, lng: -58.435 }
  },
  {
    id: "pv-2",
    name: "Estación de Reciclaje Plaza Arenales",
    address: "Nueva York y Mercedes",
    neighborhood: "Villa Devoto",
    city: "Buenos Aires",
    distanceKm: 2.1,
    acceptedMaterials: ["Plásticos", "Aluminio", "Tetrabrik", "Papel", "Aparatos electrónicos chicos"],
    schedule: "Lunes a Viernes: 10:00 a 18:00 hs",
    phone: "147",
    coordinates: { lat: -34.598, lng: -58.514 }
  },
  {
    id: "pv-3",
    name: "Centro Verde Cooperativa El Álamo",
    address: "Av. Constituyentes 6259",
    neighborhood: "Villa Pueyrredón",
    city: "Buenos Aires",
    distanceKm: 3.4,
    acceptedMaterials: ["Todo tipo de reciclables secos", "Nylon", "Telgopor", "Tapitas de plástico"],
    schedule: "Lunes a Sábados: 09:00 a 16:30 hs",
    phone: "(011) 4572-8800",
    coordinates: { lat: -34.578, lng: -58.508 }
  },
  {
    id: "pv-4",
    name: "Punto Limpio Ciudad Universitaria",
    address: "Costanera Norte s/n Pabellón 2",
    neighborhood: "Nuñez",
    city: "Buenos Aires",
    distanceKm: 4.2,
    acceptedMaterials: ["Vidrio", "Latas", "PET", "Cartón", "Residuos de laboratorio clasificados"],
    schedule: "Lunes a Viernes: 08:30 a 19:00 hs",
    phone: "(011) 5285-8000",
    coordinates: { lat: -34.542, lng: -58.441 }
  },
  {
    id: "pv-5",
    name: "Eco-Punto Móvil / Estación Barrial",
    address: "Plaza San Martín",
    neighborhood: "Retiro / Centro",
    city: "Buenos Aires",
    distanceKm: 5.1,
    acceptedMaterials: ["Papel y Cartón", "Plásticos varios", "Metales ferrosos", "Tetra Pak"],
    schedule: "Miércoles a Domingos: 12:00 a 18:00 hs",
    phone: "147",
    coordinates: { lat: -34.595, lng: -58.377 }
  }
];

// Endpoint: Nearby Green Points
app.get('/api/green-points', (req: Request, res: Response) => {
  const material = req.query.material as string | undefined;
  if (!material) {
    return res.json(GREEN_POINTS);
  }
  const filtered = GREEN_POINTS.filter(point =>
    point.acceptedMaterials.some(m => m.toLowerCase().includes(material.toLowerCase()))
  );
  return res.json(filtered.length > 0 ? filtered : GREEN_POINTS);
});

// Endpoint: AI Object Analysis via Gemini 3.8 Flash
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', userHint } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Falta la imagen base64 para analizar.' });
    }

    // Clean base64 string if data URL prefix was supplied
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    if (!ai) {
      console.warn("GEMINI_API_KEY no detectada. Retornando análisis ecológico enriquecido de demostración.");
      // Return enhanced sample analysis
      return res.json({
        ...SAMPLE_ANALYSES.default,
        timestamp: new Date().toISOString(),
        imageUrl: imageBase64.startsWith('data:') ? imageBase64 : `data:${mimeType};base64,${cleanBase64}`
      });
    }

    const systemPrompt = `Sos el motor de inteligencia artificial de 'Che Planeta', una aplicación móvil ecológica, juvenil, creativa y sumamente profesional creada para inspirar a las personas a reducir, reutilizar y reciclar correctamente cualquier objeto que encuentren.
Tu objetivo es analizar minuciosamente la imagen enviada por el usuario (un objeto doméstico, residuo o material reciclable) y producir un reporte ecológico completo, exacto y estimulante en español, con un tono cálido, argentino/latinoamericano entusiasta pero técnicamente riguroso.

Debes responder EXCLUSIVAMENTE con un JSON válido estructurado con los siguientes campos:
{
  "objectName": "Nombre específico y claro del objeto (ej. 'Lata de gaseosa de aluminio', 'Frasco de vidrio para conservas', 'Caja de cartón corrugado')",
  "category": "Categoría general (ej. 'Metales / Aluminio', 'Vidrio', 'Plásticos', 'Papel y Cartón', 'Residuo Electrónico (RAEE)', 'Residuo Peligroso')",
  "probableMaterial": "Material químico/técnico exacto y código si aplica (ej. 'Aluminio 100% infinito', 'Vidrio sílico-cálcico', 'Polietileno de Alta Densidad (HDPE - Código 2)')",
  "materialDetails": "Breve explicación de las propiedades de este material desde el punto de vista del reciclaje y biodegradabilidad (1-2 oraciones).",
  "recyclabilityScore": 95, // número entero del 0 al 100
  "recyclabilityBadge": "Altamente Reciclable" | "Reciclable con Preparación" | "Reutilizable / Upcycling" | "Residuo Especial / Peligroso" | "No Reciclable",
  "badgeColor": "emerald" | "amber" | "sky" | "rose" | "stone",
  "summary": "Resumen conciso y motivador de 2 oraciones sobre qué hacer con este objeto.",
  "diyIdeas": [
    {
      "id": "diy-1",
      "title": "Nombre creativo del proyecto DIY",
      "subtitle": "Para qué sirve o en qué rincón del hogar luce genial",
      "difficulty": "Fácil" | "Media" | "Avanzada",
      "timeMinutes": 20, // tiempo estimado en minutos
      "materialsNeeded": ["lista", "de", "materiales", "comunes"],
      "steps": ["Paso 1 muy claro y práctico", "Paso 2...", "Paso 3..."],
      "ecoBenefit": "Por qué este proyecto beneficia al ambiente"
    },
    {
      "id": "diy-2",
      "title": "Segunda idea de manualidad/reutilización",
      "subtitle": "Enfoque diferente (funcional, decorativo o para huerta/jardín)",
      "difficulty": "Fácil" | "Media" | "Avanzada",
      "timeMinutes": 30,
      "materialsNeeded": ["materiales"],
      "steps": ["Paso 1...", "Paso 2...", "Paso 3..."],
      "ecoBenefit": "Beneficio ambiental directo"
    }
  ],
  "disposalGuide": {
    "containerColor": "Verde" | "Amarillo" | "Azul" | "Gris" | "Punto Especial / Peligroso" | "Marrón (Orgánico)",
    "containerColorHex": "#10B981", // código hexadecimal representativo
    "containerName": "Nombre del contenedor oficial (ej. 'Contenedor Verde (Secos y Limpios)')",
    "preparationSteps": [
      "Instrucción 1 para prepararlo (ej. vaciar líquido, retirar etiqueta o enjuagar)",
      "Instrucción 2 (ej. secar bien para no contaminar papeles cercanos)",
      "Instrucción 3 (ej. compactar o desarmar para ahorrar espacio de transporte)"
    ],
    "warnings": [
      "Cosas que NO se deben hacer (ej. 'No tirar roto en bolsas plásticas transparentes sin envolver en papel de diario')",
      "Otro error común a evitar"
    ],
    "recyclingCategory": "Categoría para el recuperador urbano",
    "recyclingCenterType": "Lugares recomendados para llevarlo (Campana verde, punto limpio, botellón barrial, punto RAEE)"
  },
  "environmentalImpact": {
    "yearsToDegrade": "Tiempo estimado de descomposición en la naturaleza (ej. '400 a 500 años', 'Más de 4.000 años', '2 a 5 meses')",
    "yearsNumericRange": [400, 500], // rango numérico representativo para gráficas
    "carbonFootprint": "Dato o estimación de huella de carbono asociada a su producción y desecho",
    "wildlifeDanger": "Impacto concreto en animales terrestres, aves o ecosistemas marinos",
    "oceanImpact": "Efecto si termina arrastrado por arroyos o cuencas hídricas",
    "conservationTip": "Hábito de consumo para reducir la necesidad de adquirir este objeto en el futuro"
  },
  "reliableSources": [
    {
      "name": "Nombre de publicación, norma o estudio verificado",
      "organization": "Ministerio de Ambiente, Greenpeace, EPA, PNUMA, Ellen MacArthur Foundation, etc.",
      "url": "https://www.argentina.gob.ar/ambiente o url oficial",
      "topic": "Aspecto que certifica",
      "fact": "Dato puntual citado que respalda las cifras anteriores"
    },
    {
      "name": "Segunda fuente confiable",
      "organization": "Organización ecológica o científica de prestigio",
      "url": "https://www.unep.org/",
      "topic": "Aspecto que certifica",
      "fact": "Dato que respalda la información"
    }
  ],
  "cheConsejo": "Un consejo con personalidad 'Che Planeta': cálido, optimista, con modismo amigable ('¡Che, mirá qué fácil es...!', '¡Grande por fijarte antes de tirar!') que anime al usuario a contagiar la cultura sustentable a sus amigos y familia."
}`;

    const contents = [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
          {
            text: `Identificá este objeto fotografiado para Che Planeta.${userHint ? ` Nota del usuario: "${userHint}".` : ''} Analizá su material exacto, ideas de reutilización DIY para el hogar, guía paso a paso de disposición adecuada en contenedores de reciclaje, impacto ambiental con años de descomposición, y fuentes fiables de verificación.`
          }
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Gemini no retornó contenido de texto.');
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("Error al parsear JSON devuelto por Gemini:", parseErr);
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No se pudo extraer JSON válido del análisis visual.");
      }
    }

    const fullResult = {
      ...parsedResult,
      timestamp: new Date().toISOString(),
      imageUrl: imageBase64.startsWith('data:') ? imageBase64 : `data:${mimeType};base64,${cleanBase64}`
    };

    return res.json(fullResult);
  } catch (error: any) {
    console.error('Error en /api/analyze:', error);
    // In case of error (e.g., quota or content block), provide a smart fallback response with details
    return res.status(500).json({
      error: error.message || 'Error al procesar el análisis con IA.',
      fallbackAvailable: true,
      fallbackData: {
        ...SAMPLE_ANALYSES.default,
        timestamp: new Date().toISOString(),
        cheConsejo: "¡Che, hubo un detalle de red con los servidores de análisis, pero acá tenés una guía estándar para este tipo de objeto común!"
      }
    });
  }
});

// Export the Express app for Vercel serverless functions.
export default app;

// Local development: keep the original Vite + Express workflow.
async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌿 Che Planeta server running on http://0.0.0.0:${PORT}`);
  });
}

// Vercel imports this module; it must not start a persistent listener there.
if (process.env.VERCEL !== '1') {
  startServer();
}
