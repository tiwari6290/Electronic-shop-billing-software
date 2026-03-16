import api from "../lib/axios";

export interface CreatePartyPayload {
  partyName: string;
  mobile?: string;
  email?: string;
  gstin?: string;
  pan?: string;
  partyType: "Customer" | "Supplier";
  category?: string;
  billingAddress?: string;
  shippingAddress?: string;
  creditPeriod?: number;
  creditLimit?: number;
  openingBalance?: number;
  openingBalanceType?: "To_Collect" | "To_Pay"; // ✅ FIXED
}

/* ================= CREATE ================= */
export const createParty = async (data: CreatePartyPayload) => {
  const response = await api.post("/parties", data);
  return response.data;
};

/* ================= GET ALL ================= */
export const getAllParties = async () => {
  const response = await api.get("/parties");
  return response.data;
};

/* ================= GET ONE ================= */
export const getPartyById = async (id: number) => {
  const response = await api.get(`/parties/${id}`);
  return response.data;
};

/* ================= UPDATE ================= */
export const updateParty = async (
  id: number,
  data: Partial<CreatePartyPayload>
) => {
  const response = await api.put(`/parties/${id}`, data);
  return response.data;
};