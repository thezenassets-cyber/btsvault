export interface HotelChoice {
  id: string;
  name: string;
  area: string;
}

/** Hotels a guest can prefer in a tour city. The desk confirms the stay. */
const HOTELS: Record<string, HotelChoice[]> = {
  Kaohsiung: [
    { id: "khh-marriott", name: "Kaohsiung Marriott", area: "Zuoying" },
    { id: "khh-nikko", name: "Hotel Nikko Kaohsiung", area: "City center" },
    { id: "khh-hilai", name: "Grand Hi-Lai Hotel", area: "Sanduo" },
  ],
  Bangkok: [
    { id: "bkk-stregis", name: "The St. Regis Bangkok", area: "Rajadamri" },
    { id: "bkk-centara", name: "Centara Grand", area: "CentralWorld" },
    { id: "bkk-marquis", name: "Marriott Marquis", area: "Sukhumvit" },
  ],
  "Kuala Lumpur": [
    { id: "kul-sunway", name: "Sunway Resort", area: "Bandar Sunway" },
    { id: "kul-traders", name: "Traders Hotel", area: "KLCC" },
    { id: "kul-mo", name: "Mandarin Oriental", area: "KLCC" },
  ],
  Singapore: [
    { id: "sin-mbs", name: "Marina Bay Sands", area: "Marina Bay" },
    { id: "sin-fullerton", name: "The Fullerton Hotel", area: "Boat Quay" },
    { id: "sin-raffles", name: "Raffles Hotel", area: "Civic District" },
  ],
  Jakarta: [
    { id: "jkt-kempinski", name: "Hotel Indonesia Kempinski", area: "Thamrin" },
    { id: "jkt-westin", name: "The Westin Jakarta", area: "Sudirman" },
    { id: "jkt-ayana", name: "Ayana Midplaza", area: "Sudirman" },
  ],
  Melbourne: [
    { id: "mel-crown", name: "Crown Towers", area: "Southbank" },
    { id: "mel-park", name: "Park Hyatt Melbourne", area: "East Melbourne" },
    { id: "mel-langham", name: "The Langham", area: "Southbank" },
  ],
  Sydney: [
    { id: "syd-park", name: "Park Hyatt Sydney", area: "The Rocks" },
    { id: "syd-shangri", name: "Shangri-La Sydney", area: "The Rocks" },
    { id: "syd-fs", name: "Four Seasons Sydney", area: "Circular Quay" },
  ],
  "Hong Kong": [
    { id: "hkg-peninsula", name: "The Peninsula", area: "Tsim Sha Tsui" },
    { id: "hkg-island", name: "Island Shangri-La", area: "Admiralty" },
    { id: "hkg-rosewood", name: "Rosewood Hong Kong", area: "Tsim Sha Tsui" },
  ],
  Bulacan: [
    { id: "bul-solaire", name: "Solaire Resort", area: "Entertainment City" },
    { id: "bul-okada", name: "Okada Manila", area: "Entertainment City" },
    { id: "bul-shangri", name: "Shangri-La The Fort", area: "BGC" },
  ],
};

export function hotelsForCity(city: string) {
  return HOTELS[city] ?? [];
}
