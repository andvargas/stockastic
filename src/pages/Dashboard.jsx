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
import { RadarIcon, CoinsIcon, BanknoteIcon, Info } from "lucide-react";
import { formatCurrency } from "../utils/formatCurrency";
import { useAuth } from "../contexts/AuthContext";
import { hasPermission } from "../utils/roleUtils";
import TopNavBar from "../components/TopNavBar";

const Dashboard = () => {
  const { user } = useAuth();
  const [trades, setTrades] = useState([]);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [selectedTradeId, setSelectedTradeId] = useState(null);
  const [showConsidering, setShowConsidering] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);
  const [accountTypeFilter, setAccountTypeFilter] = useState(null);

  console.log(trades[9]);

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

  // const filteredTrades = trades.filter((trade) => (showConsidering ? trade.status === "Considering" : trade.status !== "Considering"));

  const filteredTrades = trades.filter((trade) => {
    if (showConsidering) return trade.status === "Considering";

    if (statusFilter && trade.status !== statusFilter) return false;

    // Map assetType to 'Real Money' or 'Paper Money'
    if (accountTypeFilter) {
      const isRealMoney = trade.assetType === "CFD" || trade.assetType === "Real Money";
      const isPaperMoney = trade.assetType === "Paper Money" || trade.assetType === "Paper CFD";

      if (accountTypeFilter === "Real Money" && !isRealMoney) return false;
      if (accountTypeFilter === "Paper Money" && !isPaperMoney) return false;
    }

    return trade.status !== "Considering";
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

  return (
    <div className="min-h-[95vh] bg-gray-100">
      <TopNavBar />
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
            <span className="w-24"></span> {/* Empty placeholder */}
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
                    <Tooltip tooltipText={"Click the ticker name to see the details."} showOnLoadDuration={5000}>
                      <sup>
                        <Info className="inline cursor-pointer" size="16" />
                      </sup>
                    </Tooltip>
                  </div>
                </th>
                <th className="border-b p-2">Entry type/nr/price</th>
                <th className="border-b p-2">Date</th>
                <th className="border-b p-2 hidden md:table-cell">Stop Loss</th>
                <th className="border-b p-2 hidden md:table-cell">
                  <div>
                    Take Profit
                    <Tooltip tooltipText={"Displays BE (Break Even); changes to Take Profit when price exceeds it."}>
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
                    <td className="border-b p-2 flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${trade.type === "Long" ? "bg-green-500" : "bg-red-500"}`}
                      >
                        {trade.type}
                      </span>
                      <span>
                        {trade.quantity} @ {formatCurrency(trade.entryPrice, trade.currency)}
                      </span>
                    </td>
                    <td className="border-b p-2">{new Date(trade.date).toLocaleDateString()}</td>
                    <td className="border-b p-2 hidden md:table-cell">{formatCurrency(trade.stopLoss, trade.currency)}</td>
                    <td className={`border-b p-2 hidden md:table-cell ${trade.wnl === "Broke Even" ? "bg-gray-100" : ""}`}>
                      {trade.wnl === "Broke Even" ? (
                        trade.takeProfit
                      ) : (
                        <Tooltip tooltipText={`Take Profit: ${trade.takeProfit}`}>
                          <span className="text-xs bg-amber-500 text-yellow-50 rounded px-1">BE</span> {(trade.entryPrice * 1.05).toFixed(2)}
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