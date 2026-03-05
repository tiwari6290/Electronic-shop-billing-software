import { useState, useRef, useEffect } from "react";
import { Party, getParties } from "./SalesInvoiceTypes";
import "./SIPartySelector.css";

interface Props {
  selectedParty: Party | null;
  shipTo: Party | null;
  onSelectParty: (p: Party) => void;
}

interface CreateForm {
  partyName: string; mobileNumber: string; billingAddress: string;
  shippingAddress: string; state: string; pincode: string; city: string;
  shippingState: string; shippingPincode: string; shippingCity: string;
  sameAsBilling: boolean; gstin: string;
}

export default function SIPartySelector({ selectedParty, onSelectParty }: Props) {
  const [showDrop, setShowDrop] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [parties, setParties] = useState<Party[]>(getParties());
  const [nameErr, setNameErr] = useState(false);
  const [form, setForm] = useState<CreateForm>({
    partyName:"", mobileNumber:"", billingAddress:"", shippingAddress:"",
    state:"", pincode:"", city:"", shippingState:"", shippingPincode:"",
    shippingCity:"", sameAsBilling:false, gstin:"",
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowDrop(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = parties.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || (p.mobile||"").includes(search)
  );

  function handleCreate() {
    if (!form.partyName.trim()) { setNameErr(true); return; }
    const np: Party = {
      id: Date.now(), name: form.partyName, mobile: form.mobileNumber,
      balance: 0, billingAddress: form.billingAddress,
      shippingAddress: form.sameAsBilling ? form.billingAddress : form.shippingAddress,
      gstin: form.gstin,
    };
    const all = [...parties, np];
    localStorage.setItem("parties", JSON.stringify(all));
    setParties(all);
    onSelectParty(np);
    setShowModal(false); setShowDrop(false); setSearch("");
    setForm({ partyName:"",mobileNumber:"",billingAddress:"",shippingAddress:"",state:"",pincode:"",city:"",shippingState:"",shippingPincode:"",shippingCity:"",sameAsBilling:false,gstin:"" });
    setNameErr(false);
  }

  if (selectedParty) {
    return (
      <div className="si-party-selected">
        <div className="si-pcol">
          <div className="si-pcard-hdr"><span>Bill To</span><button onClick={()=>setShowDrop(true)}>Change Party</button></div>
          <div className="si-pcard-body">
            <div className="si-pname">{selectedParty.name}</div>
            {selectedParty.mobile && <div className="si-pdetail">Phone Number: {selectedParty.mobile}</div>}
            {selectedParty.billingAddress && <div className="si-pdetail">{selectedParty.billingAddress}</div>}
          </div>
        </div>
        <div className="si-pcol">
          <div className="si-pcard-hdr"><span>Ship To</span><button>Change Shipping Address</button></div>
          <div className="si-pcard-body">
            <div className="si-pname">Business Name</div>
            <div className="si-pdetail">Phone Number: {selectedParty.mobile || "–"}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="si-party-wrap">
      <div className="si-plabel">Bill To</div>
      <div ref={ref} style={{position:"relative"}}>
        <div className="si-pdashed" onClick={()=>setShowDrop(!showDrop)}>+ Add Party</div>
        {showDrop && (
          <div className="si-pdropdown">
            <input autoFocus className="si-psearch" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search party by name or number"/>
            <div className="si-plist-hdr"><span>Party Name</span><span>Balance</span></div>
            <div className="si-plist">
              {filtered.map(p=>(
                <button key={p.id} className="si-prow" onClick={()=>{onSelectParty(p);setShowDrop(false);setSearch("");}}>
                  <span>{p.name}</span>
                  <span className="si-pbal">₹ {Math.abs(p.balance).toLocaleString("en-IN")}{p.balance>0&&<span className="si-arrown">↓</span>}</span>
                </button>
              ))}
            </div>
            <button className="si-create-party" onClick={()=>{setShowDrop(false);setShowModal(true);}}>+ Create Party</button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="si-overlay" onClick={()=>setShowModal(false)}>
          <div className="si-cmodal" onClick={e=>e.stopPropagation()}>
            <div className="si-cmodal-hdr"><span>Create New Party</span><button onClick={()=>setShowModal(false)}>✕</button></div>
            <div className="si-cmodal-body">
              <div className="si-crow2">
                <div>
                  <label>Party Name <span className="si-req">*</span></label>
                  <input value={form.partyName} onChange={e=>{setForm(f=>({...f,partyName:e.target.value}));setNameErr(false);}} placeholder="Enter name" className={`si-inp${nameErr?" si-inp--err":""}`}/>
                  {nameErr && <span className="si-errmsg">This field is mandatory</span>}
                </div>
                <div>
                  <label>Mobile Number</label>
                  <input value={form.mobileNumber} onChange={e=>setForm(f=>({...f,mobileNumber:e.target.value}))} placeholder="Enter Mobile Number" className="si-inp"/>
                </div>
              </div>
              <div className="si-caddr-section">
                <div className="si-caddr-hdr"><span>Address (Optional)</span><button>Remove</button></div>
                <div className="si-crow2">
                  <div>
                    <label className="si-alabel">BILLING ADDRESS <span className="si-req">*</span></label>
                    <textarea value={form.billingAddress} onChange={e=>setForm(f=>({...f,billingAddress:e.target.value}))} placeholder="Enter billing address" className="si-ta"/>
                    <div className="si-aextras">
                      <div><label>STATE</label><select className="si-sel"><option>Enter State</option></select></div>
                      <div><label>PINCODE</label><input value={form.pincode} onChange={e=>setForm(f=>({...f,pincode:e.target.value}))} placeholder="Enter Pincode" className="si-inp"/></div>
                    </div>
                    <div style={{marginTop:6}}><label>CITY</label><input value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} placeholder="Enter City" className="si-inp"/></div>
                  </div>
                  <div>
                    <label className="si-alabel">SHIPPING ADDRESS <span className="si-req">*</span></label>
                    <textarea value={form.sameAsBilling?form.billingAddress:form.shippingAddress} onChange={e=>setForm(f=>({...f,shippingAddress:e.target.value}))} placeholder="Enter shipping address" className="si-ta" disabled={form.sameAsBilling}/>
                    <div className="si-aextras">
                      <div><label>STATE</label><select className="si-sel" disabled={form.sameAsBilling}><option>Enter State</option></select></div>
                      <div><label>PINCODE</label><input value={form.shippingPincode} onChange={e=>setForm(f=>({...f,shippingPincode:e.target.value}))} placeholder="Enter Pincode" className="si-inp" disabled={form.sameAsBilling}/></div>
                    </div>
                    <div style={{marginTop:6}}><label>CITY</label><input value={form.shippingCity} onChange={e=>setForm(f=>({...f,shippingCity:e.target.value}))} placeholder="Enter City" className="si-inp" disabled={form.sameAsBilling}/></div>
                    <label className="si-same-chk"><input type="checkbox" checked={form.sameAsBilling} onChange={e=>setForm(f=>({...f,sameAsBilling:e.target.checked}))}/>Shipping address same as billing address</label>
                  </div>
                </div>
              </div>
              <div className="si-cgstin-section">
                <div className="si-caddr-hdr"><span>GSTIN (Optional)</span><button>Remove</button></div>
                <input value={form.gstin} onChange={e=>setForm(f=>({...f,gstin:e.target.value}))} placeholder="ex: 29XXXXX9438X1XX" className="si-inp si-inp--full"/>
              </div>
              <div className="si-chint">You can add Custom Fields from <span className="si-link">Party Settings</span></div>
            </div>
            <div className="si-cmodal-ftr">
              <button onClick={()=>setShowModal(false)} className="si-btn-cancel">Cancel</button>
              <button onClick={handleCreate} className="si-btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
