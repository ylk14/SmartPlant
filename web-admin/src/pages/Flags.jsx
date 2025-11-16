import React, { useEffect, useState, useCallback, useMemo } from "react";
import SearchIcon from "@mui/icons-material/Search";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import WarningIcon from "@mui/icons-material/Warning";
import {
  fetchFlaggedUnsure,
  updateObservationStatus,
  fetchAllSpecies,
  confirmExistingSpecies,
  confirmNewSpecies,
} from "../services/flagged";

const MOCK_FLAGGED = [
    {
      observation_id: "OBS-3011",
      plant_name: "Unknown Nepenthes",
      confidence: 0.42,
      user: "field.scout",
      submitted_at: "2025-10-12T10:12:00Z",
      location: "Gunung Mulu, Sarawak",
      photo: "https://images.unsplash.com/photo-1599594213166-c2c57d57d305?w=400&h=300&fit=crop", // Placeholder
      is_endangered: true,
    },
    {
      observation_id: "OBS-2987",
      plant_name: "Rafflesia ?",
      confidence: 0.35,
      user: "flora.lens",
      submitted_at: "2025-10-09T08:45:00Z",
      location: "Mount Kinabalu, Sabah",
      photo: "https://images.unsplash.com/photo-1599594213166-c2c57d57d305?w=400&h=300&fit=crop", // Placeholder
      is_endangered: true,
    },
    {
      observation_id: "OBS-2979",
      plant_name: "Pitcher Plant Candidate",
      confidence: 0.28,
      user: "botany.lee",
      submitted_at: "2025-10-08T16:20:00Z",
      location: "Fraser's Hill, Pahang",
      photo: "https://images.unsplash.com/photo-1599594213166-c2c57d57d305?w=400&h=300&fit=crop", // Placeholder
      is_endangered: true,
    },
  ];

const formatCoords = (lat, lon) => {
  if (lat == null || lon == null) return "Not available";

  const nLat = Number(lat);
  const nLon = Number(lon);

  if (!Number.isFinite(nLat) || !Number.isFinite(nLon)) return "Not available";
  if (nLat === 0 && nLon === 0) return "Not available";

  return `${nLat.toFixed(5)}, ${nLon.toFixed(5)}`;
};

