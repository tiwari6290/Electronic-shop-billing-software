import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./PartyProfile.css";
import axios from "axios";
interface PartyData {
  id: number;
  name: string;
  mobile: string;
  category: string;
  type: string;
  balance: number;

  // extended fields (from CreateParty)
  email?: string;
  gstin?: string;
  panNumber?: string;
  billingAddress?: string;
  shippingAddress?: string;
  creditPeriod?: string;
  creditLimit?: string;
}

const PartyProfile: React.FC = () => {
  const { id } = useParams();
  const [party, setParty] = useState<PartyData | null>(null);

 useEffect(() => {
  const fetchParty = async () => {
    try {
      const res = await axios.get(
        `http://localhost:4000/api/parties/${id}`
      );

      const p = res.data;

      setParty({
        id: p.id,
        name: p.partyName,
        mobile: p.mobileNumber || "-",
        category: p.partyCategory || "-",
        type: p.partyType,
        balance:
          p.openingBalanceType === "To_Collect"
            ? Number(p.openingBalance || 0)
            : -Number(p.openingBalance || 0),
        email: p.email,
        gstin: p.gstin,
        panNumber: p.panNumber,
        billingAddress: p.billingAddress,
        shippingAddress: p.shippingAddress,
        creditPeriod: p.creditPeriod?.toString(),
        creditLimit: p.creditLimit?.toString(),
      });
    } catch (error) {
      console.error("Error fetching party:", error);
    }
  };

  if (id) fetchParty();
}, [id]);

  if (!party) return <div>Loading...</div>;

  return (
    <div className="profile-container">

      {/* GENERAL DETAILS */}
      <div className="profile-card">
        <h3>General Details</h3>

        <p><strong>Party Name:</strong> {party.name}</p>
        <p><strong>Party Type:</strong> {party.type}</p>
        <p><strong>Mobile Number:</strong> {party.mobile}</p>
        <p><strong>Email:</strong> {party.email || "-"}</p>
        <p><strong>Opening Balance:</strong> ₹ {party.balance}</p>
      </div>

      {/* BUSINESS DETAILS */}
      <div className="profile-card">
        <h3>Business Details</h3>

        <p><strong>GSTIN:</strong> {party.gstin || "-"}</p>
        <p><strong>PAN Number:</strong> {party.panNumber || "-"}</p>
        <p><strong>Billing Address:</strong> {party.billingAddress || "-"}</p>
        <p><strong>Shipping Address:</strong> {party.shippingAddress || "-"}</p>
      </div>

      {/* CREDIT DETAILS */}
      <div className="profile-card">
        <h3>Credit Details</h3>

        <p><strong>Credit Period:</strong> {party.creditPeriod || "-"} Days</p>
        <p><strong>Credit Limit:</strong> ₹ {party.creditLimit || "-"}</p>
      </div>

    </div>
  );
};

export default PartyProfile;
