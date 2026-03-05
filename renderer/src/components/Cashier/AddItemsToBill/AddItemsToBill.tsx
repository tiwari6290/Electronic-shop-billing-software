import React, { useState } from "react";
import { X, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./AddItemsToBill.css";

const AddItemsToBill: React.FC = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  /* ✅ NEW STATE (added, not removing anything) */
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const items = [
    {
      id: "1",
      name: "GODREJ FRIDGE",
      code: "T=ITM9089",
      stock: "22 PCS",
      salesPrice: 34220,
      purchasePrice: 0,
    },
    {
      id: "2",
      name: "Samsung Galaxy A10",
      code: "-",
      stock: "-2 PCS",
      salesPrice: 7990,
      purchasePrice: 0,
    },
    {
      id: "3",
      name: "xyzq",
      code: "-",
      stock: "-1 BAG",
      salesPrice: 34500,
      purchasePrice: 0,
    },
  ];

  /* ✅ NEW FUNCTIONS */
  const increaseQty = (id: string) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const decreaseQty = (id: string) => {
    setQuantities((prev) => {
      const newQty = (prev[id] || 0) - 1;
      if (newQty <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newQty };
    });
  };

  const selectedCount = Object.values(quantities).filter(
    (q) => q > 0
  ).length;

  return (
    <div className="add-items-page">
      {/* Header */}
      <div className="add-items-header">
        <h2>Add Items to Bill</h2>
        <button className="icon-btn"  onClick={() => navigate(-1)}>
          <X />
        </button>
      </div>

      {/* Search Bar */}
      <div className="add-items-toolbar">
        <div className="search-box adv">
          <input
            type="text"
            placeholder="Search by Item / Serial no. / HSN / SKU / Category"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={18} className="sss" />
        </div>

        <select className="category-select">
          <option>Select Category</option>
        </select>

        <button
          className="primary-btn"
          onClick={() => navigate("/cashier/create-item")}
        >
          Create New Item
        </button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Item Code</th>
              <th>Stock</th>
              <th>Sales Price</th>
              <th>Purchase Price</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className={quantities[item.id] ? "row-selected" : ""}
              >
                <td>{item.name}</td>
                <td className="muted">{item.code}</td>
                <td>{item.stock}</td>
                <td>₹{item.salesPrice.toLocaleString()}</td>
                <td>₹{item.purchasePrice}</td>
                <td>
                  {quantities[item.id] ? (
                    <div className="qty-control">
                      <button onClick={() => decreaseQty(item.id)}>-</button>
                      <span>{quantities[item.id]}</span>
                      <button onClick={() => increaseQty(item.id)}>+</button>
                      <span className="unit">PCS</span>
                    </div>
                  ) : (
                    <button
                      className="add-btn"
                      onClick={() => increaseQty(item.id)}
                    >
                      + Add
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="add-items-footer">
        <span className="hint">
          Show {selectedCount} Item(s) Selected
        </span>
        <div className="footer-actions">
          <button className="secondary-btn">Cancel [ESC]</button>
          <button
            className="primary-btn"
            disabled={selectedCount === 0}
          >
            Add to Bill [F7]
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItemsToBill;
