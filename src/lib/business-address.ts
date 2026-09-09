export const SAN_PEDRO_BARANGAYS = [
  "Bagong Silang",
  "Calendola",
  "Chrysanthemum",
  "Cuyab",
  "Estrella",
  "Fatima",
  "G.S.I.S.",
  "Landayan",
  "Langgam",
  "Laram",
  "Magsaysay",
  "Maharlika",
  "Narra",
  "Nueva",
  "Pacita I",
  "Pacita II",
  "Poblacion",
  "Riverside",
  "Rosario",
  "Sampaguita Village",
  "San Antonio",
  "San Lorenzo Ruiz",
  "San Roque",
  "San Vicente",
  "Santo Niño",
  "United Bayanihan",
  "United Better Living",
] as const;

const SAN_PEDRO_BARANGAY_STREETS: Record<string, readonly string[]> = {
  "Bagong Silang": ["Bagong Silang Road", "M. Almeda Street", "A. Santos Avenue"],
  Calendola: ["Calendola Street", "P. Serrano Road", "San Pedro Avenue"],
  Chrysanthemum: ["Chrysanthemum Street", "Mabini Street", "National Highway"],
  Cuyab: ["Cuyab Road", "Estrella Street", "Magsaysay Avenue"],
  Estrella: ["Estrella Street", "Belen Road", "Magsaysay Avenue", "Purok 2 Street"],
  Fatima: ["Fatima Street", "M. L. Quezon Avenue", "Rizal Avenue"],
  "G.S.I.S.": ["G.S.I.S. Road", "Magsaysay Avenue", "P. Burgos Street"],
  Landayan: ["Landayan Road", "San Antonio Street", "National Highway"],
  Langgam: ["Langgam Street", "Subdivision Road", "Bayanihan Street"],
  Laram: ["Laram Street", "M. H. Del Pilar Street", "P. Burgos Street"],
  Magsaysay: ["Magsaysay Avenue", "M. H. Del Pilar Street", "Rizal Avenue"],
  Maharlika: ["Maharlika Street", "Pob. Road", "Rizal Avenue"],
  Narra: ["Narra Street", "M. H. Del Pilar Street", "Maharlika Highway"],
  Nueva: ["Nueva Street", "Mabini Street", "B. San Pedro Avenue"],
  "Pacita I": ["Pacita I Road", "Pioneer Street", "J. P. Rizal Street"],
  "Pacita II": ["Pacita II Road", "Arawan Street", "Narra Avenue"],
  Poblacion: ["Poblacion Street", "Rizal Avenue", "National Highway"],
  Riverside: ["Riverside Street", "Magsaysay Avenue", "Barangay Road"],
  Rosario: ["Rosario Street", "San Vicente Road", "Rizal Avenue"],
  "Sampaguita Village": ["Sampaguita Road", "Village Drive", "Mabini Street"],
  "San Antonio": ["San Antonio Road", "Rizal Avenue", "Magsaysay Avenue"],
  "San Lorenzo Ruiz": ["San Lorenzo Ruiz Street", "Barangay Road", "Rizal Avenue"],
  "San Roque": ["San Roque Street", "Magsaysay Avenue", "Rosario Road"],
  "San Vicente": ["San Vicente Street", "Rizal Avenue", "Mabini Street"],
  "Santo Niño": ["Santo Niño Street", "P. Burgos Street", "National Highway"],
  "United Bayanihan": ["United Bayanihan Road", "San Pedro Avenue", "Rizal Avenue"],
  "United Better Living": ["United Better Living Road", "Magsaysay Avenue", "Luna Street"],
};

export const SAN_PEDRO_STREET_OPTIONS = Object.values(SAN_PEDRO_BARANGAY_STREETS).flat() as readonly string[];

export function getStreetOptionsForBarangay(barangay: string): string[] {
  return [...(SAN_PEDRO_BARANGAY_STREETS[barangay] ?? [])];
}

export const SAN_PEDRO_LANDMARK_OPTIONS = [
  "Near the public market",
  "Beside the church",
  "Near the school",
  "Across the plaza",
  "Fronting the barangay hall",
  "Near the terminal",
  "Near the highway",
  "Inside the residential subdivision",
] as const;

const SAN_PEDRO_BARANGAY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  "Bagong Silang": { latitude: 14.3754, longitude: 121.0584 },
  Calendola: { latitude: 14.3618, longitude: 121.0610 },
  Chrysanthemum: { latitude: 14.3572, longitude: 121.0658 },
  Cuyab: { latitude: 14.3721, longitude: 121.0485 },
  Estrella: { latitude: 14.3475, longitude: 121.0539 },
  Fatima: { latitude: 14.3552, longitude: 121.0510 },
  "G.S.I.S.": { latitude: 14.3640, longitude: 121.0529 },
  Landayan: { latitude: 14.3806, longitude: 121.0682 },
  Langgam: { latitude: 14.3891, longitude: 121.0578 },
  Laram: { latitude: 14.3550, longitude: 121.0705 },
  Magsaysay: { latitude: 14.3491, longitude: 121.0608 },
  Maharlika: { latitude: 14.3471, longitude: 121.0663 },
  Narra: { latitude: 14.3626, longitude: 121.0737 },
  Nueva: { latitude: 14.3488, longitude: 121.0834 },
  "Pacita I": { latitude: 14.3901, longitude: 121.0590 },
  "Pacita II": { latitude: 14.3972, longitude: 121.0627 },
  Poblacion: { latitude: 14.3527, longitude: 121.0568 },
  Riverside: { latitude: 14.3668, longitude: 121.0482 },
  Rosario: { latitude: 14.3711, longitude: 121.0652 },
  "Sampaguita Village": { latitude: 14.3397, longitude: 121.0614 },
  "San Antonio": { latitude: 14.3545, longitude: 121.0594 },
  "San Lorenzo Ruiz": { latitude: 14.3644, longitude: 121.0617 },
  "San Roque": { latitude: 14.3478, longitude: 121.0675 },
  "San Vicente": { latitude: 14.3540, longitude: 121.0733 },
  "Santo Niño": { latitude: 14.3724, longitude: 121.0556 },
  "United Bayanihan": { latitude: 14.3801, longitude: 121.0489 },
  "United Better Living": { latitude: 14.3928, longitude: 121.0514 },
};

export function buildBusinessAddressFromChoices({
  inSanPedro = true,
  barangay = "San Antonio",
  street = "",
  landmark = "Near the public market",
  city = "San Pedro",
  province = "Laguna",
}: {
  inSanPedro?: boolean;
  barangay?: string;
  street?: string;
  landmark?: string;
  city?: string;
  province?: string;
}) {
  const normalizedStreet = street;
  const normalizedBarangay = barangay || "San Antonio";
  const cleanedBarangay = normalizedBarangay.startsWith("Brgy.") ? normalizedBarangay : `Brgy. ${normalizedBarangay}`;

  const address = inSanPedro
    ? `${normalizedStreet}, ${cleanedBarangay}, ${city}, ${province}`
    : `${normalizedStreet}, ${city}, ${province}`;

  const coordinates = SAN_PEDRO_BARANGAY_COORDINATES[normalizedBarangay] ?? {
    latitude: 14.3595,
    longitude: 121.0473,
  };

  return {
    address,
    landmark,
    coordinates,
  };
}

export function getBusinessMapEmbedUrl(address: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}