export default function FlaggedPlants() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  // const [showIdentifyModal, setShowIdentifyModal] = useState(false); 
  const [identifiedName, setIdentifiedName] = useState("");
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");

  const [identifyVisible, setIdentifyVisible] = useState(false);
  const [identifyLoading, setIdentifyLoading] = useState(false);
  const [mode, setMode] = useState("existing");
  const [speciesOptions, setSpeciesOptions] = useState([]);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState(null);
  const [newScientificName, setNewScientificName] = useState("");
  const [newCommonName, setNewCommonName] = useState("");
  const [newIsEndangered, setNewIsEndangered] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  

  const normalizeScientificName = (input) =>
    input
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z_]/g, "")
      .replace(/_+/g, "_");

  const loadFlagged = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFlaggedUnsure();
      setItems(data);
    } catch (e) {
      console.error(e);
      setError("Failed to load flagged observations. Showing latest mock data.");
      setItems(MOCK_FLAGGED);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlagged();
  }, [loadFlagged]);

  // Search filter
  const filtered = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) =>
      Object.values(item).some((v) => {
        if (v == null) return false;
        return v.toString().toLowerCase().includes(term);
      })
    );
  }, [items, searchQuery]);

  // Utility functions
  const toPercent = (score) => {
    if (score == null) return "—";
    const numeric = Number(score);
    if (Number.isNaN(numeric)) return "—";
    return `${Math.round(numeric * 100)}%`;
  };

  const formatDate = (iso) => {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
  };

  // Check if confidence is low 
  const isLowConfidence = (confidence) => {
    const numeric = Number(confidence);
    if (Number.isNaN(numeric)) return false;
    return numeric < 0.5;
  };

  // Modal handlers - FIXED: Prevent body scroll when modal is open
  const handleReview = (observation) => {
    setSelectedObservation(observation);
    setActionError(null);
    setActionLoading(false);
    setShowReviewModal(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setShowReviewModal(false);
    setSelectedObservation(null);
    setShowImageModal(false);
    setIdentifyVisible(false);      // IMPORTANT
    setIdentifiedName("");
    setReviewNotes("");
    setActionError(null);
    setActionLoading(false);
    document.body.style.overflow = "unset";
  };

  const handleImageModal = (show) => {
    setShowImageModal(show);
    document.body.style.overflow = show ? 'hidden' : 'unset';
  };

  const handleIdentifyModal = (show) => {
    setShowIdentifyModal(show);
    if (!show) {
      setActionError(null);
      setActionLoading(false);
    }
    document.body.style.overflow = show ? 'hidden' : 'unset';
  };

  // Approve
  const handleApprove = async () => {
    if (!selectedObservation) return;
    const observationId = selectedObservation.observation_id;
    if (!window.confirm("Are you sure you want to approve this observation?")) {
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      await updateObservationStatus(observationId, {
        status: "verified",
        notes: reviewNotes,
      });

      setItems((prev) =>
        prev.filter((item) => item.observation_id !== observationId)
      );
      handleCloseModal();
    } catch (e) {
      console.error(e);
      setActionError("Failed to approve observation. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Reject
  const handleReject = async () => {
    if (!selectedObservation) return;
    const observationId = selectedObservation.observation_id;
    if (!window.confirm("Are you sure you want to reject this observation?")) {
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      await updateObservationStatus(observationId, {
        status: "rejected",
        notes: reviewNotes,
      });

      setItems((prev) =>
        prev.filter((item) => item.observation_id !== observationId)
      );
      handleCloseModal();
    } catch (e) {
      console.error(e);
      setActionError("Failed to reject observation. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleIdentify = async () => {
    if (!selectedObservation) return;

    setIdentifyVisible(true);       // show identify card
    setMode("existing");
    setSelectedSpeciesId(null);
    setIdentifiedName("");
    setNewScientificName("");
    setNewCommonName("");
    setNewIsEndangered(false);
    setNewDescription("");

    try {
      setIdentifyLoading(true);
      if (!speciesOptions.length) {
        const list = await fetchAllSpecies();
        setSpeciesOptions(list);
      }
    } catch (e) {
      console.error("[Identify] failed to load species list", e);
    } finally {
      setIdentifyLoading(false);
    }
  };

  const handleConfirmExistingSpecies = async () => {
    if (!selectedObservation) return;
    const observationId = selectedObservation.observation_id;

    const name = identifiedName.trim();

    if (!selectedSpeciesId && !name) {
      alert("Please select an existing species or type the scientific name.");
      return;
    }

    const payload = {};
    if (selectedSpeciesId) payload.species_id = selectedSpeciesId;
    if (name) payload.scientific_name = name;

    try {
      setIdentifyLoading(true);
      await confirmExistingSpecies(observationId, payload);

      // remove from queue since it is now verified
      setItems((prev) =>
        prev.filter((item) => item.observation_id !== observationId)
      );
      setIdentifyVisible(false);
      handleCloseModal();
    } catch (e) {
      console.error("Confirm existing species error:", e);
      alert("Could not confirm existing species.");
    } finally {
      setIdentifyLoading(false);
    }
  };

  const handleConfirmNewSpecies = async () => {
    if (!selectedObservation) return;
    const observationId = selectedObservation.observation_id;

    const raw = newScientificName.trim();
    if (!raw) {
      alert("Scientific name is required for a new species.");
      return;
    }

    const normalized = normalizeScientificName(raw);

    try {
      setIdentifyLoading(true);
      await confirmNewSpecies(observationId, {
        scientific_name: normalized,
        common_name: newCommonName.trim(),
        is_endangered: newIsEndangered ? 1 : 0,
        description: newDescription.trim(),
      });

      setItems((prev) =>
        prev.filter((item) => item.observation_id !== observationId)
      );
      setIdentifyVisible(false);
      handleCloseModal();
    } catch (e) {
      console.error("Confirm new species error:", e);
      alert("Could not save new species.");
    } finally {
      setIdentifyLoading(false);
    }
  };

  const handleSaveIdentification = async () => {
    if (!identifiedName.trim() || !selectedObservation) return;
    const observationId = selectedObservation.observation_id;
    const appendedNote = `Identified as: ${identifiedName.trim()}`;
    const combinedNotes = selectedObservation.notes
      ? `${selectedObservation.notes}\n${appendedNote}`
      : appendedNote;

    setActionLoading(true);
    setActionError(null);

    try {
      await updateObservationStatus(observationId, {
        status: "verified",
        notes: combinedNotes,
      });
      setItems((prev) =>
        prev.filter((item) => item.observation_id !== observationId)
      );
      handleCloseModal();
    } catch (e) {
      console.error(e);
      setActionError("Failed to record identification. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading flagged plants...</div>;

  return (
    <>
      {/* Embedded CSS for modals */}
      <style>
        {`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            padding: 20px;
            overflow: hidden;
          }

          .modal-content {
            background-color: #F6F9F4;
            border-radius: 12px;
            width: 100%;
            max-width: 500px;
            max-height: 90vh;
            overflow: hidden;
            position: relative;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          }

          .modal-close {
            position: absolute;
            top: 16px;
            right: 16px;
            background: rgba(255, 255, 255, 0.9);
            border: none;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 10;
            font-size: 18px;
          }

          .modal-scroll {
            padding: 24px;
            max-height: calc(90vh - 48px);
            overflow-y: auto;
          }

          /* FIXED: Stable image container */
          .photo-wrapper {
            position: relative;
            cursor: pointer;
            border-radius: 18px;
            overflow: hidden;
            margin-bottom: 20px;
            height: 220px;
            width: 100%;
            background-color: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .photo {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }

          .resize-badge {
            position: absolute;
            bottom: 12px;
            right: 12px;
            background: rgba(0, 0, 0, 0.55);
            border-radius: 16px;
            padding: 8px;
            color: white;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .identify-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            padding: 20px;
            overflow: hidden;
          }

          .identify-modal-content {
            background-color: white;
            border-radius: 16px;
            padding: 20px;
            width: 100%;
            max-width: 400px;
            gap: 14px;
          }

          .identify-title {
            font-size: 18px;
            font-weight: 700;
            color: #0F172A;
            margin: 0 0 8px 0;
          }

          .identify-label {
            font-size: 13px;
            font-weight: 600;
            color: #475569;
            margin: 0 0 4px 0;
          }

          .identify-input {
            border: 1px solid #CBD5F5;
            border-radius: 10px;
            padding: 10px 14px;
            font-size: 14px;
            color: #0F172A;
            width: 100%;
            box-sizing: border-box;
          }

          .identify-input:focus {
            outline: none;
            border-color: #6366F1;
          }

          .identify-actions {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            margin-top: 8px;
          }

          .cancel-button {
            padding: 10px 16px;
            background: none;
            border: none;
            font-size: 13px;
            font-weight: 600;
            color: #475569;
            cursor: pointer;
          }

          .confirm-button {
            padding: 10px 18px;
            border-radius: 10px;
            background-color: #1E88E5;
            border: none;
            font-size: 13px;
            font-weight: 700;
            color: #FFFFFF;
            cursor: pointer;
          }

          .confirm-button:disabled {
            background-color: #94A3B8;
            cursor: not-allowed;
          }

          /* NEW: Low confidence badge styles */
          .low-confidence-badge {
            font-size: 10px;
            font-weight: 700;
            color: #DC2626;
            background-color: #FEE2E2;
            padding: 2px 6px;
            border-radius: 8px;
            text-transform: uppercase;
            margin-top: 4px;
          }

          /* NEW: Endangered badge styles */
          .endangered-badge {
            font-size: 12px;
            font-weight: 600;
            color: #DC2626;
            background-color: #FEE2E2;
            padding: 4px 8px;
            border-radius: 8px;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            margin-top: 4px;
          }

          .review-footer {
            display: flex;
            gap: 0.75rem;
            justify-content: flex-end; /* Approve / Reject / Identify aligned neatly */
          }
        `}
      </style>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Flag Unsure Queue</h1>
          <p style={styles.headerSubtitle}>
            AI low-confidence identifications awaiting manual review.
          </p>
        </div>

          {error && (
            <div style={styles.errorBanner}>
              <span>{error}</span>
              <button style={styles.retryButton} onClick={loadFlagged}>
                Retry
              </button>
            </div>
          )}

        {/* Search bar */}
        <div style={styles.searchBar}>
          <SearchIcon style={styles.searchIcon} />
          <input
            style={styles.searchInput}
            placeholder="Search by plant name, location, or observation ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery.length > 0 && (
            <button 
              style={styles.clearButton}
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Table structure */}
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <div style={styles.headerCellWide}>Plant</div>
            <div style={styles.headerCell}>Score</div>
            <div style={styles.headerCellAction}>Action</div>
          </div>

          {filtered.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyStateContent}>
                <LocalFloristIcon style={styles.emptyStateIcon} />
                <p style={styles.emptyStateText}>
                  {searchQuery ? 'No matching flagged plants found.' : 'No flagged plants awaiting review.'}
                </p>
              </div>
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.observation_id} style={styles.tableRow}>
                <div style={styles.cellWide}>
                  <div style={styles.plantText}>{item.plant_name}</div>
                  <div style={styles.metaText}>{item.location}</div>
                  {/* REMOVED: Endangered indicator from table */}
                </div>
                <div style={styles.cell}>
                  <div style={styles.confidenceCell}>
                    <div style={styles.confidenceValue}>
                      {toPercent(item.confidence)}
                    </div>
                    {/* NEW: Low confidence badge below the score */}
                    {isLowConfidence(item.confidence) && (
                      <div className="low-confidence-badge">Low</div>
                    )}
                  </div>
                </div>
                <div style={styles.cellAction}>
                  <button
                    style={styles.reviewButton}
                    onClick={() => handleReview(item)}
                  >
                    Review
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Review Modal */}
        {showReviewModal && selectedObservation && (
          <div
            style={styles.fullscreenOverlay}
            onClick={handleCloseModal}
          >
            {!identifyVisible && (
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <button className="modal-close" onClick={handleCloseModal}>
                  ×
                </button>

                <div className="modal-scroll">
                  {/* Image */}
                  <div
                    className="photo-wrapper"
                    onClick={() => handleImageModal(true)}
                  >
                    <img
                      src={selectedObservation.photo}
                      alt={selectedObservation.plant_name}
                      className="photo"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzIxMy44MDcgMTUwIDIyNSAxMzguODA3IDIyNSAxMjVDMjI1IDExMS4xOTMgMjEzLjgwNyAxMDAgMjAwIDEwMEMxODYuMTkzIDEwMCAxNzUgMTExLjE5MyAxNzUgMTI1QzE3IDEzOC44MDcgMTg2LjE5MyAxNTAgMjAwIDE1MFoiIGZpbGw9IiM5Q0E1QjkiLz4KPC9zdmc+";
                      }}
                    />
                    <div className="resize-badge">
                      <ZoomInIcon style={{ fontSize: 16, color: "white" }} />
                    </div>
                  </div>

                  {/* Title */}
                  <h1 style={styles.modalTitle}>
                    {selectedObservation.plant_name}
                  </h1>
                  <div style={styles.modalSubtitle}>
                    Observation {selectedObservation.observation_id}
                  </div>

                  {/* Confidence */}
                  <div style={styles.section}>
                    <div style={styles.sectionLabel}>Confidence</div>
                    <div style={styles.confidenceValue}>
                      {Number.isFinite(
                        Number(selectedObservation.confidence)
                      )
                        ? `${Math.round(
                            Number(selectedObservation.confidence) * 100
                          )}%`
                        : "—"}
                    </div>
                    {isLowConfidence(selectedObservation.confidence) && (
                      <div className="low-confidence-badge">
                        Low confidence - requires manual review
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div style={styles.section}>
                    <div style={styles.sectionLabel}>Location</div>
                    <div style={styles.sectionValue}>
                      {formatCoords(
                        selectedObservation.location_latitude,
                        selectedObservation.location_longitude
                      )}
                    </div>
                    {selectedObservation.is_endangered && (
                      <div className="endangered-badge">
                        <WarningIcon style={{ fontSize: 16 }} />
                        Endangered Species
                      </div>
                    )}
                  </div>

                  {/* Submitted */}
                  <div style={styles.section}>
                    <div style={styles.sectionLabel}>Submitted</div>
                    <div style={styles.sectionValue}>
                      {formatDate(selectedObservation.submitted_at)}
                    </div>
                    <div style={styles.sectionMeta}>
                      Flagged by {selectedObservation.user}
                    </div>
                  </div>

                  {/* Actions */}
                  {actionError && (
                    <div style={styles.actionError}>{actionError}</div>
                  )}
                  <div style={styles.actionsRow}>
                    <button
                      style={styles.approveButton}
                      onClick={handleApprove}
                      disabled={actionLoading}
                    >
                      {actionLoading ? "Saving..." : "Approve"}
                    </button>

                    <button
                      style={styles.rejectButton}
                      onClick={handleReject}
                      disabled={actionLoading}
                    >
                      Reject
                    </button>

                    <button
                      style={styles.identifyButton}
                      onClick={handleIdentify}
                      disabled={actionLoading}
                    >
                      Identify
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FIXED: Stable Image Preview Modal */}
        {showImageModal && selectedObservation && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 2000,
              padding: '40px 20px'
            }}
            onClick={() => handleImageModal(false)}
          >
            <div 
              style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                maxHeight: '80vh'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedObservation.photo} 
                alt={selectedObservation.plant_name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzIxMy44MDcgMTUwIDIyNSAxMzguODA3IDIyNSAxMjVDMjI1IDExMS4xOTMgMjEzLjgwNyAxMDAgMjAwIDEwMEMxODYuMTkzIDEwMCAxNzUgMTExLjE5MyAxNzUgMTI1QzE3IDEzOC44MDcgMTg2LjE5MyAxNTAgMjAwIDE1MFoiIGZpbGw9IiM5Q0E1QjkiLz4KPC9zdmc+';
                }}
              />
            </div>
            <button 
              style={{
                marginTop: '20px',
                backgroundColor: '#1E88E5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              onClick={() => handleImageModal(false)}
            >
              Close
            </button>
          </div>
        )}

        {identifyVisible && (
          <div style={styles.fullscreenOverlay}>
            <div style={styles.identifyCard}>
              <div style={styles.identifyTitleRow}>
                <div style={styles.identifyTitle}>Confirm Plant Identity</div>
                <button
                  style={styles.identifyClose}
                  onClick={() => setIdentifyVisible(false)}
                >
                  ×
                </button>
              </div>

              <div style={styles.toggleRow}>
                <button
                  type="button"
                  style={{
                    ...styles.toggleBtn,
                    ...(mode === "existing" ? styles.toggleBtnActive : null),
                  }}
                  onClick={() => setMode("existing")}
                >
                  Existing species
                </button>
                <button
                  type="button"
                  style={{
                    ...styles.toggleBtn,
                    ...(mode === "new" ? styles.toggleBtnActive : null),
                  }}
                  onClick={() => setMode("new")}
                >
                  New species
                </button>
              </div>

              {mode === "existing" && (
                <>
                  <div style={styles.identifyLabel}>Select existing species</div>
                  <select
                    style={styles.identifySelect}
                    value={selectedSpeciesId || ""}
                    onChange={(e) => {
                      const value = e.target.value ? Number(e.target.value) : null;
                      setSelectedSpeciesId(value);

                      const selected = speciesOptions.find(
                        (s) => s.species_id === value
                      );
                      if (selected && selected.scientific_name) {
                        setIdentifiedName(selected.scientific_name);
                      }
                    }}
                  >
                    <option value="">Select a species...</option>
                    {speciesOptions.map((s) => (
                      <option key={s.species_id} value={s.species_id}>
                        {s.display_name ||
                          s.common_name ||
                          s.scientific_name ||
                          `Species ${s.species_id}`}
                      </option>
                    ))}
                  </select>

                  <div style={styles.identifyLabel}>Or type scientific name</div>
                  <input
                    style={styles.identifyInput}
                    value={identifiedName}
                    onChange={(e) => setIdentifiedName(e.target.value)}
                    placeholder="e.g. casuarina_equisetifolia"
                  />
                </>
              )}

              {mode === "new" && (
                <>
                  <div style={styles.identifyLabel}>Scientific name</div>
                  <input
                    style={styles.identifyInput}
                    value={newScientificName}
                    onChange={(e) => setNewScientificName(e.target.value)}
                    placeholder="e.g. Casuarina equisetifolia"
                  />

                  <div style={styles.identifyLabel}>Common name</div>
                  <input
                    style={styles.identifyInput}
                    value={newCommonName}
                    onChange={(e) => setNewCommonName(e.target.value)}
                    placeholder="e.g. Casuarina"
                  />

                  <div style={styles.switchRow}>
                    <span style={styles.identifyLabel}>Is endangered</span>
                    <input
                      type="checkbox"
                      checked={newIsEndangered}
                      onChange={(e) => setNewIsEndangered(e.target.checked)}
                    />
                  </div>

                  <div style={styles.identifyLabel}>Description</div>
                  <textarea
                    style={{ ...styles.identifyInput, minHeight: 80 }}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Short description of this species"
                  />
                </>
              )}

              <div style={styles.identifyActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => setIdentifyVisible(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  style={{
                    ...styles.confirmButton,
                    opacity:
                      (mode === "existing" &&
                        !selectedSpeciesId &&
                        !identifiedName.trim()) ||
                      (mode === "new" && !newScientificName.trim())
                        ? 0.6
                        : 1,
                  }}
                  disabled={
                    identifyLoading ||
                    (mode === "existing"
                      ? !selectedSpeciesId && !identifiedName.trim()
                      : !newScientificName.trim())
                  }
                  onClick={() => {
                    if (mode === "existing") {
                      handleConfirmExistingSpecies();
                    } else {
                      handleConfirmNewSpecies();
                    }
                  }}
                >
                  {identifyLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

//
// INLINE CSS — MATCHING MOBILE APP DESIGN
//
const styles = {
  container: {
    backgroundColor: '#F6F9F4',
    padding: 20,
    minHeight: '100vh',
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2A37',
    margin: '0 0 4px 0',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#4B5563',
    margin: 0,
  },
    errorBanner: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      padding: "12px 16px",
      borderRadius: "12px",
      backgroundColor: "#FEE2E2",
      color: "#7F1D1D",
      border: "1px solid #FCA5A5",
      marginBottom: "16px",
    },
    retryButton: {
      padding: "6px 12px",
      borderRadius: "8px",
      border: "none",
      backgroundColor: "#1E88E5",
      color: "#fff",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: 600,
    },
  // Search bar styles matching mobile
  searchBar: {
    marginTop: "16px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    padding: "0 14px",
    height: "44px",
    borderRadius: "14px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E2E8F0",
    gap: "8px",
    maxWidth: "500px",
  },
  searchIcon: {
    fontSize: "20px",
    color: "#64748B",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "14px",
    color: "#0F172A",
    background: "transparent",
  },
  clearButton: {
    background: "none",
    border: "none",
    fontSize: "18px",
    color: "#94A3B8",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  table: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    border: '1px solid #E2E8F0',
    boxShadow: '0 4px 6px rgba(0,0,0,0.04)',
  },
  // Table header to match mobile structure
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '1.8fr 0.9fr 120px',
    backgroundColor: '#F1F5F9',
    padding: '14px 16px',
    borderBottom: '1px solid #E2E8F0',
  },
  headerCellWide: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
  },
  headerCell: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    textAlign: 'center', 
  },
  headerCellAction: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    textAlign: 'center', 
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '1.8fr 0.9fr 120px',
    alignItems: 'center',
    padding: '14px 16px',
    borderBottom: '1px solid #E2E8F0',
  },
  cellWide: {
    display: 'flex',
    flexDirection: 'column',
  },
  plantText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  cell: {
    fontSize: 13,
    color: '#334155',
    textAlign: 'center', 
  },
  // Confidence cell with badge below score
  confidenceCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2A37',
  },
  cellAction: {
    display: 'flex',
    justifyContent: 'center', 
  },
  reviewButton: {
    padding: '6px 16px',
    borderRadius: 12,
    backgroundColor: '#6366F1',
    border: 'none',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    cursor: 'pointer',
  },
  // Empty state to match mobile
  emptyState: {
    padding: '60px 20px',
    textAlign: 'center',
  },
  emptyStateContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  emptyStateIcon: {
    fontSize: '48px',
    color: '#94A3B8',
  },
  emptyStateText: {
    fontSize: '14px',
    color: '#64748B',
    margin: 0,
  },
  // Modal Styles
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2A37',
    margin: '0 0 4px 0',
  },
  modalSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    margin: '0 0 20px 0',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
    gap: '6px',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    margin: '0 0 6px 0',
  },
  sectionValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2A37',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
  },
  sectionMeta: {
    fontSize: 12,
    color: '#64748B',
    margin: '4px 0 0 0',
  },
  actionsRow: {
    display: 'flex',
    gap: 12,
    marginTop: 20,
  },
  actionError: {
    fontSize: 12,
    color: '#B91C1C',
    marginTop: 4,
  },
  // Button colors to match mobile app
  approveButton: {
    flex: 1,
    backgroundColor: "#166534",
    borderRadius: 12,
    padding: "14px",
    border: "none",
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    cursor: "pointer",
  },
  rejectButton: {
    flex: 1,
    backgroundColor: "#ae280bff",
    borderRadius: 12,
    padding: "14px",
    border: "none",
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    cursor: "pointer",
  },
  identifyButton: {
    flex: 1,
    backgroundColor: "#1D4ED8",
    borderRadius: 12,
    padding: "14px",
    border: "none",
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    cursor: "pointer",
  },
  identifyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: 420,
    maxWidth: "90vw",
    boxShadow: "0 20px 45px rgba(15, 23, 42, 0.25)",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  fullscreenOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  identifyTitleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  identifyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  identifyClose: {
    border: "none",
    backgroundColor: "#E5E7EB",
    borderRadius: "999px",
    width: 28,
    height: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  toggleRow: {
    display: "flex",
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    padding: 3,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    border: "none",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 13,
    fontWeight: "600",
    cursor: "pointer",
    backgroundColor: "transparent",
    color: "#4B5563",
  },
  toggleBtnActive: {
    backgroundColor: "#1D4ED8",
    color: "#FFFFFF",
  },
  identifyLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 4,
  },
  identifySelect: {
    width: "100%",
    borderRadius: 10,
    border: "1px solid #CBD5E1",
    padding: "8px 10px",
    fontSize: 14,
    marginBottom: 10,
  },
  identifyInput: {
    width: "100%",
    borderRadius: 10,
    border: "1px solid #CBD5E1",
    padding: "8px 10px",
    fontSize: 14,
    boxSizing: "border-box",
    marginBottom: 10,
  },
  switchRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  identifyActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },
  cancelButton: {
    padding: "10px 16px",
    backgroundColor: "transparent",
    border: "none",
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    cursor: "pointer",
  },
  confirmButton: {
    padding: "10px 18px",
    borderRadius: 10,
    backgroundColor: "#1D4ED8",
    border: "none",
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    cursor: "pointer",
  },
  
};