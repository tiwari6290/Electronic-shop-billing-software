import "./AccountantDashboard.css";
import AccountantSidebar from "../AccountantSidebar/AccountantSidebar";
import AccountantTopbar from "../AccountantTopbar/AccountantTopbar";

import {
  TrendingUp,
  AlertCircle,
  ArrowDownRight,
  IndianRupee,
  Receipt,
  FileText,
  CreditCard,
  PlusCircle
} from "lucide-react";

export default function AccountantDashboard() {
  return (
    <div className="accountant-layout">

      <AccountantSidebar />

      <div className="accountant-main">

        <AccountantTopbar />

        <div className="accountant-content">

{/* ================= STATS ================= */}

<div className="stats-grid">

  <div className="stat-card primary">
    <div className="stat-icon">
      <TrendingUp size={26} />
    </div>
    <div className="stat-content">
      <p>Monthly Revenue</p>
      <h2>₹48,50,000</h2>
      <span>Jan 2024</span>
    </div>
  </div>

  <div className="stat-card">
    <div className="stat-icon light">
      <AlertCircle size={26} />
    </div>
    <div className="stat-content">
      <p>Outstanding</p>
      <h2>₹2,48,500</h2>
      <span>3 pending invoices</span>
    </div>
  </div>

  <div className="stat-card">
    <div className="stat-icon light">
      <ArrowDownRight size={26} />
    </div>
    <div className="stat-content">
      <p>Total Expenses</p>
      <h2>₹12,75,000</h2>
      <span>This month</span>
    </div>
  </div>

  <div className="stat-card">
    <div className="stat-icon light">
      <IndianRupee size={26} />
    </div>
    <div className="stat-content">
      <p>Net Profit</p>
      <h2>₹8,25,000</h2>
      <span>17% margin</span>
    </div>
  </div>

</div>

{/* ================= GST ================= */}

<div className="gst-card">

  <div className="gst-header">
    <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
      <Receipt size={20}/>
      <h3>GST Summary (January 2024)</h3>
    </div>
    <span>Due: Feb 20, 2024</span>
  </div>

  <div className="gst-grid">

    <div className="gst-box green">
      <p>Output GST (Collected)</p>
      <h2>₹8,73,000</h2>
      <span>CGST ₹4,36,500 | SGST ₹4,36,500</span>
    </div>

    <div className="gst-box red">
      <p>Input GST (Paid)</p>
      <h2>₹5,45,000</h2>
      <span>CGST ₹2,72,500 | SGST ₹2,72,500</span>
    </div>

    <div className="gst-box blue">
      <p>GST Payable</p>
      <h2>₹3,28,000</h2>

      <div className="progress-bar">
        <div className="progress-fill"></div>
      </div>

      <span>75% Filing Progress</span>
    </div>

  </div>

</div>

{/* ================= QUICK ACTIONS ================= */}

<div className="quick-section">

  <h3 className="quick-heading">Quick Actions</h3>

  <div className="quick-actions">

    <div className="quick-card active">
      <Receipt size={20}/>
      <div>
        <h4>GST Dashboard</h4>
        <p>View GST reports</p>
      </div>
    </div>

    <div className="quick-card">
      <FileText size={20}/>
      <div>
        <h4>Ledgers</h4>
        <p>Customer & supplier</p>
      </div>
    </div>

    <div className="quick-card">
      <CreditCard size={20}/>
      <div>
        <h4>Settlements</h4>
        <p>Bank & UPI reconciliation</p>
      </div>
    </div>

    <div className="quick-card">
      <PlusCircle size={20}/>
      <div>
        <h4>Add Expense</h4>
        <p>Record new expense</p>
      </div>
    </div>

  </div>

</div>


          {/* ===== TABLE SECTION ===== */}
          <div className="table-grid">

            {/* RECEIVABLES */}
            <div className="table-card">

              <div className="table-header">
                Outstanding Receivables
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Invoice</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  <tr>
                    <td>Tech Solutions Ltd</td>
                    <td>INV-1001</td>
                    <td>₹1,25,000</td>
                    <td><span className="status-pill overdue">Overdue</span></td>
                  </tr>

                  <tr>
                    <td>Smart Electronics</td>
                    <td>INV-1005</td>
                    <td>₹78,500</td>
                    <td><span className="status-pill pending">Pending</span></td>
                  </tr>

                  <tr>
                    <td>Digital World</td>
                    <td>INV-1008</td>
                    <td>₹45,000</td>
                    <td><span className="status-pill pending">Pending</span></td>
                  </tr>

                </tbody>

              </table>

            </div>


            {/* EXPENSES */}
            <div className="table-card">

              <div className="table-header">
                Recent Expenses
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>

                  <tr>
                    <td>Electricity Bill</td>
                    <td>Utilities</td>
                    <td>₹12,500</td>
                    <td>2024-01-25</td>
                  </tr>

                  <tr>
                    <td>Staff Salary</td>
                    <td>Payroll</td>
                    <td>₹1,85,000</td>
                    <td>2024-01-25</td>
                  </tr>

                  <tr>
                    <td>Store Rent</td>
                    <td>Rent</td>
                    <td>₹55,000</td>
                    <td>2024-01-20</td>
                  </tr>

                  <tr>
                    <td>Marketing</td>
                    <td>Advertising</td>
                    <td>₹25,000</td>
                    <td>2024-01-18</td>
                  </tr>

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
