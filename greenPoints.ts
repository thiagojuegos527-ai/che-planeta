import { GreenPoint } from '../types/chePlaneta';

export const LOCAL_GREEN_POINTS: GreenPoint[] = [
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
    acceptedMaterials: ["Vidrio", "Latas", "PET", "Cartón", "Residuos clasificados"],
    schedule: "Lunes a Viernes: 08:30 a 19:00 hs",
    phone: "(011) 5285-8000",
    coordinates: { lat: -34.542, lng: -58.441 }
  },
  {
    id: "pv-5",
    name: "Eco-Punto Móvil Retiro",
    address: "Plaza San Martín, Av. Santa Fe y Florida",
    neighborhood: "Retiro / San Nicolás",
    city: "Buenos Aires",
    distanceKm: 5.1,
    acceptedMaterials: ["Papel y Cartón", "Plásticos varios", "Metales ferrosos", "Tetra Pak"],
    schedule: "Miércoles a Domingos: 12:00 a 18:00 hs",
    phone: "147",
    coordinates: { lat: -34.595, lng: -58.377 }
  },
  {
    id: "pv-6",
    name: "Campana Verde Plaza Irlanda",
    address: "Donato Álvarez y Gaona",
    neighborhood: "Flores / Caballito Norte",
    city: "Buenos Aires",
    distanceKm: 1.5,
    acceptedMaterials: ["Plásticos", "Papel", "Cartón", "Vidrio", "Metal"],
    schedule: "Abierto 24 horas (Depósito directo)",
    coordinates: { lat: -34.615, lng: -58.455 }
  }
];
