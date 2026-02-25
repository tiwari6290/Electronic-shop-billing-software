import React, { useState } from "react";
import "./StaffAttendance.css";

import img1 from "../../../assets/adminstaffattendence1.png";
import img2 from "../../../assets/adminattendence2.png";
import img3 from "../../../assets/adminstaffattendence3.png";

/* ============================================================
   TYPES
   ============================================================ */
type AttendanceStatus = "P" | "A" | "HD" | "PL" | "WO";

/** Callback fired whenever a salary payment is saved — use this to push to Expenses */
export interface SalaryPaymentEvent {
  id: number;
  date: string;
  staffName: string;
  amount: number;
  paymentType: string;
  mode: string;
  remarks: string;
}

interface StaffAttendanceProps {
  /** Optional: called when a payment is saved so parent can forward it to Expenses */
  onSalaryPayment?: (payment: SalaryPaymentEvent) => void;
}
type DetailTab = "Attendance" | "Payroll" | "Transactions" | "Details";

interface OvertimeEntry {
  date: string;
  type: "hourly" | "fixed";
  hours?: number;
  minutes?: number;
  rateMultiplier?: number;
  customRate?: number;
  fixedAmount?: number;
  totalAmount: number;
}

interface DailyRecord {
  attendance: AttendanceStatus | null;
  overtime: OvertimeEntry | null;
  dayAmount: number;
}

interface PaymentEntry {
  id: number;
  date: string;
  paymentType: string;
  amount: number;
  mode: string;
  remarks: string;
}

interface StaffMember {
  id: number;
  name: string;
  mobile: string;
  salary: number;
  salaryPayoutType: string;
  salaryCycle: string;
  lastMonthDue: number;
  balance: number;
  openingBalance: number;
  openingBalanceType: string;
  openingBalanceDate: string;
  records: Record<string, DailyRecord>;
  payments: PaymentEntry[];
}

interface AddStaffForm {
  name: string;
  mobile: string;
  salaryPayoutType: string;
  salary: string;
  salaryCycle: string;
  openingBalance: string;
  openingBalanceType: string;
}

interface OvertimeForm {
  type: "hourly" | "fixed";
  hours: string;
  minutes: string;
  rateKey: "1x" | "1.5x" | "2x" | "custom";
  customRate: string;
  fixedAmount: string;
}

interface AttendanceSettingsData {
  reminderEnabled: boolean;
  reminderTime: string;
  markPresentByDefault: boolean;
  shiftHours: string;
  shiftMinutes: string;
  weeklyOffDays: string[];
}

interface MakePaymentForm {
  paymentType: string;
  date: string;
  amount: string;
  mode: string;
  remarks: string;
}

/* ============================================================
   CONSTANTS
   ============================================================ */
const INITIAL_FORM: AddStaffForm = {
  name: "",
  mobile: "",
  salaryPayoutType: "Monthly",
  salary: "",
  salaryCycle: "10 to 10 Every month",
  openingBalance: "",
  openingBalanceType: "To Pay",
};

const INITIAL_OVERTIME_FORM: OvertimeForm = {
  type: "hourly",
  hours: "00",
  minutes: "00",
  rateKey: "1x",
  customRate: "",
  fixedAmount: "0",
};

const INITIAL_SETTINGS: AttendanceSettingsData = {
  reminderEnabled: true,
  reminderTime: "10:00",
  markPresentByDefault: false,
  shiftHours: "08",
  shiftMinutes: "00",
  weeklyOffDays: ["Sun"],
};

const BADGE_CONFIG: Record<string, { label: string; className: string }> = {
  HD: { label: "HD", className: "att-badge att-badge-hd" },
  PL: { label: "PL", className: "att-badge att-badge-pl" },
  WO: { label: "WO", className: "att-badge att-badge-wo" },
};

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES_OPTIONS = ["00", "15", "30", "45"];

/* ============================================================
   HELPERS
   ============================================================ */
const toDateKey = (date: Date) => date.toISOString().split("T")[0];

const formatDateDisplay = (date: Date) =>
  date.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

const formatDateLong = (date: Date) =>
  date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

const formatMonthYear = (date: Date) =>
  date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });

const formatMonthLong = (date: Date) =>
  date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

const getDayAmount = (salary: number, attendance: AttendanceStatus | null): number => {
  const daily = salary / 26;
  switch (attendance) {
    case "P": case "WO": case "PL": return daily;
    case "HD": return daily / 2;
    default: return 0;
  }
};

const getHourlyRate = (salary: number, rateKey: string, customRate: string): number => {
  const base = salary / 26 / 8;
  if (rateKey === "1x") return parseFloat((base).toFixed(2));
  if (rateKey === "1.5x") return parseFloat((base * 1.5).toFixed(2));
  if (rateKey === "2x") return parseFloat((base * 2).toFixed(2));
  return parseFloat(customRate) || 0;
};

const calcOvertimeTotal = (salary: number, form: OvertimeForm): number => {
  if (form.type === "fixed") return parseFloat(form.fixedAmount) || 0;
  const h = parseInt(form.hours) || 0;
  const m = parseInt(form.minutes) || 0;
  const totalHours = h + m / 60;
  const rate = getHourlyRate(salary, form.rateKey, form.customRate);
  return parseFloat((totalHours * rate).toFixed(2));
};

const getDaysOfMonth = (year: number, month: number): Date[] => {
  const days: Date[] = [];
  const total = getDaysInMonth(year, month);
  for (let d = total; d >= 1; d--) {
    days.push(new Date(year, month, d));
  }
  return days;
};

const calcMonthlyEarnings = (staff: StaffMember, year: number, month: number) => {
  let present = 0, absent = 0, halfDay = 0, paidLeave = 0, weeklyOff = 0;
  let earnedAmount = 0;
  const days = getDaysInMonth(year, month);
  for (let d = 1; d <= days; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const rec = staff.records[key];
    if (!rec || !rec.attendance) continue;
    switch (rec.attendance) {
      case "P": present++; break;
      case "A": absent++; break;
      case "HD": halfDay++; break;
      case "PL": paidLeave++; break;
      case "WO": weeklyOff++; break;
    }
    earnedAmount += rec.dayAmount || 0;
  }
  return { present, absent, halfDay, paidLeave, weeklyOff, earnedAmount };
};

const calcNetPayable = (staff: StaffMember, year: number, month: number) => {
  const { earnedAmount } = calcMonthlyEarnings(staff, year, month);
  const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
  const totalPaid = staff.payments
    .filter((p) => p.date.startsWith(monthStr))
    .reduce((s, p) => s + p.amount, 0);
  return { earnedAmount, totalPaid, netPayable: earnedAmount - totalPaid };
};

