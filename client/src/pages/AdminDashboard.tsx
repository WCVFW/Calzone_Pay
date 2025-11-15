import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { FaUsers, FaClock, FaCheckCircle, FaTimesCircle, FaEye, FaTachometerAlt, FaFileContract, FaHistory, FaSearch, FaBell, FaUserCircle, FaArrowLeft, FaSignOutAlt } from "react-icons/fa";

const DashboardStyles = () => (
  <style>{`
    .admin-dashboard { display: flex; min-height: 100vh; background-color: #f4f7f6; }
    .sidebar { width: 260px; background: #2c3e50; color: white; position: fixed; height: 100%; z-index: 1000; display: flex; flex-direction: column; }
    .sidebar-header { padding: 20px; text-align: center; border-bottom: 1px solid #34495e; }
    .sidebar-nav { flex-grow: 1; }
    .sidebar-nav ul { list-style: none; padding: 0; margin: 0; }
    .sidebar-nav button { display: block; width: 100%; padding: 15px 20px; color: #bdc3c7; text-decoration: none; transition: background 0.2s, color 0.2s; background: none; border: none; text-align: left; }
    .sidebar-nav button:hover { background: #34495e; color: white; }
    .sidebar-nav button.active { background: #E15D67; color: white; font-weight: bold; }
    .sidebar-footer { padding: 20px; border-top: 1px solid #34495e; }
    .sidebar-footer .back-button { background: none; border: 1px solid #7f8c8d; color: #bdc3c7; width: 100%; border-radius: 5px; padding: 10px; transition: all 0.2s; }
    .sidebar-footer .back-button:hover { background: #7f8c8d; color: white; }
    .main-content { margin-left: 260px; width: calc(100% - 260px); padding: 30px; }
    .main-header { display: flex; justify-content: space-between; align-items: center; background: white; padding: 15px 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 30px; }
    .main-header .search-bar { max-width: 300px; }
    .main-header .user-profile { display: flex; align-items: center; gap: 10px; }
    .stat-card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); transition: transform 0.2s; }
    .stat-card:hover { transform: translateY(-5px); }
    .stat-card .icon { font-size: 2rem; }
    .table-wrapper { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .profile-dropdown { position: absolute; top: 110%; right: 0; background: white; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); z-index: 1001; min-width: 180px; overflow: hidden; }
    .profile-dropdown a, .profile-dropdown button { display: block; width: 100%; padding: 10px 15px; text-decoration: none; color: #333; background: none; border: none; text-align: left; }
    .profile-dropdown a:hover, .profile-dropdown button:hover { background-color: #f8f9fa; }
    .table thead th { background-color: #f8f9fa; border-bottom: 2px solid #dee2e6; }
    .table-responsive { max-height: 60vh; }
    .modal-body img { max-width: 100%; border-radius: 5px; }
  `}</style>
);

interface KycRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  aadhaar: string;
  pan: string;
  address: string;
  document_urls: string;
}

