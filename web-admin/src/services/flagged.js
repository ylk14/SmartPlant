// src/services/flagged.js
import apiClient from "./apiClient";

const toNumberOrNull = (value) => {
  if (value == null) return null;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? null : numeric;
};

// Get the list of pending / flagged observations for review
export async function fetchFlaggedUnsure() {
  const res = await apiClient.get("/api/admin/observations", {
    params: {
      status: "pending",   // only pending ones
      page: 1,
      page_size: 200
    },
  });

  const payload = res.data || {};
  const rows = Array.isArray(payload.data) ? payload.data : [];

  const flagged = rows
    .map((row) => {
      const lat = toNumberOrNull(row.location_latitude);
      const lon = toNumberOrNull(row.location_longitude);

      const coordsText =
        lat != null && lon != null
          ? `${lat.toFixed(4)}, ${lon.toFixed(4)}`
          : "";

      const location =
        row.location ||
        row.location_name ||
        coordsText ||
        "Location unavailable";

      return {
        observation_id: row.observation_id,
        plant_name: row.plant_name || "Unknown species",
        confidence:
          row.confidence != null
            ? Number(row.confidence)
            : null,
        user: row.user || "Unknown reporter",
        submitted_at: row.submitted_at || row.created_at,
        location,
        photo: row.photo || row.photo_url || null,
        // this endpoint does not currently expose endangered flag
        is_endangered: false,
        notes: row.notes || "",
        status: row.status || "pending",
        // needed for proper lat / lon display
        location_latitude: row.location_latitude,
        location_longitude: row.location_longitude,
      };
    })
    .sort((a, b) => {
      const aTime = new Date(a.submitted_at || 0).getTime();
      const bTime = new Date(b.submitted_at || 0).getTime();
      if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
      if (Number.isNaN(aTime)) return 1;
      if (Number.isNaN(bTime)) return -1;
      return bTime - aTime;
    });

  return flagged;
}

/**
 * Update status of a single observation, using the dedicated admin endpoints:
 *  - status = "verified"  -> PUT /api/admin/observations/:id/verify
 *  - status = "rejected"  -> PUT /api/admin/observations/:id/reject
 *  - status = "pending"   -> PUT /api/admin/observations/:id/flag-unsure
 * Fallback: generic update route for any weird status.
 */
export async function updateObservationStatus(observationId, options = {}) {
  if (!observationId) {
    throw new Error("Observation id is required");
  }

  const status = options.status;
  const notes =
    typeof options.notes === "string" ? options.notes.trim() : undefined;

  if (!status) {
    throw new Error("Status is required");
  }

  // 1) Approve / verify
  if (status === "verified") {
    const res = await apiClient.put(
      `/api/admin/observations/${observationId}/verify`
    );
    return res.data;
  }

  // 2) Reject
  if (status === "rejected") {
    // backend rejectObservation does not require a body,
    // but we can send notes later if you extend it
    const res = await apiClient.put(
      `/api/admin/observations/${observationId}/reject`,
      notes ? { notes } : {}
    );
    return res.data;
  }

  // 3) Flag as unsure (back to pending with optional notes)
  if (status === "pending") {
    const body = {};
    if (notes) body.notes = notes;

    const res = await apiClient.put(
      `/api/admin/observations/${observationId}/flag-unsure`,
      body
    );
    return res.data;
  }

  // 4) Fallback, use generic update route for any other status
  const res = await apiClient.put(
    `/api/admin/plant-observations/${observationId}`,
    {
      status,
      notes: notes || null,
    }
  );
  return res.data;
}

export async function fetchAllSpecies() {
  const res = await apiClient.get("/api/species/all");
  const raw = res.data;

  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}

export async function confirmExistingSpecies(observationId, payload) {
  const res = await apiClient.post(
    `/api/admin/observations/${observationId}/confirm-existing`,
    payload
  );
  return res.data;
}

export async function confirmNewSpecies(observationId, payload) {
  const res = await apiClient.post(
    `/api/admin/observations/${observationId}/confirm-new`,
    payload
  );
  return res.data;
}