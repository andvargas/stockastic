import { createContext, useContext, useState, useEffect } from "react";

const DashboardFilterContext = createContext();

export const DashboardFilterProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [accountTypeFilter, setAccountTypeFilter] = useState(null);
  const [showConsidering, setShowConsidering] = useState(false);
  const [dateFilter, setDateFilter] = useState("this-year");
  const [customStartDate, setCustomStartDate] = useState(null);

  // Load saved filters on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("dashboardFilters"));
    if (saved) {
      setSearchTerm(saved.searchTerm || "");
      setAccountTypeFilter(saved.accountTypeFilter ?? null);
      setShowConsidering(saved.showConsidering || false);
      setDateFilter(saved.dateFilter || "this-year");
      setCustomStartDate(saved.customStartDate || null);
    }
  }, []);

  // Save filters when they change
  useEffect(() => {
    localStorage.setItem(
      "dashboardFilters",
      JSON.stringify({
        searchTerm,
        accountTypeFilter,
        showConsidering,
        dateFilter,
        customStartDate
      })
    );
  }, [searchTerm, accountTypeFilter, showConsidering, dateFilter]);

  return (
    <DashboardFilterContext.Provider
      value={{
        searchTerm,
        setSearchTerm,
        accountTypeFilter,
        setAccountTypeFilter,
        showConsidering,
        setShowConsidering,
        dateFilter,
        setDateFilter,
        customStartDate,
        setCustomStartDate,
      }}
    >
      {children}
    </DashboardFilterContext.Provider>
  );
};

export const useDashboardFilters = () => useContext(DashboardFilterContext);