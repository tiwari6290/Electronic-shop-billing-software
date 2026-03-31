import api from "@/lib/axios";

/* =====================================
   CREATE PAYMENT
===================================== */
export const createPaymentOut = (data: any) => {
  return api.post("/payment-out", data);
};

/* =====================================
   GET ALL PAYMENTS
===================================== */
export const getAllPaymentOut = () => {
  return api.get("/payment-out");
};

/* =====================================
   GET SINGLE PAYMENT
===================================== */
export const getPaymentOutById = (id: number) => {
  return api.get(`/payment-out/${id}`);
};

/* =====================================
   DELETE PAYMENT
===================================== */
export const deletePaymentOut = (id: number) => {
  return api.delete(`/payment-out/${id}`);
};

/* =====================================
   GET PAYMENT OUT SETTINGS
===================================== */
export const getPaymentOutSettings = () => {
  return api.get("/payment-out/settings");
};

/* =====================================
   UPDATE PAYMENT OUT SETTINGS
===================================== */
export const updatePaymentOutSettings = (data: {
  prefix: string;
}) => {
  return api.put("/payment-out/settings", data);
};