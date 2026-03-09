import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Settings,
  Boxes,
  Receipt,
  Tags,
  Layers,
  Search,
  X,
} from "lucide-react";
import api from "../../../lib/axios";
import StockDetails from "../StockDetails/StockDetails";
import CustomFields from "../CustomFields/CustomFields";
import partyWiseImg from "../../../assets/2.png";
import "./CreateItem.css";

/* ═══════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════ */
const MEASURING_UNITS = [
  "Aaaaaaaaaaa(G NEX)","Aana(ANA)","Accessories(ACS)","Acre(AC)","Adult(ADL)",
  "Ampoule(AMP)","Bags(BAG)","Bale(BAL)","Balls(BALL)","Barni(BAR)","Barrel(BRL)",
  "Batch(BTH)","Billions Of Units(BOU)","Blister(BLISTER)","Bolus(BOLUS)","Book(BK)",
  "Bora(BOR)","Bottles(BTL)","Box(BOX)","Brass(BRASS)","Brick(BRICK)","Buckets(BCK)",
  "Buckles(BKL)","Bunches(BUN)","Bundles(BDL)","Butts(BTS)","Cable(CBL)","Cans(CAN)",
  "Cap(CAP)","Capsules(CPS)","Carat(CT)","Carats(CTS)","Card(CARD)","Cartons(CTN)",
  "Case(CASE)","Centimeter(CMS)","Cents(CNT)","Ch(CHAIN)","Child(CLD)","Choka(CHOKA)",
  "Chudi(CHUDI)","Cloth(CLT)","Coil(COIL)","Cone(CN)","Container(CONT)","Copy(COPY)",
  "Cotton(COTT)","Course(COURSE)","Crate(CRT)","Cream(CRM)","Cubic Centimeter(CCM)",
  "Cubic Feet(CUFT)","Cubic Feet Per Minute(CFM)","Cubic Foot(CFT)","Cubic Meter(CBM)",
  "Cup(CUP)","Cv(CV)","Daily(DAILY)","Dangler(DANGLER)","Days(DAY)","Daze(DEZ)",
  "Decimeter(DMTR)","Dozen(DOZ)","Drop(DROP)","Drum(DRM)","Duty(DUTY)","Ea(EA)",
  "Each(EACH)","Feet(FT)","Feet Square(FT2)","Finger(FNGR)","Fit(FIT)","Flat(FLT)",
  "Fold(FLD)","Free(FREE)","Fts(FTS)","Full Plate(FP)","Gel(GEL)","Glasses(GLS)",
  "Grams(GMS)","Great Gross(GGR)","Gross(GRS)","Gross Yards(GYD)","Half(HF)",
  "Half Plate(H.P.)","Hanger(HEGAR)","Hangers(HANGER)","Hectare(HA)","Helmet(HMT)",
  "Horsepower(HP)","Hours(HRS)","Hundreds(HDS)","Ijn(INJECTION)","Inches(IN)",
  "Inj(INJECTION)","Insertion(INS)","Item Id(ITEM ID)","Jars(JAR)","Jhal(JL)",
  "Jhola(JO)","Jhola Jhal(JHL)","Jhudi(JHD)","Job(JOB)","Katta(KT)","Kilograms(KGS)",
  "Kiloliter(KLR)","Kilometre(KME)","Kilometres(KMS)","Kilovolt-amp(KVA)","Kilowatt(KW)",
  "Kit(KIT)","Ladi(LAD)","Length(LENG)","Libra Pondo(LBS)","Line(LNE)","Litre(LTR)",
  "Lot(LOT)","Lump Sum(LS)","Man-days(MAN-DAY)","Mark(MRK)","Mbps(MBPS)","Megawatt(MW)",
  "Meters(MTR)","Metric Million British Thermal Unit(MMBTU)","Metric Ton(MTON)",
  "Metric, Ton(MTS)","Microgram(ΜG)","Millicoulomb(M/C)","Milligram(MLG)",
  "Millilitre(MLT)","Millimeter(MM)","Minutes(MINS)","Month(UOM)","Months(MON)",
  "Mora(MORA)","Nights(NIGHT)","Non.(NON)","None(NONE)","Numbers(NOS)","Ointment(OINT)",
  "Others(OTH)","Outer(OR)","Package(PKG)","Packets(PKT)","Packs(PAC)","Pad(PAD)",
  "Pads(PADS)","Pages(PAGE)","Pair(PAIR)","Pairs(PRS)","Panel(PNL)","Part(PART)",
  "Patta(PATTA)","Patti(PTI)","Pax(PAX)","Per(PER)","Per Day(/DAY)","Per Metric Ton(PMT)",
  "Per Watt Peak(PWP)","Persons(PERSON)","Peti(PET)","Phile(PHILE)","Pieces(PCS)",
  "Plates(PLT)","Pocket(PCKT)","Point(PT)","Portion(PRT)","Pouch(POCH)","Pound(POUND)",
  "Puda(PD)","Quad(QUAD)","Quantity(QTY)","Quintal(QTL)","Ratti(RTI)","Ream(REAM)",
  "Reel(REEL)","Respules(RESP)","Rim(RIM)","Rolls(ROL)","Room(ROOM)","Running Foot(RFT)",
  "Running Meter(RMT)","Rupees(RS)","Sachet(SAC)","Seconds(SEC)","Semester(SEM)",
  "Service(SERVICE)","Session(SSN)","Sets(SET)","Sheet(SHEET)","Skins(SKINS)",
  "Slants(SLT)","Sleves(SLEVES)","Spindles(SPLS)","Spray(SPRAY)",
  "Square Centimeters(SQCM)","Square Feet(SQF)","Square Gaj(GAJ)","Square Gaz(GAZ)",
  "Square Inches(SQIN)","Square Kilometer(SQ KM)","Square Meters(SQM)",
  "Square Yards(SQY)","Srm(SARAM)","Std Pouch(ST POUCH)","Stickers(STICKER)",
  "Stone(STONE)","Strips(STRP)","Syrup(SYRP)","Tablets(TBS)","Ten Gross(TGM)",
  "Test(TEST)","Than(TN)","Thousands(THD)","Ticket(TKT)","Tin(TIN)","Tonnes(TON)",
  "Trays(TRY)","Trolly(TRLY)","Trp(TRIP)","Truck(TRK)","Tubes(TUB)","Units(UNT)",
  "Us Gallons(UGS)","Vials(VIAL)","Watt(W)","Weeks(WEEK)","Yards(YDS)","Years(YRS)",
];