const buildSalarySlipHTML = (staff: StaffMember, year: number, month: number): string => {
  const { present, halfDay, paidLeave, earnedAmount } = calcMonthlyEarnings(staff, year, month);
  const { totalPaid, netPayable } = calcNetPayable(staff, year, month);
  const monthName = new Date(year, month, 1).toLocaleDateString("en-IN", { month: "long" });
  const lastDay = getDaysInMonth(year, month);
  const cycleStart = `01 ${monthName.slice(0, 3)} ${year}`;
  const cycleEnd = `${lastDay} ${monthName.slice(0, 3)} ${year}`;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Salary Slip - ${staff.name}</title>
  <style>
    body{font-family:Arial,sans-serif;margin:40px;color:#222}
    .slip-title{font-size:12px;color:#555;letter-spacing:1px;margin-bottom:10px}
    .company-name{font-size:22px;font-weight:bold;margin:0 0 4px}
    .company-mobile{font-size:13px;color:#555}
    hr{border:none;border-top:1px solid #ccc;margin:20px 0}
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 40px;margin:20px 0}
    .info-row{display:flex;gap:8px;font-size:13px;align-items:center}
    .info-label{font-weight:bold;min-width:130px}
    table{width:100%;border-collapse:collapse;margin:16px 0;border:1px solid #e0e0e0}
    th{background:#f0f4ff;color:#5b5ff0;font-size:11px;padding:10px 14px;text-align:left;text-transform:uppercase}
    td{padding:10px 14px;font-size:13px;border-bottom:1px solid #f0f0f0}
    .amount-right{text-align:right}
    .total-row td{font-weight:bold;background:#fafafa;border-top:2px solid #ddd;border-bottom:none}
    @media print{body{margin:20px}}
  </style>
</head>
<body>
  <div class="slip-title">SALARY SLIP</div>
  <div class="company-name">Your Company</div>
  <div class="company-mobile">Mobile: —</div>
  <hr/>
  <div class="info-grid">
    <div class="info-row"><span class="info-label">Staff Name</span><span>:</span><span>${staff.name}</span></div>
    <div class="info-row"><span class="info-label">Mobile number</span><span>:</span><span>${staff.mobile}</span></div>
    <div class="info-row"><span class="info-label">Monthly Salary</span><span>:</span><span>₹ ${staff.salary.toLocaleString("en-IN")}</span></div>
    <div class="info-row"><span class="info-label">Salary cycle</span><span>:</span><span>${cycleStart} - ${cycleEnd}</span></div>
  </div>
  <table>
    <thead><tr><th>EARNING</th><th class="amount-right">AMOUNT</th></tr></thead>
    <tbody>
      ${present > 0 ? `<tr><td>Present (${present} days)</td><td class="amount-right">₹ ${(present * staff.salary / 26).toLocaleString("en-IN", { minimumFractionDigits: 0 })}</td></tr>` : ""}
      ${halfDay > 0 ? `<tr><td>Half Day (${halfDay} days)</td><td class="amount-right">₹ ${(halfDay * staff.salary / 26 / 2).toLocaleString("en-IN", { minimumFractionDigits: 0 })}</td></tr>` : ""}
      ${paidLeave > 0 ? `<tr><td>Paid Leave (${paidLeave} days)</td><td class="amount-right">₹ ${(paidLeave * staff.salary / 26).toLocaleString("en-IN", { minimumFractionDigits: 0 })}</td></tr>` : ""}
      <tr class="total-row"><td>Gross Earnings</td><td class="amount-right">₹ ${earnedAmount.toLocaleString("en-IN", { minimumFractionDigits: 0 })}</td></tr>
    </tbody>
  </table>
  <table>
    <tbody>
      <tr><td>Previous Month Closing Balance</td><td class="amount-right">₹ ${staff.lastMonthDue.toLocaleString("en-IN", { minimumFractionDigits: 0 })}</td></tr>
      <tr class="total-row"><td>Net Payable (Earnings + Previous Balance - Payments)</td><td class="amount-right">₹ ${netPayable.toLocaleString("en-IN", { minimumFractionDigits: 0 })}</td></tr>
    </tbody>
  </table>
</body>
</html>`;
};

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
const StaffAttendance: React.FC<StaffAttendanceProps> = ({ onSalaryPayment }) => {
  /* List state */
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<AddStaffForm>(INITIAL_FORM);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dropdownOpenId, setDropdownOpenId] = useState<number | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [overtimeStaffId, setOvertimeStaffId] = useState<number | null>(null);
  const [overtimeForm, setOvertimeForm] = useState<OvertimeForm>(INITIAL_OVERTIME_FORM);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AttendanceSettingsData>(INITIAL_SETTINGS);
  const [settingsDraft, setSettingsDraft] = useState<AttendanceSettingsData>(INITIAL_SETTINGS);

  /* Detail view state */
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("Attendance");
  const [detailMonthDate, setDetailMonthDate] = useState(new Date());
  const [detailDropdownOpenDate, setDetailDropdownOpenDate] = useState<string | null>(null);
  const [detailDropdownPos, setDetailDropdownPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [detailOvertimeDate, setDetailOvertimeDate] = useState<string | null>(null);
  const [detailOvertimeForm, setDetailOvertimeForm] = useState<OvertimeForm>(INITIAL_OVERTIME_FORM);
  const [showMakePayment, setShowMakePayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState<MakePaymentForm>({
    paymentType: "Salary", date: toDateKey(new Date()), amount: "", mode: "Cash", remarks: "",
  });
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<AddStaffForm>(INITIAL_FORM);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [txDateFilter, setTxDateFilter] = useState("Previous Quarter");
  const [txTypeFilter, setTxTypeFilter] = useState("Salary");

  const dateKey = toDateKey(currentDate);
  const selectedStaff = staffList.find((s) => s.id === selectedStaffId) || null;
  const hasStaff = staffList.length > 0;
  const isDetailView = selectedStaffId !== null;
  const detailYear = detailMonthDate.getFullYear();
  const detailMonth = detailMonthDate.getMonth();

  /* ---- Helpers ---- */
  const getRecord = (staff: StaffMember, dk?: string): DailyRecord =>
    staff.records[dk || dateKey] || { attendance: null, overtime: null, dayAmount: 0 };

  const changeDate = (delta: number) => {
    setCurrentDate((prev) => { const d = new Date(prev); d.setDate(d.getDate() + delta); return d; });
    setDropdownOpenId(null);
  };

  const changeDetailMonth = (delta: number) => {
    setDetailMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  /* ---- Add staff ---- */
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = () => {
    if (!form.name || !form.mobile || !form.salary) return;
    const bal = parseFloat(form.openingBalance) || 0;
    const newStaff: StaffMember = {
      id: Date.now(), name: form.name, mobile: form.mobile,
      salary: parseFloat(form.salary) || 0, salaryPayoutType: form.salaryPayoutType,
      salaryCycle: form.salaryCycle, lastMonthDue: 0, balance: bal,
      openingBalance: bal, openingBalanceType: form.openingBalanceType,
      openingBalanceDate: toDateKey(new Date()), records: {}, payments: [],
    };
    setStaffList((prev) => [...prev, newStaff]);
    setForm(INITIAL_FORM);
    setShowModal(false);
  };

  /* ---- Mark attendance ---- */
  const markAttendance = (id: number, status: AttendanceStatus, dk?: string) => {
    const key = dk || dateKey;
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const rec = s.records[key] || { attendance: null, overtime: null, dayAmount: 0 };
        const newStatus = rec.attendance === status ? null : status;
        const attAmt = getDayAmount(s.salary, newStatus);
        const otAmt = rec.overtime?.totalAmount || 0;
        return { ...s, records: { ...s.records, [key]: { ...rec, attendance: newStatus, dayAmount: attAmt + otAmt } } };
      })
    );
    setDropdownOpenId(null);
    setDetailDropdownOpenDate(null);
  };

  /* ---- Overtime (shared) ---- */
  const handleSaveOvertimeForStaff = (staffId: number, oForm: OvertimeForm, dk?: string) => {
    const key = dk || dateKey;
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id !== staffId) return s;
        const rec = s.records[key] || { attendance: null, overtime: null, dayAmount: 0 };
        const total = calcOvertimeTotal(s.salary, oForm);
        const overtimeEntry: OvertimeEntry = {
          date: key, type: oForm.type,
          hours: parseInt(oForm.hours), minutes: parseInt(oForm.minutes),
          rateMultiplier: oForm.rateKey === "1x" ? 1 : oForm.rateKey === "1.5x" ? 1.5 : oForm.rateKey === "2x" ? 2 : undefined,
          customRate: oForm.rateKey === "custom" ? parseFloat(oForm.customRate) : undefined,
          fixedAmount: oForm.type === "fixed" ? parseFloat(oForm.fixedAmount) : undefined,
          totalAmount: total,
        };
        const attAmt = getDayAmount(s.salary, rec.attendance);
        return { ...s, records: { ...s.records, [key]: { ...rec, overtime: overtimeEntry, dayAmount: attAmt + total } } };
      })
    );
    setOvertimeStaffId(null);
    setDetailOvertimeDate(null);
  };

  /* ---- Settings ---- */
  const openSettings = () => { setSettingsDraft({ ...settings }); setShowSettings(true); };
  const saveSettings = () => { setSettings({ ...settingsDraft }); setShowSettings(false); };
  const toggleWeeklyOff = (day: string) =>
    setSettingsDraft((prev) => ({
      ...prev,
      weeklyOffDays: prev.weeklyOffDays.includes(day)
        ? prev.weeklyOffDays.filter((d) => d !== day)
        : [...prev.weeklyOffDays, day],
    }));

  /* ---- Make payment ---- */
  const handleSavePayment = () => {
    if (!selectedStaff || !paymentForm.amount) return;
    const amt = parseFloat(paymentForm.amount) || 0;
    const newPayment: PaymentEntry = {
      id: Date.now(), date: paymentForm.date, paymentType: paymentForm.paymentType,
      amount: amt, mode: paymentForm.mode, remarks: paymentForm.remarks,
    };
    setStaffList((prev) =>
      prev.map((s) =>
        s.id === selectedStaff.id
          ? { ...s, payments: [...s.payments, newPayment], balance: Math.max(0, s.balance - amt) }
          : s
      )
    );
    // Notify parent so it can push to Expenses
    if (onSalaryPayment) {
      onSalaryPayment({
        id: newPayment.id,
        date: newPayment.date,
        staffName: selectedStaff.name,
        amount: amt,
        paymentType: newPayment.paymentType,
        mode: newPayment.mode,
        remarks: newPayment.remarks,
      });
    }
    setShowMakePayment(false);
    setPaymentForm({ paymentType: "Salary", date: toDateKey(new Date()), amount: "", mode: "Cash", remarks: "" });
  };

  /* ---- Edit staff ---- */
  const handleOpenEdit = () => {
    if (!selectedStaff) return;
    setEditForm({
      name: selectedStaff.name, mobile: selectedStaff.mobile,
      salaryPayoutType: selectedStaff.salaryPayoutType, salary: String(selectedStaff.salary),
      salaryCycle: selectedStaff.salaryCycle, openingBalance: String(selectedStaff.openingBalance),
      openingBalanceType: selectedStaff.openingBalanceType,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!selectedStaff || !editForm.name || !editForm.mobile || !editForm.salary) return;
    setStaffList((prev) =>
      prev.map((s) =>
        s.id === selectedStaff.id
          ? { ...s, name: editForm.name, mobile: editForm.mobile, salary: parseFloat(editForm.salary) || s.salary,
              salaryPayoutType: editForm.salaryPayoutType, salaryCycle: editForm.salaryCycle,
              openingBalance: parseFloat(editForm.openingBalance) || s.openingBalance,
              openingBalanceType: editForm.openingBalanceType }
          : s
      )
    );
    setShowEditModal(false);
  };

  /* ---- Delete ---- */
  const handleDeleteStaff = () => {
    if (!selectedStaff) return;
    setStaffList((prev) => prev.filter((s) => s.id !== selectedStaff.id));
    setSelectedStaffId(null);
    setShowDeleteConfirm(false);
  };

  /* ---- Transactions filter ---- */
  const getFilteredTransactions = (): PaymentEntry[] => {
    if (!selectedStaff) return [];
    const now = new Date();
    let filtered = [...selectedStaff.payments];
    if (txDateFilter === "Today") filtered = filtered.filter((p) => p.date === toDateKey(now));
    else if (txDateFilter === "This Month") { const ms = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`; filtered = filtered.filter((p) => p.date.startsWith(ms)); }
    else if (txDateFilter === "Previous Quarter") { const t = new Date(now.getFullYear(), now.getMonth()-3, 1); filtered = filtered.filter((p) => new Date(p.date) >= t); }
    else if (txDateFilter === "This Year") filtered = filtered.filter((p) => p.date.startsWith(String(now.getFullYear())));
    if (txTypeFilter !== "All") filtered = filtered.filter((p) => p.paymentType === txTypeFilter);
    return filtered.sort((a, b) => b.date.localeCompare(a.date));
  };

  /* ---- List view counts ---- */
  const counts = {
    P: staffList.filter((s) => getRecord(s).attendance === "P").length,
    A: staffList.filter((s) => getRecord(s).attendance === "A").length,
    HD: staffList.filter((s) => getRecord(s).attendance === "HD").length,
    PL: staffList.filter((s) => getRecord(s).attendance === "PL").length,
    WO: staffList.filter((s) => getRecord(s).attendance === "WO").length,
  };
  const totalDayAmount = staffList.reduce((sum, s) => sum + (getRecord(s).dayAmount || 0), 0);
  const totalBalance = staffList.reduce((sum, s) => sum + s.balance, 0);
  const totalLastMonthDue = staffList.reduce((sum, s) => sum + s.lastMonthDue, 0);

  /* ---- Detail monthly attendance counts ---- */
  const detailCounts = selectedStaff
    ? (() => {
        const days = getDaysOfMonth(detailYear, detailMonth);
        let P = 0, A = 0, HD = 0, PL = 0, WO = 0;
        days.forEach((day) => {
          const dk = toDateKey(day);
          const rec = selectedStaff.records[dk];
          if (rec?.attendance === "P") P++;
          if (rec?.attendance === "A") A++;
          if (rec?.attendance === "HD") HD++;
          if (rec?.attendance === "PL") PL++;
          if (rec?.attendance === "WO") WO++;
        });
        return { P, A, HD, PL, WO };
      })()
    : { P: 0, A: 0, HD: 0, PL: 0, WO: 0 };

  /* ---- Overtime computed values ---- */
  const overtimeStaffObj = staffList.find((s) => s.id === overtimeStaffId);
  const overtimeHourlyRate = overtimeStaffObj ? getHourlyRate(overtimeStaffObj.salary, overtimeForm.rateKey, overtimeForm.customRate) : 0;
  const overtimeTotalAmt = overtimeStaffObj ? calcOvertimeTotal(overtimeStaffObj.salary, overtimeForm) : 0;

  const detailOTHourlyRate = selectedStaff ? getHourlyRate(selectedStaff.salary, detailOvertimeForm.rateKey, detailOvertimeForm.customRate) : 0;
  const detailOTTotal = selectedStaff ? calcOvertimeTotal(selectedStaff.salary, detailOvertimeForm) : 0;

  /* ---- Download salary slip ---- */
  const handleDownloadSalarySlip = () => {
    if (!selectedStaff) return;
    const html = buildSalarySlipHTML(selectedStaff, detailYear, detailMonth);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `salary-slip-${selectedStaff.name}-${formatMonthYear(detailMonthDate).replace(" ", "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ============================================================
     OVERTIME BODY RENDERER (reusable)
     ============================================================ */
  const renderOvertimeBody = (
    staff: StaffMember,
    oForm: OvertimeForm,
    setOForm: React.Dispatch<React.SetStateAction<OvertimeForm>>,
    hourlyRate: number,
    total: number,
    displayDateStr?: string
  ) => {
    const dateStr = displayDateStr
      ? formatDateLong(new Date(displayDateStr + "T00:00:00"))
      : formatDateLong(currentDate);
    return (
      <>
        <div className="ot-info-row">
          <div className="ot-info-item">
            <span className="ot-info-label">Staff name</span>
            <span className="ot-info-value">{staff.name}</span>
          </div>
          <div className="ot-info-item">
            <span className="ot-info-label">Date</span>
            <span className="ot-info-value">{dateStr}</span>
          </div>
        </div>
        <div className="ot-type-row">
          <span className="ot-section-label">Overtime Type</span>
          <div className="ot-radio-group">
            <label className="ot-radio-label">
              <input type="radio" name="otType" checked={oForm.type === "hourly"} onChange={() => setOForm((p) => ({ ...p, type: "hourly" }))}/>
              Hourly rate
            </label>
            <label className="ot-radio-label">
              <input type="radio" name="otType" checked={oForm.type === "fixed"} onChange={() => setOForm((p) => ({ ...p, type: "fixed" }))}/>
              Fixed amount
              <span className="ot-info-icon" title="A fixed amount added for overtime regardless of hours">ⓘ</span>
            </label>
          </div>
        </div>
        {oForm.type === "hourly" && (
          <div className="ot-fields-box">
            <div className="ot-fields-row">
              <div className="ot-field-group">
                <label className="ot-field-label">Number of hours <span className="ot-required">*</span></label>
                <div className="ot-time-input">
                  <input type="number" className="ot-hrs-input" value={oForm.hours} min="0" max="23"
                    onChange={(e) => setOForm((p) => ({ ...p, hours: e.target.value.padStart(2, "0") }))}/>
                  <span className="ot-unit">Hrs</span>
                  <span className="ot-colon">:</span>
                  <select className="ot-min-select" value={oForm.minutes} onChange={(e) => setOForm((p) => ({ ...p, minutes: e.target.value }))}>
                    {MINUTES_OPTIONS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                  <span className="ot-unit">Min</span>
                </div>
              </div>
              <div className="ot-field-group">
                <label className="ot-field-label">Overtime rate <span className="ot-required">*</span></label>
                <div className="ot-rate-input">
                  <select className="ot-rate-select" value={oForm.rateKey} onChange={(e) => setOForm((p) => ({ ...p, rateKey: e.target.value as OvertimeForm["rateKey"] }))}>
                    <option value="1x">1x Salary</option>
                    <option value="1.5x">1.5x Salary</option>
                    <option value="2x">2x Salary</option>
                    <option value="custom">Custom Rate</option>
                  </select>
                  {oForm.rateKey === "custom" ? (
                    <input type="number" className="ot-rate-value" placeholder="₹ rate/hr" value={oForm.customRate}
                      onChange={(e) => setOForm((p) => ({ ...p, customRate: e.target.value }))}/>
                  ) : (
                    <span className="ot-rate-display">₹ {hourlyRate.toFixed(0)} /Hr</span>
                  )}
                </div>
              </div>
            </div>
            <div className="ot-total-row">
              <span className="ot-total-label">Total amount</span>
              <p className="ot-total-formula">
                {oForm.hours.padStart(2,"0")}:{oForm.minutes.padStart(2,"0")} × ₹{hourlyRate.toFixed(0)} = {total > 0 ? `₹${total.toLocaleString("en-IN",{minimumFractionDigits:2})}` : "0"}
              </p>
            </div>
          </div>
        )}
        {oForm.type === "fixed" && (
          <div className="ot-fields-box">
            <div className="ot-field-group">
              <label className="ot-field-label">Overtime amount <span className="ot-required">*</span></label>
              <input type="number" className="ot-fixed-input" value={oForm.fixedAmount}
                onChange={(e) => setOForm((p) => ({ ...p, fixedAmount: e.target.value }))}/>
            </div>
          </div>
        )}
      </>
    );
  };

  /* ============================================================
     ADD STAFF MODAL
     ============================================================ */
  const renderAddStaffModal = () =>
    showModal ? (
      <div className="attendance-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
        <div className="attendance-modal" onClick={(e) => e.stopPropagation()}>
          <div className="attendance-modal-header">
            <h3>Add Staff</h3>
            <button className="attendance-modal-close" onClick={() => setShowModal(false)}>✕</button>
          </div>
          <div className="attendance-modal-body">
            <div className="attendance-form-grid">
              <div className="attendance-form-group">
                <label>Name*</label>
                <input type="text" name="name" placeholder="Enter Employee Name" value={form.name} onChange={handleFormChange}/>
              </div>
              <div className="attendance-form-group">
                <label>Mobile Number*</label>
                <input type="text" name="mobile" placeholder="+91 9999999999" value={form.mobile} onChange={handleFormChange}/>
              </div>
              <div className="attendance-form-group">
                <label>Salary Payout Type*</label>
                <select name="salaryPayoutType" value={form.salaryPayoutType} onChange={handleFormChange}>
                  <option>Monthly</option>
                  <option>Weekly</option>
                </select>
              </div>
              <div className="attendance-form-group">
                <label>Salary*</label>
                <input type="number" name="salary" placeholder="₹ 20000" value={form.salary} onChange={handleFormChange}/>
              </div>
              <div className="attendance-form-group">
                <label>Salary Cycle</label>
                <select name="salaryCycle" value={form.salaryCycle} onChange={handleFormChange}>
                  <option>10 to 10 Every month</option>
                  <option>1 to 30 Every month</option>
                  <option>1 to 1 Every month</option>
                </select>
              </div>
              <div className="attendance-form-group">
                <label>Outstanding / Opening Balance</label>
                <div className="attendance-balance-group">
                  <input type="number" name="openingBalance" placeholder="₹ 0" value={form.openingBalance} onChange={handleFormChange}/>
                  <select name="openingBalanceType" value={form.openingBalanceType} onChange={handleFormChange}>
                    <option>To Pay</option>
                    <option>To Collect</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="attendance-modal-footer">
            <button className="attendance-cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="attendance-save-btn" onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>
    ) : null;

  /* ============================================================
     DETAIL VIEW
     ============================================================ */
  if (isDetailView && selectedStaff) {
    const { earnedAmount, totalPaid, netPayable } = calcNetPayable(selectedStaff, detailYear, detailMonth);
    const { present, halfDay, paidLeave } = calcMonthlyEarnings(selectedStaff, detailYear, detailMonth);
    const monthName = new Date(detailYear, detailMonth, 1).toLocaleDateString("en-IN", { month: "long" });
    const lastDay = getDaysInMonth(detailYear, detailMonth);
    const txList = getFilteredTransactions();
    const isLastMonthFuture = detailYear > new Date().getFullYear() ||
      (detailYear === new Date().getFullYear() && detailMonth >= new Date().getMonth());

    return (
      <div className="detail-view" onClick={() => { setDetailDropdownOpenDate(null); setShowPaymentDropdown(false); }}>
        {/* ---- Left Sidebar ---- */}
        <div className="detail-sidebar">
          <div className="detail-sidebar-header">
            <span className="detail-sidebar-title">Staff</span>
            <button className="attendance-add-btn small" onClick={(e) => { e.stopPropagation(); setShowModal(true); }}>+ Add Staff</button>
          </div>
          <div className="detail-sidebar-list">
            {staffList.map((s) => {
              const { netPayable: np } = calcNetPayable(s, new Date().getFullYear(), new Date().getMonth());
              return (
                <div
                  key={s.id}
                  className={`detail-sidebar-item${s.id === selectedStaffId ? " active" : ""}`}
                  onClick={(e) => { e.stopPropagation(); setSelectedStaffId(s.id); setActiveTab("Attendance"); setDetailMonthDate(new Date()); }}
                >
                  <span className="detail-sidebar-name">{s.name}</span>
                  <span className={`detail-sidebar-amount ${np > 0 ? "due" : "paid"}`}>
                    {np > 0 ? (
                      <><svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><path d="M12 4l8 8H4l8-8z"/></svg> ₹{np.toLocaleString("en-IN")}</>
                    ) : (
                      <><svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><path d="M12 20l-8-8h16l-8 8z"/></svg> ₹{Math.abs(np).toLocaleString("en-IN")}</>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ---- Main Panel ---- */}
        <div className="detail-main" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="detail-main-header">
            <div className="detail-main-title-row">
              <button className="detail-back-btn" onClick={() => setSelectedStaffId(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><path d="M19 12H5M5 12l7-7M5 12l7 7"/></svg>
              </button>
              <h2 className="detail-staff-name">{selectedStaff.name}</h2>
            </div>
            <div className="detail-main-actions">
              <button className="detail-download-btn" onClick={handleDownloadSalarySlip}>
                Download Salary Slip
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </button>
              <div className="detail-payment-btn-wrapper" onClick={(e) => e.stopPropagation()}>
                <button className="detail-payment-btn" onClick={() => { setShowMakePayment(true); setShowPaymentDropdown(false); }}>
                  Make Payment
                </button>
                <button className="detail-payment-dropdown-toggle" onClick={() => setShowPaymentDropdown((v) => !v)}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M7 10l5 5 5-5z"/></svg>
                </button>
                {showPaymentDropdown && (
                  <div className="detail-payment-dropdown">
                    <div className="att-dropdown-item" onClick={() => setShowPaymentDropdown(false)}>Collect Payment</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="detail-tabs">
            <div className="detail-tabs-left">
              {(["Attendance", "Payroll", "Transactions", "Details"] as DetailTab[]).map((tab) => (
                <button key={tab} className={`detail-tab${activeTab === tab ? " active" : ""}`} onClick={() => setActiveTab(tab)}>
                  {tab}
                </button>
              ))}
            </div>
            {activeTab === "Details" && (
              <div className="detail-tab-actions">
                <button className="detail-edit-btn" onClick={handleOpenEdit}>Edit</button>
                <button className="detail-delete-btn" onClick={() => setShowDeleteConfirm(true)}>Delete</button>
              </div>
            )}
          </div>

          {/* ===================== TAB CONTENT ===================== */}
          <div className="detail-tab-body">

            {/* ATTENDANCE TAB */}
            {activeTab === "Attendance" && (
              <div className="detail-tab-content">
                <div className="detail-month-nav">
                  <span className="detail-month-label">{formatMonthLong(detailMonthDate)}</span>
                  <div className="attendance-date-controls">
                    <button className="attendance-date-arrow" onClick={() => changeDetailMonth(-1)}>&#8249;</button>
                    <span className="attendance-today-badge">{formatMonthYear(detailMonthDate)}</span>
                    <button className="attendance-date-arrow" onClick={() => changeDetailMonth(1)} disabled={isLastMonthFuture}>&#8250;</button>
                  </div>
                </div>
                <div className="detail-summary-bar">
                  {[{ label: "Present (P)", val: detailCounts.P }, { label: "Absent (A)", val: detailCounts.A },
                    { label: "Half day (HD)", val: detailCounts.HD }, { label: "Paid Leave (PL)", val: detailCounts.PL },
                    { label: "Weekly off (WO)", val: detailCounts.WO }].map((item) => (
                    <div key={item.label} className="attendance-summary-item">
                      <span className="attendance-summary-label">{item.label}</span>
                      <span className="attendance-summary-count">{item.val}</span>
                    </div>
                  ))}
                </div>
                <table className="detail-att-table">
                  <thead>
                    <tr><th>DATE</th><th>ATTENDANCE</th></tr>
                  </thead>
                  <tbody>
                    {getDaysOfMonth(detailYear, detailMonth).map((day) => {
                      const dk = toDateKey(day);
                      const rec = selectedStaff.records[dk] || { attendance: null, overtime: null, dayAmount: 0 };
                      const isFuture = dk > toDateKey(new Date());
                      return (
                        <tr key={dk} className={isFuture ? "detail-att-row-future" : ""}>
                          <td className="detail-att-date">{formatDateDisplay(day)}</td>
                          <td className="detail-att-actions" onClick={(e) => e.stopPropagation()}>
                            <div className="attendance-mark-cell">
                              <button className={`att-btn att-btn-p${rec.attendance==="P"?" active-p":""}`} disabled={isFuture} onClick={() => !isFuture && markAttendance(selectedStaff.id,"P",dk)}>P</button>
                              <button className={`att-btn att-btn-a${rec.attendance==="A"?" active-a":""}`} disabled={isFuture} onClick={() => !isFuture && markAttendance(selectedStaff.id,"A",dk)}>A</button>
                              <div className="att-more-wrapper">
                                <button className="att-more-btn" disabled={isFuture} onClick={(e) => {
                                  e.stopPropagation();
                                  if (detailDropdownOpenDate === dk) { setDetailDropdownOpenDate(null); }
                                  else {
                                    const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                                    setDetailDropdownPos({ top: rect.bottom + 6, left: rect.left });
                                    setDetailDropdownOpenDate(dk);
                                  }
                                }}>&#8942;</button>
                                {detailDropdownOpenDate === dk && (
                                  <div className="att-dropdown" style={{ top: detailDropdownPos.top, left: detailDropdownPos.left }} onClick={(e) => e.stopPropagation()}>
                                    <div className="att-dropdown-item" onClick={() => markAttendance(selectedStaff.id,"HD",dk)}>Half day</div>
                                    <div className="att-dropdown-item" onClick={() => markAttendance(selectedStaff.id,"PL",dk)}>Paid leave</div>
                                    <div className="att-dropdown-item" onClick={() => markAttendance(selectedStaff.id,"WO",dk)}>Week off</div>
                                    <div className="att-dropdown-item att-dropdown-item--last" onClick={() => {
                                      setDetailOvertimeDate(dk);
                                      setDetailOvertimeForm(INITIAL_OVERTIME_FORM);
                                      setDetailDropdownOpenDate(null);
                                    }}>Add overtime</div>
                                  </div>
                                )}
                              </div>
                              {rec.attendance && BADGE_CONFIG[rec.attendance] && (
                                <span className={BADGE_CONFIG[rec.attendance].className}>{BADGE_CONFIG[rec.attendance].label}</span>
                              )}
                              {rec.overtime && <span className="att-overtime-tag">+OT</span>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* PAYROLL TAB */}
            {activeTab === "Payroll" && (
              <div className="detail-tab-content">
                <div className="detail-month-nav">
                  <span className="detail-month-label">{formatMonthLong(detailMonthDate)}</span>
                  <div className="attendance-date-controls">
                    <button className="attendance-date-arrow" onClick={() => changeDetailMonth(-1)}>&#8249;</button>
                    <span className="attendance-today-badge">{formatMonthYear(detailMonthDate)}</span>
                    <button className="attendance-date-arrow" onClick={() => changeDetailMonth(1)} disabled={isLastMonthFuture}>&#8250;</button>
                  </div>
                </div>
                <div className="payroll-metrics">
                  <div className="payroll-metric-item">
                    <span className="payroll-metric-label">TOTAL DUES</span>
                    <span className="payroll-metric-value payroll-metric-due">
                      <svg className="balance-arrow-icon" viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 4l8 8H4l8-8z"/></svg>
                      ₹ {netPayable > 0 ? netPayable.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}
                    </span>
                  </div>
                  <div className="payroll-metric-item">
                    <span className="payroll-metric-label">LAST MONTH (DUE)</span>
                    <span className="payroll-metric-value">₹ {selectedStaff.lastMonthDue.toFixed(2)}</span>
                  </div>
                  <div className="payroll-metric-item">
                    <span className="payroll-metric-label">LOAN</span>
                    <span className="payroll-metric-value">₹ 0.00</span>
                  </div>
                </div>
                <div className="payroll-month-row">
                  <span className="payroll-month-label">
                    {monthName} (01 {monthName.slice(0,3)} {detailYear} - {lastDay} {monthName.slice(0,3)} {detailYear}) - Current Month
                  </span>
                </div>
                <div className="payroll-section">
                  <div className="payroll-section-header-row">
                    <span>Earnings <span className="payroll-info-icon">ⓘ</span></span>
                    <div className="payroll-section-right">
                      <span>₹{earnedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      <span className="payroll-chevron">&#8743;</span>
                    </div>
                  </div>
                  {present > 0 && <div className="payroll-sub-row"><span>Present ({present} Days)</span><span>₹ {(present*selectedStaff.salary/26).toLocaleString("en-IN",{minimumFractionDigits:2})}</span></div>}
                  {halfDay > 0 && <div className="payroll-sub-row"><span>Half Day ({halfDay} Days)</span><span>₹ {(halfDay*selectedStaff.salary/26/2).toLocaleString("en-IN",{minimumFractionDigits:2})}</span></div>}
                  {paidLeave > 0 && <div className="payroll-sub-row"><span>Paid Leave ({paidLeave} Days)</span><span>₹ {(paidLeave*selectedStaff.salary/26).toLocaleString("en-IN",{minimumFractionDigits:2})}</span></div>}
                </div>
                <div className="payroll-section">
                  <div className="payroll-section-header-row">
                    <span>Payments</span>
                    <span>₹ {totalPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TRANSACTIONS TAB */}
            {activeTab === "Transactions" && (
              <div className="detail-tab-content">
                <div className="tx-filters">
                  <div className="tx-filter-select-wrapper">
                    <span className="tx-cal-icon">📅</span>
                    <select className="tx-filter-select" value={txDateFilter} onChange={(e) => setTxDateFilter(e.target.value)}>
                      <option>Today</option>
                      <option>This Month</option>
                      <option>Previous Quarter</option>
                      <option>This Year</option>
                    </select>
                  </div>
                  <select className="tx-filter-select" value={txTypeFilter} onChange={(e) => setTxTypeFilter(e.target.value)}>
                    <option>All</option>
                    <option>Salary</option>
                    <option>Advance</option>
                    <option>Loan</option>
                    <option>Bonus</option>
                  </select>
                </div>
                {txList.length === 0 ? (
                  <p className="tx-empty">There are no payments for {selectedStaff.name} in the selected date range.</p>
                ) : (
                  <table className="attendance-table">
                    <thead>
                      <tr><th>DATE OF PAYMENT</th><th>PAYMENT TYPE</th><th>AMOUNT</th><th>REMARKS</th></tr>
                    </thead>
                    <tbody>
                      {txList.map((tx) => (
                        <tr key={tx.id}>
                          <td>{tx.date}</td>
                          <td>{tx.paymentType}</td>
                          <td>
                            <span className="attendance-balance-due">
                              <svg className="balance-arrow-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l8 8H4l8-8z"/></svg>
                              ₹{tx.amount.toLocaleString("en-IN")}
                            </span>
                          </td>
                          <td>{tx.remarks || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* DETAILS TAB */}
            {activeTab === "Details" && (
              <div className="detail-tab-content">
                <div className="staff-details-grid">
                  <div className="staff-details-item">
                    <span className="staff-details-label">Staff Name</span>
                    <span className="staff-details-value">{selectedStaff.name}</span>
                  </div>
                  <div className="staff-details-item">
                    <span className="staff-details-label">Mobile Number</span>
                    <span className="staff-details-value">{selectedStaff.mobile}</span>
                  </div>
                  <div className="staff-details-item">
                    <span className="staff-details-label">Opening Balance</span>
                    <span className="staff-details-value">
                      ₹{selectedStaff.openingBalance} On{" "}
                      {selectedStaff.openingBalanceDate
                        ? new Date(selectedStaff.openingBalanceDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                        : "-"}
                    </span>
                  </div>
                  <div className="staff-details-item">
                    <span className="staff-details-label">Salary</span>
                    <span className="staff-details-value">₹{selectedStaff.salary.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="staff-details-item">
                    <span className="staff-details-label">Salary Type</span>
                    <span className="staff-details-value">{selectedStaff.salaryPayoutType}</span>
                  </div>
                  <div className="staff-details-item">
                    <span className="staff-details-label">Salary Cycle</span>
                    <span className="staff-details-value">{selectedStaff.salaryCycle}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ---- Detail Overtime Modal ---- */}
        {detailOvertimeDate !== null && (
          <div className="attendance-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setDetailOvertimeDate(null); }}>
            <div className="attendance-modal ot-modal" onClick={(e) => e.stopPropagation()}>
              <div className="attendance-modal-header">
                <h3>Add Overtime</h3>
                <button className="attendance-modal-close" onClick={() => setDetailOvertimeDate(null)}>✕</button>
              </div>
              <div className="attendance-modal-body">
                {renderOvertimeBody(selectedStaff, detailOvertimeForm, setDetailOvertimeForm, detailOTHourlyRate, detailOTTotal, detailOvertimeDate)}
              </div>
              <div className="attendance-modal-footer">
                <button className="attendance-cancel-btn" onClick={() => setDetailOvertimeDate(null)}>Cancel</button>
                <button className="attendance-save-btn" onClick={() => handleSaveOvertimeForStaff(selectedStaff.id, detailOvertimeForm, detailOvertimeDate)}>Save</button>
              </div>
            </div>
          </div>
        )}

        {/* ---- Make Payment Modal ---- */}
        {showMakePayment && (
          <div className="attendance-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowMakePayment(false); }}>
            <div className="attendance-modal" onClick={(e) => e.stopPropagation()}>
              <div className="attendance-modal-header">
                <h3>Make Payment</h3>
                <button className="attendance-modal-close" onClick={() => setShowMakePayment(false)}>✕</button>
              </div>
              <div className="attendance-modal-body">
                <div className="attendance-form-grid">
                  <div className="attendance-form-group">
                    <label>Payment type <span className="ot-required">*</span></label>
                    <select value={paymentForm.paymentType} onChange={(e) => setPaymentForm((p) => ({ ...p, paymentType: e.target.value }))}>
                      <option>Salary</option><option>Advance</option><option>Loan</option><option>Bonus</option>
                    </select>
                  </div>
                  <div className="attendance-form-group">
                    <label>Date <span className="ot-required">*</span></label>
                    <input type="date" value={paymentForm.date} onChange={(e) => setPaymentForm((p) => ({ ...p, date: e.target.value }))}/>
                  </div>
                  <div className="attendance-form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Amount <span className="ot-required">*</span></label>
                    <div className="attendance-balance-group">
                      <input type="number" placeholder="₹ 20000" value={paymentForm.amount} onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))}/>
                      <select value={paymentForm.mode} onChange={(e) => setPaymentForm((p) => ({ ...p, mode: e.target.value }))}>
                        <option>Cash</option><option>Bank Transfer</option><option>UPI</option><option>Cheque</option>
                      </select>
                    </div>
                  </div>
                  <div className="attendance-form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Remarks (Optional)</label>
                    <input type="text" placeholder="Enter remarks" value={paymentForm.remarks} onChange={(e) => setPaymentForm((p) => ({ ...p, remarks: e.target.value }))}/>
                  </div>
                </div>
                <div className="payment-note">
                  <strong>Note:</strong> An expense under the category Employee Salary &amp; Advance will automatically be created for this payment
                </div>
              </div>
              <div className="attendance-modal-footer">
                <button className="attendance-cancel-btn" onClick={() => setShowMakePayment(false)}>Cancel</button>
                <button className="attendance-save-btn" style={{ opacity: paymentForm.amount ? 1 : 0.6 }} onClick={handleSavePayment}>Save</button>
              </div>
            </div>
          </div>
        )}

        {/* ---- Edit Staff Modal ---- */}
        {showEditModal && (
          <div className="attendance-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false); }}>
            <div className="attendance-modal" onClick={(e) => e.stopPropagation()}>
              <div className="attendance-modal-header">
                <h3>Edit Staff</h3>
                <button className="attendance-modal-close" onClick={() => setShowEditModal(false)}>✕</button>
              </div>
              <div className="attendance-modal-body">
                <div className="attendance-form-grid">
                  <div className="attendance-form-group">
                    <label>Name <span className="ot-required">*</span></label>
                    <input type="text" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}/>
                  </div>
                  <div className="attendance-form-group">
                    <label>Mobile Number <span className="ot-required">*</span></label>
                    <input type="text" value={editForm.mobile} onChange={(e) => setEditForm((p) => ({ ...p, mobile: e.target.value }))}/>
                  </div>
                  <div className="attendance-form-group">
                    <label>Salary Payout Type <span className="ot-required">*</span></label>
                    <select value={editForm.salaryPayoutType} onChange={(e) => setEditForm((p) => ({ ...p, salaryPayoutType: e.target.value }))}>
                      <option>Monthly</option><option>Weekly</option>
                    </select>
                  </div>
                  <div className="attendance-form-group">
                    <label>Salary <span className="ot-required">*</span></label>
                    <input type="number" value={editForm.salary} onChange={(e) => setEditForm((p) => ({ ...p, salary: e.target.value }))}/>
                  </div>
                  <div className="attendance-form-group">
                    <label>Salary Cycle</label>
                    <select value={editForm.salaryCycle} onChange={(e) => setEditForm((p) => ({ ...p, salaryCycle: e.target.value }))}>
                      <option>10 to 10 Every month</option><option>1 to 30 Every month</option><option>1 to 1 Every month</option>
                    </select>
                  </div>
                  <div className="attendance-form-group">
                    <label>Outstanding / Opening Balance <span className="ot-info-icon">ⓘ</span></label>
                    <div className="attendance-balance-group">
                      <input type="number" value={editForm.openingBalance} onChange={(e) => setEditForm((p) => ({ ...p, openingBalance: e.target.value }))}/>
                      <select value={editForm.openingBalanceType} onChange={(e) => setEditForm((p) => ({ ...p, openingBalanceType: e.target.value }))}>
                        <option>To Pay</option><option>To Collect</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="attendance-modal-footer">
                <button className="attendance-cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="attendance-save-btn" onClick={handleSaveEdit}>Save</button>
              </div>
            </div>
          </div>
        )}

        {/* ---- Delete Confirm Modal ---- */}
        {showDeleteConfirm && (
          <div className="attendance-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteConfirm(false); }}>
            <div className="attendance-modal delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
              <div className="attendance-modal-header">
                <h3>Delete this Employee?</h3>
                <button className="attendance-modal-close" onClick={() => setShowDeleteConfirm(false)}>✕</button>
              </div>
              <div className="attendance-modal-body">
                <p className="delete-confirm-text">The employee will be deleted permanently. Are you sure you want to proceed?</p>
              </div>
              <div className="attendance-modal-footer">
                <button className="attendance-cancel-btn" onClick={() => setShowDeleteConfirm(false)}>Leave</button>
                <button className="delete-confirm-btn" onClick={handleDeleteStaff}>Yes, Delete</button>
              </div>
            </div>
          </div>
        )}

        {renderAddStaffModal()}
      </div>
    );
  }

  /* ============================================================
     LIST VIEW
     ============================================================ */
  return (
    <div className="attendance-container" onClick={() => setDropdownOpenId(null)}>
      {!hasStaff ? (
        <>
          <h2 className="attendance-title">Staff Attendance &amp; Payroll</h2>
          <div className="attendance-card-wrapper">
            <div className="attendance-card"><div className="attendance-card-img-wrapper"><img src={img1} alt="Attendance"/></div><div className="attendance-card-text">Mark your staff's attendance digitally</div></div>
            <div className="attendance-card"><div className="attendance-card-img-wrapper"><img src={img2} alt="Payroll"/></div><div className="attendance-card-text">Simplify payroll by adding salary, advance &amp; pending payments</div></div>
            <div className="attendance-card"><div className="attendance-card-img-wrapper"><img src={img3} alt="Reminder"/></div><div className="attendance-card-text">Set custom reminders to mark attendance timely</div></div>
          </div>
          <div className="attendance-bottom-section">
            <h3>Mark attendance and manage payroll</h3>
            <p>Add staff to Mark attendance and manage payroll with ease!</p>
            <button className="attendance-add-btn" onClick={(e) => { e.stopPropagation(); setShowModal(true); }}>+ Add Staff</button>
          </div>
        </>
      ) : (
        <>
          <div className="attendance-list-header">
            <h2 className="attendance-title">Staff Attendance &amp; Payroll</h2>
            <div className="attendance-list-header-actions">
              <button className="attendance-settings-btn" onClick={(e) => { e.stopPropagation(); openSettings(); }}>
                Attendance Settings
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
              <button className="attendance-add-btn" onClick={(e) => { e.stopPropagation(); setShowModal(true); }}>+ Add Staff</button>
            </div>
          </div>

          <div className="attendance-date-nav">
            <span className="attendance-date-label">{formatDateDisplay(currentDate)}</span>
            <div className="attendance-date-controls">
              <button className="attendance-date-arrow" onClick={() => changeDate(-1)}>&#8249;</button>
              <span className="attendance-today-badge" onClick={() => setCurrentDate(new Date())} style={{ cursor: "pointer" }}>Today:&nbsp;&nbsp;{formatDateDisplay(new Date())}</span>
              <button className="attendance-date-arrow" onClick={() => changeDate(1)} disabled={toDateKey(currentDate) >= toDateKey(new Date())}>&#8250;</button>
            </div>
          </div>

          <div className="attendance-card-table">
            <div className="attendance-summary-bar">
              {[{label:"Present (P)",val:counts.P},{label:"Absent (A)",val:counts.A},{label:"Half day (HD)",val:counts.HD},{label:"Paid Leave (PL)",val:counts.PL},{label:"Weekly off (WO)",val:counts.WO}].map((item)=>(
                <div key={item.label} className="attendance-summary-item">
                  <span className="attendance-summary-label">{item.label}</span>
                  <span className="attendance-summary-count">{item.val}</span>
                </div>
              ))}
            </div>
            <table className="attendance-table">
              <thead>
                <tr><th>STAFF NAME</th><th>MOBILE NUMBER</th><th>LAST MONTH DUE</th><th>BALANCE</th><th>DAY AMOUNT</th><th>MARK ATTENDANCE</th></tr>
              </thead>
              <tbody>
                {staffList.map((staff) => {
                  const rec = getRecord(staff);
                  return (
                    <tr key={staff.id} className="att-table-row-clickable" onClick={() => { setSelectedStaffId(staff.id); setActiveTab("Attendance"); setDetailMonthDate(new Date()); }}>
                      <td>{staff.name}</td>
                      <td>{staff.mobile}</td>
                      <td>{staff.lastMonthDue > 0 ? `₹${staff.lastMonthDue.toLocaleString("en-IN")}` : "-"}</td>
                      <td>{staff.balance > 0 ? <span className="attendance-balance-due"><svg className="balance-arrow-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l8 8H4l8-8z"/></svg>₹&nbsp;{staff.balance.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}</span> : <span>₹ 0</span>}</td>
                      <td>{rec.dayAmount > 0 ? <span className="attendance-day-amount">₹{rec.dayAmount.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}{rec.overtime && <span className="att-overtime-tag"> +OT</span>}</span> : "-"}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="attendance-mark-cell">
                          <button className={`att-btn att-btn-p${rec.attendance==="P"?" active-p":""}`} onClick={()=>markAttendance(staff.id,"P")}>P</button>
                          <button className={`att-btn att-btn-a${rec.attendance==="A"?" active-a":""}`} onClick={()=>markAttendance(staff.id,"A")}>A</button>
                          <div className="att-more-wrapper">
                            <button className="att-more-btn" onClick={(e)=>{
                              e.stopPropagation();
                              if(dropdownOpenId===staff.id){setDropdownOpenId(null);}
                              else{const rect=(e.currentTarget as HTMLButtonElement).getBoundingClientRect();setDropdownPos({top:rect.bottom+6,left:rect.left});setDropdownOpenId(staff.id);}
                            }}>&#8942;</button>
                            {dropdownOpenId===staff.id&&(
                              <div className="att-dropdown" style={{top:dropdownPos.top,left:dropdownPos.left}} onClick={(e)=>e.stopPropagation()}>
                                <div className="att-dropdown-item" onClick={()=>markAttendance(staff.id,"HD")}>Half day</div>
                                <div className="att-dropdown-item" onClick={()=>markAttendance(staff.id,"PL")}>Paid leave</div>
                                <div className="att-dropdown-item" onClick={()=>markAttendance(staff.id,"WO")}>Week off</div>
                                <div className="att-dropdown-item att-dropdown-item--last" onClick={()=>{setOvertimeStaffId(staff.id);setOvertimeForm(INITIAL_OVERTIME_FORM);setDropdownOpenId(null);}}>Add overtime</div>
                              </div>
                            )}
                          </div>
                          {rec.attendance&&BADGE_CONFIG[rec.attendance]&&<span className={BADGE_CONFIG[rec.attendance].className}>{BADGE_CONFIG[rec.attendance].label}</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                <tr className="attendance-pending-row">
                  <td colSpan={2}><strong>Pending amount</strong></td>
                  <td><strong>₹{totalLastMonthDue.toLocaleString("en-IN",{minimumFractionDigits:0})}</strong></td>
                  <td>{totalBalance>0&&<span className="attendance-balance-due"><svg className="balance-arrow-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l8 8H4l8-8z"/></svg>₹{totalBalance.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>}</td>
                  <td>{totalDayAmount>0&&<strong>₹{totalDayAmount.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}</strong>}</td>
                  <td/>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Overtime modal (list view) */}
      {overtimeStaffId!==null&&overtimeStaffObj&&(
        <div className="attendance-modal-overlay" onClick={(e)=>{if(e.target===e.currentTarget)setOvertimeStaffId(null);}}>
          <div className="attendance-modal ot-modal" onClick={(e)=>e.stopPropagation()}>
            <div className="attendance-modal-header"><h3>Add Overtime</h3><button className="attendance-modal-close" onClick={()=>setOvertimeStaffId(null)}>✕</button></div>
            <div className="attendance-modal-body">{renderOvertimeBody(overtimeStaffObj,overtimeForm,setOvertimeForm,overtimeHourlyRate,overtimeTotalAmt)}</div>
            <div className="attendance-modal-footer">
              <button className="attendance-cancel-btn" onClick={()=>setOvertimeStaffId(null)}>Cancel</button>
              <button className="attendance-save-btn" onClick={()=>handleSaveOvertimeForStaff(overtimeStaffObj.id,overtimeForm)}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Settings modal */}
      {showSettings&&(
        <div className="attendance-modal-overlay" onClick={(e)=>{if(e.target===e.currentTarget)setShowSettings(false);}}>
          <div className="attendance-modal settings-modal" onClick={(e)=>e.stopPropagation()}>
            <div className="attendance-modal-header"><h3>Attendance Settings</h3><button className="attendance-modal-close" onClick={()=>setShowSettings(false)}>✕</button></div>
            <div className="attendance-modal-body">
              <div className="settings-section">
                <div className="settings-toggle-row">
                  <span className="settings-toggle-label">Enable Daily Attendance Reminder</span>
                  <label className="settings-toggle-switch"><input type="checkbox" checked={settingsDraft.reminderEnabled} onChange={(e)=>setSettingsDraft((p)=>({...p,reminderEnabled:e.target.checked}))}/><span className="settings-slider"/></label>
                </div>
                {settingsDraft.reminderEnabled&&(
                  <div className="settings-reminder-time">
                    <span className="settings-sub-label">Reminder time {settingsDraft.reminderTime}</span>
                    <select className="settings-time-select" value={settingsDraft.reminderTime} onChange={(e)=>setSettingsDraft((p)=>({...p,reminderTime:e.target.value}))}>
                      {Array.from({length:24},(_,i)=>{const hh=String(i).padStart(2,"0");return(<React.Fragment key={hh}><option value={`${hh}:00`}>{hh}:00</option><option value={`${hh}:30`}>{hh}:30</option></React.Fragment>);})}
                    </select>
                  </div>
                )}
              </div>
              <div className="settings-divider"/>
              <div className="settings-section">
                <div className="settings-toggle-row">
                  <span className="settings-toggle-label">Mark Present By Default</span>
                  <label className="settings-toggle-switch"><input type="checkbox" checked={settingsDraft.markPresentByDefault} onChange={(e)=>setSettingsDraft((p)=>({...p,markPresentByDefault:e.target.checked}))}/><span className="settings-slider"/></label>
                </div>
              </div>
              <div className="settings-divider"/>
              <div className="settings-section">
                <span className="settings-section-title">Set Up Working Hours In A Shift</span>
                <div className="settings-sub-label">Number of hours</div>
                <div className="ot-time-input" style={{marginTop:8}}>
                  <select className="settings-hrs-select" value={settingsDraft.shiftHours} onChange={(e)=>setSettingsDraft((p)=>({...p,shiftHours:e.target.value}))}>{HOURS_OPTIONS.map((h)=><option key={h}>{h}</option>)}</select>
                  <span className="ot-unit">Hrs</span><span className="ot-colon">:</span>
                  <select className="settings-hrs-select" value={settingsDraft.shiftMinutes} onChange={(e)=>setSettingsDraft((p)=>({...p,shiftMinutes:e.target.value}))}>{MINUTES_OPTIONS.map((m)=><option key={m}>{m}</option>)}</select>
                  <span className="ot-unit">Min</span>
                </div>
                <div className="settings-sub-label" style={{marginTop:8}}>Total working hours in a day = {settingsDraft.shiftHours}:{settingsDraft.shiftMinutes}hrs</div>
              </div>
              <div className="settings-divider"/>
              <div className="settings-section">
                <div className="settings-weekly-header">
                  <span className="settings-section-title">Set Up Weekly Off</span>
                  <span className="settings-info-icon" title="Days marked as weekly off will be automatically marked WO">ⓘ</span>
                </div>
                <div className="settings-days-row">
                  {DAYS_OF_WEEK.map((day)=><button key={day} className={`settings-day-btn${settingsDraft.weeklyOffDays.includes(day)?" active":""}`} onClick={()=>toggleWeeklyOff(day)}>{day}</button>)}
                </div>
                <div className="settings-sub-label" style={{marginTop:8}}>{settingsDraft.weeklyOffDays.length>0?`${settingsDraft.weeklyOffDays.join(", ")} will be marked weekly off`:"No weekly off days set"}</div>
              </div>
            </div>
            <div className="attendance-modal-footer">
              <button className="attendance-cancel-btn" onClick={()=>setShowSettings(false)}>Cancel</button>
              <button className="attendance-save-btn" onClick={saveSettings}>Save</button>
            </div>
          </div>
        </div>
      )}

      {renderAddStaffModal()}
    </div>
  );
};

export default StaffAttendance;