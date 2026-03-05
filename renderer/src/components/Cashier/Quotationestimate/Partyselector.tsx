import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Party, getParties } from "./Quotationtypes";
import "./PartySelector.css";

interface PartySelectorProps {
  selectedParty: Party | null;
  onSelectParty: (party: Party | null) => void;
}

export default function PartySelector({ selectedParty, onSelectParty }: PartySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const parties = getParties();

  useEffect(() => {
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = parties.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedParty) {
    return (
      <div className="ps-selected-wrap">
        {/* Bill To */}
        <div className="ps-address-col">
          <div className="ps-address-header">
            <span className="ps-address-title">Bill To</span>
            <button
              className="ps-change-btn"
              onClick={() => onSelectParty(null)}
            >
              Change Party
            </button>
          </div>
          <div className="ps-address-body">
            <div className="ps-party-name">{selectedParty.name}</div>
            {selectedParty.mobile && selectedParty.mobile !== "-" && (
              <div className="ps-party-info">
                Phone Number: <span>{selectedParty.mobile}</span>
              </div>
            )}
            {selectedParty.billingAddress && (
              <div className="ps-party-info">{selectedParty.billingAddress}</div>
            )}
          </div>
        </div>

        {/* Ship To */}
        <div className="ps-address-col">
          <div className="ps-address-header">
            <span className="ps-address-title">Ship To</span>
            <button className="ps-change-btn">Change Shipping Address</button>
          </div>
          <div className="ps-address-body">
            <div className="ps-party-name">{selectedParty.name}</div>
            {selectedParty.mobile && selectedParty.mobile !== "-" && (
              <div className="ps-party-info">
                Phone Number: <span>{selectedParty.mobile}</span>
              </div>
            )}
            {selectedParty.shippingAddress && (
              <div className="ps-party-info">{selectedParty.shippingAddress}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ps-wrap" ref={ref}>
      <div className="ps-label">Bill To</div>
      {!open ? (
        <button className="ps-add-btn" onClick={() => setOpen(true)}>
          + Add Party
        </button>
      ) : (
        <div className="ps-dropdown">
          <div className="ps-search-row">
            <input
              autoFocus
              className="ps-search-input"
              placeholder="Search party by name or number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg className="ps-search-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          <div className="ps-list-header">
            <span>Party Name</span>
            <span>Balance</span>
          </div>
          <div className="ps-list">
            {filtered.length === 0 && (
              <div className="ps-no-results">No parties found</div>
            )}
            {filtered.map((p) => (
              <div
                key={p.id}
                className="ps-list-item"
                onClick={() => {
                  onSelectParty(p);
                  setOpen(false);
                  setSearch("");
                }}
              >
                <span className="ps-item-name">{p.name}</span>
                <span className="ps-item-balance">
                  ₹ {Math.abs(p.balance).toLocaleString("en-IN")}
                  {p.balance < 0 && (
                    <svg className="ps-balance-arrow ps-balance-arrow--down" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <polyline points="5 12 12 19 19 12" />
                    </svg>
                  )}
                </span>
              </div>
            ))}
          </div>
          <button className="ps-create-btn" onClick={() => navigate("/cashier/create-party")}>
            + Create Party
          </button>
        </div>
      )}
    </div>
  );
}