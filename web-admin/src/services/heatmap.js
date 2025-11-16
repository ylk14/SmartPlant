import apiClient from "./apiClient";

const toNumberOrNull = (value) => {
  if (value == null) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const toBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "yes") return true;
    if (normalized === "false" || normalized === "no") return false;
    if (!Number.isNaN(Number(normalized))) {
      return Number(normalized) !== 0;
    }
  }
  return fallback;
};

const coerceObservationId = (entry) => {
  const candidates = [
    entry?.observation_id,
    entry?.observationId,
    entry?.id,
    entry?.uuid,
  ];

  for (const candidate of candidates) {
    if (candidate == null) continue;
    const asString = String(candidate).trim();
    if (asString) return asString;
  }

  return null;
};

const buildLocationName = (entry, lat, lng) => {
  if (entry?.location_name) return entry.location_name;
  if (entry?.location?.name) return entry.location.name;
  if (lat == null || lng == null) return "Unknown location";
  return `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`;
};

const normalizeObservation = (entry) => {
  if (!entry || typeof entry !== "object") return null;

  const lat =
    toNumberOrNull(entry.location_latitude) ??
    toNumberOrNull(entry.lat) ??
    toNumberOrNull(entry.latitude) ??
    toNumberOrNull(entry.location?.latitude);

  const lng =
    toNumberOrNull(entry.location_longitude) ??
    toNumberOrNull(entry.lng) ??
    toNumberOrNull(entry.longitude) ??
    toNumberOrNull(entry.location?.longitude);

  if (lat == null || lng == null) {
    return null;
  }

  const speciesRecord = entry.species ?? {};
  const speciesId =
    speciesRecord.species_id ??
    speciesRecord.id ??
    entry.species_id ??
    entry.speciesId ??
    null;

  const speciesCommonName =
    speciesRecord.common_name ??
    entry.species_common_name ??
    entry.plant_name ??
    "Unknown species";

  const speciesScientificName =
    speciesRecord.scientific_name ??
    entry.species_scientific_name ??
    speciesRecord.scientific ??
    "";

  const isEndangered = toBoolean(
    speciesRecord.is_endangered ??
      entry.is_endangered ??
      entry.species_is_endangered
  );

  const confidenceScore =
    toNumberOrNull(entry.confidence_score) ??
    toNumberOrNull(entry.confidence) ??
    toNumberOrNull(entry.ai_confidence) ??
    0;

  return {
    observation_id:
      coerceObservationId(entry) ??
      `OBS-${speciesId ?? "UNKNOWN"}-${entry.user_id ?? "X"}`,
    user_id: entry.user_id ?? null,
    species: {
      species_id: speciesId,
      common_name: speciesCommonName,
      scientific_name: speciesScientificName || "Unknown",
      is_endangered: isEndangered,
    },
    location_name: buildLocationName(entry, lat, lng),
    location_latitude: lat,
    location_longitude: lng,
    confidence_score: confidenceScore,
    is_masked: toBoolean(entry.is_masked ?? entry.masked ?? entry.is_hidden, false),
  };
};

const extractArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (payload?.data?.items && Array.isArray(payload.data.items)) {
    return payload.data.items;
  }
  return [];
};

export async function fetchHeatmapObservations(options = {}) {
  // You can keep options if you want to filter client-side later
  const { includeMasked } = options;

  // Get all map observations for admin
  const response = await apiClient.get("/api/map/observations", {
    params: { role: "admin" },
  });

  const all = extractArray(response.data)
    .map(normalizeObservation)
    .filter(Boolean);

  // Optional: respect includeMasked flag on frontend
  if (typeof includeMasked === "boolean") {
    return all.filter((item) =>
      includeMasked ? true : !item.is_masked
    );
  }

  return all;
}

export async function updateObservationMask(observationId, isMasked) {
  if (!observationId && observationId !== 0) {
    throw new Error("Observation ID is required to update mask visibility.");
  }

  const payload =
    typeof isMasked === "boolean" ? { is_masked: isMasked } : undefined;

  const { data } = await apiClient.patch(
    `/api/admin/map/observations/${observationId}/mask`,
    payload ?? {}
  );

  return data;
}
