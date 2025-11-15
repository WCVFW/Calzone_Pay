import React from "react";
import "./EmployeeDashboard.css";

const EmployeeDashboard = () => {
  return (
<div className="dashboard-container">
        <header className="dashboard-header">
            <div className="logo-section">
                <img src="https://placehold.co/53x53/2D1E63/FFFFFF?text=V" alt="Logo" />
                <span>vel</span>
            </div>

            <div className="search-bar">
                <span className="material-symbols-outlined">search</span>
                <input type="text" placeholder="Search" />
            </div>

            <div className="header-icons">
                <span className="material-symbols-outlined">notifications</span>
                <span className="material-symbols-outlined">settings</span>
            </div>
        </header>

        <div className="dashboard-layout">
            <aside className="sidebar">
                <a href="javascript:void(0)" className="active">
                    <span className="material-symbols-outlined">dashboard</span> Dashboard
                </a>
                <a href="javascript:void(0)">
                    <span className="material-symbols-outlined">paid</span> Commission
                </a>
                <a href="javascript:void(0)">
                    <span className="material-symbols-outlined">account_balance_wallet</span> Withdrawal
                </a>
                <a href="javascript:void(0)">
                    <span className="material-symbols-outlined">badge</span> KYC Docs
                </a>
            </aside>

            <main className="main-content">
                <h1>Dashboard Overview</h1>
                <p>Welcome back, <strong>User</strong></p>

                <div className="stats-grid">
                    <div className="stat-card bg-blue">
                        <h4>Pending Bookings</h4>
                        <p>12</p>
                    </div>
                    <div className="stat-card bg-green">
                        <h4>New Inquiries</h4>
                        <p>5</p>
                    </div>
                    <div className="stat-card bg-purple">
                        <h4>Completed Today</h4>
                        <p>8</p>
                    </div>
                </div>

                <div className="recent-activity">
                    <h3>Recent Activity</h3>
                    <div className="activity-box">Chart or Data Table goes here</div>
                </div>
            </main>
        </div>
    </div>
  );
};

export default EmployeeDashboard;
