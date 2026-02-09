const CashierDashboard = () => {
  const role = localStorage.getItem("role");
  const branch = localStorage.getItem("branch");

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#212529]">
              Cashier Dashboard
            </h1>
            <p className="text-[#6c757d] mt-1">
              Role: <b>{role}</b> | Branch: <b>{branch}</b>
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="px-5 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-lg font-medium text-[#212529]">
            Welcome Cashier 💵
          </p>
          <p className="text-sm text-[#6c757d] mt-2">
            You can manage billing, payments, and daily sales here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CashierDashboard;
