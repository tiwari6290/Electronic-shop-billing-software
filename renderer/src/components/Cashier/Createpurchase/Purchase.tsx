import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import "./Purchase.css";
import {
  createPurchaseInvoice,
  updatePurchaseInvoice,
  getAllPurchaseInvoices,
  deletePurchaseInvoice,
  recordPurchasePayment,
} from "@/services/purchaseService";
import api from "@/lib/axios";
import { getAllParties } from "@/services/partyService";

/* ══════════════════════════════════════════ ICONS ══ */
const IC = {
  Report: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Chevron: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  ChevronL: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  ChevronR: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Settings: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Monitor: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  Search: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Calendar: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Dots: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  ),
  X: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Edit: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  History: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
    </svg>
  ),
  Copy: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  Note: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  Trash: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  ),
  Cart: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  Check: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Alert: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Plus: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Upload: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  ),
  Back: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  Barcode: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 5v14M7 5v14M11 5v14M15 5v14M19 5v14M21 5v4M21 15v4M21 9v2" />
    </svg>
  ),
  Info: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Gear: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  ),
  ArrowUp: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  ),
  AddCircle: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="12" fill="#4361ee" />
      <line
        x1="12"
        y1="7"
        x2="12"
        y2="17"
        stroke="white"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <line
        x1="7"
        y1="12"
        x2="17"
        y2="12"
        stroke="white"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </svg>
  ),
  Mail: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Download: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Print: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  ),
  Star: () => (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Share: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  Refresh: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
  Pen: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
};

/* ══════════════════════════════════════════ TYPES ══ */
type InvoiceStatus = "paid" | "unpaid" | "partial" | "";
type PageMode =
  | "list"
  | "create"
  | "edit"
  | "duplicate"
  | "gstr2"
  | "daybook"
  | "view";

interface InvoiceItem {
  id: number;
  productId?: number;
  godownId?: number | null;
  rowId?: number;
  name: string;
  hsn: string;
  qty: number;
  price: number;
  discount: number;
  discountPct: number;
  tax: number;
  taxLabel?: string;
}

interface AdditionalCharge {
  id: number;
  label: string;
  amount: number;
  taxRate: string;
}
interface ShippingAddr {
  name: string;
  phone: string;
  addr: string;
  city: string;
  state: string;
  pin: string;
  isSame: boolean;
}

interface RawPurchaseInvoice {
  id: number;
  purchaseInvNo: string | number;
  invoiceDate: string;
  dueDate?: string;
  totalAmount: number;
  amountPaid: number;
  status: string;
  paymentMode?: string;
  discountAmount?: number;
  roundOff?: number;
  partyId: number;
  party?: {
    partyName?: string;
    name?: string;
    mobileNumber?: string;
    phone?: string;
    gstin?: string;
    pan?: string;
  };
  items?: RawInvoiceItem[];
  additionalCharges?: RawAdditionalCharge[];
}
interface RawInvoiceItem {
  id?: number;
  productId?: number;
  godownId?: number | null;
  hsnSac?: string;
  quantity: number;
  price: number;
  discount?: number;
  taxRate?: number;
  product?: { name?: string };
}
interface RawAdditionalCharge {
  id: number;
  name: string;
  amount: number;
}

interface Invoice {
  id: number;
  date: string;
  invoiceNumber: number | string;
  partyName: string;
  partyId: number;
  partyPhone: string;
  partyPan: string;
  dueIn: string;
  amount: number;
  status: InvoiceStatus;
  items: InvoiceItem[];
  additionalCharges: AdditionalCharge[];
  shipping: ShippingAddr;
  discountEnabled: boolean;
  discountType: "%" | "₹";
  discountVal: number;
  roundOff: boolean;
  roundOffDir: string;
  roundOffVal: number;
  amtPaid: number;
  payMethod: string;
}

interface AppSettings {
  prefixEnabled: boolean;
  prefix: string;
  sequenceNumber: number;
  showItemImage: boolean;
  enablePriceHistory: boolean;
}
type DateFilter =
  | "Today"
  | "Yesterday"
  | "This Week"
  | "Last Week"
  | "Last 7 Days"
  | "This Month"
  | "Previous Month"
  | "Last 30 Days"
  | "Last 365 Days"
  | "Custom";
