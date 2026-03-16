import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Party, loadPartiesFromStorage } from "./Types";
import "./Addpartymodal.css";

// ── Inline SVG Icons ──────────────────────────────────────────────────────────
const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

interface Props {
  onSelect: (party: Party) => void;
  onClose: () => void;
}

const AddPartyModal: React.FC<Props> = ({ onSelect, onClose }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [parties, setParties] = useState<Party[]>([]);

  // Load parties from localStorage on mount (same source as Parties.tsx)
  useEffect(() => {
    setParties(loadPartiesFromStorage());

    // Also react to storage changes (e.g. party created in another tab)
    const onStorage = () => setParties(loadPartiesFromStorage());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const filtered = parties.filter(p => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.mobile && p.mobile !== "-" && p.mobile.includes(search))
    );
  });

  const handleCreateNewParty = () => {
    onClose();
    navigate("/cashier/create-party");
  };

  return (
    <div className="aa-apm-overlay" onClick={onClose}>
      <div className="aa-apm-modal" onClick={e => e.stopPropagation()}>
        <div className="aa-apm-header">
          <h2>Select Party</h2>
          <button className="aa-apm-close" onClick={onClose}><IconClose /></button>
        </div>

        <div className="aa-apm-search-wrap">
          <IconSearch />
          <input
            autoFocus
            className="aa-apm-search"
            placeholder="Search party by name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="aa-apm-list-header">
          <span>Party Name</span>
          <span>Balance</span>
        </div>
        <div className="aa-apm-list">
          {filtered.length === 0 ? (
            <div className="aa-apm-empty">No parties found</div>
          ) : (
            filtered.map(party => (
              <div key={party.id} className="aa-apm-item" onClick={() => onSelect(party)}>
                <div className="aa-apm-item-name">{party.name}</div>
                <div className="aa-apm-item-balance">
                  ₹ {Math.abs(party.balance || 0).toLocaleString("en-IN")}
                  {(party.balance || 0) < 0 && <span className="aa-apm-bal-up">↑</span>}
                  {(party.balance || 0) > 0 && <span className="aa-apm-bal-down">↓</span>}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="aa-apm-footer">
          <button className="aa-apm-create-btn" onClick={handleCreateNewParty}>
            + Create New Party
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPartyModal;