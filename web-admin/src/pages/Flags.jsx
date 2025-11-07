import React, { useEffect, useState } from "react";
import axios from "../utils/axios";

export default function FlaggedPlants() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showIdentifyModal, setShowIdentifyModal] = useState(false);
  const [identifiedName, setIdentifiedName] = useState("");

  // ✅ Updated Mock data (matching mobile version structure)
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

  useEffect(() => {
    const loadFlagged = async () => {
      try {
        const res = await axios.get("/admin/flagged");
        setItems(res.data);
      } catch (e) {
        console.warn("Backend not ready, using mock data.");
        setItems(MOCK_FLAGGED);
      } finally {
        setLoading(false);
      }
    };
    loadFlagged();
  }, []);

  // ✅ Search filter
  const filtered = items.filter((item) =>
    Object.values(item).some((v) =>
      v.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // ✅ Utility functions
  const toPercent = (score) => `${Math.round(score * 100)}%`;

  const formatDate = (iso) => {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
  };

  // ✅ Modal handlers
  const handleReview = (observation) => {
    setSelectedObservation(observation);
    setShowReviewModal(true);
  };

  const handleCloseModal = () => {
    setShowReviewModal(false);
    setSelectedObservation(null);
    setShowImageModal(false);
    setShowIdentifyModal(false);
    setIdentifiedName("");
  };

  const handleApprove = () => {
    if (window.confirm('Are you sure you want to approve this observation?')) {
      // Remove from list
      setItems(prev => prev.filter(item => item.observation_id !== selectedObservation.observation_id));
      alert(`Observation ${selectedObservation.observation_id} has been approved.`);
      handleCloseModal();
    }
  };

  const handleIdentify = () => {
    setShowIdentifyModal(true);
  };

  const handleSaveIdentification = () => {
    if (identifiedName.trim()) {
      // Remove from list and record identification
      setItems(prev => prev.filter(item => item.observation_id !== selectedObservation.observation_id));
      alert(`Recorded as ${identifiedName}.`);
      handleCloseModal();
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading flagged plants...</div>;

  return (
    <>
      {/* ✅ Embedded CSS for modals */}
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

          .photo-wrapper {
            position: relative;
            cursor: pointer;
            border-radius: 18px;
            overflow: hidden;
            margin-bottom: 20px;
          }

          .photo {
            width: 100%;
            height: 220px;
            object-fit: cover;
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
          }

          .image-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            padding: 20px;
          }

          .image-modal-content {
            position: relative;
            max-width: 90%;
            max-height: 90%;
          }

          .image-modal-image {
            max-width: 100%;
            max-height: 80vh;
            border-radius: 12px;
          }

          .image-modal-close {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #1E88E5;
            color: white;
            border: none;
            border-radius: 999px;
            padding: 10px 24px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
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
        `}
      </style>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Flag Unsure Queue</h1>
          <p style={styles.headerSubtitle}>
            AI low-confidence identifications awaiting manual review.
          </p>
        </div>

        {/* ✅ Search bar */}
        <input
          style={styles.search}
          placeholder="Search flagged observations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <div style={styles.headerCell}>Plant</div>
            <div style={styles.headerCell}>Confidence</div>
            <div style={{ ...styles.headerCell, textAlign: 'right' }}>Action</div>
          </div>

          {filtered.length === 0 ? (
            <div style={styles.emptyState}>
              No flagged observations pending review.
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.observation_id} style={styles.tableRow}>
                <div style={styles.cellWide}>
                  <div style={styles.plantText}>{item.plant_name}</div>
                  <div style={styles.metaText}>
                    Obs {item.observation_id} • {item.location}
                  </div>
                </div>
                <div style={styles.cell}>{toPercent(item.confidence)}</div>
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

        {/* ✅ Review Modal */}
        {showReviewModal && selectedObservation && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
              
              <div className="modal-scroll">
                <div className="photo-wrapper" onClick={() => setShowImageModal(true)}>
                  <img 
                    src={selectedObservation.photo} 
                    alt={selectedObservation.plant_name}
                    className="photo"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzIxMy44MDcgMTUwIDIyNSAxMzguODA3IDIyNSAxMjVDMjI1IDExMS4xOTMgMjEzLjgwNyAxMDAgMjAwIDEwMEMxODYuMTkzIDEwMCAxNzUgMTExLjE5MyAxNzUgMTI1QzE3NSAxMzguODA3IDE4Ni4xOTMgMTUwIDIwMCAxNTBaTTIwMCAxNzVDMTczLjM4NiAxNzUgMTUwIDE5Ny4zODYgMTUwIDIyNEgxNzVDMTc1IDIwNS4xNjkgMTgxLjE2OSAxODcgMjAwIDE4N0MyMTguODMxIDE4NyAyMjUgMjA1LjE2OSAyMjUgMjI0SDI1MEMyNTAgMTk3LjM4NiAyMjYuNjE0IDE3NSAyMDAgMTc1WiIgZmlsbD0iIzlDQTVCOSIvPgo8L3N2Zz4K';
                    }}
                  />
                  <div className="resize-badge">🔍</div>
                </div>

                <h1 style={styles.modalTitle}>{selectedObservation.plant_name}</h1>
                <div style={styles.modalSubtitle}>Observation {selectedObservation.observation_id}</div>

                <div style={styles.section}>
                  <div style={styles.sectionLabel}>Confidence</div>
                  <div style={styles.sectionValue}>{Math.round(selectedObservation.confidence * 100)}%</div>
                </div>

                <div style={styles.section}>
                  <div style={styles.sectionLabel}>Location</div>
                  <div style={styles.sectionValue}>{selectedObservation.location}</div>
                </div>

                <div style={styles.section}>
                  <div style={styles.sectionLabel}>Submitted</div>
                  <div style={styles.sectionValue}>{formatDate(selectedObservation.submitted_at)}</div>
                  <div style={styles.sectionMeta}>Flagged by {selectedObservation.user}</div>
                </div>

                <div style={styles.actionsRow}>
                  <button style={styles.approveButton} onClick={handleApprove}>
                    Approve
                  </button>
                  <button style={styles.identifyButton} onClick={handleIdentify}>
                    Identify
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Image Preview Modal */}
        {showImageModal && selectedObservation && (
          <div className="image-modal-overlay" onClick={() => setShowImageModal(false)}>
            <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
              <img 
                src={selectedObservation.photo} 
                alt={selectedObservation.plant_name}
                className="image-modal-image"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzIxMy44MDcgMTUwIDIyNSAxMzguODA3IDIyNSAxMjVDMjI1IDExMS4xOTMgMjEzLjgwNyAxMDAgMjAwIDEwMEMxODYuMTkzIDEwMCAxNzUgMTExLjE5MyAxNzUgMTI1QzE3NSAxMzguODA3IDE4Ni4xOTMgMTUwIDIwMCAxNTBaTTIwMCAxNzVDMTczLjM4NiAxNzUgMTUwIDE5Ny4zODYgMTUwIDIyNEgxNzVDMTc1IDIwNS4xNjkgMTgxLjE2OSAxODcgMjAwIDE4N0MyMTguODMxIDE4NyAyMjUgMjA1LjE2OSAyMjUgMjI0SDI1MEMyNTAgMTk3LjM4NiAyMjYuNjE0IDE3NSAyMDAgMTc1WiIgZmlsbD0iIzlDQTVCOSIvPgo8L3N2Zz4K';
                }}
              />
              <button 
                className="image-modal-close" 
                onClick={() => setShowImageModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* ✅ Identify Modal */}
        {showIdentifyModal && (
          <div className="identify-modal-overlay" onClick={() => setShowIdentifyModal(false)}>
            <div className="identify-modal-content" onClick={(e) => e.stopPropagation()}>
              <h3 className="identify-title">Confirm Plant Identity</h3>
              <div className="identify-label">Plant Name</div>
              <input
                type="text"
                className="identify-input"
                value={identifiedName}
                onChange={(e) => setIdentifiedName(e.target.value)}
                placeholder="Enter confirmed plant name"
                autoFocus
              />
              <div className="identify-actions">
                <button 
                  className="cancel-button"
                  onClick={() => setShowIdentifyModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="confirm-button"
                  disabled={!identifiedName.trim()}
                  onClick={handleSaveIdentification}
                >
                  Save
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
// ✅ INLINE CSS — MATCHING MOBILE APP DESIGN
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
  search: {
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #E2E8F0',
    width: '30%',
    marginBottom: 16,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
  },
  table: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    border: '1px solid #E2E8F0',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '1.8fr 0.9fr 120px',
    backgroundColor: '#F1F5F9',
    padding: '14px 16px',
    borderBottom: '1px solid #E2E8F0',
  },
  headerCell: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
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
  },
  cellAction: {
    display: 'flex',
    justifyContent: 'flex-end',
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
  emptyState: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#4B5563',
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
  approveButton: {
    flex: 1,
    backgroundColor: '#22C55E',
    borderRadius: 12,
    padding: '14px',
    border: 'none',
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    cursor: 'pointer',
  },
  identifyButton: {
    flex: 1,
    backgroundColor: '#1E88E5',
    borderRadius: 12,
    padding: '14px',
    border: 'none',
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    cursor: 'pointer',
  },
};