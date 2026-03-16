import React from "react";
import "./UserRolesModal.css";

interface UserRolesModalProps {
  onClose: () => void;
}

/* ── Data ── */
const ROLES = [
  "Salesman",
  "Delivery Boy",
  "Stock Manager",
  "Partner",
  "Admin",
  "Accountant / Advocate"
];

type CellValue =
  | string
  | {
      text: string;
      highlight?: "green" | "orange" | "yes" | "no";
    };

const ROWS: {
  feature: string;
  permission: string;
  values: CellValue[];
}[] = [
  {
    feature:
      "Sales Vouchers\n(Sales, Quotation,\nProforma, Payment\nIn, Credit Note,\nDelivery Challan\nOnline Store)",
    permission: "Create (Includes edit of item details)",
    values: [
      "YES",
      { text: "Only Payment", highlight: "orange" },
      "NO",
      "",
      "YES",
      "YES",
      "YES"
    ]
  },
  { feature: "", permission: "Edit", values: ["Y/N", "NO", "NO", "", "YES", "YES", "YES"] },
  { feature: "", permission: "View", values: ["YES", "YES", "YES", "", "YES", "YES", "YES"] },
  { feature: "", permission: "Delete", values: ["NO", "NO", "NO", "", "YES", "YES", "YES"] }
];

/* ── Helpers ── */
function getCellClass(val: CellValue): string {
  if (typeof val === "object") {
    if (val.highlight === "orange") return "ur-cell--orange";
    if (val.highlight === "green") return "ur-cell--green";
  }

  if (typeof val === "string") {
    if (val === "YES") return "ur-cell--yes";
    if (val === "NO") return "ur-cell--no";
    if (val === "Y/N") return "ur-cell--yn";
  }

  return "";
}

function getCellText(val: CellValue): string {
  return typeof val === "object" ? val.text : val;
}

/* ── Component ── */
const UserRolesModal: React.FC<UserRolesModalProps> = ({ onClose }) => {
  return (
    <div className="ur-overlay" onClick={onClose}>
      <div className="ur-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ur-header">
          <h2 className="ur-title">User Roles</h2>
          <button className="ur-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Table */}
        <div className="ur-body">
          <table className="ur-table">
            <thead>
              <tr>
                <th className="ur-th ur-th--feature">Features</th>
                <th className="ur-th ur-th--permission">Permissions</th>

                {ROLES.map((role) => (
                  <th key={role} className="ur-th ur-th--role">
                    <div className="ur-role-header">
                      <img
                        src="../../../assets/user1.png"
                        alt={role}
                        className="ur-role-img"
                      />
                      <span className="ur-role-name">{role}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {ROWS.map((row, idx) => {
                const isFirstInGroup = row.feature !== "";

                let rowSpan = 1;
                if (isFirstInGroup) {
                  for (let i = idx + 1; i < ROWS.length; i++) {
                    if (ROWS[i].feature === "") rowSpan++;
                    else break;
                  }
                }

                return (
                  <tr
                    key={idx}
                    className={`ur-row ${idx % 2 === 0 ? "ur-row--even" : ""}`}
                  >
                    {isFirstInGroup && (
                      <td
                        className="ur-td ur-td--feature"
                        rowSpan={rowSpan}
                      >
                        {row.feature.split("\n").map((line, i) => (
                          <span key={i}>
                            {line}
                            <br />
                          </span>
                        ))}
                      </td>
                    )}

                    <td className="ur-td ur-td--permission">
                      {row.permission}
                    </td>

                    {/* First 6 Roles */}
                    {row.values.slice(0, 6).map((val, ci) => {
                      if (ci === 3) {
                        return (
                          <td
                            key={ci}
                            className="ur-td ur-td--partner"
                          />
                        );
                      }

                      if (!val) {
                        return (
                          <td
                            key={ci}
                            className="ur-td ur-td--val"
                          />
                        );
                      }

                      const text = getCellText(val);
                      const cls = getCellClass(val);

                      return (
                        <td
                          key={ci}
                          className={`ur-td ur-td--val ${cls}`}
                        >
                          {text}
                        </td>
                      );
                    })}

                    {/* Accountant Column */}
                    {(() => {
                      const val = row.values[6];

                      if (!val) {
                        return (
                          <td className="ur-td ur-td--val" />
                        );
                      }

                      const text = getCellText(val);
                      const cls = getCellClass(val);

                      return (
                        <td
                          className={`ur-td ur-td--val ${cls}`}
                        >
                          {text}
                        </td>
                      );
                    })()}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserRolesModal;
