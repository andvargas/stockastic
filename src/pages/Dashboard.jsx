import React, { useState, useEffect } from "react";
import { getTrades } from "../services/stockService";
import TradeForm from "../components/TradeForm";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";
import { addTrade } from "../services/stockService";
import Tooltip from "../components/Tooltip";
import { addNote } from "../services/journalService";
import toast from "react-hot-toast";
import AddJournalEntryForm from "../components/AddJournalEntryForm";
import { RadarIcon, CoinsIcon, BanknoteIcon, Info, CalendarDaysIcon } from "lucide-react";
import currencyRates from "../utils/currencyRates";
import { formatCurrency } from "../utils/formatCurrency";
import { useAuth } from "../contexts/AuthContext";
import { hasPermission } from "../utils/roleUtils";
import TopNavBar from "../components/TopNavBar";
import DateCard from "../components/DateCard";

const Dashboard = () => {
  const { user } = useAuth();
  const [trades, setTrades] = useState([]);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [selectedTradeId, setSelectedTradeId] = useState(null);
  const [showConsidering, setShowConsidering] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);
  const [accountTypeFilter, setAccountTypeFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("All");
  const [customStartDate, setCustomStartDate] = useState(null);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  console.log(trades[7]);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const data = await getTrades();
        setTrades(data);
      } catch (err) {
        console.error("Error fetching trades", err);
      }
    };

    fetchTrades();
  }, []);

  const handleAddTrade = async (newTrade) => {
    try {
      const res = await addTrade(newTrade);
      setTrades((prevTrades) => [...prevTrades, res]);
      return true;
    } catch (err) {
      console.error("Error adding trade", err);
    }
  };

  const openJournalModal = (tradeId) => {
    setSelectedTradeId(tradeId);
  };

  const closeJournalModal = () => {
    setSelectedTradeId(null);
  };

  const saveJournalEntry = async (entry) => {
    try {
      await addNote(entry);
      toast.success("Journal note added!");
      closeJournalModal();
      // optionally trigger a data refresh
    } catch (error) {
      console.error("Failed to add journal note", error);
      toast.error("Failed to add note.");
    }
  };

  const now = new Date();
  const matchesDate = (trade) => {
    if (!trade.date) return false;
    const tradeDate = new Date(trade.date);

    switch (dateFilter) {
      case "Last month":
        const lastMonth = new Date(now);
        lastMonth.setMonth(now.getMonth() - 1);
        return tradeDate >= lastMonth;
      case "This year":
        return tradeDate.getFullYear() === now.getFullYear();
      case "Custom":
        return customStartDate ? tradeDate >= new Date(customStartDate) : true;
      default:
        return true; // "All"
    }
  };

  const filteredTrades = trades.filter((trade) => {
    const matchesStatus = showConsidering ? trade.status === "Considering" : trade.status !== "Considering";

    const matchesAccountType =
      !accountTypeFilter ||
      (accountTypeFilter === "Real Money" && ["CFD", "Real Money"].includes(trade.assetType)) ||
      (accountTypeFilter === "Paper Money" && ["Paper Money", "Paper CFD"].includes(trade.assetType));

    const matchesSearch =
      !searchTerm ||
      trade.ticker?.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      trade.strategy?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesAccountType && matchesSearch && matchesDate(trade);
  });

  const totalTrades = filteredTrades.length;
  const openPositions = filteredTrades.filter((trade) => trade.status === "Open").length;
  const totalPL = filteredTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);

  const setShowRealMoney = () => {
    setAccountTypeFilter((prev) => (prev === "Real Money" ? null : "Real Money"));
    setShowConsidering(false);
  };

  const setShowPaperMoney = () => {
    setAccountTypeFilter((prev) => (prev === "Paper Money" ? null : "Paper Money"));
    setShowConsidering(false);
  };

  const titleModifier = accountTypeFilter === "Real Money" ? "(RM)" : accountTypeFilter === "Paper Money" ? "(PM)" : "";

  const getChangeData = (trade) => {
    const rate = currencyRates[trade.currency] || 1;
    const entryValue = trade.quantity * trade.entryPrice * rate;

    // If trade is closed, use netProfit as-is (already in GBP)
    if (trade.status === "Closed" && typeof trade.netProfit === "number") {
      const change = trade.netProfit;
      const percentChange = (change / entryValue) * 100;

      return {
        change,
        percentChange,
        currency: "GBP", // netProfit is already in GBP
      };
    }

    const refPrice = trade.highestClosePrice ?? trade.manualCurrentPrice;
    if (!refPrice || !trade.quantity) return { change: null, percentChange: null };

    const currentValue = trade.quantity * refPrice * rate;
    const change = currentValue - entryValue;
    const percentChange = (change / entryValue) * 100;

    return {
      change,
      percentChange,
      currency: "GBP",
    };
  };

  const handleDateFilterChange = (option) => {
    setDateFilter(option);

    if (option !== "Custom") {
      setShowDateDropdown(false);
    }
  };

  return (
    <div className="min-h-[95vh] bg-gray-100">
      <TopNavBar isLoggedIn={!!user} onLogout={() => {}} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <h2 className="text-sm text-gray-500">Total Trades</h2>
            <p className="text-2xl font-semibold">{totalTrades}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <h2 className="text-sm text-gray-500">Open Positions</h2>
            <p className="text-2xl font-semibold">{openPositions}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <h2 className="text-sm text-gray-500">Total P/L</h2>
            <p className={`text-2xl font-semibold ${totalPL >= 0 ? "text-green-500" : "text-red-500"}`}>
              £{totalPL.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Trade List */}
        <div className="bg-white rounded-xl p-6 shadow">
          <div className="flex justify-between items-center mb-4">
            <div className="relative">
              <Tooltip tooltipText="Filter by date">
                <button
                  onClick={() => setShowDateDropdown((prev) => !prev)}
                  className="flex items-center gap-1 text-sm px-2 py-1 rounded hover:bg-gray-200 transition"
                >
                  <CalendarDaysIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">
                    {dateFilter === "Custom" && customStartDate
                      ? `> ${new Date(customStartDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })}`
                      : dateFilter || "All"}
                  </span>
                </button>
              </Tooltip>

              {showDateDropdown && (
                <div className="absolute left-0 top-8 bg-white border rounded-lg shadow-md p-2 w-48 z-10 space-y-2 text-sm">
                  {["All", "Last month", "This year", "Custom"].map((option) => (
                    <button
                      key={option}
                      className={`block w-full text-left px-2 py-1 rounded hover:bg-gray-100 ${
                        dateFilter === option ? "bg-blue-100 font-semibold" : ""
                      }`}
                      onClick={() => {
                        setDateFilter(option);
                        if (option !== "Custom") {
                          setCustomStartDate(null);
                          setShowDateDropdown(false);
                        }
                      }}
                    >
                      {option}
                    </button>
                  ))}

                  {dateFilter === "Custom" && (
                    <input
                      type="date"
                      className="w-full border rounded px-2 py-1 mt-2"
                      value={customStartDate || ""}
                      onChange={(e) => {
                        setCustomStartDate(e.target.value);
                        setShowDateDropdown(false);
                      }}
                    />
                  )}
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold">{showConsidering ? "Potential Buys" : `Trades ${titleModifier}`}</h2>
            <div className="gap-4 flex items-center">
              <Tooltip tooltipText={showConsidering ? "Show Active" : "Show Real Money"}>
                <BanknoteIcon
                  onClick={() => setShowRealMoney()}
                  className={`h-6 w-6 cursor-pointer transition-colors duration-300 ${
                    accountTypeFilter === "Real Money" ? "text-lime-600" : "hover:text-lime-600"
                  }`}
                />
              </Tooltip>
              <Tooltip tooltipText={showConsidering ? "Show Active" : "Show Paper Money"}>
                <CoinsIcon
                  onClick={() => setShowPaperMoney()}
                  className={`h-6 w-6 cursor-pointer transition-colors duration-300 ${
                    accountTypeFilter === "Paper Money" ? "text-lime-600" : "hover:text-lime-600"
                  }`}
                />
              </Tooltip>
              <Tooltip tooltipText={showConsidering ? "Show Active" : "Show Considering"}>
                <RadarIcon
                  onClick={() => setShowConsidering(!showConsidering)}
                  className="h-6 w-6 cursor-pointer hover:text-lime-600 transition-colors duration-300"
                />
              </Tooltip>
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b p-2">
                  <div className="flex items-center gap-1">
                    Ticker
                    <Tooltip tooltipText={"Click the ticker name to see the details."} showOnLoadDuration={2000}>
                      <sup>
                        <Info className="inline cursor-pointer" size="16" />
                      </sup>
                    </Tooltip>
                  </div>
                </th>
                <th className="border-b p-2">Entry type/nr/price</th>
                <th className="border-b p-2">Change</th>
                <th className="border-b p-2">Date</th>
                <th className="border-b p-2 hidden md:table-cell">
                  Stop Loss{" "}
                  <Tooltip tooltipText={"Displays SL (Stop Loss) or Net Loss when closed."}>
                    <sup>
                      <Info className="inline cursor-pointer" size="16" />
                    </sup>
                  </Tooltip>
                </th>
                <th className="border-b p-2 hidden md:table-cell">
                  <div>
                    Take Profit
                    <Tooltip tooltipText={"Displays BE/TP (Break Even / Take Profit) or Net Profit when closed."}>
                      <sup>
                        <Info className="inline cursor-pointer" size="16" />
                      </sup>
                    </Tooltip>
                  </div>
                </th>
                <th className="border-b p-2 hidden md:table-cell">Status</th>
                <th className="border-b p-2 hidden md:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades &&
                filteredTrades.map((trade) => (
                  <tr key={trade._id} className={trade.wnl === "Broke Even" ? "bg-gray-100" : ""}>
                    <td className="border-b p-2">
                      <Link
                        to={`/trade/${trade._id}`}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium text-white 
      ${
        trade.wnl === "Broke Even" ? "bg-gray-500" : trade.wnl === "Won" ? "bg-green-600" : trade.wnl === "Lost" ? "bg-red-500" : "bg-blue-500"
      } hover:opacity-80 transition`}
                      >
                        {trade.ticker}
                      </Link>
                    </td>
                    <td className="border-b p-2 align-middle">
                      <span
                        className={`px-2 mr-2 py-0.5 rounded-full text-xs font-medium text-white ${
                          trade.type === "Long" ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {trade.type}
                      </span>
                      <span>
                        {trade.quantity} @ {formatCurrency(trade.entryPrice, trade.currency)}
                      </span>
                    </td>
                    <td className="border-b p-2 text-right">
                      {(() => {
                        const { change, percentChange, currency } = getChangeData(trade);

                        if (change === null) return <span className="text-gray-400 italic">N/A</span>;

                        return (
                          <Tooltip position="left" tooltipText={`${percentChange.toFixed(2)}%`}>
                            <span className={change >= 0 ? "text-green-600" : "text-red-600"}>£{change.toFixed(2)}</span>
                          </Tooltip>
                        );
                      })()}
                    </td>
                    <td className="border-b p-0.5 align-middle">
                      <DateCard date={trade.date} />
                    </td>

                    {/* <td className="border-b p-2 hidden md:table-cell">{formatCurrency(trade.stopLoss, trade.currency)}</td> */}

                    <td className="border-b p-2 hidden md:table-cell">
                      {trade.status === "Closed" ? (
                        trade.netProfit < 0 ? (
                          <span className="text-red-600">£{Math.abs(trade.netProfit).toFixed(2)}</span>
                        ) : (
                          "-"
                        )
                      ) : (
                        formatCurrency(trade.stopLoss, trade.currency)
                      )}
                    </td>
                    <td className={`border-b p-2 hidden md:table-cell ${trade.wnl === "Broke Even" ? "bg-gray-100" : ""}`}>
                      {trade.status === "Closed" ? (
                        trade.netProfit >= 0 ? (
                          <span className="text-green-600">£{trade.netProfit.toFixed(2)}</span>
                        ) : (
                          "-"
                        )
                      ) : trade.wnl === "Broke Even" ? (
                        trade.takeProfit
                      ) : (
                        <Tooltip tooltipText={`Take Profit: ${trade.takeProfit}`}>
                          <span className="text-xs bg-amber-500 text-yellow-50 rounded px-1">BE</span> {(trade.entryPrice * 1.04).toFixed(2)}
                        </Tooltip>
                      )}
                    </td>
                    <td className="border-b p-2 hidden md:table-cell">
                      <button
                        onClick={() => setStatusFilter((prev) => (prev === trade.status ? null : trade.status))}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${
                          trade.status === "Open" ? "bg-blue-500" : trade.status === "Closed" ? "bg-gray-500" : "bg-yellow-500"
                        }`}
                      >
                        {trade.status}
                      </button>
                    </td>
                    <td className="border-b p-2 hidden md:table-cell">
                      <button
                        onClick={() => openJournalModal(trade._id)}
                        className="bg-cyan-700 px-2 py-0.5 rounded-full text-xs font-medium text-white hover:bg-cyan-400 transition-colors duration-300"
                      >
                        Add Note
                      </button>
                      {selectedTradeId && (
                        <Modal isOpen={!!selectedTradeId} onClose={closeJournalModal} title="Add Journal Entry">
                          <AddJournalEntryForm tradeId={selectedTradeId} onClose={closeJournalModal} />
                        </Modal>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Disable Trade Button for Viewers */}
        <Tooltip tooltipText="Only traders and admins can add trades">
          <button
            onClick={() => hasPermission(user, ["admin", "trader"]) && setIsTradeModalOpen(true)}
            disabled={!hasPermission(user, ["admin", "trader"])}
            className={`px-4 py-2 rounded-lg mt-8 transition-colors duration-300 
    ${hasPermission(user, ["admin", "trader"]) ? "bg-cyan-700 text-white hover:bg-cyan-400" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
          >
            Add Trade
          </button>
        </Tooltip>

        <Modal isOpen={isTradeModalOpen} onClose={() => setIsTradeModalOpen(false)} title="Add New Trade">
          <TradeForm onAddTrade={handleAddTrade} onClose={() => setIsTradeModalOpen(false)} />
        </Modal>
      </div>
    </div>
  );
};

export default Dashboard;