import { describe, expect, it } from "vitest";
import {
  SAN_PEDRO_BARANGAYS,
  buildBusinessAddressFromChoices,
  getBusinessMapEmbedUrl,
  getStreetOptionsForBarangay,
} from "@/lib/business-address";

describe("business location questionnaire", () => {
  it("builds a complete San Pedro address from selection choices", () => {
    const result = buildBusinessAddressFromChoices({
      inSanPedro: true,
      barangay: "San Antonio",
      street: "Rizal Avenue",
      landmark: "Near the public market",
    });

    expect(result.address).toBe("Rizal Avenue, Brgy. San Antonio, San Pedro, Laguna");
    expect(result.coordinates).toEqual({ latitude: 14.3545, longitude: 121.0594 });
  });

  it("builds a map embed URL from the selected address", () => {
    const url = getBusinessMapEmbedUrl("Rizal Avenue, Brgy. San Antonio, San Pedro, Laguna");

    expect(url).toContain("google.com/maps");
    expect(url).toContain(encodeURIComponent("Rizal Avenue, Brgy. San Antonio, San Pedro, Laguna"));
  });

  it("lists all San Pedro barangays and filters street options by selection", () => {
    expect(SAN_PEDRO_BARANGAYS).toHaveLength(27);
    expect(SAN_PEDRO_BARANGAYS).toContain("Estrella");
    expect(SAN_PEDRO_BARANGAYS).toContain("Cuyab");
    expect(SAN_PEDRO_BARANGAYS).toContain("Magsaysay");
    expect(SAN_PEDRO_BARANGAYS).toContain("San Roque");
    expect(SAN_PEDRO_BARANGAYS).toContain("San Lorenzo Ruiz");
    expect(SAN_PEDRO_BARANGAYS).not.toContain("San Lorenzo");

    const estrellaStreets = getStreetOptionsForBarangay("Estrella");
    expect(estrellaStreets.length).toBeGreaterThan(0);
    expect(estrellaStreets).toContain("Estrella Street");
    expect(estrellaStreets).not.toContain("National Highway");

    expect(getStreetOptionsForBarangay("Unknown Barangay")).toEqual([]);
  });
});