type SearchType = "Invoice No. & Party name" | "Mobile Number";
interface Party {
  id: number;
  name: string;
  phone: string;
  pan: string;
  balance: number;
}
interface CatalogItem {
  id: number;
  name: string;
  code: string;
  hsn: string;
  stock: string;
  salesPrice: number;
  purchasePrice: number;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
const fmtShort = (d: Date) =>
  `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
const fmtMoney = (n: number) =>
  n === 0 ? "₹0" : `₹${Math.abs(n).toLocaleString("en-IN")}`;
const fmtAmt = (n: number) => `₹ ${n.toLocaleString("en-IN")}`;
const todayStr = () => {
  const d = new Date();
  return `${d.getDate().toString().padStart(2, "0")} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]} ${d.getFullYear()}`;
};
const fmtDateDDMM = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getFullYear()}`;
};
const fmtDateTime = (dateStr: string) => {
  const d = new Date(dateStr);
  const h = d.getHours(),
    m = d.getMinutes();
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()} ${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

function getRange(f: DateFilter, from?: Date, to?: Date): [Date, Date] {
  const t = new Date(),
    s = new Date(t),
    e = new Date(t);
  switch (f) {
    case "Yesterday":
      s.setDate(t.getDate() - 1);
      e.setDate(t.getDate() - 1);
      break;
    case "This Week":
      s.setDate(t.getDate() - t.getDay());
      break;
    case "Last Week": {
      const d = t.getDay();
      s.setDate(t.getDate() - d - 7);
      e.setDate(t.getDate() - d - 1);
      break;
    }
    case "Last 7 Days":
      s.setDate(t.getDate() - 6);
      break;
    case "This Month":
      s.setDate(1);
      break;
    case "Previous Month":
      s.setMonth(t.getMonth() - 1, 1);
      e.setDate(0);
      break;
    case "Last 30 Days":
      s.setDate(t.getDate() - 29);
      break;
    case "Last 365 Days":
      s.setFullYear(t.getFullYear() - 1);
      break;
    case "Custom":
      if (from && to) return [from, to];
      break;
  }
  s.setHours(0, 0, 0, 0);
  e.setHours(23, 59, 59, 999);
  return [s, e];
}

const DATE_OPTS: DateFilter[] = [
  "Today",
  "Yesterday",
  "This Week",
  "Last Week",
  "Last 7 Days",
  "This Month",
  "Previous Month",
  "Last 30 Days",
  "Last 365 Days",
  "Custom",
];

/* ══════════════════════════════════════════ GST OPTIONS ══ */
const GST_OPTIONS: { label: string; rate: number }[] = [
  { label: "None", rate: 0 },
  { label: "Exempted", rate: 0 },
  { label: "GST @ 0%", rate: 0 },
  { label: "GST @ 0.1%", rate: 0.1 },
  { label: "GST @ 0.25%", rate: 0.25 },
  { label: "GST @ 1.5%", rate: 1.5 },
  { label: "GST @ 3%", rate: 3 },
  { label: "GST @ 5%", rate: 5 },
  { label: "GST @ 6%", rate: 6 },
  { label: "GST @ 8.9%", rate: 8.9 },
  { label: "GST @ 12%", rate: 12 },
  { label: "GST @ 13.8%", rate: 13.8 },
  { label: "GST @ 18%", rate: 18 },
  { label: "GST @ 14% + cess @ 12%", rate: 26 },
  { label: "GST @ 28%", rate: 28 },
];

const defaultShipping = (name: string, phone: string): ShippingAddr => ({
  name,
  phone,
  addr: "",
  city: "",
  state: "",
  pin: "",
  isSame: true,
});

/* ══════════════════════════════════════════ TAX DROPDOWN ══ */
function TaxDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (label: string, rate: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const display = value || "None";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: "1px solid #d0d5dd",
          borderRadius: 5,
          padding: "5px 8px",
          fontSize: 11,
          cursor: "pointer",
          background: "#fff",
          minWidth: 145,
          gap: 4,
          userSelect: "none",
          color: display === "None" ? "#98a2b3" : "#1a2332",
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 115,
          }}
        >
          {display}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: 11, height: 11, color: "#667085", flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            zIndex: 9999,
            background: "#fff",
            border: "1px solid #e4e7ec",
            borderRadius: 7,
            boxShadow: "0 8px 28px rgba(0,0,0,0.14)",
            minWidth: 210,
            maxHeight: 300,
            overflowY: "auto",
          }}
        >
          {GST_OPTIONS.map((opt) => {
            const isSelected = opt.label === display;
            return (
              <div
                key={opt.label}
                onClick={() => {
                  onChange(opt.label, opt.rate);
                  setOpen(false);
                }}
                style={{
                  padding: "8px 14px",
                  fontSize: 12,
                  cursor: "pointer",
                  color: isSelected ? "#4361ee" : "#344054",
                  background: isSelected ? "#f0f3ff" : "transparent",
                  fontWeight: isSelected ? 600 : 400,
                  borderBottom: "1px solid #f2f4f7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected)
                    (e.currentTarget as HTMLDivElement).style.background =
                      "#f9fafb";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected)
                    (e.currentTarget as HTMLDivElement).style.background =
                      "transparent";
                }}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#4361ee"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ width: 13, height: 13 }}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════ CALENDAR ══ */
function CalendarPicker({
  onApply,
  onCancel,
}: {
  onApply: (f: Date, t: Date) => void;
  onCancel: () => void;
}) {
  const today = new Date();
  const [vy, setVy] = useState(today.getFullYear());
  const [vm, setVm] = useState(today.getMonth());
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [hov, setHov] = useState<Date | null>(null);

  const prev = () => {
    if (vm === 0) {
      setVm(11);
      setVy((y) => y - 1);
    } else setVm((m) => m - 1);
  };
  const next = () => {
    if (vm === 11) {
      setVm(0);
      setVy((y) => y + 1);
    } else setVm((m) => m + 1);
  };

  const cells = () => {
    const f = new Date(vy, vm, 1),
      l = new Date(vy, vm + 1, 0),
      a: (Date | null)[] = [];
    for (let i = 0; i < f.getDay(); i++) a.push(null);
    for (let d = 1; d <= l.getDate(); d++) a.push(new Date(vy, vm, d));
    while (a.length % 7 !== 0) a.push(null);
    return a;
  };

  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const inR = (d: Date) => {
    const e2 = end || hov;
    if (!start || !e2) return false;
    const mn = start < e2 ? start : e2,
      mx = start < e2 ? e2 : start;
    return d > mn && d < mx;
  };

  const pick = (d: Date) => {
    if (!start || (start && end)) {
      setStart(d);
      setEnd(null);
    } else {
      if (d < start) {
        setEnd(start);
        setStart(d);
      } else setEnd(d);
    }
  };

  const cs = cells();

  return (
    <div className="pi-cal-overlay">
      <div className="pi-cal-header-row">
        <div className="pi-cal-section">
          <div className="pi-cal-section-label">Select Start Date</div>
          <div className="pi-cal-section-value">
            {start ? fmtShort(start) : ""}
          </div>
        </div>
        <div className="pi-cal-sep" />
        <div className="pi-cal-section">
          <div className="pi-cal-section-label">Select End Date</div>
          <div className="pi-cal-section-value">{end ? fmtShort(end) : ""}</div>
        </div>
      </div>
      <div className="pi-cal-nav">
        <button className="pi-cal-nav-btn" onClick={prev}>
          <IC.ChevronL />
        </button>
        <span className="pi-cal-month-label">
          {MONTHS[vm]} {vy}
        </span>
        <button className="pi-cal-nav-btn" onClick={next}>
          <IC.ChevronR />
        </button>
      </div>
      <table className="pi-cal-grid">
        <thead>
          <tr>
            {DAYS.map((d) => (
              <th key={d}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: cs.length / 7 }, (_, r) => (
            <tr key={r}>
              {cs.slice(r * 7, r * 7 + 7).map((d, i) => {
                if (!d) return <td key={i} />;
                const isSel =
                  !!(start && same(d, start)) || !!(end && same(d, end));
                const isStart = !!(start && same(d, start)),
                  isEnd = !!(end && same(d, end));
                let cls = "pi-cal-day";
                if (isStart && end) cls += " range-start";
                else if (isEnd) cls += " range-end";
                else if (isSel) cls += " selected";
                if (!isSel && inR(d)) cls += " in-range";
                if (same(d, today) && !isSel) cls += " today";
                return (
                  <td key={i}>
                    <button
                      className={cls}
                      onClick={() => pick(d)}
                      onMouseEnter={() => setHov(d)}
                      onMouseLeave={() => setHov(null)}
                    >
                      {d.getDate()}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pi-cal-footer">
        <button className="pi-cal-cancel" onClick={onCancel}>
          CANCEL
        </button>
        <button
          className="pi-cal-ok"
          onClick={() => {
            if (start && end) onApply(start, end);
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SINGLE DATE PICKER
══════════════════════════════════════════════════════════ */
function SingleDatePicker({
  value,
  onApply,
  onCancel,
  compact,
}: {
  value: Date;
  onApply: (d: Date) => void;
  onCancel: () => void;
  compact?: boolean;
}) {
  const today = new Date();
  const [vy, setVy] = useState(value.getFullYear());
  const [vm, setVm] = useState(value.getMonth());
  const [sel, setSel] = useState<Date>(value);

  const prev = () => {
    if (vm === 0) {
      setVm(11);
      setVy((y) => y - 1);
    } else setVm((m) => m - 1);
  };
  const next = () => {
    if (vm === 11) {
      setVm(0);
      setVy((y) => y + 1);
    } else setVm((m) => m + 1);
  };

  const cells = () => {
    const f = new Date(vy, vm, 1),
      l = new Date(vy, vm + 1, 0),
      a: (Date | null)[] = [];
    for (let i = 0; i < f.getDay(); i++) a.push(null);
    for (let d = 1; d <= l.getDate(); d++) a.push(new Date(vy, vm, d));
    while (a.length % 7 !== 0) a.push(null);
    return a;
  };

  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const cs = cells();
  const selLabel = `${sel.getDate().toString().padStart(2, "0")} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][sel.getMonth()]} ${sel.getFullYear()}`;
  const YEAR_OPTS = Array.from(
    { length: 10 },
    (_, i) => today.getFullYear() - 5 + i,
  );

  return (
    <div className={`sdp-overlay${compact ? " sdp-compact" : ""}`}>
      <div className="sdp-selected-label">{selLabel}</div>
      <div className="sdp-nav">
        <button className="pi-cal-nav-btn" onClick={prev}>
          <IC.ChevronL />
        </button>
        <div className="sdp-month-year">
          <select
            className="sdp-month-sel"
            value={vm}
            onChange={(e) => setVm(Number(e.target.value))}
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i}>
                {m}
              </option>
            ))}
          </select>
          <select
            className="sdp-year-sel"
            value={vy}
            onChange={(e) => setVy(Number(e.target.value))}
          >
            {YEAR_OPTS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <button className="pi-cal-nav-btn" onClick={next}>
          <IC.ChevronR />
        </button>
      </div>
      <table className="pi-cal-grid">
        <thead>
          <tr>
            {DAYS.map((d) => (
              <th key={d}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: cs.length / 7 }, (_, r) => (
            <tr key={r}>
              {cs.slice(r * 7, r * 7 + 7).map((d, i) => {
                if (!d) return <td key={i} />;
                const isSel = same(d, sel),
                  isToday = same(d, today);
                let cls = "pi-cal-day";
                if (isSel) cls += " selected";
                else if (isToday) cls += " today";
                return (
                  <td key={i}>
                    <button className={cls} onClick={() => setSel(new Date(d))}>
                      {d.getDate()}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pi-cal-footer">
        <button className="pi-cal-cancel" onClick={onCancel}>
          CANCEL
        </button>
        <button className="pi-cal-ok" onClick={() => onApply(sel)}>
          OK
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   RECORD PAYMENT MODAL
══════════════════════════════════════════════════════════ */
interface RecordPaymentProps {
  invoice: Invoice;
  invoiceTotal: number;
  onClose: () => void;
  onSave: (
    amtPaid: number,
    discount: number,
    payMode: string,
    notes: string,
  ) => void;
}

function RecordPaymentModal({
  invoice,
  invoiceTotal,
  onClose,
  onSave,
}: RecordPaymentProps) {
  const [amtPaid, setAmtPaid] = useState(invoiceTotal - invoice.amtPaid);
  const [discount, setDiscount] = useState(0);
  const [payMode, setPayMode] = useState("Cash");
  const [notes, setNotes] = useState("");
  const [payDate, setPayDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(e.target as Node)
      )
        setShowDatePicker(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const payDateStr = `${payDate.getDate().toString().padStart(2, "0")} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][payDate.getMonth()]} ${payDate.getFullYear()}`;
  const pendingAmt = invoiceTotal - invoice.amtPaid;
  const balance = pendingAmt - amtPaid - discount;

  const dueDateDisplay = () => {
    if (invoice.dueIn === "-") return null;
    const d = new Date(invoice.date);
    const days = parseInt(invoice.dueIn) || 0;
    d.setDate(d.getDate() + days);
    return `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getFullYear()}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="record-payment-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rp-modal-head">
          <span className="rp-modal-title">
            Record Payment For Invoice #{invoice.invoiceNumber}
          </span>
          <button className="modal-close" onClick={onClose}>
            <IC.X />
          </button>
        </div>
        <div className="rp-modal-body">
          <div className="rp-form-side">
            <div className="rp-form-grid-2">
              <div className="form-group">
                <label>Amount Paid</label>
                <input
                  type="number"
                  value={amtPaid}
                  onChange={(e) => setAmtPaid(Number(e.target.value))}
                  className="rp-input"
                />
              </div>
              <div className="form-group">
                <label
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  Payment Out Discount{" "}
                  <span className="rp-info-icon">
                    <IC.Info />
                  </span>
                </label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="rp-input"
                />
              </div>
            </div>
            <div className="rp-form-grid-2">
              <div
                className="form-group"
                style={{ position: "relative" }}
                ref={datePickerRef}
              >
                <label>Payment Date</label>
                <div
                  className="rp-date-field"
                  onClick={() => setShowDatePicker((v) => !v)}
                  style={{ cursor: "pointer" }}
                >
                  <span className="rp-date-icon">
                    <IC.Calendar />
                  </span>
                  <span className="rp-date-val">{payDateStr}</span>
                  <span className="rp-date-caret">
                    <IC.Chevron />
                  </span>
                </div>
                {showDatePicker && (
                  <SingleDatePicker
                    value={payDate}
                    onApply={(d) => {
                      setPayDate(d);
                      setShowDatePicker(false);
                    }}
                    onCancel={() => setShowDatePicker(false)}
                    compact
                  />
                )}
              </div>
              <div className="form-group">
                <label>Payment Mode</label>
                <div style={{ position: "relative" }}>
                  <select
                    value={payMode}
                    onChange={(e) => setPayMode(e.target.value)}
                    className="rp-select"
                  >
                    <option>Cash</option>
                    <option>Bank</option>
                    <option>UPI</option>
                    <option>Cheque</option>
                  </select>
                  <span className="rp-select-arr">
                    <IC.Chevron />
                  </span>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rp-notes"
                rows={4}
              />
            </div>
          </div>
          <div className="rp-summary-side">
            <div className="rp-inv-card">
              <div className="rp-inv-card-title">
                Invoice #{invoice.invoiceNumber}
              </div>
              <div className="rp-inv-card-row">
                <span>Invoice Amount</span>
                <span>₹{invoiceTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="rp-inv-card-party">{invoice.partyName}</div>
              {dueDateDisplay() && (
                <div className="rp-inv-card-due">
                  Due Date: {dueDateDisplay()}
                </div>
              )}
            </div>
            <div className="rp-calc-section">
              <div className="rp-calc-title">Record Payment Calculation</div>
              <div className="rp-pending-box">
                <span className="rp-pending-label">Invoice Pending Amt.</span>
                <span className="rp-pending-val">
                  ₹{pendingAmt.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="rp-calc-row">
                <span>Amount Paid</span>
                <span>₹{amtPaid.toLocaleString("en-IN")}</span>
              </div>
              <div className="rp-calc-row">
                <span>Payment Out Discount</span>
                <span>₹{discount.toLocaleString("en-IN")}</span>
              </div>
              <div className="rp-calc-divider" />
              <div className="rp-calc-row rp-balance-row">
                <span>Balance Amount</span>
                <span>₹{Math.max(0, balance).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="rp-modal-foot">
          <button className="modal-btn-cancel" onClick={onClose}>
            Close
          </button>
          <button
            className="modal-btn-save"
            onClick={() => {
              if (amtPaid > pendingAmt) {
                alert("Amount exceeds pending amount");
                return;
              }
              onSave(amtPaid, discount, payMode, notes);
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   INVOICE BILL VIEW
══════════════════════════════════════════════════════════ */
interface InvoiceBillViewProps {
  invoice: Invoice;
  onBack: () => void;
  onInvoiceUpdate: (inv: Invoice) => void;
  settings: AppSettings;
}

function InvoiceBillView({
  invoice,
  onBack,
  onInvoiceUpdate,
  settings,
}: InvoiceBillViewProps) {
  const [inv, setInv] = useState<Invoice>(invoice);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showShareDD, setShowShareDD] = useState(false);
  const [showPrintDD, setShowPrintDD] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSignatureUrl(reader.result as string);
    reader.readAsDataURL(file);
    showT("Signature uploaded");
  };

  const shareRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const showT = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2400);
  };

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node))
        setShowShareDD(false);
      if (printRef.current && !printRef.current.contains(e.target as Node))
        setShowPrintDD(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const totalTax = inv.items.reduce(
    (s, i) => s + ((i.qty * i.price - i.discount) * i.tax) / 100,
    0,
  );
  const subtotal = inv.items.reduce(
    (s, i) => s + i.qty * i.price - (i.discount || 0),
    0,
  );
  const chargesTotal = inv.additionalCharges.reduce((s, c) => s + c.amount, 0);
  const discountAmt = inv.discountEnabled
    ? inv.discountType === "%"
      ? ((subtotal + chargesTotal) * inv.discountVal) / 100
      : inv.discountVal
    : 0;
  const roundOffAmt = inv.roundOff
    ? inv.roundOffDir === "+Add"
      ? inv.roundOffVal
      : -inv.roundOffVal
    : 0;
  const invoiceTotal =
    subtotal + chargesTotal - discountAmt + totalTax + roundOffAmt;

  const numToWords = (n: number): string => {
    if (n === 0) return "Zero Rupees";
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const convert = (num: number): string => {
      if (num < 20) return ones[num];
      if (num < 100)
        return (
          tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "")
        );
      if (num < 1000)
        return (
          ones[Math.floor(num / 100)] +
          " Hundred" +
          (num % 100 ? " " + convert(num % 100) : "")
        );
      if (num < 100000)
        return (
          convert(Math.floor(num / 1000)) +
          " Thousand" +
          (num % 1000 ? " " + convert(num % 1000) : "")
        );
      if (num < 10000000)
        return (
          convert(Math.floor(num / 100000)) +
          " Lakh" +
          (num % 100000 ? " " + convert(num % 100000) : "")
        );
      return (
        convert(Math.floor(num / 10000000)) +
        " Crore" +
        (num % 10000000 ? " " + convert(num % 10000000) : "")
      );
    };
    return convert(Math.round(n)) + " Rupees";
  };

  const handleSavePayment = async (
    paid: number,
    disc: number,
    payMode: string,
  ) => {
    try {
      await recordPurchasePayment(inv.id, paid);
      const newAmtPaid = inv.amtPaid + paid;
      let newStatus: InvoiceStatus = "";
      if (newAmtPaid === 0) newStatus = "unpaid";
      else if (newAmtPaid >= invoiceTotal) newStatus = "paid";
      else newStatus = "partial";
      const updated: Invoice = {
        ...inv,
        amtPaid: newAmtPaid,
        payMethod: payMode,
        status: newStatus,
        amount: invoiceTotal,
      };
      setInv(updated);
      onInvoiceUpdate(updated);
      setShowPayModal(false);
    } catch (err) {
      console.error("Payment failed", err);
    }
  };

  return (
    <div className="bill-view-page">
      <div className="bill-view-topbar">
        <div className="bill-view-topbar-left">
          <button className="report-back-btn" onClick={onBack}>
            <IC.Back />
          </button>
          <span className="bill-view-title">
            Purchase Invoice #{inv.invoiceNumber}
          </span>
          {inv.status === "unpaid" && (
            <span className="bv-badge bv-unpaid">Unpaid</span>
          )}
          {inv.status === "partial" && (
            <span className="bv-badge bv-partial">Partial</span>
          )}
          {inv.status === "paid" && (
            <span className="bv-badge bv-paid">Paid</span>
          )}
        </div>
        <div className="bill-view-topbar-right">
          <button className="report-action-btn">
            <IC.Download /> Download PDF
          </button>
          <div
            className="report-action-split"
            ref={printRef}
            style={{ position: "relative" }}
          >
            <button className="report-action-btn">
              <IC.Print /> Print PDF
            </button>
            <button
              className="report-action-btn-arr"
              onClick={() => {
                setShowPrintDD((v) => !v);
                setShowShareDD(false);
              }}
            >
              <IC.Chevron />
            </button>
            {showPrintDD && (
              <div className="bv-dropdown">
                <div
                  className="bv-dd-item"
                  onClick={() => {
                    setShowPrintDD(false);
                    showT("Print Thermal");
                  }}
                >
                  Print Thermal
                </div>
              </div>
            )}
          </div>
          <button
            className="report-action-btn"
            onClick={() => showT("Refreshed")}
          >
            <IC.Refresh />
          </button>

          <button
            className="report-action-btn"
            onClick={() => sigInputRef.current?.click()}
            title="Upload Authorised Signature"
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <IC.Pen />
            {signatureUrl ? "Change Signature" : "Upload Signature"}
          </button>
          <input
            ref={sigInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleSignatureUpload}
          />

          <div
            className="report-action-split"
            ref={shareRef}
            style={{ position: "relative" }}
          >
            <button className="report-action-btn">
              <IC.Share /> Share
            </button>
            <button
              className="report-action-btn-arr"
              onClick={() => {
                setShowShareDD((v) => !v);
                setShowPrintDD(false);
              }}
            >
              <IC.Chevron />
            </button>
            {showShareDD && (
              <div className="bv-dropdown">
                <div
                  className="bv-dd-item"
                  onClick={() => {
                    setShowShareDD(false);
                    showT("Sharing via WhatsApp");
                  }}
                >
                  <span className="bv-dd-icon bv-wa-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      style={{ width: 15, height: 15 }}
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </span>
                  Whatsapp
                </div>
                <div
                  className="bv-dd-item"
                  onClick={() => {
                    setShowShareDD(false);
                    showT("Sharing via SMS");
                  }}
                >
                  <span className="bv-dd-icon bv-sms-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ width: 15, height: 15 }}
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </span>
                  SMS
                </div>
              </div>
            )}
          </div>
          <button
            className="btn-record-payment"
            onClick={() => setShowPayModal(true)}
          >
            Record Payment Out
          </button>
        </div>
      </div>

      <div className="bill-paper-wrap">
        <div className="bill-paper">
          <div className="bill-purchase-label">PURCHASE</div>
          <div className="bill-header-row">
            <div className="bill-company-info">
              <div className="bill-company-logo">
                <span>
                  SCRATCH
                  <br />
                  WEB
                </span>
              </div>
              <div>
                <div className="bill-company-name">scratchweb.solutions</div>
                <div className="bill-company-addr">
                  WEST SHANTINAGAR ANANDNAGAR BALLY
                  <br />
                  HOWRAH SAREE HOUSE, HOWRAH, 711227
                  <br />
                  Mobile: 06289909521
                  <br />
                  Email: rakeshranjantiwan11@gmail.com
                </div>
              </div>
            </div>
            <div className="bill-meta-table">
              <table>
                <tbody>
                  <tr>
                    <td className="bill-meta-label">Purchase No.</td>
                    <td className="bill-meta-val">{inv.invoiceNumber}</td>
                  </tr>
                  <tr>
                    <td className="bill-meta-label">Purchase Date</td>
                    <td className="bill-meta-val">{fmtDateTime(inv.date)}</td>
                  </tr>
                  {inv.dueIn !== "-" && (
                    <tr>
                      <td className="bill-meta-label">Due Date</td>
                      <td className="bill-meta-val bill-meta-due">
                        {(() => {
                          const d = new Date(inv.date);
                          d.setDate(d.getDate() + (parseInt(inv.dueIn) || 0));
                          return `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getFullYear()}`;
                        })()}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bill-from-row">
            <div className="bill-from-label">BILL FROM</div>
            <div className="bill-from-name">{inv.partyName.toUpperCase()}</div>
            {inv.partyPhone && (
              <div className="bill-from-detail">Mobile: {inv.partyPhone}</div>
            )}
            {inv.partyPan && (
              <div className="bill-from-detail">PAN: {inv.partyPan}</div>
            )}
          </div>
          <table className="bill-items-table">
            <thead>
              <tr>
                <th style={{ width: 48, textAlign: "center" }}>S.NO.</th>
                <th>SERVICES</th>
                <th style={{ width: 80, textAlign: "center" }}>QTY</th>
                <th style={{ width: 90, textAlign: "center" }}>RATE</th>
                <th style={{ width: 90, textAlign: "center" }}>TAX</th>
                <th style={{ width: 100, textAlign: "right" }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {inv.items.map((item, idx) => {
                const amt = item.qty * item.price - item.discount;
                const taxAmt = ((item.qty * item.price - (item.discount || 0)) * item.tax) / 100;
                return (
                  <tr key={item.rowId ?? item.id}>
                    <td style={{ textAlign: "center", color: "#667085" }}>
                      {idx + 1}
                    </td>
                    <td style={{ fontWeight: 500, color: "#1a2332" }}>
                      {item.name}
                    </td>
                    <td style={{ textAlign: "center", color: "#344054" }}>
                      {item.qty} PCS
                    </td>
                    <td style={{ textAlign: "center", color: "#344054" }}>
                      {item.price > 0 ? item.price.toLocaleString("en-IN") : 0}
                    </td>
                    <td style={{ textAlign: "center", color: "#667085" }}>
                      {taxAmt.toLocaleString("en-IN")}
                      <br />
                      <span style={{ fontSize: 10 }}>
                        ({item.taxLabel || `${item.tax}%`})
                      </span>
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontWeight: 600,
                        color: "#1a2332",
                      }}
                    >
                      {amt.toLocaleString("en-IN")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bill-tfoot-total">
                <td />
                <td
                  style={{
                    textAlign: "right",
                    fontWeight: 600,
                    fontSize: 11,
                    color: "#667085",
                    paddingRight: 8,
                  }}
                >
                  TOTAL
                </td>
                <td
                  style={{
                    textAlign: "center",
                    fontWeight: 700,
                    color: "#1a2332",
                  }}
                >
                  {inv.items.reduce((s, i) => s + i.qty, 0)}
                </td>
                <td />
                <td
                  style={{
                    textAlign: "center",
                    fontWeight: 700,
                    color: "#344054",
                  }}
                >
                  ₹{totalTax.toLocaleString("en-IN")}
                </td>
                <td
                  style={{
                    textAlign: "right",
                    fontWeight: 700,
                    color: "#1a2332",
                  }}
                >
                  ₹{invoiceTotal.toLocaleString("en-IN")}
                </td>
              </tr>
              <tr className="bill-tfoot-paid">
                <td
                  colSpan={5}
                  style={{
                    textAlign: "right",
                    fontWeight: 600,
                    fontSize: 12,
                    color: "#344054",
                    paddingRight: 8,
                  }}
                >
                  PAID AMOUNT
                </td>
                <td
                  style={{
                    textAlign: "right",
                    fontWeight: 700,
                    color: "#16a34a",
                  }}
                >
                  ₹{inv.amtPaid.toLocaleString("en-IN")}
                </td>
              </tr>
            </tfoot>
          </table>
          <div className="bill-tax-section">
            <table className="bill-tax-table">
              <thead>
                <tr>
                  <th rowSpan={2}>HSN/SAC</th>
                  <th rowSpan={2}>Taxable Value</th>
                  <th colSpan={2}>CGST</th>
                  <th colSpan={2}>SGST</th>
                  <th rowSpan={2}>Total Tax Amount</th>
                </tr>
                <tr>
                  <th>Rate</th>
                  <th>Amount</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {inv.items.map((item, i) => {
                  const taxableVal =
                    item.qty * item.price - (item.discount || 0);
                  const itemTax = (taxableVal * item.tax) / 100;
                  return (
                    <tr key={i}>
                      <td>{item.hsn || "-"}</td>
                      <td style={{ textAlign: "right" }}>
                        {taxableVal.toLocaleString("en-IN")}
                      </td>
                      <td style={{ textAlign: "center" }}>{item.tax / 2}%</td>
                      <td style={{ textAlign: "center" }}>
                        {(itemTax / 2).toLocaleString("en-IN")}
                      </td>
                      <td style={{ textAlign: "center" }}>{item.tax / 2}%</td>
                      <td style={{ textAlign: "center" }}>
                        {(itemTax / 2).toLocaleString("en-IN")}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>
                        ₹{itemTax.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="bill-footer-row">
            <div className="bill-footer-left">
              <div className="bill-words-label">Total Amount (in words)</div>
              <div className="bill-words-val">{numToWords(invoiceTotal)}</div>
              <div className="bill-tc-label">Terms and Conditions</div>
              <div className="bill-tc-text">
                1. Goods once sold will not be taken back or exchanged
                <br />
                2. All disputes are subject to [ENTER_YOUR_CITY_NAME]{" "}
                jurisdiction only
              </div>
            </div>
            <div className="bill-footer-right">
              <div className="bill-auth-label">Authorised Signatory For</div>
              <div className="bill-auth-company">scratchweb.solutions</div>

              <div
                className="bill-sig-box"
                style={{
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
                onClick={() => sigInputRef.current?.click()}
                title={
                  signatureUrl
                    ? "Click to change signature"
                    : "Click to upload signature"
                }
              >
                {signatureUrl ? (
                  <>
                    <img
                      src={signatureUrl}
                      alt="Authorised Signature"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        padding: 4,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(255,255,255,0.82)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                        opacity: 0,
                        transition: "opacity 0.18s",
                        fontSize: 11,
                        color: "#4361ee",
                        fontWeight: 600,
                        pointerEvents: "none",
                      }}
                      className="sig-hover-overlay"
                    >
                      <IC.Pen /> Change Signature
                    </div>
                  </>
                ) : (
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                      fontSize: 11,
                      color: "#c0cad8",
                    }}
                  >
                    <IC.Pen />
                    <span>Click to upload signature</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="bill-bottom-footer">
            Invoice created using{" "}
            <strong style={{ color: "#4361ee" }}>myBillBook</strong> · Download
            now at
          </div>
        </div>
      </div>

      {showPayModal && (
        <RecordPaymentModal
          invoice={inv}
          invoiceTotal={invoiceTotal}
          onClose={() => setShowPayModal(false)}
          onSave={handleSavePayment}
        />
      )}
      {toast && <div className="pi-toast">{toast}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   GSTR-2 REPORT PAGE
══════════════════════════════════════════════════════════ */
interface GSTR2Props {
  invoices: Invoice[];
  onBack: () => void;
}

function GSTR2Page({ invoices, onBack }: GSTR2Props) {
  const [activeTab, setActiveTab] = useState<"purchase" | "purchaseReturn">(
    "purchase",
  );
  const [dateFilter, setDateFilter] = useState<DateFilter>("This Week");
  const [showDateList, setShowDateList] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [customFrom, setCustomFrom] = useState<Date | null>(null);
  const [customTo, setCustomTo] = useState<Date | null>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setShowDateList(false);
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const [from, to] = getRange(
    dateFilter,
    customFrom || undefined,
    customTo || undefined,
  );
  const filteredInvoices = invoices.filter((inv) => {
    const d = new Date(inv.date);
    d.setHours(12);
    return d >= from && d <= to;
  });
  const dateBtnLabel = () =>
    dateFilter === "Custom" && customFrom && customTo
      ? `${fmtShort(customFrom)} - ${fmtShort(customTo)}`
      : dateFilter;

  const gstr2Rows = filteredInvoices.map((inv) => {
    const totalTax = inv.items.reduce(
      (s, i) => s + ((i.qty * i.price - (i.discount || 0)) * i.tax) / 100,
      0,
    );
    const taxableVal = inv.items.reduce(
      (s, i) => s + (i.qty * i.price - i.discount),
      0,
    );
    const taxPct =
      inv.items.length > 0 ? (inv.items.find((i) => i.tax > 0)?.tax ?? 0) : 0;
    return {
      gstin: inv.partyPan || "-",
      customerName: inv.partyName,
      stateCode: "-",
      stateName: "-",
      invoiceNo: inv.invoiceNumber,
      originalNo: "-",
      invoiceDate: fmtDateDDMM(inv.date),
      invoiceValue: inv.amount,
      totalTaxPct: taxPct > 0 ? `${taxPct}%` : "0%",
      taxableValue: taxableVal,
      sgst: totalTax > 0 ? totalTax / 2 : 0,
      cgst: totalTax > 0 ? totalTax / 2 : 0,
      igst: 0,
      cess: 0,
      totalTax,
    };
  });

  return (
    <div className="report-page">
      <div className="report-header">
        <div className="report-header-left">
          <button className="report-back-btn" onClick={onBack}>
            <IC.Back />
          </button>
          <span className="report-title">GSTR-2 (Purchase)</span>
          <button className="report-fav-btn">
            <IC.Star /> Favourite
          </button>
        </div>
      </div>
      <div className="report-toolbar">
        <div ref={dateRef} style={{ position: "relative" }}>
          <button
            className="report-date-btn"
            onClick={() => {
              setShowCalendar(false);
              setShowDateList((v) => !v);
            }}
          >
            <IC.Calendar /> {dateBtnLabel()} <span className="arr">▾</span>
          </button>
          {showDateList && !showCalendar && (
            <div className="pi-dd pi-date-list-dd" style={{ zIndex: 200 }}>
              {DATE_OPTS.map((opt) => (
                <div
                  key={opt}
                  className={`pi-dd-item ${dateFilter === opt ? "sel" : ""}`}
                  onClick={() => {
                    if (opt === "Custom") {
                      setShowCalendar(true);
                      setShowDateList(false);
                    } else {
                      setDateFilter(opt);
                      setShowDateList(false);
                    }
                  }}
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
          {showCalendar && (
            <CalendarPicker
              onApply={(f, t) => {
                setCustomFrom(f);
                setCustomTo(t);
                setDateFilter("Custom");
                setShowCalendar(false);
              }}
              onCancel={() => setShowCalendar(false)}
            />
          )}
        </div>
        <div className="report-toolbar-right">
          <button className="report-action-btn">
            <IC.Mail /> Email Excel
          </button>
          <div className="report-action-split">
            <button className="report-action-btn">
              <IC.Download /> Download Excel
            </button>
            <button className="report-action-btn-arr">
              <IC.Chevron />
            </button>
          </div>
          <button className="report-action-btn">
            <IC.Print /> Print PDF
          </button>
        </div>
      </div>
      <div className="report-tabs">
        <button
          className={`report-tab ${activeTab === "purchase" ? "active" : ""}`}
          onClick={() => setActiveTab("purchase")}
        >
          Purchase
        </button>
        <button
          className={`report-tab ${activeTab === "purchaseReturn" ? "active" : ""}`}
          onClick={() => setActiveTab("purchaseReturn")}
        >
          Purchase Return
        </button>
      </div>
      <div className="report-table-wrap">
        {activeTab === "purchase" ? (
          <table className="report-table">
            <thead>
              <tr>
                <th rowSpan={2} className="rth-group-none">
                  GSTIN
                </th>
                <th rowSpan={2} className="rth-group-none">
                  CUSTOMER NAME
                </th>
                <th colSpan={2} className="rth-group-center">
                  PLACE OF SUPPLY
                </th>
                <th colSpan={3} className="rth-group-center">
                  INVOICE DETAILS
                </th>
                <th rowSpan={2} className="rth-group-none">
                  TOTAL TAX %
                </th>
                <th rowSpan={2} className="rth-group-none">
                  TAXABLE VALUE
                </th>
                <th colSpan={5} className="rth-group-center">
                  AMOUNT OF TAX
                </th>
              </tr>
              <tr>
                <th>STATE CODE</th>
                <th>STATE NAME</th>
                <th>
                  INVOICE NO
                  <br />
                  ORIGINAL NO
                </th>
                <th>INVOICE DATE</th>
                <th>INVOICE VALUE</th>
                <th>SGST</th>
                <th>CGST</th>
                <th>IGST</th>
                <th>CESS</th>
                <th>TOTAL TAX</th>
              </tr>
            </thead>
            <tbody>
              {gstr2Rows.length === 0 ? (
                <tr>
                  <td colSpan={14}>
                    <div className="report-empty">
                      <div className="report-empty-icon">📄</div>
                      No transactions available to generate report
                    </div>
                  </td>
                </tr>
              ) : (
                gstr2Rows.map((row, i) => (
                  <tr key={i}>
                    <td className="rtd-muted">{row.gstin}</td>
                    <td className="rtd-bold">{row.customerName}</td>
                    <td className="rtd-muted">{row.stateCode}</td>
                    <td className="rtd-muted">{row.stateName}</td>
                    <td
                      className="rtd-muted"
                      style={{ whiteSpace: "pre-line" }}
                    >
                      {row.invoiceNo}
                      {"\n"}
                      {row.originalNo}
                    </td>
                    <td className="rtd-muted">{row.invoiceDate}</td>
                    <td className="rtd-num">
                      ₹ {row.invoiceValue.toLocaleString("en-IN")}
                    </td>
                    <td className="rtd-muted">{row.totalTaxPct}</td>
                    <td className="rtd-num">
                      {row.taxableValue > 0
                        ? `₹ ${row.taxableValue.toLocaleString("en-IN")}`
                        : "-"}
                    </td>
                    <td className="rtd-num">
                      {row.sgst > 0
                        ? `₹ ${row.sgst.toLocaleString("en-IN")}`
                        : "-"}
                    </td>
                    <td className="rtd-num">
                      {row.cgst > 0
                        ? `₹ ${row.cgst.toLocaleString("en-IN")}`
                        : "-"}
                    </td>
                    <td className="rtd-num">
                      {row.igst > 0
                        ? `₹ ${row.igst.toLocaleString("en-IN")}`
                        : "-"}
                    </td>
                    <td className="rtd-num">-</td>
                    <td className="rtd-num">
                      {row.totalTax > 0
                        ? `₹ ${row.totalTax.toLocaleString("en-IN")}`
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="report-table">
            <thead>
              <tr>
                <th rowSpan={2} className="rth-group-none">
                  GSTIN
                </th>
                <th rowSpan={2} className="rth-group-none">
                  CUSTOMER NAME
                </th>
                <th colSpan={2} className="rth-group-center">
                  PLACE OF SUPPLY
                </th>
                <th colSpan={4} className="rth-group-center">
                  INVOICE DETAILS
                </th>
                <th rowSpan={2} className="rth-group-none">
                  TOTAL TAX %
                </th>
                <th rowSpan={2} className="rth-group-none">
                  TAXABLE VALUE
                </th>
                <th colSpan={5} className="rth-group-center">
                  AMOUNT OF TAX
                </th>
              </tr>
              <tr>
                <th>STATE CODE</th>
                <th>STATE NAME</th>
                <th>
                  INVOICE NO
                  <br />
                  ORIGINAL NO
                </th>
                <th>INVOICE DATE</th>
                <th>INVOICE VALUE</th>
                <th>INVOICE TYPE</th>
                <th>SGST</th>
                <th>CGST</th>
                <th>IGST</th>
                <th>CESS</th>
                <th>TOTAL TAX</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={15}>
                  <div className="report-empty">
                    <div className="report-empty-icon">📄</div>
                    No transactions available to generate report
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   DAYBOOK REPORT PAGE
══════════════════════════════════════════════════════════ */
interface DaybookProps {
  invoices: Invoice[];
  onBack: () => void;
}

function DaybookPage({ invoices, onBack }: DaybookProps) {
  const [dateFilter, setDateFilter] = useState<DateFilter>("This Week");
  const [showDateList, setShowDateList] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [customFrom, setCustomFrom] = useState<Date | null>(null);
  const [customTo, setCustomTo] = useState<Date | null>(null);
  const [staffFilter, setStaffFilter] = useState("All Staff");
  const [txnFilter, setTxnFilter] = useState("All Transactions");
  const dateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setShowDateList(false);
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const [from, to] = getRange(
    dateFilter,
    customFrom || undefined,
    customTo || undefined,
  );
  const filteredInvoices = invoices.filter((inv) => {
    const d = new Date(inv.date);
    d.setHours(12);
    return d >= from && d <= to;
  });
  const daybookRows = filteredInvoices.map((inv) => ({
    date: fmtDateDDMM(inv.date),
    partyName: inv.partyName,
    transactionType: "Expenses",
    transactionNo: inv.invoiceNumber,
    totalAmount:
      inv.amount > 0 ? `₹ ${inv.amount.toLocaleString("en-IN")}` : "-",
    moneyIn: "-",
    moneyOut: "-",
    balanceAmount: "-",
    createdBy: "-",
  }));
  const netAmount = filteredInvoices.reduce((s, inv) => s + inv.amount, 0);
  const dateBtnLabel = () =>
    dateFilter === "Custom" && customFrom && customTo
      ? `${fmtShort(customFrom)} - ${fmtShort(customTo)}`
      : dateFilter;

  return (
    <div className="report-page">
      <div className="report-header">
        <div className="report-header-left">
          <button className="report-back-btn" onClick={onBack}>
            <IC.Back />
          </button>
          <span className="report-title">Daybook</span>
          <button className="report-fav-btn">
            <IC.Star /> Favourite
          </button>
        </div>
      </div>
      <div className="report-toolbar">
        <div className="report-select-wrap">
          <select
            className="report-select"
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
          >
            <option>All Staff</option>
          </select>
          <span className="report-select-arr">▾</span>
        </div>
        <div ref={dateRef} style={{ position: "relative" }}>
          <button
            className="report-date-btn"
            onClick={() => {
              setShowCalendar(false);
              setShowDateList((v) => !v);
            }}
          >
            <IC.Calendar /> {dateBtnLabel()} <span className="arr">▾</span>
          </button>
          {showDateList && !showCalendar && (
            <div className="pi-dd pi-date-list-dd" style={{ zIndex: 200 }}>
              {DATE_OPTS.map((opt) => (
                <div
                  key={opt}
                  className={`pi-dd-item ${dateFilter === opt ? "sel" : ""}`}
                  onClick={() => {
                    if (opt === "Custom") {
                      setShowCalendar(true);
                      setShowDateList(false);
                    } else {
                      setDateFilter(opt);
                      setShowDateList(false);
                    }
                  }}
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
          {showCalendar && (
            <CalendarPicker
              onApply={(f, t) => {
                setCustomFrom(f);
                setCustomTo(t);
                setDateFilter("Custom");
                setShowCalendar(false);
              }}
              onCancel={() => setShowCalendar(false)}
            />
          )}
        </div>
        <div className="report-select-wrap">
          <select
            className="report-select"
            value={txnFilter}
            onChange={(e) => setTxnFilter(e.target.value)}
          >
            <option>All Transactions</option>
            <option>Expenses</option>
            <option>Purchase Invoice</option>
          </select>
          <span className="report-select-arr">▾</span>
        </div>
        <div className="report-toolbar-right">
          <button className="report-action-btn">
            <IC.Mail /> Email Excel
          </button>
          <div className="report-action-split">
            <button className="report-action-btn">
              <IC.Download /> Download Excel
            </button>
            <button className="report-action-btn-arr">
              <IC.Chevron />
            </button>
          </div>
          <button className="report-action-btn">
            <IC.Print /> Print PDF
          </button>
        </div>
      </div>
      <div className="daybook-net-bar">
        Net Amount:{" "}
        <span className="daybook-net-val">
          ₹ {netAmount.toLocaleString("en-IN")}
        </span>
      </div>
      <div className="report-table-wrap">
        <table className="report-table">
          <thead>
            <tr>
              <th>DATE</th>
              <th>PARTY NAME</th>
              <th>TRANSACTION TYPE</th>
              <th>TRANSACTION NO.</th>
              <th>TOTAL AMOUNT</th>
              <th>MONEY IN</th>
              <th>MONEY OUT</th>
              <th>BALANCE AMOUNT</th>
              <th>CREATED BY</th>
            </tr>
          </thead>
          <tbody>
            {daybookRows.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="report-empty">
                    <div className="report-empty-icon">📄</div>
                    No transactions available to generate report
                  </div>
                </td>
              </tr>
            ) : (
              daybookRows.map((row, i) => (
                <tr key={i}>
                  <td>{row.date}</td>
                  <td className="rtd-bold">{row.partyName}</td>
                  <td className="rtd-muted">{row.transactionType}</td>
                  <td className="rtd-muted">{row.transactionNo}</td>
                  <td className="rtd-num">{row.totalAmount}</td>
                  <td className="rtd-muted">{row.moneyIn}</td>
                  <td className="rtd-muted">{row.moneyOut}</td>
                  <td className="rtd-muted">{row.balanceAmount}</td>
                  <td className="rtd-muted">{row.createdBy}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SETTINGS PANEL
══════════════════════════════════════════════════════════ */
function SettingsPanel({
  settings,
  setSettings,
  onClose,
  onSave,
}: {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <>
      <div className="pi-s-block">
        <div className="pi-s-top">
          <span className="pi-s-name">
            Purchase Invoice Prefix &amp; Sequence Number
          </span>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.prefixEnabled}
              onChange={(e) =>
                setSettings((p) => ({
                  ...p,
                  prefixEnabled: e.target.checked,
                }))
              }
            />
            <span className="toggle-slider" />
          </label>
        </div>
        <p className="pi-s-desc">
          Add your custom prefix &amp; sequence for Purchase Invoice Numbering
        </p>
        {settings.prefixEnabled && (
          <>
            <div className="pi-s-fields">
              <div>
                <label>Prefix</label>
                <input
                  placeholder="Prefix"
                  value={settings.prefix}
                  onChange={(e) =>
                    setSettings((p) => ({ ...p, prefix: e.target.value }))
                  }
                />
              </div>
              <div>
                <label>Sequence Number</label>
                <input
                  type="number"
                  value={settings.sequenceNumber}
                  readOnly
                  style={{ background: "#f5f5f5", cursor: "not-allowed" }}
                />
              </div>
            </div>
            <p className="pi-s-note">
              Purchase Invoice Number: {settings.prefix}
              {settings.sequenceNumber}
            </p>
          </>
        )}
      </div>

      <div className="pi-s-block">
        <div className="pi-s-top">
          <span className="pi-s-name">Show Item Image on Invoice</span>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.showItemImage}
              onChange={(e) =>
                setSettings((p) => ({
                  ...p,
                  showItemImage: e.target.checked,
                }))
              }
            />
            <span className="toggle-slider" />
          </label>
        </div>
        <p className="pi-s-desc">
          This will apply to all vouchers except for Payment In and Payment Out
        </p>
      </div>

      <div className="pi-s-block">
        <div className="pi-s-top">
          <span className="pi-s-name">
            Price History <span className="badge-new">New</span>
          </span>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.enablePriceHistory}
              onChange={(e) =>
                setSettings((p) => ({
                  ...p,
                  enablePriceHistory: e.target.checked,
                }))
              }
            />
            <span className="toggle-slider" />
          </label>
        </div>
        <p className="pi-s-desc">
          Show last 5 sales / purchase prices of the item for the selected party
          in invoice
        </p>
      </div>

      <div className="pi-modal-foot">
        <button className="btn-cancel" onClick={onClose}>
          Cancel
        </button>
        <button className="btn-save" onClick={onSave}>
          Save
        </button>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   CREATE / EDIT / DUPLICATE PURCHASE INVOICE PAGE
══════════════════════════════════════════════════════════ */
interface CPIProps {
  mode: "create" | "edit" | "duplicate";
  editData?: Invoice;
  seqNo: number;
  onBack: () => void;
  onSaved: (inv: Invoice, isEdit: boolean, goToList?: boolean) => void;
  onCreateItem: () => void;
  allParties: Party[];
  setAllParties: React.Dispatch<React.SetStateAction<Party[]>>;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

function CreatePurchaseInvoicePage({
  mode,
  editData,
  seqNo,
  onBack,
  onSaved,
  onCreateItem,
  allParties,
  setAllParties,
  settings,
  setSettings,
}: CPIProps) {
  const navigate = useNavigate();
  const isEdit = mode === "edit";
  const isDup = mode === "duplicate";
  const isNew = mode === "create";

  const initParty = editData
    ? allParties.find((p) => p.id === editData.partyId) || null
    : null;

  const [partyState, setPartyState] = useState<
    "empty" | "searching" | "selected"
  >(initParty ? "selected" : "empty");
  const [partySearch, setPartySearch] = useState("");
  const [selectedParty, setSelectedParty] = useState<Party | null>(initParty);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>(
    editData
      ? editData.items.map((i) => ({
          ...i,
          discountPct: i.discountPct ?? 0,
          taxLabel: i.taxLabel ?? "None",
        }))
      : [],
  );

  const [invNo, setInvNo] = useState<string | number>(
    isEdit ? editData!.invoiceNumber : "",
  );

  useEffect(() => {
    if (isDup && editData) {
      setInvoiceItems(
        editData.items.map((item) => ({
          ...item,
          discountPct: item.discountPct ?? 0,
          taxLabel: item.taxLabel ?? "None",
          rowId: Date.now() + Math.random(),
        })),
      );
    }
  }, [isDup, editData]);

  useEffect(() => {
    if (isNew || isDup) {
      api
        .get("/purchase-invoices/next-invoice-number")
        .then((res: any) => {
          setInvNo(res.data.invoiceNumber);
        })
        .catch(() => {
          setInvNo(1);
        });
    }
  }, [isNew, isDup]);

  const initInvDate = isEdit ? new Date(editData!.date) : new Date();
  const [invDateObj, setInvDateObj] = useState<Date>(initInvDate);
  const [showInvDatePicker, setShowInvDatePicker] = useState(false);
  const invDateRef = useRef<HTMLDivElement>(null);
  const invDate = `${invDateObj.getDate().toString().padStart(2, "0")} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][invDateObj.getMonth()]} ${invDateObj.getFullYear()}`;

  const [showDueDate, setShowDueDate] = useState(
    editData ? editData.dueIn !== "-" : false,
  );
  const [payTerms, setPayTerms] = useState("30");
  const [dueDate] = useState(todayStr());
  const [amtPaid, setAmtPaid] = useState(isEdit ? editData!.amtPaid : 0);
  const [payMethod, setPayMethod] = useState(
    editData ? editData.payMethod : "Cash",
  );
  const [roundOff, setRoundOff] = useState(
    editData ? editData.roundOff : false,
  );
  const [roundOffDir, setRoundOffDir] = useState(
    editData ? editData.roundOffDir : "+Add",
  );
  const [roundOffVal, setRoundOffVal] = useState(
    editData ? editData.roundOffVal : 0,
  );
  const [applyTCS, setApplyTCS] = useState(false);
  const [applyTDS, setApplyTDS] = useState(false);
  const [markPaid, setMarkPaid] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [showCreateParty, setShowCreateParty] = useState(false);
  const [showAddItems, setShowAddItems] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [additionalCharges, setAdditionalCharges] = useState<
    AdditionalCharge[]
  >(editData ? [...editData.additionalCharges] : []);
  const [showDiscount, setShowDiscount] = useState(
    editData ? editData.discountEnabled : false,
  );
  const [discountType, setDiscountType] = useState<"%" | "₹">(
    editData ? editData.discountType : "%",
  );
  const [discountVal, setDiscountVal] = useState(
    editData ? editData.discountVal : 0,
  );
  const [showShipModal, setShowShipModal] = useState(false);
  const [shipName, setShipName] = useState(
    editData ? editData.shipping.name : initParty?.name || "",
  );
  const [shipPhone, setShipPhone] = useState(
    editData ? editData.shipping.phone : initParty?.phone || "",
  );
  const [shipAddr, setShipAddr] = useState(
    editData ? editData.shipping.addr : "",
  );
  const [shipState, setShipState] = useState(
    editData ? editData.shipping.state : "",
  );
  const [shipPin, setShipPin] = useState(editData ? editData.shipping.pin : "");
  const [shipCity, setShipCity] = useState(
    editData ? editData.shipping.city : "",
  );
  const [shipSaved, setShipSaved] = useState(
    editData ? !editData.shipping.isSame : false,
  );
  const [cpName, setCpName] = useState("");
  const [cpPhone, setCpPhone] = useState("");
  const [cpShowAddr, setCpShowAddr] = useState(false);
  const [cpShowGST, setCpShowGST] = useState(false);
  const [cpAddr, setCpAddr] = useState("");
  const [cpState, setCpState] = useState("");
  const [cpPin, setCpPin] = useState("");
  const [cpCity, setCpCity] = useState("");
  const [cpSameShip, setCpSameShip] = useState(true);
  const [cpGSTIN, setCpGSTIN] = useState("");
  const [cpErr, setCpErr] = useState(false);
  const [itemSearch, setItemSearch] = useState("");
  // ── single source of truth: id→qty (present = added, absent = not added) ──
  const [addedItems, setAddedItems] = useState<Record<number, number>>({});
  const pendingQtys = addedItems;
  const addedIds = Object.keys(addedItems).map(Number);
  const [showCPISettings, setShowCPISettings] = useState(false);

  const partyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (partyRef.current && !partyRef.current.contains(e.target as Node))
        if (partyState === "searching")
          setPartyState(selectedParty ? "selected" : "empty");
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [partyState, selectedParty]);

  const showT = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2400);
  };

  const subtotal = useMemo(() => {
    return invoiceItems.reduce((s, i) => {
      const base = i.qty * i.price;
      const discount = i.discount || 0;
      return s + (base - discount);
    }, 0);
  }, [invoiceItems]);

  const totalTax = useMemo(() => {
    return invoiceItems.reduce(
      (s, i) => s + ((i.qty * i.price - (i.discount || 0)) * i.tax) / 100,
      0,
    );
  }, [invoiceItems]);

  const chargesTotal = useMemo(() => {
    return additionalCharges.reduce((s, c) => s + c.amount, 0);
  }, [additionalCharges]);

  const taxableAmount = useMemo(
    () => subtotal + chargesTotal,
    [subtotal, chargesTotal],
  );

  const discountAmt = useMemo(() => {
    if (!showDiscount) return 0;
    return discountType === "%"
      ? (taxableAmount * discountVal) / 100
      : discountVal;
  }, [showDiscount, discountType, discountVal, taxableAmount]);

  const roundOffAmt = useMemo(() => {
    if (!roundOff) return 0;
    return roundOffDir === "+Add" ? roundOffVal : -roundOffVal;
  }, [roundOff, roundOffDir, roundOffVal]);

  const totalAmt = useMemo(
    () => taxableAmount - discountAmt + totalTax + roundOffAmt,
    [taxableAmount, discountAmt, totalTax, roundOffAmt],
  );

  const balance = useMemo(() => totalAmt - amtPaid, [totalAmt, amtPaid]);

  const selectParty = (p: Party) => {
    setSelectedParty(p);
    setPartyState("selected");
    setPartySearch("");
    setShipName(p.name);
    setShipPhone(p.phone);
    setShipSaved(false);
    setShipAddr("");
    setShipState("");
    setShipPin("");
    setShipCity("");
  };
  const filtParties = allParties.filter((p) =>
    p.name.toLowerCase().includes(partySearch.toLowerCase()),
  );

  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  useEffect(() => {
    api
      .get("/items")
      .then((res: any) => {
        const list = res?.data?.data ?? res?.data ?? [];
        setCatalog(
          list.map((i: any) => ({
            id: i.id,
            name: i.name,
            code: i.itemCode ?? "",
            hsn: i.hsnCode ? String(i.hsnCode) : "",
            stock: (() => {
              const arr = (i.ProductStock ?? i.productStock ?? []) as any[];
              const total = arr.reduce(
                (s: number, ps: any) => s + (Number(ps.currentStock) || 0),
                0,
              );
              return arr.length > 0 ? `${total} ${i.unit ?? ""}`.trim() : "0";
            })(),
            salesPrice: Number(i.salesPrice ?? 0),
            purchasePrice: Number(i.purchasePrice ?? 0),
          })),
        );
      })
      .catch((err) => {
        console.error("Failed to load items", err);
      });
  }, []);

  const filtCatalog = catalog.filter(
    (c) =>
      c.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
      c.code.toLowerCase().includes(itemSearch.toLowerCase()),
  );

  const saveParty = () => {
    if (!cpName.trim()) {
      setCpErr(true);
      return;
    }
    const np: Party = {
      id: Date.now(),
      name: cpName,
      phone: cpPhone,
      pan: "",
      balance: 0,
    };
    setAllParties((p) => [...p, np]);
    selectParty(np);
    setShowCreateParty(false);
    setCpName("");
    setCpPhone("");
    setCpShowAddr(false);
    setCpShowGST(false);
    setCpErr(false);
    showT(`Party "${cpName}" created`);
  };

  const openAddItems = () => {
    const init: Record<number, number> = {};
    invoiceItems.forEach((i) => {
      init[i.id] = i.qty;
    });
    setAddedItems(init);
    setShowAddItems(true);
  };

  // ── toggleItem: single state update — no sync issues ──
  const toggleItem = (cat: CatalogItem) => {
    setAddedItems((prev) => {
      if (cat.id in prev) {
        const next = { ...prev };
        delete next[cat.id];
        return next;
      } else {
        return { ...prev, [cat.id]: 1 };
      }
    });
  };

  const setPendingQty = (id: number, v: number) => {
    const safeVal = v <= 0 ? 1 : v;
    setAddedItems((prev) => ({ ...prev, [id]: safeVal }));
  };

  const addToBill = () => {
    const newItems: InvoiceItem[] = addedIds.map((id) => {
      const existing = invoiceItems.find((i) => i.id === id);
      const cat = catalog.find((c) => c.id === id)!;
      return existing
        ? { ...existing, qty: Number(pendingQtys[id] || existing.qty || 1) }
        : {
            id: cat.id,
            productId: cat.id,
            godownId: null,
            rowId: Date.now() + Math.random(),
            name: cat.name,
            hsn: cat.hsn ?? "",
            qty: Number(pendingQtys[id] ?? 1),
            price: cat.purchasePrice || cat.salesPrice,
            discount: 0,
            discountPct: 0,
            tax: 0,
            taxLabel: "None",
          };
    });
    setInvoiceItems(newItems);
    setShowAddItems(false);
    setItemSearch("");
    setAddedItems({});
  };

  const removeItem = (rowId: number) =>
    setInvoiceItems((p) => p.filter((i) => (i.rowId ?? i.id) !== rowId));

  const updItem = (rowId: number, f: keyof InvoiceItem, v: string) =>
    setInvoiceItems((p) =>
      p.map((i) =>
        (i.rowId ?? i.id) === rowId
          ? { ...i, [f]: isNaN(Number(v)) ? v : Number(v) }
          : i,
      ),
    );

  const updateDiscountPct = (rowId: number, pct: number, item: InvoiceItem) => {
    const rs = parseFloat(((item.qty * item.price * pct) / 100).toFixed(2));
    setInvoiceItems((p) =>
      p.map((i) =>
        (i.rowId ?? i.id) === rowId
          ? { ...i, discountPct: pct, discount: rs }
          : i,
      ),
    );
  };

  const updateDiscountRs = (rowId: number, rs: number, item: InvoiceItem) => {
    const base = item.qty * item.price;
    const pct = base > 0 ? parseFloat(((rs / base) * 100).toFixed(2)) : 0;
    setInvoiceItems((p) =>
      p.map((i) =>
        (i.rowId ?? i.id) === rowId
          ? { ...i, discount: rs, discountPct: pct }
          : i,
      ),
    );
  };

  const updateItemTax = (rowId: number, label: string, rate: number) => {
    setInvoiceItems((p) =>
      p.map((i) =>
        (i.rowId ?? i.id) === rowId ? { ...i, tax: rate, taxLabel: label } : i,
      ),
    );
  };

  const addCharge = () =>
    setAdditionalCharges((p) => [
      ...p,
      {
        id: Date.now(),
        label: "",
        amount: 0,
        taxRate: "No Tax Applicable",
      },
    ]);
  const updCharge = (
    id: number,
    f: keyof AdditionalCharge,
    v: string | number,
  ) =>
    setAdditionalCharges((p) =>
      p.map((c) => (c.id === id ? { ...c, [f]: v } : c)),
    );
  const removeCharge = (id: number) =>
    setAdditionalCharges((p) => p.filter((c) => c.id !== id));

  const [saving, setSaving] = useState(false);

  const handleSave = async (createNew: boolean = false) => {
    if (!selectedParty) {
      showT("Please select a party first");
      return;
    }
    if (invoiceItems.length === 0) {
      showT("Please add at least one item");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        partyId: selectedParty.id,
        invoiceDate: invDateObj.toISOString(),
        dueDate: showDueDate
          ? new Date(
              invDateObj.getTime() + parseInt(payTerms) * 86400000,
            ).toISOString()
          : null,
        paymentMode: payMethod,
        amountPaid: amtPaid,
        discountAmount: discountAmt,
        roundOff: roundOffAmt,
        notes: showNotes ? notes : undefined,
        items: invoiceItems.map((i) => ({
          productId: i.productId ?? i.id,
          ...(i.godownId && { godownId: i.godownId }),
          hsnSac: i.hsn || undefined,
          quantity: Number(i.qty),
          price: Number(i.price),
          discount: Number(i.discount || 0),
          taxRate: Number(i.tax || 0),
        })),
        additionalCharges: additionalCharges.map((c) => ({
          name: c.label,
          amount: c.amount,
        })),
      };

      let raw: any;
      if (isEdit) {
        raw = await updatePurchaseInvoice(editData!.id, payload);
        raw = raw.data ?? raw;
      } else {
        raw = await createPurchaseInvoice(payload);
        raw = raw.data ?? raw;
      }

      const inv: Invoice = {
        id: raw.id,
        date:
          raw.invoiceDate?.slice(0, 10) ??
          invDateObj.toISOString().slice(0, 10),
        invoiceNumber: raw.purchaseInvNo,
        partyName: selectedParty.name,
        partyId: selectedParty.id,
        partyPhone: selectedParty.phone,
        partyPan: selectedParty.pan,
        dueIn: showDueDate ? `${payTerms} days` : "-",
        amount: Number(raw.totalAmount ?? totalAmt),
        status:
          raw.status === "PAID"
            ? "paid"
            : raw.status === "PARTIAL"
              ? "partial"
              : raw.status === "OPEN"
                ? "unpaid"
                : "",
        items: invoiceItems,
        additionalCharges,
        shipping: {
          name: shipName,
          phone: shipPhone,
          addr: shipAddr,
          city: shipCity,
          state: shipState,
          pin: shipPin,
          isSame: !shipSaved,
        },
        discountEnabled: showDiscount,
        discountType,
        discountVal,
        roundOff,
        roundOffDir,
        roundOffVal,
        amtPaid: Number(raw.amountPaid ?? amtPaid),
        payMethod,
      };

      if (createNew && !isEdit) {
        onSaved(inv, false, false);
        setSelectedParty(null);
        setPartyState("empty");
        setPartySearch("");
        setInvoiceItems([]);
        setAdditionalCharges([]);
        setAmtPaid(0);
        setPayMethod("Cash");
        setMarkPaid(false);
        setShowDiscount(false);
        setDiscountType("%");
        setDiscountVal(0);
        setRoundOff(false);
        setRoundOffDir("+Add");
        setRoundOffVal(0);
        setShowNotes(false);
        setNotes("");
        setShipName("");
        setShipPhone("");
        setShipAddr("");
        setShipState("");
        setShipPin("");
        setShipCity("");
        setShipSaved(false);
        setInvDateObj(new Date());
        try {
          const res = await api.get("/purchase-invoices/next-invoice-number");
          setInvNo(res.data.invoiceNumber);
        } catch {
          setInvNo("");
        }
        showT("Invoice saved. Ready for next.");
      } else {
        onSaved(inv, isEdit, true);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to save invoice";
      console.error("Invoice save error:", err);
      showT(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.put("/purchase-invoices/settings", {
        prefix: settings.prefix,
        enablePrefix: settings.prefixEnabled,
        showItemImage: settings.showItemImage,
        enablePriceHistory: settings.enablePriceHistory,
      });
      setShowCPISettings(false);
      showT("Settings saved");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to save settings";
      showT(msg);
    }
  };

  return (
    <div className="cpi-page">
      {/* ── TOP BAR ── */}
      <div className="cpi-topbar">
        <div className="cpi-title-wrap">
          <button className="cpi-back-btn" onClick={onBack}>
            <IC.Back />
          </button>
          <span className="cpi-page-title">
            {isEdit
              ? "Update Purchase Invoice"
              : isDup
                ? "Duplicate Purchase Invoice"
                : "Create Purchase Invoice"}
          </span>
        </div>
        <div className="cpi-topbar-right">
          <button className="btn-upload">
            <IC.Upload /> Upload using Phone
          </button>
          <button
            className="btn-topbar-settings"
            onClick={() => setShowCPISettings(true)}
          >
            <IC.Settings /> Settings
            <span className="red-dot" />
          </button>
          {!isEdit && (
            <button
              className="btn-save-new"
              onClick={() => handleSave(true)}
              disabled={!selectedParty || saving}
            >
              Save &amp; New
            </button>
          )}
          <button
            className={isEdit ? "btn-save-update" : "btn-save-top"}
            onClick={() => handleSave(false)}
            disabled={!selectedParty || saving}
          >
            {saving ? "Saving…" : isEdit ? "Update Purchase Invoice" : "Save"}
          </button>
        </div>
      </div>

      <div className="cpi-body">
        <div className={`cpi-top-card ${isEdit ? "edit-mode" : ""}`}>
          {isEdit ? (
            <div className="edit-party-row">
              <div className="edit-party-col">
                <div className="edit-party-col-header">
                  <span className="edit-col-label">Bill From</span>
                  <div ref={partyRef} style={{ position: "relative" }}>
                    <button
                      className="btn-change-inline"
                      onClick={() =>
                        setPartyState(
                          partyState === "searching" ? "selected" : "searching",
                        )
                      }
                    >
                      Change Party
                    </button>
                    {partyState === "searching" && (
                      <div
                        className="party-search-wrap"
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          minWidth: 300,
                          zIndex: 300,
                        }}
                      >
                        <input
                          className="party-search-input"
                          placeholder="Search party"
                          value={partySearch}
                          onChange={(e) => setPartySearch(e.target.value)}
                          autoFocus
                        />
                        <span className="party-search-arrow">
                          <IC.Chevron />
                        </span>
                        <div className="party-dropdown">
                          <div className="party-dd-header">
                            <span>Party Name</span>
                            <span>Balance</span>
                          </div>
                          {filtParties.map((p) => (
                            <div
                              key={p.id}
                              className="party-dd-item"
                              onClick={() => selectParty(p)}
                            >
                              <span className="party-dd-name">{p.name}</span>
                              <span
                                className={`party-dd-bal ${p.balance < 0 ? "neg" : ""}`}
                              >
                                {fmtMoney(p.balance)}
                              </span>
                            </div>
                          ))}
                          <div
                            className="party-dd-create"
                            onClick={() => {
                              setShowCreateParty(true);
                              setPartyState("selected");
                            }}
                          >
                            <IC.Plus /> + Create Party
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="edit-party-info">
                  <div className="edit-party-name">
                    {selectedParty?.name || "—"}
                  </div>
                  {selectedParty?.phone && (
                    <div className="edit-party-detail">
                      Phone Number: {selectedParty.phone}
                    </div>
                  )}
                  {selectedParty?.pan && (
                    <div className="edit-party-detail">
                      PAN Number: {selectedParty.pan}
                    </div>
                  )}
                </div>
              </div>
              <div className="edit-party-col">
                <div className="edit-party-col-header">
                  <span className="edit-col-label">Ship From</span>
                  <button
                    className="btn-change-inline"
                    onClick={() => setShowShipModal(true)}
                  >
                    Change Shipping Address
                  </button>
                </div>
                <div className="edit-party-info">
                  <div className="edit-party-name">
                    {shipSaved ? shipName : selectedParty?.name || "—"}
                  </div>
                  {(shipSaved ? shipPhone : selectedParty?.phone) && (
                    <div className="edit-party-detail">
                      Phone Number:{" "}
                      {shipSaved ? shipPhone : selectedParty?.phone}
                    </div>
                  )}
                  {shipSaved && shipAddr && (
                    <div className="edit-party-detail">
                      {shipAddr}
                      {shipCity ? `, ${shipCity}` : ""}
                      {shipState ? `, ${shipState}` : ""}
                      {shipPin ? ` - ${shipPin}` : ""}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="cpi-bill-panel">
              <div className="section-label">Bill From</div>
              {partyState === "empty" && (
                <div
                  ref={partyRef}
                  className="party-add-box"
                  onClick={() => setPartyState("searching")}
                >
                  <div className="party-add-inner">
                    <IC.Plus /> Add Party
                  </div>
                </div>
              )}
              {partyState === "searching" && (
                <div ref={partyRef} className="party-search-wrap">
                  <input
                    className="party-search-input"
                    placeholder="Search party by name or number"
                    value={partySearch}
                    onChange={(e) => setPartySearch(e.target.value)}
                    autoFocus
                  />
                  <span className="party-search-arrow">
                    <IC.Chevron />
                  </span>
                  <div className="party-dropdown">
                    <div className="party-dd-header">
                      <span>Party Name</span>
                      <span>Balance</span>
                    </div>
                    {filtParties.map((p) => (
                      <div
                        key={p.id}
                        className="party-dd-item"
                        onClick={() => selectParty(p)}
                      >
                        <span className="party-dd-name">{p.name}</span>
                        <span
                          className={`party-dd-bal ${p.balance < 0 ? "neg" : ""}`}
                        >
                          {fmtMoney(p.balance)}
                          {p.balance < 0 && <IC.ArrowUp />}
                        </span>
                      </div>
                    ))}
                    <div
                      className="party-dd-create"
                      onClick={() => {
                        setShowCreateParty(true);
                        setPartyState("empty");
                      }}
                    >
                      <IC.Plus /> + Create Party
                    </div>
                  </div>
                </div>
              )}
              {partyState === "selected" && selectedParty && (
                <div className="party-info-section">
                  <div className="party-info-pane">
                    <div className="party-info-pane-header">
                      <span className="pane-label">Bill From</span>
                      <button
                        className="btn-change"
                        onClick={() => setPartyState("searching")}
                      >
                        Change Party
                      </button>
                    </div>
                    <div className="party-info-name">{selectedParty.name}</div>
                    {selectedParty.phone && (
                      <div className="party-info-line">
                        Phone: {selectedParty.phone}
                      </div>
                    )}
                  </div>
                  <div className="party-info-pane">
                    <div className="party-info-pane-header">
                      <span className="pane-label">Ship From</span>
                      <button
                        className="btn-change"
                        onClick={() => setShowShipModal(true)}
                      >
                        Change Address
                      </button>
                    </div>
                    <div className="party-info-name">
                      {shipSaved ? shipName : selectedParty.name}
                    </div>
                    {(shipSaved ? shipPhone : selectedParty.phone) && (
                      <div className="party-info-line">
                        Phone: {shipSaved ? shipPhone : selectedParty.phone}
                      </div>
                    )}
                    {shipSaved && shipAddr && (
                      <div className="party-info-line">
                        {shipAddr}
                        {shipCity ? `, ${shipCity}` : ""}
                        {shipState ? `, ${shipState}` : ""}
                        {shipPin ? ` - ${shipPin}` : ""}
                      </div>
                    )}
                    {!shipSaved && (
                      <div className="party-info-line ship-same-tag">
                        Same as Bill From
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="cpi-invoice-fields">
            <div className="inv-fields-top-row">
              <div className="inv-field-group" style={{ flex: "0 0 80px" }}>
                <label>Purchase Inv No:</label>
                <input value={invNo} readOnly />
              </div>
              <div className="inv-field-group" style={{ flex: 1 }}>
                <label>Purchase Inv Date:</label>
                <div
                  className="date-field-wrap"
                  ref={invDateRef}
                  style={{ position: "relative", cursor: "pointer" }}
                  onClick={() => setShowInvDatePicker((v) => !v)}
                >
                  <span className="cal-icon">
                    <IC.Calendar />
                  </span>
                  <span className="date-val">{invDate}</span>
                  <span className="caret">▾</span>
                  {showInvDatePicker && (
                    <SingleDatePicker
                      value={invDateObj}
                      onApply={(d) => {
                        setInvDateObj(d);
                        setShowInvDatePicker(false);
                      }}
                      onCancel={() => setShowInvDatePicker(false)}
                    />
                  )}
                </div>
              </div>
              <div className="inv-field-group" style={{ flex: 1 }}>
                <label>Original Inv No.</label>
                <input placeholder="" />
              </div>
            </div>
            {!showDueDate ? (
              <button
                className="add-due-date-btn"
                onClick={() => setShowDueDate(true)}
              >
                <IC.Plus /> Add Due Date
              </button>
            ) : (
              <div className="due-date-row">
                <div className="inv-field-group" style={{ flex: "0 0 auto" }}>
                  <label>Payment Terms:</label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid #d0d5dd",
                      borderRadius: 6,
                      overflow: "hidden",
                      background: "#fff",
                    }}
                  >
                    <input
                      value={payTerms}
                      onChange={(e) => setPayTerms(e.target.value)}
                      style={{
                        border: "none",
                        width: 46,
                        padding: "7px 8px",
                        outline: "none",
                        fontFamily: "inherit",
                        fontSize: 12,
                      }}
                    />
                    <span className="days-tag">days</span>
                  </div>
                </div>
                <div className="inv-field-group" style={{ flex: 1 }}>
                  <label>Due Date:</label>
                  <div className="date-field-wrap">
                    <span className="cal-icon">
                      <IC.Calendar />
                    </span>
                    <span className="date-val">{dueDate}</span>
                  </div>
                </div>
                <button
                  className="due-date-remove"
                  onClick={() => setShowDueDate(false)}
                  style={{ marginTop: 18 }}
                >
                  <IC.X />
                </button>
              </div>
            )}
            <div className="extra-fields-grid">
              <div className="extra-field">
                <label>
                  E-Way Bill No. <IC.Info />
                </label>
                <input />
              </div>
              <div className="extra-field">
                <label>Challan No.:</label>
                <input />
              </div>
              <div className="extra-field">
                <label>Financed By:</label>
                <input />
              </div>
              <div className="extra-field">
                <label>Salesman:</label>
                <input />
              </div>
              <div className="extra-field">
                <label>Email ID:</label>
                <input />
              </div>
            </div>
            <div className="extra-fields-grid-2">
              <div className="extra-field">
                <label>Warranty Period:</label>
                <input />
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ ITEMS TABLE ══════════ */}
        <div className="cpi-items-section">
          <table className="items-table">
            <thead>
              <tr>
                <th style={{ width: 40, textAlign: "center" }}>NO</th>
                <th>ITEMS/ SERVICES</th>
                <th style={{ width: 110 }}>HSN/ SAC</th>
                <th style={{ width: 72 }}>QTY</th>
                <th style={{ width: 130 }}>PRICE/ITEM (₹)</th>
                <th style={{ width: 130 }}>DISCOUNT</th>
                <th style={{ width: 170 }}>TAX</th>
                <th style={{ width: 120 }}>AMOUNT (₹)</th>
                <th style={{ width: 40 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IC.AddCircle />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((item, idx) => {
                const rowKey = item.rowId ?? item.id;
                const lineTotal = item.qty * item.price - (item.discount || 0);
                return (
                  <tr key={rowKey}>
                    <td style={{ color: "#667085", textAlign: "center" }}>
                      {idx + 1}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#1a2332" }}>
                        {item.name}
                      </div>
                      <input
                        className="item-desc-input"
                        placeholder="Enter Description (optional)"
                      />
                    </td>
                    <td>
                      <input
                        className="qty-input"
                        style={{ width: 92 }}
                        value={item.hsn}
                        onChange={(e) => updItem(rowKey, "hsn", e.target.value)}
                      />
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <input
                          className="qty-input"
                          type="number"
                          value={item.qty || 1}
                          onChange={(e) =>
                            updItem(rowKey, "qty", e.target.value)
                          }
                        />
                        <span
                          style={{
                            fontSize: 10,
                            color: "#98a2b3",
                            whiteSpace: "nowrap",
                          }}
                        >
                          PCS
                        </span>
                      </div>
                    </td>
                    <td>
                      <input
                        className="qty-input"
                        style={{ width: 108 }}
                        type="number"
                        value={item.price || ""}
                        placeholder="0"
                        onChange={(e) =>
                          updItem(rowKey, "price", e.target.value)
                        }
                      />
                    </td>

                    {/* ── DISCOUNT CELL ── */}
                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              color: "#667085",
                              minWidth: 10,
                            }}
                          >
                            %
                          </span>
                          <input
                            className="qty-input"
                            style={{ width: 68 }}
                            type="number"
                            value={item.discountPct || ""}
                            placeholder="0"
                            onChange={(e) =>
                              updateDiscountPct(
                                rowKey,
                                Number(e.target.value) || 0,
                                item,
                              )
                            }
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              color: "#667085",
                              minWidth: 10,
                            }}
                          >
                            ₹
                          </span>
                          <input
                            className="qty-input"
                            style={{ width: 68 }}
                            type="number"
                            value={item.discount || ""}
                            placeholder="0"
                            onChange={(e) =>
                              updateDiscountRs(
                                rowKey,
                                Number(e.target.value) || 0,
                                item,
                              )
                            }
                          />
                        </div>
                      </div>
                    </td>

                    {/* ── TAX CELL ── */}
                    <td style={{ minWidth: 170 }}>
                      <TaxDropdown
                        value={item.taxLabel ?? "None"}
                        onChange={(label, rate) =>
                          updateItemTax(rowKey, label, rate)
                        }
                      />
                      {item.tax > 0 && (
                        <div
                          style={{
                            fontSize: 10,
                            color: "#667085",
                            marginTop: 3,
                          }}
                        >
                          ₹{" "}
                          {(
                            ((item.qty * item.price - (item.discount || 0)) *
                              item.tax) /
                            100
                          ).toLocaleString("en-IN")}
                        </div>
                      )}
                    </td>

                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span style={{ fontSize: 11, color: "#98a2b3" }}>
                          ₹
                        </span>
                        <span
                          style={{
                            fontWeight: 700,
                            color: "#1d2939",
                          }}
                        >
                          {lineTotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </td>
                    <td>
                      <button
                        className="item-row-delete"
                        onClick={() => removeItem(rowKey)}
                      >
                        <IC.Trash />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="add-item-area">
            <button className="add-item-dashed-btn" onClick={openAddItems}>
              <IC.Plus /> Add Item
            </button>
            <div className="scan-barcode-area" onClick={openAddItems}>
              <IC.Barcode /> Scan Barcode
            </div>
          </div>
          <div className="subtotal-row">
            <span className="sub-label">SUBTOTAL</span>
            <span className="sub-cell">
              ₹ {subtotal.toLocaleString("en-IN")}
            </span>
            <span className="sub-cell">
              ₹ {totalTax.toLocaleString("en-IN")}
            </span>
            <span className="sub-cell">
              ₹ {(subtotal + totalTax).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <div className="cpi-bottom-section">
          <div className="notes-panel">
            {!showNotes ? (
              <button
                className="btn-add-notes"
                onClick={() => setShowNotes(true)}
              >
                + Add Notes
              </button>
            ) : (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes..."
                style={{
                  width: "100%",
                  border: "1.5px solid #dde1e9",
                  borderRadius: 6,
                  padding: "7px 10px",
                  fontSize: 12,
                  outline: "none",
                  resize: "vertical",
                  minHeight: 50,
                  fontFamily: "inherit",
                  marginBottom: 10,
                }}
              />
            )}
            <div className="tc-label-row">
              <span className="tc-heading">Terms and Conditions</span>
              <button
                className="tc-gear-btn"
                onClick={() => showT("T&C settings")}
              >
                <IC.Gear />
              </button>
            </div>
            <div className="tc-list">
              1. Goods once sold will not be taken back or exchanged
              <br />
              2. All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction
              only
            </div>
          </div>

          <div className="summary-panel">
            {additionalCharges.map((c) => (
              <div key={c.id} className="charge-row">
                <input
                  className="charge-label-input"
                  placeholder="Enter charge (ex. Transport Charge)"
                  value={c.label}
                  onChange={(e) => updCharge(c.id, "label", e.target.value)}
                />
                <div className="charge-right">
                  <div className="charge-amount-wrap">
                    <span className="charge-rupee">₹</span>
                    <input
                      type="number"
                      className="charge-amt-input"
                      value={c.amount === 0 ? "" : c.amount}
                      onChange={(e) =>
                        updCharge(c.id, "amount", Number(e.target.value))
                      }
                      placeholder="0"
                    />
                  </div>
                  <select
                    className="charge-tax-select"
                    value={c.taxRate}
                    onChange={(e) => updCharge(c.id, "taxRate", e.target.value)}
                  >
                    <option>No Tax Applicable</option>
                    <option>5%</option>
                    <option>12%</option>
                    <option>18%</option>
                    <option>28%</option>
                  </select>
                  <button
                    className="charge-remove-btn"
                    onClick={() => removeCharge(c.id)}
                  >
                    <IC.X />
                  </button>
                </div>
              </div>
            ))}
            <button className="btn-add-charge-link" onClick={addCharge}>
              {additionalCharges.length === 0
                ? "+ Add Additional Charges"
                : "+ Add Another Charge"}
            </button>

            <div className="summary-line">
              <span className="summary-line-label">Taxable Amount</span>
              <span className="summary-line-value">
                {fmtAmt(taxableAmount)}
              </span>
            </div>
            {totalTax > 0 && (
              <>
                <div className="summary-line tax-sub-line">
                  <span className="summary-line-label">SGST@9</span>
                  <span className="summary-line-value">
                    {fmtAmt(totalTax / 2)}
                  </span>
                </div>
                <div className="summary-line tax-sub-line">
                  <span className="summary-line-label">CGST@9</span>
                  <span className="summary-line-value">
                    {fmtAmt(totalTax / 2)}
                  </span>
                </div>
              </>
            )}

            {!showDiscount ? (
              <button
                className="btn-add-discount-link"
                onClick={() => setShowDiscount(true)}
              >
                + Add Discount
              </button>
            ) : (
              <div className="discount-row">
                <span className="discount-label">Discount</span>
                <div className="discount-inputs">
                  <select
                    className="discount-type-select"
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                  >
                    <option value="%">%</option>
                    <option value="₹">₹</option>
                  </select>
                  <input
                    type="number"
                    className="discount-val-input"
                    value={discountVal}
                    onChange={(e) => setDiscountVal(Number(e.target.value))}
                  />
                  <span className="discount-computed">
                    - {fmtAmt(discountAmt)}
                  </span>
                  <button
                    className="charge-remove-btn"
                    onClick={() => {
                      setShowDiscount(false);
                      setDiscountVal(0);
                    }}
                  >
                    <IC.X />
                  </button>
                </div>
              </div>
            )}

            <div className="summary-checkbox-row">
              <label className="summary-checkbox-label">
                <input
                  type="checkbox"
                  checked={applyTCS}
                  onChange={(e) => setApplyTCS(e.target.checked)}
                />
                Apply TCS
              </label>
            </div>
            <div className="round-off-line">
              <label className="summary-checkbox-label">
                <input
                  type="checkbox"
                  checked={roundOff}
                  onChange={(e) => setRoundOff(e.target.checked)}
                />
                Auto Round Off
              </label>
              {roundOff && (
                <div className="round-off-controls">
                  <select
                    value={roundOffDir}
                    onChange={(e) => setRoundOffDir(e.target.value)}
                    className="round-dir-select"
                  >
                    <option value="+Add">+Add</option>
                    <option value="-Sub">-Sub</option>
                  </select>
                  <span className="round-rupee">₹</span>
                  <input
                    type="number"
                    className="round-val-input"
                    value={roundOffVal}
                    onChange={(e) => setRoundOffVal(Number(e.target.value))}
                  />
                </div>
              )}
            </div>

            <div className="total-amount-line">
              <span className="total-amount-label">Total Amount</span>
              <div className="enter-payment-wrap">
                {totalAmt > 0 && (
                  <span className="total-amount-value-big">
                    {fmtAmt(totalAmt)}
                  </span>
                )}
                {totalAmt === 0 && (
                  <span className="total-amount-value">₹ 0</span>
                )}
                {!isEdit && (
                  <button className="enter-payment-btn">
                    Enter Payment amount
                  </button>
                )}
              </div>
            </div>
            <div className="mark-paid-line">
              <label className="mark-paid-label">
                Mark as fully paid
                <input
                  type="checkbox"
                  checked={markPaid}
                  onChange={(e) => {
                    setMarkPaid(e.target.checked);
                    if (e.target.checked) setAmtPaid(totalAmt);
                    else setAmtPaid(0);
                  }}
                />
              </label>
            </div>
            <div className="amount-paid-line">
              <span className="amount-paid-label">Amount Paid</span>
              <div className="amount-paid-inputs">
                <div className="rupee-input-wrap">
                  <span className="rupee-prefix">₹</span>
                  <input
                    type="number"
                    className="rupee-num-input"
                    value={amtPaid}
                    onChange={(e) => setAmtPaid(Number(e.target.value))}
                  />
                </div>
                <select
                  className="payment-method-select"
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                >
                  <option>Cash</option>
                  <option>Bank</option>
                  <option>UPI</option>
                </select>
              </div>
            </div>
            <div className="summary-checkbox-row">
              <label className="summary-checkbox-label">
                <input
                  type="checkbox"
                  checked={applyTDS}
                  onChange={(e) => setApplyTDS(e.target.checked)}
                />
                Apply TDS
              </label>
            </div>
            <div className="balance-line">
              <span className="balance-label">Balance Amount</span>
              <span className="balance-value">{fmtAmt(balance)}</span>
            </div>
            <div className="authorized-row">
              Authorized signatory for <strong>scratchweb.solutions</strong>
            </div>
            <div className="sig-box" />
          </div>
        </div>
      </div>

      {/* ══════════ MODALS ══════════ */}
      {showCreateParty && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateParty(false)}
        >
          <div
            className="modal create-party-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <span className="modal-title">Create New Party</span>
              <button
                className="modal-close"
                onClick={() => setShowCreateParty(false)}
              >
                <IC.X />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>
                  Party Name <span className="req">*</span>
                </label>
                <input
                  placeholder="Enter name"
                  value={cpName}
                  className={cpErr ? "error" : ""}
                  onChange={(e) => {
                    setCpName(e.target.value);
                    setCpErr(false);
                  }}
                />
                {cpErr && (
                  <div className="error-msg">This field is mandatory</div>
                )}
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  placeholder="Enter Mobile Number"
                  value={cpPhone}
                  onChange={(e) => setCpPhone(e.target.value)}
                />
              </div>
              {!cpShowAddr ? (
                <button
                  className="btn-optional"
                  onClick={() => setCpShowAddr(true)}
                >
                  <IC.Plus /> + Add Address (Optional)
                </button>
              ) : (
                <div className="optional-section">
                  <div className="optional-section-header">
                    <span className="optional-section-label">
                      Address (Optional)
                    </span>
                    <button
                      className="btn-remove-section"
                      onClick={() => setCpShowAddr(false)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="form-group">
                    <label>
                      BILLING ADDRESS <span className="req">*</span>
                    </label>
                    <textarea
                      placeholder="Enter billing address"
                      value={cpAddr}
                      onChange={(e) => setCpAddr(e.target.value)}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>STATE</label>
                      <input
                        placeholder="Enter State"
                        value={cpState}
                        onChange={(e) => setCpState(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>PINCODE</label>
                      <input
                        placeholder="Enter Pincode"
                        value={cpPin}
                        onChange={(e) => setCpPin(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>CITY</label>
                    <input
                      placeholder="Enter City"
                      value={cpCity}
                      onChange={(e) => setCpCity(e.target.value)}
                    />
                  </div>
                  <label className="ship-checkbox">
                    <input
                      type="checkbox"
                      checked={cpSameShip}
                      onChange={(e) => setCpSameShip(e.target.checked)}
                    />
                    Shipping address same as billing address
                  </label>
                </div>
              )}
              {!cpShowGST ? (
                <button
                  className="btn-optional"
                  onClick={() => setCpShowGST(true)}
                >
                  <IC.Plus /> + Add GSTIN (Optional)
                </button>
              ) : (
                <div className="optional-section">
                  <div className="optional-section-header">
                    <span className="optional-section-label">
                      GSTIN (Optional)
                    </span>
                    <button
                      className="btn-remove-section"
                      onClick={() => setCpShowGST(false)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="form-group">
                    <label>GSTIN</label>
                    <input
                      placeholder="ex: 29XXXXX9438X1XX"
                      value={cpGSTIN}
                      onChange={(e) => setCpGSTIN(e.target.value)}
                    />
                  </div>
                </div>
              )}
              <div className="custom-fields-note">
                You can add Custom Fields from{" "}
                <a href="#" onClick={(e) => e.preventDefault()}>
                  Party Settings
                </a>
                .
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="modal-btn-cancel"
                onClick={() => setShowCreateParty(false)}
              >
                Cancel
              </button>
              <button
                className="modal-btn-save"
                onClick={saveParty}
                disabled={!cpName.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showShipModal && (
        <div className="modal-overlay" onClick={() => setShowShipModal(false)}>
          <div
            className="modal ship-addr-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <span className="modal-title">Change Shipping Address</span>
              <button
                className="modal-close"
                onClick={() => setShowShipModal(false)}
              >
                <IC.X />
              </button>
            </div>
            <div className="modal-body">
              <div className="ship-same-checkbox-row">
                <label className="ship-checkbox">
                  <input
                    type="checkbox"
                    checked={!shipSaved}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setShipSaved(false);
                        setShowShipModal(false);
                      }
                    }}
                  />
                  Same as Bill From address
                </label>
              </div>
              <div className="ship-divider-label">
                — or enter a different shipping address —
              </div>
              <div className="form-group">
                <label>
                  Name <span className="req">*</span>
                </label>
                <input
                  placeholder="Enter name"
                  value={shipName}
                  onChange={(e) => setShipName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  placeholder="Enter phone number"
                  value={shipPhone}
                  onChange={(e) => setShipPhone(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  placeholder="Enter shipping address"
                  value={shipAddr}
                  onChange={(e) => setShipAddr(e.target.value)}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    placeholder="Enter city"
                    value={shipCity}
                    onChange={(e) => setShipCity(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    placeholder="Enter state"
                    value={shipState}
                    onChange={(e) => setShipState(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Pincode</label>
                <input
                  placeholder="Enter pincode"
                  value={shipPin}
                  onChange={(e) => setShipPin(e.target.value)}
                  style={{ width: "50%" }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="modal-btn-cancel"
                onClick={() => setShowShipModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal-btn-save"
                onClick={() => {
                  setShipSaved(true);
                  setShowShipModal(false);
                  showT("Shipping address updated");
                }}
              >
                Save Address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ ADD ITEMS MODAL ══════════ */}
      {showAddItems && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowAddItems(false);
            setItemSearch("");
          }}
        >
          <div className="aim-modal" onClick={(e) => e.stopPropagation()}>
            <div className="aim-header">
              <span className="aim-title">Add Items to Bill</span>
              <button
                className="aim-close"
                onClick={() => {
                  setShowAddItems(false);
                  setItemSearch("");
                }}
              >
                <IC.X />
              </button>
            </div>
            <div className="aim-search-row">
              <div className="aim-search-box">
                <span className="aim-search-icon">
                  <IC.Search />
                </span>
                <input
                  className="aim-search-input"
                  placeholder="Search by Item / Serial no./ HSN code/ SKU/ Custom Field / Category"
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  autoFocus
                />
                <button className="aim-barcode-btn">
                  <IC.Barcode />
                </button>
              </div>
              <div className="aim-cat-wrap">
                <select className="aim-cat-select">
                  <option>Select Category</option>
                  <option>Electronics</option>
                  <option>Software</option>
                </select>
              </div>
              <button
                className="aim-create-btn"
                onClick={() => {
                  setShowAddItems(false);
                  setItemSearch("");
                  onCreateItem();
                }}
              >
                Create New Item
              </button>
            </div>
            <div className="aim-table-wrap">
              <table className="aim-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th style={{ width: 100 }}>Item Code</th>
                    <th style={{ width: 90 }}>Stock</th>
                    <th style={{ width: 110 }}>Sales Price</th>
                    <th style={{ width: 120 }}>Purchase Price</th>
                    <th style={{ width: 110, textAlign: "center" }}>
                      Quantity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtCatalog.map((c) => {
                    const isAdded = addedIds.includes(c.id);
                    // ── FIX: use ?? instead of || so qty is always 1 when shown ──
                    const qty = pendingQtys[c.id] ?? 1;
                    return (
                      <tr key={c.id} className={isAdded ? "aim-row-added" : ""}>
                        <td className="aim-item-name">{c.name}</td>
                        <td className="aim-td-muted">{c.code}</td>
                        <td className="aim-td-muted">
                          <span
                            style={{
                              color:
                                !c.stock || c.stock === "0"
                                  ? "#e11d48"
                                  : "#16a34a",
                              fontWeight: 500,
                              fontSize: 11,
                            }}
                          >
                            {c.stock || "0"}
                          </span>
                        </td>
                        <td className="aim-td-muted">
                          {c.salesPrice > 0
                            ? `₹${c.salesPrice.toLocaleString("en-IN")}`
                            : ""}
                        </td>
                        <td className="aim-td-muted">
                          {c.purchasePrice > 0
                            ? `₹${c.purchasePrice.toLocaleString("en-IN")}`
                            : ""}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {isAdded ? (
                            <div className="aim-qty-controls">
                              <button
                                className="aim-qty-btn"
                                onClick={() => {
                                  if (qty <= 1) {
                                    toggleItem(c);
                                  } else {
                                    setPendingQty(c.id, qty - 1);
                                  }
                                }}
                              >
                                −
                              </button>
                              <input
                                className="aim-qty-input"
                                type="number"
                                value={qty || ""}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  if (val <= 0) {
                                    toggleItem(c);
                                  } else {
                                    setPendingQty(c.id, val);
                                  }
                                }}
                              />
                              <button
                                className="aim-qty-btn"
                                onClick={() => setPendingQty(c.id, qty + 1)}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              className="aim-add-btn"
                              onClick={() => toggleItem(c)}
                            >
                              + Add
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filtCatalog.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          textAlign: "center",
                          padding: 28,
                          color: "#9aabbd",
                        }}
                      >
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="aim-shortcuts-bar">
              <span className="aim-shortcuts-label">Keyboard Shortcuts:</span>
              <span className="aim-shortcut-item">
                Change Quantity <kbd>Enter</kbd>
              </span>
              <span className="aim-shortcut-sep" />
              <span className="aim-shortcut-item">
                Move Between Items <kbd>+</kbd> <kbd>/</kbd>
              </span>
            </div>
            <div className="aim-footer">
              <span className="aim-selected-count">
                {addedIds.length} Item(s) Selected
              </span>
              <div className="aim-footer-btns">
                <button
                  className="aim-cancel-btn"
                  onClick={() => {
                    setShowAddItems(false);
                    setItemSearch("");
                    setAddedItems({});
                  }}
                >
                  Cancel (ESC)
                </button>
                <button className="aim-confirm-btn" onClick={addToBill}>
                  Add to Bill (F7)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCPISettings && (
        <div className="pi-overlay" onClick={() => setShowCPISettings(false)}>
          <div className="pi-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pi-modal-head">
              <span className="pi-modal-title">
                Quick Purchase Invoice Settings
              </span>
              <button
                className="pi-modal-close"
                onClick={() => setShowCPISettings(false)}
              >
                <IC.X />
              </button>
            </div>
            <SettingsPanel
              settings={settings}
              setSettings={setSettings}
              onClose={() => setShowCPISettings(false)}
              onSave={handleSaveSettings}
            />
          </div>
        </div>
      )}

      {toast && <div className="pi-toast">{toast}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════
   PURCHASE INVOICES LIST PAGE
══════════════════════════════════════════ */
function PurchaseInvoicesPage({
  invoices,
  setInvoices,
  loading,
  settings,
  setSettings,
  onCreateNew,
  onEdit,
  onDuplicate,
  onGSTR2,
  onDaybook,
  onView,
}: {
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  loading: boolean;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onCreateNew: () => void;
  onEdit: (inv: Invoice) => void;
  onDuplicate: (inv: Invoice) => void;
  onGSTR2: () => void;
  onDaybook: () => void;
  onView: (inv: Invoice) => void;
}) {
  const [activeCard, setActiveCard] = useState<"all" | "paid" | "unpaid">(
    "all",
  );
  const [dateFilter, setDateFilter] = useState<DateFilter>("Last 365 Days");
  const [customFrom, setCustomFrom] = useState<Date | null>(null);
  const [customTo, setCustomTo] = useState<Date | null>(null);
  const [showDateList, setShowDateList] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showSType, setShowSType] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>(
    "Invoice No. & Party name",
  );
  const [query, setQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [ctx, setCtx] = useState<{ id: number; x: number; y: number } | null>(
    null,
  );
  const [toast, setToast] = useState<string | null>(null);
  const dateRef = useRef<HTMLDivElement>(null),
    reportsRef = useRef<HTMLDivElement>(null),
    stypeRef = useRef<HTMLDivElement>(null),
    ctxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setShowDateList(false);
        setShowCalendar(false);
      }
      if (reportsRef.current && !reportsRef.current.contains(e.target as Node))
        setShowReports(false);
      if (stypeRef.current && !stypeRef.current.contains(e.target as Node))
        setShowSType(false);
      if (ctxRef.current && !ctxRef.current.contains(e.target as Node))
        setCtx(null);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const showT = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2400);
  };

  const highlight = (text: string, q: string) => {
    if (!q.trim()) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(q.toLowerCase().trim());
    if (idx === -1) return <>{text}</>;
    return (
      <>
        {text.slice(0, idx)}
        <mark
          style={{
            background: "#fef08a",
            color: "#1a2332",
            padding: "0 1px",
            borderRadius: 2,
          }}
        >
          {text.slice(idx, idx + q.trim().length)}
        </mark>
        {text.slice(idx + q.trim().length)}
      </>
    );
  };

  const displayed = useCallback(() => {
    const [from, to] = getRange(
      dateFilter,
      customFrom || undefined,
      customTo || undefined,
    );
    return invoices.filter((inv) => {
      const d = new Date(inv.date);
      d.setHours(12);
      if (d < from || d > to) return false;
      if (activeCard === "paid" && inv.amtPaid < inv.amount) return false;
      if (activeCard === "unpaid" && inv.amtPaid >= inv.amount) return false;
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        if (searchType === "Mobile Number") {
          return inv.partyPhone.toLowerCase().includes(q);
        }
        return (
          inv.partyName.toLowerCase().includes(q) ||
          inv.invoiceNumber.toString().toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [
    invoices,
    activeCard,
    dateFilter,
    customFrom,
    customTo,
    query,
    searchType,
  ])();

  const totalAll = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const totalPaid = invoices.reduce(
    (sum, inv) => sum + Number(inv.amtPaid || 0),
    0,
  );
  const totalUnpaid = invoices.reduce(
    (sum, inv) =>
      sum + Math.max(Number(inv.amount) - Number(inv.amtPaid || 0), 0),
    0,
  );

  const handleDot = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setCtx({ id, x: r.right - 173, y: r.bottom + 5 });
  };

  const doCtx = async (action: string) => {
    const inv = invoices.find((i) => i.id === ctx?.id);
    setCtx(null);
    if (!inv) return;
    if (action === "edit") {
      onEdit(inv);
      return;
    }
    if (action === "duplicate") {
      onDuplicate(inv);
      return;
    }
    if (action === "history") {
      showT(`Edit history for Invoice #${inv.invoiceNumber}`);
      return;
    }
    if (action === "debit") {
      showT(`Debit note issued for Invoice #${inv.invoiceNumber}`);
      return;
    }
    if (action === "delete") {
      if (
        !window.confirm(
          `Delete Invoice #${inv.invoiceNumber}? This cannot be undone.`,
        )
      )
        return;
      try {
        await deletePurchaseInvoice(inv.id);
        setInvoices((p) => p.filter((i) => i.id !== inv.id));
        showT(`Invoice #${inv.invoiceNumber} deleted`);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Delete failed";
        showT(msg);
      }
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.put("/purchase-invoices/settings", {
        prefix: settings.prefix,
        enablePrefix: settings.prefixEnabled,
        showItemImage: settings.showItemImage,
        enablePriceHistory: settings.enablePriceHistory,
      });
      setShowSettings(false);
      showT("Settings saved");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to save settings";
      showT(msg);
    }
  };

  const dateBtnLabel = () =>
    dateFilter === "Custom" && customFrom && customTo
      ? `${fmtShort(customFrom)} - ${fmtShort(customTo)}`
      : dateFilter;

  return (
    <div className="pi-page">
      <div className="pi-header">
        <h1 className="pi-title">Purchase Invoices</h1>
        <div className="pi-header-right">
          <div ref={reportsRef} style={{ position: "relative" }}>
            <button
              className="btn-reports"
              onClick={() => setShowReports((v) => !v)}
            >
              <IC.Report /> Reports <IC.Chevron />
            </button>
            {showReports && (
              <div className="pi-dd pi-reports-dd">
                <div
                  className="pi-dd-item"
                  onClick={() => {
                    onGSTR2();
                    setShowReports(false);
                  }}
                >
                  <IC.Report /> GSTR 2 (Purchase)
                </div>
                <div
                  className="pi-dd-item"
                  onClick={() => {
                    onDaybook();
                    setShowReports(false);
                  }}
                >
                  <IC.Note /> DayBook
                </div>
              </div>
            )}
          </div>
          <button className="btn-icon" onClick={() => setShowSettings(true)}>
            <IC.Settings />
          </button>
          <button className="btn-icon" onClick={() => showT("View mode")}>
            <IC.Monitor />
          </button>
        </div>
      </div>

      <div className="pi-cards">
        {(
          [
            [
              "all",
              "active-total",
              <IC.Cart />,
              "Total Purchases",
              totalAll,
              "c-blue",
            ],
            ["paid", "active-paid", <IC.Check />, "Paid", totalPaid, "c-green"],
            [
              "unpaid",
              "active-unpaid",
              <IC.Alert />,
              "Unpaid",
              totalUnpaid,
              "c-red",
            ],
          ] as any[]
        ).map(([key, cls, icon, lbl, val, icls]) => (
          <div
            key={key}
            className={`pi-card ${activeCard === key ? cls : ""}`}
            onClick={() => setActiveCard(key)}
          >
            <div className="pi-card-label">
              <span className={icls}>{icon}</span>
              {lbl}
            </div>
            <div className="pi-card-amount">
              ₹ {val.toLocaleString("en-IN")}
            </div>
          </div>
        ))}
      </div>

      <div className="pi-toolbar">
        <div className="pi-search-group">
          <span className="pi-search-icon">
            <IC.Search />
          </span>
          <input
            className="pi-search-input"
            placeholder={
              searchType === "Mobile Number"
                ? "Search by mobile number…"
                : "Search by invoice no. or party name…"
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              title="Clear search"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#98a2b3",
                display: "flex",
                alignItems: "center",
                padding: "0 6px",
              }}
            >
              <IC.X />
            </button>
          )}
          <div className="pi-stype-wrap" ref={stypeRef}>
            <button
              className="pi-stype-btn"
              onClick={() => setShowSType((v) => !v)}
            >
              {searchType === "Invoice No. & Party name"
                ? "Invoice No. & Party name"
                : "Mobile Number"}
              <IC.Chevron />
            </button>
            {showSType && (
              <div className="pi-dd pi-stype-dd">
                {(
                  ["Invoice No. & Party name", "Mobile Number"] as SearchType[]
                ).map((t) => (
                  <div
                    key={t}
                    className={`pi-dd-item ${searchType === t ? "sel" : ""}`}
                    onClick={() => {
                      setSearchType(t);
                      setQuery("");
                      setShowSType(false);
                    }}
                  >
                    {searchType === t && (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          width: 12,
                          height: 12,
                          marginRight: 6,
                          color: "#4361ee",
                        }}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {t}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="pi-date-wrap" ref={dateRef}>
          <button
            className="pi-date-btn"
            onClick={() => {
              setShowCalendar(false);
              setShowDateList((v) => !v);
            }}
          >
            <IC.Calendar /> {dateBtnLabel()} <span className="arr">▾</span>
          </button>
          {showDateList && !showCalendar && (
            <div className="pi-dd pi-date-list-dd">
              {DATE_OPTS.map((opt) => (
                <div
                  key={opt}
                  className={`pi-dd-item ${dateFilter === opt ? "sel" : ""}`}
                  onClick={() => {
                    if (opt === "Custom") {
                      setShowCalendar(true);
                      setShowDateList(false);
                    } else {
                      setDateFilter(opt);
                      setShowDateList(false);
                    }
                  }}
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
          {showCalendar && (
            <CalendarPicker
              onApply={(f, t) => {
                setCustomFrom(f);
                setCustomTo(t);
                setDateFilter("Custom");
                setShowCalendar(false);
              }}
              onCancel={() => setShowCalendar(false)}
            />
          )}
        </div>
        <button className="btn-create" onClick={onCreateNew}>
          Create Purchase Invoice
        </button>
      </div>

      <div className="pi-table-wrap">
        {query.trim() && displayed.length > 0 && (
          <div
            style={{
              padding: "8px 16px",
              fontSize: 12,
              color: "#667085",
              borderBottom: "1px solid #f0f2f5",
              background: "#fafbfc",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>
              <strong style={{ color: "#344054" }}>{displayed.length}</strong>{" "}
              result{displayed.length !== 1 ? "s" : ""} for{" "}
              <strong style={{ color: "#4361ee" }}>"{query}"</strong>
              {searchType === "Mobile Number"
                ? " in mobile numbers"
                : " in invoice numbers & party names"}
            </span>
            <button
              onClick={() => setQuery("")}
              style={{
                fontSize: 11,
                color: "#98a2b3",
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <IC.X /> Clear
            </button>
          </div>
        )}

        <table>
          <thead>
            <tr>
              <th className="sortable">Date ↕</th>
              <th>Purchase Invoice Number</th>
              <th>Party Name</th>
              <th>Due In</th>
              <th>Amount</th>
              <th>Status</th>
              <th style={{ width: 44 }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7}>
                  <div className="pi-empty">Loading invoices…</div>
                </td>
              </tr>
            ) : displayed.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="pi-empty">
                    {query.trim() ? (
                      <>
                        <div
                          style={{
                            fontSize: 15,
                            marginBottom: 4,
                            color: "#667085",
                          }}
                        >
                          No results for "{query}"
                        </div>
                        <div style={{ fontSize: 12, color: "#98a2b3" }}>
                          {searchType === "Mobile Number"
                            ? "Try searching by a different mobile number"
                            : "Try searching by party name or invoice number"}
                        </div>
                        <button
                          onClick={() => setQuery("")}
                          style={{
                            marginTop: 10,
                            fontSize: 12,
                            color: "#4361ee",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                        >
                          Clear search
                        </button>
                      </>
                    ) : (
                      "No purchase invoices found."
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              displayed.map((inv) => (
                <tr
                  key={inv.id}
                  className="pi-table-row"
                  onClick={() => onView(inv)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{fmtDate(new Date(inv.date))}</td>
                  <td>
                    {searchType === "Invoice No. & Party name"
                      ? highlight(inv.invoiceNumber.toString(), query)
                      : inv.invoiceNumber}
                  </td>
                  <td>
                    {searchType === "Invoice No. & Party name" ? (
                      highlight(inv.partyName, query)
                    ) : searchType === "Mobile Number" ? (
                      <>
                        {inv.partyName}{" "}
                        <span
                          style={{
                            fontSize: 11,
                            color: "#667085",
                          }}
                        >
                          ({highlight(inv.partyPhone, query)})
                        </span>
                      </>
                    ) : (
                      inv.partyName
                    )}
                  </td>
                  <td>{inv.dueIn}</td>
                  <td className="td-amt">
                    ₹ {inv.amount.toLocaleString("en-IN")}
                    {(inv.status === "unpaid" || inv.status === "partial") &&
                      inv.amount > 0 && (
                        <div className="td-amt-sub">
                          (₹{" "}
                          {(inv.amount - inv.amtPaid).toLocaleString("en-IN")}{" "}
                          unpaid)
                        </div>
                      )}
                  </td>
                  <td>
                    {inv.status === "paid" && (
                      <span className="s-badge s-paid">Paid</span>
                    )}
                    {inv.status === "unpaid" && (
                      <span className="s-badge s-unpaid">Unpaid</span>
                    )}
                    {inv.status === "partial" && (
                      <span className="s-badge s-partial">Partial</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="tdot-btn"
                      onClick={(e) => handleDot(e, inv.id)}
                    >
                      <IC.Dots />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {ctx && (
        <div
          ref={ctxRef}
          className="pi-ctx"
          style={{ top: ctx.y, left: ctx.x }}
        >
          <div className="pi-dd-item" onClick={() => doCtx("edit")}>
            <IC.Edit />
            Edit
          </div>
          <div className="pi-dd-item" onClick={() => doCtx("history")}>
            <IC.History />
            Edit History
          </div>
          <div className="pi-dd-item" onClick={() => doCtx("duplicate")}>
            <IC.Copy />
            Duplicate
          </div>
          <div className="pi-dd-item" onClick={() => doCtx("debit")}>
            <IC.Note />
            Issue Debit Note
          </div>
          <div className="pi-dd-divider" />
          <div className="pi-dd-item danger" onClick={() => doCtx("delete")}>
            <IC.Trash />
            Delete
          </div>
        </div>
      )}

      {showSettings && (
        <div className="pi-overlay" onClick={() => setShowSettings(false)}>
          <div className="pi-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pi-modal-head">
              <span className="pi-modal-title">
                Quick Purchase Invoice Settings
              </span>
              <button
                className="pi-modal-close"
                onClick={() => setShowSettings(false)}
              >
                <IC.X />
              </button>
            </div>
            <SettingsPanel
              settings={settings}
              setSettings={setSettings}
              onClose={() => setShowSettings(false)}
              onSave={handleSaveSettings}
            />
          </div>
        </div>
      )}

      {toast && <div className="pi-toast">{toast}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════ ROOT ══ */
export default function PurchaseModule() {
  const navigate = useNavigate();
  const [page, setPage] = useState<PageMode>("list");
  const [editTarget, setEditTarget] = useState<Invoice | null>(null);
  const [viewTarget, setViewTarget] = useState<Invoice | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [allParties, setAllParties] = useState<Party[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    prefixEnabled: true,
    prefix: "",
    sequenceNumber: 1,
    showItemImage: true,
    enablePriceHistory: true,
  });

  const mapInvoice = (raw: RawPurchaseInvoice): Invoice => ({
    id: raw.id,
    date:
      raw.invoiceDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    invoiceNumber: raw.purchaseInvNo,
    partyName: raw.party?.partyName ?? raw.party?.name ?? "",
    partyId: raw.partyId,
    partyPhone: raw.party?.mobileNumber ?? raw.party?.phone ?? "",
    partyPan: raw.party?.gstin ?? raw.party?.pan ?? "",
    dueIn: raw.dueDate
      ? Math.ceil(
          (new Date(raw.dueDate).getTime() -
            new Date(raw.invoiceDate).getTime()) /
            (1000 * 60 * 60 * 24),
        ) + " days"
      : "-",
    amount: Number(raw.totalAmount ?? 0),
    status:
      raw.status === "PAID"
        ? "paid"
        : raw.status === "PARTIAL"
          ? "partial"
          : raw.status === "OPEN"
            ? "unpaid"
            : "",
    items: (raw.items ?? []).map((i: RawInvoiceItem) => ({
      id: i.productId ?? i.id ?? 0,
      productId: i.productId ?? i.id ?? 0,
      godownId: i.godownId ?? null,
      name: i.product?.name ?? "",
      hsn: i.hsnSac ?? "",
      qty: Number(i.quantity),
      price: Number(i.price),
      discount: Number(i.discount ?? 0),
      discountPct: 0,
      tax: Number(i.taxRate ?? 0),
      taxLabel: "None",
    })),
    additionalCharges: (raw.additionalCharges ?? []).map(
      (c: RawAdditionalCharge) => ({
        id: c.id,
        label: c.name,
        amount: Number(c.amount),
        taxRate: "No Tax Applicable",
      }),
    ),
    shipping: defaultShipping(
      raw.party?.partyName ?? raw.party?.name ?? "",
      raw.party?.mobileNumber ?? raw.party?.phone ?? "",
    ),
    discountEnabled: Number(raw.discountAmount ?? 0) > 0,
    discountType: "₹",
    discountVal: Number(raw.discountAmount ?? 0),
    roundOff: Number(raw.roundOff ?? 0) !== 0,
    roundOffDir: Number(raw.roundOff ?? 0) >= 0 ? "+Add" : "-Sub",
    roundOffVal: Math.abs(Number(raw.roundOff ?? 0)),
    amtPaid: Number(raw.amountPaid ?? 0),
    payMethod: raw.paymentMode ?? "Cash",
  });

  const loadInvoices = async () => {
    setLoadingList(true);
    try {
      const res = await getAllPurchaseInvoices();
      const list: RawPurchaseInvoice[] = res?.data?.data ?? res?.data ?? [];
      setInvoices(list.map(mapInvoice));
    } catch (err) {
      console.error("Failed to load invoices:", err);
    } finally {
      setLoadingList(false);
    }
  };

  const loadParties = async () => {
    try {
      const res = await getAllParties();
      const list: any[] = res.data?.data ?? res.data ?? res;
      setAllParties(
        list.map((p: any) => ({
          id: p.id,
          name: p.partyName ?? p.name ?? "",
          phone: p.mobileNumber ?? p.phone ?? "",
          pan: p.gstin ?? p.pan ?? "",
          balance: Number(p.balance ?? 0),
        })),
      );
    } catch (err) {
      console.error("Failed to load parties:", err);
    }
  };

  useEffect(() => {
    loadInvoices();
    loadParties();
    api
      .get("/purchase-invoices/settings")
      .then((res: any) => {
        const data = res.data.data ?? res.data;
        setSettings({
          prefixEnabled: data.enablePrefix,
          prefix: data.prefix,
          sequenceNumber: data.sequenceNumber,
          showItemImage: data.showItemImage,
          enablePriceHistory: data.enablePriceHistory,
        });
      })
      .catch((err) => {
        console.log("Failed to load purchase invoice settings", err);
      });
  }, []);

  const handleSaved = (
    inv: Invoice,
    isEdit: boolean,
    goToList: boolean = true,
  ) => {
    setInvoices((prev) => {
      if (isEdit) {
        return prev.map((i) => (i.id === inv.id ? inv : i));
      }
      return [inv, ...prev];
    });
    setEditTarget(null);
    if (goToList) {
      setPage("list");
    }
    setTimeout(loadInvoices, 500);
  };

  const handleEdit = (inv: Invoice) => {
    setEditTarget(inv);
    setPage("edit");
  };
  const handleDuplicate = (inv: Invoice) => {
    setEditTarget(inv);
    setPage("duplicate");
  };
  const handleView = (inv: Invoice) => {
    setViewTarget(inv);
    setPage("view");
  };
  const handleInvoiceUpdate = (updated: Invoice) => {
    setInvoices((p) => p.map((i) => (i.id === updated.id ? updated : i)));
    setViewTarget(updated);
  };
  const handleCreateItem = () => {
    navigate("/cashier/create-item");
  };

  if (page === "gstr2")
    return <GSTR2Page invoices={invoices} onBack={() => setPage("list")} />;
  if (page === "daybook")
    return <DaybookPage invoices={invoices} onBack={() => setPage("list")} />;
  if (page === "view" && viewTarget) {
    const latest = invoices.find((i) => i.id === viewTarget.id) || viewTarget;
    return (
      <InvoiceBillView
        invoice={latest}
        onBack={() => {
          setViewTarget(null);
          setPage("list");
        }}
        onInvoiceUpdate={handleInvoiceUpdate}
        settings={settings}
      />
    );
  }
  if (page === "edit" && editTarget)
    return (
      <CreatePurchaseInvoicePage
        mode="edit"
        editData={editTarget}
        seqNo={settings.sequenceNumber}
        onBack={() => {
          setEditTarget(null);
          setPage("list");
        }}
        onSaved={handleSaved}
        onCreateItem={handleCreateItem}
        allParties={allParties}
        setAllParties={setAllParties}
        settings={settings}
        setSettings={setSettings}
      />
    );
  if (page === "duplicate" && editTarget)
    return (
      <CreatePurchaseInvoicePage
        mode="duplicate"
        editData={editTarget}
        seqNo={settings.sequenceNumber}
        onBack={() => {
          setEditTarget(null);
          setPage("list");
        }}
        onSaved={handleSaved}
        onCreateItem={handleCreateItem}
        allParties={allParties}
        setAllParties={setAllParties}
        settings={settings}
        setSettings={setSettings}
      />
    );
  if (page === "create")
    return (
      <CreatePurchaseInvoicePage
        mode="create"
        seqNo={settings.sequenceNumber}
        onBack={() => setPage("list")}
        onSaved={handleSaved}
        onCreateItem={handleCreateItem}
        allParties={allParties}
        setAllParties={setAllParties}
        settings={settings}
        setSettings={setSettings}
      />
    );

  return (
    <PurchaseInvoicesPage
      invoices={invoices}
      setInvoices={setInvoices}
      loading={loadingList}
      settings={settings}
      setSettings={setSettings}
      onCreateNew={() => setPage("create")}
      onEdit={handleEdit}
      onDuplicate={handleDuplicate}
      onGSTR2={() => setPage("gstr2")}
      onDaybook={() => setPage("daybook")}
      onView={handleView}
    />
  );
}
