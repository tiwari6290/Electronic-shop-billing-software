import StockDetails from "../StockDetails/StockDetails";
import CustomFields from "../CustomFields/CustomFields";
import partyWiseImg from "../../../assets/2.png";

import { useState } from "react";
import {
  Package,
  Settings,
  Boxes,
  Receipt,
  Tags,
  Layers,
  Search,
} from "lucide-react";
import "./CreateItem.css";

const CreateItem = () => {
  const [type, setType] = useState<"product" | "service">("product");

  /* SECTION STATE */
  const [activeSection, setActiveSection] = useState<
    "basic" | "stock" | "pricing" | "party" | "other"
  >("basic");

  /* CATEGORY STATES */
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categories, setCategories] = useState<string[]>(["FRIDGE", "TV"]);
  const [selectedCategory, setSelectedCategory] = useState("Select Category");
  const [newCategory, setNewCategory] = useState("");

  /* FORM STATES */
  const [itemName, setItemName] = useState("");
  const [salesPrice, setSalesPrice] = useState("");
  const [openingStock, setOpeningStock] = useState("");
  const [serviceCode, setServiceCode] = useState("");

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    const value = newCategory.toUpperCase();
    setCategories((prev) => [...prev, value]);
    setSelectedCategory(value);
    setNewCategory("");
    setShowAddCategory(false);
    setCategoryOpen(false);
  };

  const handleSave = () => {
    if (!itemName.trim()) {
      alert("Item name is required!");
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      itemName: itemName,
      itemCode: serviceCode || "",
      stockQty: type === "product" && openingStock ? `${openingStock} PCS` : "-",
      sellingPrice: salesPrice ? parseFloat(salesPrice) : null,
      purchasePrice: null,
      category: selectedCategory === "Select Category" ? "" : selectedCategory,
      gstTaxRate: "None",
      hsnCode: "",
      secondaryUnit: "-",
      lowStockQty: "-",
      lowStockWarning: "Disabled" as const,
      itemDescription: "",
      stockDetails: [],
      partyWiseReport: [],
      godownStock: [],
      partyWisePrices: [],
    };

    const existing = JSON.parse(localStorage.getItem("inventory_items") || "[]");
    localStorage.setItem("inventory_items", JSON.stringify([...existing, newItem]));

    alert(`"${itemName}" saved successfully!`);

    // Reset form
    setItemName("");
    setSalesPrice("");
    setOpeningStock("");
    setServiceCode("");
    setSelectedCategory("Select Category");
    setActiveSection("basic");
  };

  return (
    <div className="ci-wrapper">
      <div className="ci-header">Create New Item</div>

      <div className="ci-body">
        {/* LEFT PANEL */}
        <aside className="ci-sidebar">
          <div
            className={`ci-side-item ${
              activeSection === "basic" ? "ci-side-active" : ""
            }`}
            onClick={() => setActiveSection("basic")}
          >
            <Package size={18} />
            <span>Basic Details *</span>
          </div>

          <div className="ci-side-title">Advance Details</div>

          {type === "product" ? (
            <>
              <div
                className={`ci-side-item ${
                  activeSection === "stock" ? "ci-side-active" : ""
                }`}
                onClick={() => setActiveSection("stock")}
              >
                <Boxes size={18} />
                <span>Stock Details</span>
              </div>

              <div
                className={`ci-side-item ${
                  activeSection === "pricing" ? "ci-side-active" : ""
                }`}
                onClick={() => setActiveSection("pricing")}
              >
                <Receipt size={18} />
                <span>Pricing Details</span>
              </div>
            </>
          ) : (
            <div className="ci-side-item">
              <Settings size={18} />
              <span>Other Details</span>
            </div>
          )}

          <div
            className={`ci-side-item ${
              activeSection === "party" ? "ci-side-active" : ""
            }`}
            onClick={() => setActiveSection("party")}
          >
            <Tags size={18} />
            <span>Party Wise Prices</span>
          </div>

          <div
            className={`ci-side-item ${
              activeSection === "other" ? "ci-side-active" : ""
            }`}
            onClick={() => setActiveSection("other")}
          >
            <Layers size={18} />
            <span>Custom Fields</span>
          </div>
        </aside>

        {/* RIGHT PANEL */}
        <section className="ci-content">
          {/* ================= BASIC DETAILS ================= */}
          {activeSection === "basic" && (
            <>
              {/* Item Type + Category */}
              <div className="ci-row">
                <div>
                  <label>Item Type *</label>
                  <div className="ci-radio">
                    <button
                      className={type === "product" ? "active" : ""}
                      onClick={() => setType("product")}
                    >
                      Product
                    </button>
                    <button
                      className={type === "service" ? "active" : ""}
                      onClick={() => setType("service")}
                    >
                      Service
                    </button>
                  </div>
                </div>

                <div className="ci-category-wrapper">
                  <div
                    className="ci-category-input"
                    onClick={() => setCategoryOpen(!categoryOpen)}
                  >
                    <span className="ci-category-icon">
                      <Search size={16} />
                    </span>
                    <span className="ci-category-placeholder">
                      {selectedCategory}
                    </span>
                    <span className="ci-category-arrow">▾</span>
                  </div>

                  {categoryOpen && (
                    <div className="ci-category-dropdown">
                      {categories.map((cat) => (
                        <div
                          key={cat}
                          className="ci-category-item"
                          onClick={() => {
                            setSelectedCategory(cat);
                            setCategoryOpen(false);
                          }}
                        >
                          {cat}
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

              {/* Item Name + Online Store */}
              <div className="ci-row">
                <div>
                  <label>
                    {type === "product" ? "Item Name *" : "Service Name *"}
                  </label>
                  <input
                    placeholder={
                      type === "product"
                        ? "ex: Maggie 20gm"
                        : "ex: Mobile service"
                    }
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                  />
                </div>

                <div className="ci-toggle">
                  <div className="ci-toggle-inner">
                    <span>Show Item in Online Store</span>
                    <label className="ci-switch">
                      <input type="checkbox" />
                      <span className="ci-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Sales Price + GST */}
              <div className="ci-row">
                <div>
                  <label>Sales Price</label>
                  <div className="ci-price">
                    <span>₹</span>
                    <input
                      placeholder="ex: ₹200"
                      value={salesPrice}
                      onChange={(e) => setSalesPrice(e.target.value)}
                    />
                    <select>
                      <option>With Tax</option>
                      <option>Without Tax</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label>GST Tax Rate (%)</label>
                  <select>
                    <option>None</option>
                  </select>
                </div>
              </div>

              {/* Measuring Unit + Opening Stock */}
              <div className="ci-row">
                <div>
                  <label>Measuring Unit</label>
                  <select>
                    <option>Pieces (PCS)</option>
                    <option>Box (BOX)</option>
                    <option>Kg (KGS)</option>
                  </select>
                </div>

                {type === "product" ? (
                  <div>
                    <label>Opening Stock</label>
                    <input
                      placeholder="ex: 150 PCS"
                      value={openingStock}
                      onChange={(e) => setOpeningStock(e.target.value)}
                    />
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

              {/* Enable Serialisation */}
              {type === "product" && (
                <div className="ci-serial">
                  <div className="ci-serial-inner">
                    <span>Enable Serialisation</span>
                    <label className="ci-switch">
                      <input type="checkbox" />
                      <span className="ci-slider"></span>
                    </label>
                  </div>
                </div>
              )}
            </>
          )}

          {/* STOCK DETAILS */}
          {activeSection === "stock" && type === "product" && (
            <StockDetails />
          )}

          {/* PRICING DETAILS */}
          {activeSection === "pricing" && type === "product" && (
            <>
              <div className="ci-row">
                <div>
                  <label>Sales Price</label>
                  <div className="ci-price">
                    <span>₹</span>
                    <input placeholder="ex: ₹200" />
                    <select>
                      <option>With Tax</option>
                      <option>Without Tax</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label>Purchase Price</label>
                  <div className="ci-price">
                    <span>₹</span>
                    <input placeholder="ex: ₹200" />
                    <select>
                      <option>With Tax</option>
                      <option>Without Tax</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="ci-row">
                <div>
                  <label>GST Tax Rate (%)</label>
                  <select>
                    <option>None</option>
                    <option>5%</option>
                    <option>12%</option>
                    <option>18%</option>
                    <option>28%</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* PARTY WISE */}
          {activeSection === "party" && (
            <div className="ci-empty">
              <img src={partyWiseImg} />
              <p>
                To enable Party Wise Prices and set custom prices for parties,
                please save the item first
              </p>
            </div>
          )}

          {/* CUSTOM FIELDS */}
          {activeSection === "other" && <CustomFields />}
        </section>
      </div>

      {/* FOOTER */}
      <footer className="ci-footer">
        <button className="ci-cancel">Cancel</button>
        <button className="ci-save" onClick={handleSave}>Save</button>
      </footer>

      {/* ADD CATEGORY MODAL */}
      {showAddCategory && (
        <div className="ci-modal-backdrop">
          <div className="ci-modal">
            <div className="ci-modal-header">
              <h3>Create New Category</h3>
              <button onClick={() => setShowAddCategory(false)}>×</button>
            </div>

            <div className="ci-modal-body">
              <label>Category Name</label>
              <input
                placeholder="Ex: Snacks"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>

            <div className="ci-modal-footer">
              <button onClick={() => setShowAddCategory(false)}>Cancel</button>
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