const GST_RATES = [
  { label: "None", value: "" },
  { label: "Exempted", value: "Exempted" },
  { label: "GST @ 0%", value: "0" },
  { label: "GST @ 0.1%", value: "0.1" },
  { label: "GST @ 0.25%", value: "0.25" },
  { label: "GST @ 1.5%", value: "1.5" },
  { label: "GST @ 3%", value: "3" },
  { label: "GST @ 5%", value: "5" },
  { label: "GST @ 6%", value: "6" },
  { label: "GST @ 8.9%", value: "8.9" },
  { label: "GST @ 12%", value: "12" },
  { label: "GST @ 13.8%", value: "13.8" },
  { label: "GST @ 18%", value: "18" },
  { label: "GST @ 14% + cess @ 12%", value: "14+cess12" },
  { label: "GST @ 28%", value: "28" },
  { label: "GST @ 28% + Cess @ 5%", value: "28+cess5" },
  { label: "GST @ 40%", value: "40" },
  { label: "GST @ 28% + Cess @ 36%", value: "28+cess36" },
  { label: "GST @ 28% + Cess @ 60%", value: "28+cess60" },
];

/* ═══════════════════════════════════════════
   REUSABLE: Searchable Unit Dropdown
═══════════════════════════════════════════ */
const UnitDropdown = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = MEASURING_UNITS.filter((u) =>
    u.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="ci-unit-wrapper" ref={ref}>
      <div className="ci-unit-trigger" onClick={() => setOpen(!open)}>
        <Search size={14} className="ci-unit-icon" />
        <span>{value || "Pieces(PCS)"}</span>
        <span className="ci-unit-arrow">▾</span>
      </div>
      {open && (
        <div className="ci-unit-dropdown">
          <div className="ci-unit-search">
            <Search size={14} />
            <input
              autoFocus
              placeholder="Search unit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="ci-unit-list">
            {filtered.map((u) => (
              <div
                key={u}
                className={`ci-unit-item ${value === u ? "ci-unit-selected" : ""}`}
                onClick={() => { onChange(u); setOpen(false); setSearch(""); }}
              >
                {u}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════
   REUSABLE: GST Dropdown
═══════════════════════════════════════════ */
const GstDropdown = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selected = GST_RATES.find((g) => g.value === value);
  const filtered = GST_RATES.filter((g) =>
    g.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="ci-gst-wrapper" ref={ref}>
      <div className="ci-gst-trigger" onClick={() => setOpen(!open)}>
        <Search size={14} className="ci-gst-icon" />
        <span>{selected ? selected.label : "None"}</span>
        <span className="ci-gst-arrow">▾</span>
      </div>
      {open && (
        <div className="ci-gst-dropdown">
          <div className="ci-gst-search">
            <Search size={14} />
            <input
              autoFocus
              placeholder="Search GST rate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="ci-gst-list">
            {filtered.map((g) => (
              <div
                key={g.value}
                className={`ci-gst-item ${value === g.value ? "ci-gst-selected" : ""}`}
                onClick={() => { onChange(g.value); setOpen(false); setSearch(""); }}
              >
                {g.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
type SectionType = "basic" | "stock" | "pricing" | "party" | "custom" | "other";

const CreateItem = () => {
  const navigate = useNavigate();
  const [type, setType] = useState<"product" | "service">("product");
  const [activeSection, setActiveSection] = useState<SectionType>("basic");

  /* ── Category ── */
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const catRef = useRef<HTMLDivElement>(null);

  /* ── Basic form ── */
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState(false);
  const [salesPrice, setSalesPrice] = useState("");
  const [salesTax, setSalesTax] = useState("With Tax");
  const [gstRate, setGstRate] = useState("");
  const [unit, setUnit] = useState("Pieces(PCS)");
  const [openingStock, setOpeningStock] = useState("");
  const [serviceCode, setServiceCode] = useState("");
  const [showOnlineStore, setShowOnlineStore] = useState(false);

  /* ── Stock (passed down to StockDetails) ── */
  const [godownId, setGodownId] = useState("");
  const [asOfDate, setAsOfDate] = useState("");

  /* ── Pricing ── */
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseTax, setPurchaseTax] = useState("With Tax");
  const [discount, setDiscount] = useState("");
  // mrp and wholesalePrice kept as state for payload but not shown in UI
  const [mrp] = useState("");
  const [wholesalePrice] = useState("");
  const [trackBatchExpiry, setTrackBatchExpiry] = useState(false);

  /* ── Service other details ── */
  const [sacCode, setSacCode] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");

  /* ── Stock / other fields ── */
  const [itemCode, setItemCode] = useState("");
  const [hsnCode, setHsnCode] = useState("");
  const [description, setDescription] = useState("");
  const [lowStockAlert, setLowStockAlert] = useState(false);
  const [lowStockQty, setLowStockQty] = useState("");

  /* ── Outside click closes category dropdown ── */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node))
        setCategoryOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ── Fetch categories on mount ── */
  useEffect(() => {
    fetchCategories();
  }, []);

  /* ── Reset when switching product ↔ service ── */
  useEffect(() => {
    setName("");
    setSalesPrice("");
    setOpeningStock("");
    setServiceCode("");
    setNameError(false);
    setSearchCategory("");
    setSelectedCategory("");
    setActiveSection("basic");
  }, [type]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch {
      console.error("Failed to fetch categories");
    }
  };

  const filteredCategories = categories.filter((c: any) =>
    c.name.toLowerCase().includes(searchCategory.toLowerCase())
  );

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const res = await api.post("/categories", { name: newCategory });
      setCategories((prev) => [...prev, res.data]);
      setSelectedCategory(res.data.name);
      setNewCategory("");
      setShowAddCategory(false);
    } catch {
      console.error("Category creation failed");
    }
  };

  const autoCreateCategory = async (catName: string) => {
    try {
      const res = await api.post("/categories", { name: catName });
      setCategories((prev) => [...prev, res.data]);
      return res.data.name;
    } catch {
      return catName;
    }
  };

  const getUnitCode = (u: string) => {
    const m = u.match(/\(([^)]+)\)$/);
    return m ? m[1] : "PCS";
  };
  const unitCode = getUnitCode(unit);

  /* ── Helper: strip commas and convert to number ── */
  const cleanNumber = (value: string) => {
    if (!value) return null;
    const n = Number(String(value).replace(/,/g, ""));
    return isNaN(n) ? null : n;
  };

  /* ── Save item ── */
  const createItem = async () => {
    if (!name.trim()) {
      setNameError(true);
      setActiveSection("basic");
      return;
    }
    setNameError(false);

    try {
      let categoryValue = selectedCategory;
      if (!categoryValue && searchCategory.trim()) {
        categoryValue = await autoCreateCategory(searchCategory);
      }

      const payload = {
        name: name.trim(),
        itemType: type,
        category: categoryValue || null,

        itemCode: itemCode || null,
        hsnCode: hsnCode || null,
        sacCode: type === "service" ? sacCode || null : null,

        description:
          type === "service"
            ? serviceDescription || null
            : description || null,

        salesPrice: cleanNumber(salesPrice),
        purchasePrice: cleanNumber(purchasePrice),
        mrp: cleanNumber(mrp),
        wholesalePrice: cleanNumber(wholesalePrice),

        // ✅ sent as string — matches backend schema gstRate String?
        gstRate: gstRate ? String(gstRate) : null,

        salesDiscountPercent: discount ? Number(discount) : null,

        unit,

        // ✅ only for products with a positive stock value
        openingStock:
          type === "product" && openingStock
            ? Number(openingStock)
            : null,

        // ✅ required for ProductStock creation
        godownId:
          type === "product"
            ? Number(godownId || 1)
            : null,

        serviceCode:
          type === "service"
            ? serviceCode || null
            : null,

        lowStockAlert,
        lowStockQty: lowStockQty ? Number(lowStockQty) : null,

        trackBatchExpiry,
        showOnlineStore,
      };

      console.log("Create Item Payload:", payload);

      const res = await api.post("/items", payload);

      if (res.data?.success || res.data?.data) {
        alert("Item created successfully");
        navigate("/cashier/create-item/inventory");
      }
    } catch (error) {
      console.error("Item creation failed:", error);
      alert("Failed to create item. Please check all fields and try again.");
    }
  };

  /* ═══════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════ */
  return (
    <div className="ci-wrapper">
      {/* HEADER */}
      <div className="ci-header">Create New Item</div>

      <div className="ci-body">

        {/* ════ SIDEBAR ════ */}
        <aside className="ci-sidebar">
          <div
            className={`ci-side-item ${activeSection === "basic" ? "ci-side-active" : ""}`}
            onClick={() => setActiveSection("basic")}
          >
            <Package size={18} />
            <span>Basic Details <span className="ci-required">*</span></span>
          </div>

          <div className="ci-side-title">Advance Details</div>

          {type === "product" ? (
            <>
              <div
                className={`ci-side-item ${activeSection === "stock" ? "ci-side-active" : ""}`}
                onClick={() => setActiveSection("stock")}
              >
                <Boxes size={18} />
                <span>Stock Details</span>
              </div>
              <div
                className={`ci-side-item ${activeSection === "pricing" ? "ci-side-active" : ""}`}
                onClick={() => setActiveSection("pricing")}
              >
                <Receipt size={18} />
                <span>Pricing Details</span>
              </div>
            </>
          ) : (
            <div
              className={`ci-side-item ${activeSection === "other" ? "ci-side-active" : ""}`}
              onClick={() => setActiveSection("other")}
            >
              <Settings size={18} />
              <span>Other Details</span>
            </div>
          )}

          <div
            className={`ci-side-item ${activeSection === "party" ? "ci-side-active" : ""}`}
            onClick={() => setActiveSection("party")}
          >
            <Tags size={18} />
            <span>Party Wise Prices</span>
          </div>

          <div
            className={`ci-side-item ${activeSection === "custom" ? "ci-side-active" : ""}`}
            onClick={() => setActiveSection("custom")}
          >
            <Layers size={18} />
            <span>Custom Fields</span>
          </div>
        </aside>

        {/* ════ CONTENT ════ */}
        <section className="ci-content">

          {/* ── BASIC DETAILS ── */}
          {activeSection === "basic" && (
            <>
              {/* Row 1: Item Type + Category */}
              <div className="ci-row">
                <div>
                  <label>Item Type <span className="ci-required">*</span></label>
                  <div className="ci-radio">
                    <label className={`ci-radio-opt ${type === "product" ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="itemType"
                        checked={type === "product"}
                        onChange={() => setType("product")}
                      />
                      Product
                    </label>
                    <label className={`ci-radio-opt ${type === "service" ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="itemType"
                        checked={type === "service"}
                        onChange={() => setType("service")}
                      />
                      Service
                    </label>
                  </div>
                </div>

                <div>
                  <label>Category</label>
                  <div className="ci-category-wrapper" ref={catRef}>
                    <div
                      className="ci-category-input"
                      onClick={() => setCategoryOpen(!categoryOpen)}
                    >
                      <Search size={15} className="ci-category-icon" />
                      <input
                        className="ci-category-search"
                        placeholder={selectedCategory || "Search Categories"}
                        value={searchCategory}
                        onChange={(e) => {
                          setSearchCategory(e.target.value);
                          setCategoryOpen(true);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="ci-category-arrow">▾</span>
                    </div>
                    {categoryOpen && (
                      <div className="ci-category-dropdown">
                        {filteredCategories.map((cat: any) => (
                          <div
                            key={cat.id}
                            className="ci-category-item"
                            onClick={() => {
                              setSelectedCategory(cat.name);
                              setCategoryOpen(false);
                              setSearchCategory("");
                            }}
                          >
                            {cat.name}
                          </div>
                        ))}
                        <div
                          className="ci-category-add"
                          onClick={() => {
                            setShowAddCategory(true);
                            setCategoryOpen(false);
                          }}
                        >
                          + Add Category
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 2: Name + Online Store toggle */}
              <div className="ci-row">
                <div>
                  <label>
                    {type === "product" ? "Item Name" : "Service Name"}{" "}
                    <span className="ci-required">*</span>
                  </label>
                  <input
                    className={nameError ? "ci-input-error" : ""}
                    value={name}
                    onChange={(e) => { setName(e.target.value); setNameError(false); }}
                    placeholder={type === "product" ? "ex: Maggie 20gm" : "ex: Mobile service"}
                  />
                  {nameError && (
                    <p className="ci-error-msg">
                      Please enter the {type === "product" ? "item" : "service"} name
                    </p>
                  )}
                </div>
                <div className="ci-toggle">
                  <span className="ci-toggle-label">Show Item in Online Store</span>
                  <label className="ci-switch">
                    <input
                      type="checkbox"
                      checked={showOnlineStore}
                      onChange={(e) => setShowOnlineStore(e.target.checked)}
                    />
                    <span className="ci-slider"></span>
                  </label>
                </div>
              </div>

              {/* Row 3: Sales Price + GST */}
              <div className="ci-row">
                <div>
                  <label>Sales Price</label>
                  <div className="ci-price">
                    <span className="ci-price-sym">₹</span>
                    <input
                      type="number"
                      className="ci-price-input"
                      placeholder="ex: ₹200"
                      value={salesPrice}
                      onChange={(e) => setSalesPrice(e.target.value)}
                    />
                    <select
                      className="ci-price-sel"
                      value={salesTax}
                      onChange={(e) => setSalesTax(e.target.value)}
                    >
                      <option>With Tax</option>
                      <option>Without Tax</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label>GST Tax Rate(%)</label>
                  <GstDropdown value={gstRate} onChange={setGstRate} />
                </div>
              </div>

              {/* Row 4: Measuring Unit + Opening Stock / Service Code */}
              <div className="ci-row">
                <div>
                  <label>Measuring Unit</label>
                  <UnitDropdown value={unit} onChange={setUnit} />
                </div>

                {type === "product" ? (
                  <div>
                    <label>Opening Stock</label>
                    <div className="ci-stock-input-row">
                      <input
                        placeholder="ex: 150 PCS"
                        value={openingStock}
                        onChange={(e) => setOpeningStock(e.target.value)}
                      />
                      <span className="ci-stock-unit">{unitCode}</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label>Service Code</label>
                    <input
                      placeholder="Enter Service Code"
                      value={serviceCode}
                      onChange={(e) => setServiceCode(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── STOCK DETAILS ── */}
          {activeSection === "stock" && type === "product" && (
            <StockDetails
              godownId={godownId}
              setGodownId={setGodownId}

              openingStock={openingStock}
              setOpeningStock={setOpeningStock}

              asOfDate={asOfDate}
              setAsOfDate={setAsOfDate}

              itemCode={itemCode}
              setItemCode={setItemCode}

              hsnCode={hsnCode}
              setHsnCode={setHsnCode}

              description={description}
              setDescription={setDescription}

              lowStockQty={lowStockQty}
              setLowStockQty={setLowStockQty}

              lowStockAlert={lowStockAlert}
              setLowStockAlert={setLowStockAlert}
            />
          )}

          {/* ── PRICING DETAILS ── */}
          {activeSection === "pricing" && type === "product" && (
            <div className="ci-pricing-section">
              <div className="ci-row">
                <div>
                  <label>Sales Price</label>
                  <div className="ci-price">
                    <span className="ci-price-sym">₹</span>
                    <input
                      className="ci-price-input"
                      placeholder="ex: ₹200"
                      value={salesPrice}
                      onChange={(e) => setSalesPrice(e.target.value)}
                    />
                    <select
                      className="ci-price-sel"
                      value={salesTax}
                      onChange={(e) => setSalesTax(e.target.value)}
                    >
                      <option>With Tax</option>
                      <option>Without Tax</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label>Purchase Price</label>
                  <div className="ci-price">
                    <span className="ci-price-sym">₹</span>
                    <input
                      className="ci-price-input"
                      placeholder="ex: ₹200"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                    />
                    <select
                      className="ci-price-sel"
                      value={purchaseTax}
                      onChange={(e) => setPurchaseTax(e.target.value)}
                    >
                      <option>With Tax</option>
                      <option>Without Tax</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ── Track Batch & Expiry toggle ── */}
              <div className="ci-toggle">
                <span className="ci-toggle-label">Track Batch &amp; Expiry</span>
                <label className="ci-switch">
                  <input
                    type="checkbox"
                    checked={trackBatchExpiry}
                    onChange={(e) => setTrackBatchExpiry(e.target.checked)}
                  />
                  <span className="ci-slider"></span>
                </label>
              </div>

              <div className="ci-row">
                <div>
                  <label>GST Tax Rate(%)</label>
                  <GstDropdown value={gstRate} onChange={setGstRate} />
                </div>
                <div>
                  <label>Discount on Sales Price</label>
                  <div className="ci-discount-row">
                    <input
                      placeholder="ex: 12"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                    />
                    <span className="ci-discount-sym">%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── OTHER DETAILS (service only) ── */}
          {activeSection === "other" && type === "service" && (
            <div className="ci-other-section">
              <div className="ci-row-single">
                <label>SAC code</label>
                <input
                  placeholder="Enter SAC code"
                  value={sacCode}
                  onChange={(e) => setSacCode(e.target.value)}
                  className="ci-sac-input"
                />
                <button type="button" className="ci-link-btn">
                  Find SAC Code
                </button>
              </div>
              <div>
                <label>Description</label>
                <textarea
                  placeholder="Enter Description"
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  className="ci-textarea"
                />
              </div>
            </div>
          )}

          {/* ── PARTY WISE PRICES ── */}
          {activeSection === "party" && (
            <div className="ci-empty">
              <img src={partyWiseImg} alt="" className="ci-party-img" />
              <p>
                To enable Party Wise Prices and set custom prices for parties,
                please save the item first
              </p>
            </div>
          )}

          {/* ── CUSTOM FIELDS ── */}
          {activeSection === "custom" && <CustomFields />}

        </section>
      </div>

      {/* FOOTER */}
      <footer className="ci-footer">
        <button type="button" className="ci-cancel" onClick={() => navigate(-1)}>
          Cancel
        </button>
        <button type="button" className="ci-save" onClick={createItem}>
          Save
        </button>
      </footer>

      {/* ADD CATEGORY MODAL */}
      {showAddCategory && (
        <div className="ci-modal-backdrop">
          <div className="ci-modal">
            <div className="ci-modal-header">
              <h3>Create New Category</h3>
              <button onClick={() => setShowAddCategory(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="ci-modal-body">
              <label>Category Name</label>
              <input
                placeholder="Ex: Snacks"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                autoFocus
              />
            </div>
            <div className="ci-modal-footer">
              <button className="ci-cancel" onClick={() => setShowAddCategory(false)}>
                Cancel
              </button>
              <button className="ci-save" onClick={handleAddCategory}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateItem;