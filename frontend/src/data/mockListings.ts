import adyarImage from "@/assets/property-adyar.jpg";
import interiorImage from "@/assets/property-interior.jpg";
import omrImage from "@/assets/property-omr.jpg";
import villaImage from "@/assets/property-villa.jpg";
import type { Listing } from "@/types/property";

const seeds = [
  ["The Banyan Residences", "Adyar", "Apartment", 3, 18900000, 1540, "Semi-furnished"],
  ["Anna Nagar Courtyard", "Anna Nagar", "Apartment", 2, 12800000, 1085, "Furnished"],
  ["Olympia Parkside", "Guindy", "Apartment", 3, 16500000, 1430, "Unfurnished"],
  ["Seabreeze Heights", "OMR", "Apartment", 2, 8700000, 1010, "Semi-furnished"],
  ["Lakeview Terraces", "Perungudi", "Penthouse", 4, 28400000, 2420, "Furnished"],
  ["Arcadia Gardens", "Porur", "Villa", 4, 21500000, 2280, "Semi-furnished"],
  ["The Madras House", "T Nagar", "Independent House", 3, 32000000, 1960, "Furnished"],
  ["Tambaram Greens", "Tambaram", "Apartment", 1, 5200000, 650, "Unfurnished"],
  ["Bayline Habitat", "Thoraipakkam", "Apartment", 2, 9400000, 1120, "Semi-furnished"],
  ["Velachery Grove", "Velachery", "Apartment", 3, 14200000, 1360, "Furnished"],
  ["Riverstone Enclave", "Adyar", "Villa", 4, 36500000, 2850, "Furnished"],
  ["Second Avenue Homes", "Anna Nagar", "Apartment", 3, 17600000, 1480, "Semi-furnished"],
  ["Racecourse Residences", "Guindy", "Apartment", 2, 11800000, 980, "Unfurnished"],
  ["Coromandel Towers", "OMR", "Apartment", 3, 13200000, 1395, "Semi-furnished"],
  ["Cedar House", "Perungudi", "Independent House", 2, 15800000, 1240, "Furnished"],
  ["Urban Canopy", "Porur", "Apartment", 1, 6100000, 720, "Semi-furnished"],
  ["Raghava Manor", "T Nagar", "Apartment", 4, 29800000, 2310, "Furnished"],
  ["Southgate Habitat", "Tambaram", "Apartment", 2, 7100000, 930, "Unfurnished"],
  ["Palmera Crest", "Thoraipakkam", "Penthouse", 4, 23800000, 2180, "Semi-furnished"],
  ["Vijaya Garden", "Velachery", "Villa", 3, 19600000, 1820, "Furnished"],
] as const;
const images = [adyarImage, interiorImage, omrImage, villaImage];

export const mockListings: Listing[] = seeds.map((seed, index) => ({
  listing_id: `CHN-${String(index + 101).padStart(5, "0")}`,
  listing_url: "https://example.com/property",
  website: ["Owner listing", "Property portal", "Builder website"][index % 3] ?? "Property listing",
  city_id: 4,
  apartment_name: seed[0], locality: seed[1], property_type: seed[2], bedroom: seed[3],
  bathroom: Math.min(seed[3], 3), balcony: index % 3, floor: index % 12 + 1,
  total_floors: index % 12 + 6, furnishing: seed[6], facing_direction: ["East", "North", "West"][index % 3] ?? "East",
  covered_parking: index % 3, price: seed[4], carpet_area: seed[5], super_built_up_area: Math.round(seed[5] * 1.18),
  latitude: 13.0067, longitude: 80.2206, posted_by: index % 3 === 0 ? "Owner" : index % 3 === 1 ? "Builder" : "Agent",
  posted_by_name: index % 3 === 0 ? "Owner" : index % 3 === 1 ? "Developer" : "Property Partner",
  project_id: index % 4 === 0 ? null : `PRJ-${210 + index}`,
  is_verified: index % 4 !== 2, is_live: index % 6 !== 5,
  description: `A thoughtfully planned ${seed[3]} BHK ${seed[2].toLowerCase()} in ${seed[1]}, with generous natural light, efficient spaces and excellent access to Chennai's everyday essentials.`,
  posted_at: new Date(Date.now() - index * 86400000 * 2).toISOString(), image: images[index % images.length] ?? adyarImage,
}));