interface Transaction {
  id: number;
  user_name: string;
  mobile_number: string;
  operator: string;
  amount: number;
  status: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("dashboard");
  const [pendingKycs, setPendingKycs] = useState<KycRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<KycRequest | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // --- Data Fetching ---
  const fetchPendingKycs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/kyc-pending");
      setPendingKycs(response.data);
    } catch (err) {
      setError("Failed to fetch KYC requests.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // This endpoint needs to be created on the backend
      // const response = await api.get("/admin/transactions");
      // setTransactions(response.data);
      // Mock data for now:
      setTransactions([
        { id: 1, user_name: 'John Doe', mobile_number: '9876543210', operator: 'Airtel', amount: 199, status: 'SUCCESS', created_at: new Date().toISOString() },
        { id: 2, user_name: 'Jane Smith', mobile_number: '8765432109', operator: 'Jio', amount: 399, status: 'PENDING', created_at: new Date().toISOString() },
      ]);
    } catch (err) {
      setError("Failed to fetch transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingKycs();
    fetchTransactions();
  }, []);

  const handleKycAction = async (userId: number, action: "APPROVED" | "REJECTED") => {
    const result = await Swal.fire({
      title: `Confirm ${action.toLowerCase()}?`,
      text: `Are you sure you want to ${action.toLowerCase()} the KYC for this user?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: action === "APPROVED" ? "#28a745" : "#dc3545",
      confirmButtonText: `Yes, ${action.toLowerCase()} it!`,
    });

    if (result.isConfirmed) {
      try {
        await api.post("/admin/kyc-approve", { userId, action });
        Swal.fire("Success!", `User KYC has been ${action.toLowerCase()}.`, "success");
        setPendingKycs(pendingKycs.filter((user) => user.id !== userId));
      } catch (err) {
        Swal.fire("Error!", "Failed to update KYC status.", "error");
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const parseDocumentUrls = (urls: string) => {
    try {
      return JSON.parse(urls);
    } catch {
      return [];
    }
  };

  // --- Render Logic ---
  return (
    <>
      <DashboardStyles />
      <div className="admin-dashboard">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h3>Admin Panel</h3>
          </div>
          <nav className="sidebar-nav">
            <ul>
              <li><button onClick={() => setActiveView("dashboard")} className={activeView === 'dashboard' ? 'active' : ''}><FaTachometerAlt className="me-2" /> Dashboard</button></li>
              <li><button onClick={() => setActiveView("kyc")} className={activeView === 'kyc' ? 'active' : ''}><FaFileContract className="me-2" /> KYC Management</button></li>
              <li><button onClick={() => setActiveView("transactions")} className={activeView === 'transactions' ? 'active' : ''}><FaHistory className="me-2" /> Transactions</button></li>
              <li><button onClick={() => setActiveView("commission")} className={activeView === 'commission' ? 'active' : ''}><FaCheckCircle className="me-2" /> Commission</button></li>
              <li><button onClick={() => setActiveView("reportAnalysis")} className={activeView === 'reportAnalysis' ? 'active' : ''}><FaClock className="me-2" /> Analysis Report</button></li>
              <li><button onClick={() => setActiveView("employees")} className={activeView === 'employees' ? 'active' : ''}><FaUsers className="me-2" /> Employees</button></li>
              <li><button onClick={() => setActiveView("profile")} className={activeView === 'profile' ? 'active' : ''}><FaUserCircle className="me-2" /> Profile</button></li>
            </ul>
          </nav>
          <nav className="sidebar-footer">
            {activeView !== 'dashboard' && (
              <button onClick={() => setActiveView('dashboard')} className="back-button">
                <FaArrowLeft className="me-2" /> Back to Dashboard
              </button>
            )}
          </nav>
        </aside>

        <main className="main-content">
          <header className="main-header">
            <div className="search-bar input-group">
              <span className="input-group-text bg-light border-0"><FaSearch /></span>
              <input type="text" className="form-control bg-light border-0" placeholder="Search..." />
            </div>
            <div className="user-profile position-relative">
              <FaBell size={20} className="text-muted" />
              <div style={{cursor: 'pointer'}} onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
                <span className="fw-semibold">{auth.user?.name || 'Admin'}</span>
                <FaUserCircle size={32} className="text-primary ms-2" />
              </div>
              {profileDropdownOpen && (
                <div className="profile-dropdown">
                  <button onClick={() => { setActiveView('profile'); setProfileDropdownOpen(false); }}>
                    <FaUserCircle className="me-2" /> Profile
                  </button>
                  <button onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* --- Main Dashboard View --- */}
          {activeView === 'dashboard' && (
            <div>
              <h1 className="h2 mb-4">Analytics Overview</h1>
              <div className="row g-4">
                <div className="col-md-6 col-lg-3">
                  <div className="stat-card d-flex align-items-center">
                    <div className="icon text-primary me-3"><FaUsers /></div>
                    <div><h5 className="mb-0">25</h5><p className="text-muted mb-0">Total Employees</p></div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div className="stat-card d-flex align-items-center">
                    <div className="icon text-success me-3">₹</div>
                    <div><h5 className="mb-0">8,450</h5><p className="text-muted mb-0">Total Revenue</p></div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div className="stat-card d-flex align-items-center">
                    <div className="icon text-warning me-3"><FaClock /></div>
                    <div><h5 className="mb-0">{pendingKycs.length}</h5><p className="text-muted mb-0">Pending KYC</p></div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div className="stat-card d-flex align-items-center">
                    <div className="icon text-info me-3">₹</div>
                    <div><h5 className="mb-0">1,230</h5><p className="text-muted mb-0">Total Commissions</p></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- KYC Management View --- */}
          {activeView === 'kyc' && (
            <div className="table-wrapper">
              <h2 className="mb-3">Pending KYC Requests</h2>
              {loading && <div className="text-center p-5">Loading...</div>}
              {error && <div className="alert alert-danger">{error}</div>}
              {!loading && !error && (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead><tr><th>User</th><th>Contact</th><th>Status</th><th className="text-center">Actions</th></tr></thead>
                    <tbody>
                      {pendingKycs.map((user) => (
                        <tr key={user.id}>
                          <td><div className="fw-bold">{user.name}</div><div className="small text-muted">{user.email}</div></td>
                          <td>{user.phone}</td>
                          <td><span className="badge bg-warning text-dark">PENDING</span></td>
                          <td className="text-center">
                            <button className="btn btn-sm btn-outline-info me-2" onClick={() => setSelectedUser(user)}><FaEye /></button>
                            <button className="btn btn-sm btn-outline-success me-2" onClick={() => handleKycAction(user.id, "APPROVED")}><FaCheckCircle /></button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleKycAction(user.id, "REJECTED")}><FaTimesCircle /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* --- Transactions View --- */}
          {activeView === 'transactions' && (
            <div className="table-wrapper">
              <h2 className="mb-3">Transaction History</h2>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead><tr><th>User</th><th>Mobile</th><th>Operator</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td>{tx.user_name}</td><td>{tx.mobile_number}</td><td>{tx.operator}</td><td>₹{tx.amount}</td>
                        <td><span className={`badge bg-${tx.status === 'SUCCESS' ? 'success' : 'secondary'}`}>{tx.status}</span></td>
                        <td>{new Date(tx.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- Commission View --- */}
          {activeView === 'commission' && (
            <div className="table-wrapper">
              <h2 className="mb-3">Commission Management</h2>
              <p className="text-muted">This section will display commission structures, payouts, and related reports.</p>
            </div>
          )}

          {/* --- Report Analysis View --- */}
          {activeView === 'reportAnalysis' && (
            <div className="table-wrapper">
              <h2 className="mb-3">Report Analysis</h2>
              <p className="text-muted">This section will provide various reports and analytical tools for the platform.</p>
            </div>
          )}

          {/* --- Profile View --- */}
          {activeView === 'profile' && (
            <div className="table-wrapper">
              <h2 className="mb-4">My Profile</h2>
              {auth.user ? (
                <div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Name</label>
                    <p className="fs-5">{auth.user.name}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Email</label>
                    <p className="fs-5">{auth.user.email}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Role</label>
                    <p className="fs-5"><span className="badge bg-primary">{auth.user.role}</span></p>
                  </div>
                </div>
              ) : <p>Could not load user profile.</p>}
            </div>
          )}

          {/* --- Employees View --- */}
          {activeView === 'employees' && (
            <div className="table-wrapper">
              <h2 className="mb-3">Manage Employees</h2>
              <p className="text-muted">This section will contain tools to view and manage employee accounts.</p>
            </div>
          )}

        </main>
      </div>

      {/* View Details Modal */}
      {selectedUser && (
        <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.5)" }} onClick={() => setSelectedUser(null)}>
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">KYC Details: {selectedUser.name}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedUser(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Aadhaar:</strong> {selectedUser.aadhaar}</p>
                    <p><strong>PAN:</strong> {selectedUser.pan}</p>
                    <p><strong>Address:</strong> {selectedUser.address}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Documents:</h6>
                    {parseDocumentUrls(selectedUser.document_urls).length > 0 ? (
                      parseDocumentUrls(selectedUser.document_urls).map((url: string, index: number) => (
                        <a href={`http://localhost:3000${url}`} target="_blank" rel="noopener noreferrer" key={index} className="d-block mb-2">
                          <img src={`http://localhost:3000${url}`} alt={`Document ${index + 1}`} />
                        </a>
                      ))
                    ) : (
                      <p className="text-muted">No documents uploaded.</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-success" onClick={() => { handleKycAction(selectedUser.id, "APPROVED"); setSelectedUser(null); }}>Approve</button>
                <button className="btn btn-danger" onClick={() => { handleKycAction(selectedUser.id, "REJECTED"); setSelectedUser(null); }}>Reject</button>
                <button className="btn btn-secondary" onClick={() => setSelectedUser(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
