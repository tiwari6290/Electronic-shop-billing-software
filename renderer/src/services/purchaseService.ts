import api from "../lib/axios";

/* ================= CREATE ================= */

export const createPurchaseInvoice = async (data:any) => {
  const res = await api.post("/purchase-invoices", data);
  return res.data;
};

/* ================= GET ALL ================= */

export const getAllPurchaseInvoices = async () => {
  const res = await api.get("/purchase-invoices");
  return res.data;
};

/* ================= GET ONE ================= */

export const getPurchaseInvoiceById = async (id:number) => {
  const res = await api.get(`/purchase-invoices/${id}`);
  return res.data;
};

/* ================= UPDATE ================= */

export const updatePurchaseInvoice = async (id:number,data:any) => {
  const res = await api.put(`/purchase-invoices/${id}`,data);
  return res.data;
};

/* ================= DELETE ================= */

export const deletePurchaseInvoice = async (id:number) => {
  const res = await api.delete(`/purchase-invoices/${id}`);
  return res.data;
};

/* ================= RECORD PAYMENT ================= */

export const recordPurchasePayment = async (id:number,amount:number) => {
  const res = await api.patch(`/purchase-invoices/${id}/payment`,{
    amount
  });
  return res.data;
};

/* ================= SUMMARY ================= */

export const getPurchaseSummary = async () => {
  const res = await api.get("/purchase-invoices/summary");
  return res.data;
};