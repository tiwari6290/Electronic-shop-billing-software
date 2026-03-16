import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addDays, fmtDisplayDate } from "./SalesInvoiceTypes";
import "./SIMetaFields.css";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function CalPicker({ value, onChange, onClose }: { value: string; onChange:(v:string)=>void; onClose:()=>void }) {
  const today = new Date();
  const [vm, setVm] = useState(value ? new Date(value).getMonth() : today.getMonth());
  const [vy, setVy] = useState(value ? new Date(value).getFullYear() : today.getFullYear());
  const ref = useRef<HTMLDivElement>(null);
  useEffect(()=>{ function h(e:MouseEvent){if(ref.current&&!ref.current.contains(e.target as Node))onClose();} document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h); },[]);
  const dim=(m:number,y:number)=>new Date(y,m+1,0).getDate();
  const fdo=(m:number,y:number)=>new Date(y,m,1).getDay();
  const cells=[...Array(fdo(vm,vy)).fill(null),...Array.from({length:dim(vm,vy)},(_,i)=>i+1)];
  while(cells.length%7!==0) cells.push(null);
  const ds=(d:number)=>`${vy}-${String(vm+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  return (
    <div ref={ref} className="si-cal-pop">
      <div className="si-cal-sel">{value ? fmtDisplayDate(value) : "Select Date"}</div>
      <div className="si-cal-nav">
        <div className="si-cal-ngrp">
          <button onClick={()=>{if(vm===0){setVm(11);setVy(y=>y-1);}else setVm(m=>m-1);}}>‹</button>
          <span>{MONTHS[vm]}</span>
          <button onClick={()=>{if(vm===11){setVm(0);setVy(y=>y+1);}else setVm(m=>m+1);}}>›</button>
        </div>
        <div className="si-cal-ngrp">
          <button onClick={()=>setVy(y=>y-1)}>‹</button>
          <span>{vy}</span>
          <button onClick={()=>setVy(y=>y+1)}>›</button>
        </div>
      </div>
      <div className="si-cal-grid">
        {DAYS.map(d=><div key={d} className="si-cal-dh">{d}</div>)}
        {cells.map((day,i)=>{
          if(!day) return <div key={i}/>;
          const s=ds(day); const isSel=s===value;
          return <button key={i} className={`si-cal-day${isSel?" si-cal-day--sel":""}`} onClick={()=>onChange(s)}>{day}</button>;
        })}
      </div>
      <div className="si-cal-ftr">
        <button className="si-cal-cancel" onClick={onClose}>CANCEL</button>
        <button className="si-cal-ok" onClick={onClose}>OK</button>
      </div>
    </div>
  );
}

interface SIMetaFieldsProps {
  invoiceNo: number;
  invoiceDate: string;
  showDueDate: boolean;
  paymentTermsDays: number;
  dueDate: string;
  eWayBillNo: string;
  challanNo: string;
  financedBy: string;
  salesman: string;
  emailId: string;
  warrantyPeriod: string;
  showColumns: { pricePerItem: boolean; quantity: boolean };
  onChange: (field: string, value: string | number | boolean) => void;
  onShowColumnsChange: (cols: { pricePerItem: boolean; quantity: boolean }) => void;
}

export default function SIMetaFields(p: SIMetaFieldsProps) {
  const navigate = useNavigate();
  const [showDateCal, setShowDateCal] = useState(false);
  const [showDueCal, setShowDueCal] = useState(false);
  const [showColModal, setShowColModal] = useState(false);
  const [localCols, setLocalCols] = useState(p.showColumns);
  const dateRef = useRef<HTMLDivElement>(null);
  const dueRef = useRef<HTMLDivElement>(null);

  return (
    <div className="si-meta">
      {/* Row 1: Invoice No + Invoice Date */}
      <div className="si-meta-row1">
        <div className="si-meta-field">
          <label>Sales Invoice No:</label>
          <input
            className="si-meta-input si-meta-input--no"
            value={p.invoiceNo}
            onChange={e => p.onChange("invoiceNo", Number(e.target.value))}
          />
        </div>
        <div className="si-meta-field">
          <label>Sales Invoice Date:</label>
          <div ref={dateRef} className="si-date-wrap">
            <button className="si-date-btn" onClick={()=>setShowDateCal(!showDateCal)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {fmtDisplayDate(p.invoiceDate)}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:12,height:12}}><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showDateCal && <CalPicker value={p.invoiceDate} onChange={v=>{p.onChange("invoiceDate",v);setShowDateCal(false);}} onClose={()=>setShowDateCal(false)}/>}
          </div>
        </div>
      </div>

      {/* Row 2: + Add Due Date OR Payment Terms + Due Date */}
      {!p.showDueDate ? (
        <div className="si-due-dashed" onClick={()=>p.onChange("showDueDate",true)}>+ Add Due Date</div>
      ) : (
        <div className="si-due-row">
          <button className="si-due-remove" onClick={()=>p.onChange("showDueDate",false)}>✕</button>
          <div className="si-meta-field">
            <label>Payment Terms:</label>
            <div className="si-days-wrap">
              <input type="number" className="si-meta-input" style={{width:60}} value={p.paymentTermsDays}
                onChange={e=>{const d=Number(e.target.value);p.onChange("paymentTermsDays",d);p.onChange("dueDate",addDays(p.invoiceDate,d));}}/>
              <span className="si-days-label">days</span>
            </div>
          </div>
          <div className="si-meta-field">
            <label>Due Date:</label>
            <div ref={dueRef} className="si-date-wrap">
              <button className="si-date-btn" onClick={()=>setShowDueCal(!showDueCal)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {fmtDisplayDate(p.dueDate)}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:12,height:12}}><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {showDueCal && <CalPicker value={p.dueDate} onChange={v=>p.onChange("dueDate",v)} onClose={()=>setShowDueCal(false)}/>}
            </div>
          </div>
        </div>
      )}

      {/* Row 3: E-Way Bill No, Challan No, Financed By, Salesman */}
      <div className="si-meta-grid4">
        {[
          {label:"E-Way Bill No:", field:"eWayBillNo", val:p.eWayBillNo, info:true},
          {label:"Challan No.:", field:"challanNo", val:p.challanNo},
          {label:"Financed By:", field:"financedBy", val:p.financedBy},
          {label:"Salesman:", field:"salesman", val:p.salesman},
        ].map(f=>(
          <div key={f.field} className="si-meta-field">
            <label>{f.label}{f.info&&<span className="si-info-icon" title="E-Way Bill Number">ⓘ</span>}</label>
            <input className="si-meta-input" value={f.val} onChange={e=>p.onChange(f.field,e.target.value)}/>
          </div>
        ))}
      </div>

      {/* Row 4: Email ID, Warranty Period */}
      <div className="si-meta-grid2">
        {[
          {label:"Email ID:", field:"emailId", val:p.emailId},
          {label:"Warranty Period:", field:"warrantyPeriod", val:p.warrantyPeriod},
        ].map(f=>(
          <div key={f.field} className="si-meta-field">
            <label>{f.label}</label>
            <input className="si-meta-input" value={f.val} onChange={e=>p.onChange(f.field,e.target.value)}/>
          </div>
        ))}
      </div>

      {/* + Column button (top-right of table header — rendered here as absolute) */}
      <button className="si-col-btn" onClick={()=>setShowColModal(true)} title="Show/Hide Columns">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>

      {/* Show/Hide Columns Modal */}
      {showColModal && (
        <div className="si-overlay" onClick={()=>setShowColModal(false)}>
          <div className="si-col-modal" onClick={e=>e.stopPropagation()}>
            <div className="si-col-hdr"><span>Show/Hide Columns in Invoice</span><button onClick={()=>setShowColModal(false)}>✕</button></div>
            <div className="si-col-body">
              {[
                {label:"Price/Item (₹)", key:"pricePerItem"},
                {label:"Quantity", key:"quantity"},
              ].map(col=>(
                <div key={col.key} className="si-col-row">
                  <span>{col.label}</span>
                  <button
                    className={`si-toggle${localCols[col.key as keyof typeof localCols]?" si-toggle--on":""}`}
                    onClick={()=>setLocalCols(c=>({...c,[col.key]:!c[col.key as keyof typeof localCols]}))}
                  >
                    <span className="si-toggle-thumb"/>
                  </button>
                </div>
              ))}
              <div className="si-col-custom-hdr">CUSTOM COLUMN</div>
              <div className="si-col-empty">
                <div className="si-col-empty-msg">No Custom Columns added</div>
                <div className="si-col-empty-sub">Any custom column such as Batch # & Expiry Date can be added</div>
                <div className="si-col-hint">
                  To add Custom Item Columns - Go to <strong>Item settings</strong> from <span className="si-link" onClick={() => navigate("/cashier/create-item/inventory")} style={{cursor:"pointer"}}>Items page (click here)</span>
                </div>
              </div>
            </div>
            <div className="si-col-ftr">
              <button onClick={()=>setShowColModal(false)} className="si-btn-cancel">Cancel</button>
              <button onClick={()=>{p.onShowColumnsChange(localCols);setShowColModal(false);}} className="si-btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}