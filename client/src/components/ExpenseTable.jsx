import React, { useState, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Edit3,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Save,
  RotateCcw,
  GripVertical,
} from "lucide-react";
import LoadingSpinner from "./ui/LoadingSpinner";

const ExpenseTable = ({
  expenses,
  isLoading,
  error,
  onEdit,
  onDelete,
  isDeleting,
  onUpdateOrder,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [draggedExpenses, setDraggedExpenses] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize dragged expenses when expenses change
  React.useEffect(() => {
    if (expenses && expenses.length > 0) {
      setDraggedExpenses([...expenses]);
      setHasUnsavedChanges(false);
    }
  }, [expenses]);

  // Sorting logic
  const sortedExpenses = useMemo(() => {
    if (!draggedExpenses) return [];

    // If in custom drag mode, return dragged order
    if (sortConfig.key === "custom") {
      return draggedExpenses;
    }

    // If no sort config, return original order
    if (!sortConfig.key) {
      return draggedExpenses;
    }

    const sorted = [...draggedExpenses].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === "date") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortConfig.key === "amount") {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [draggedExpenses, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") {
        direction = "desc";
      } else if (sortConfig.direction === "desc") {
        direction = "asc";
        key = null; // Reset to original order
      }
    }
    setSortConfig({ key, direction });
  };

  const handleCustomSort = () => {
    setSortConfig({ key: "custom", direction: "asc" });
  };

  const handleDragEnd = (result) => {
    if (!result.destination || sortConfig.key !== "custom") {
      return;
    }

    const items = Array.from(draggedExpenses);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setDraggedExpenses(items);
    setHasUnsavedChanges(true);
  };

  const handleSaveOrder = async () => {
    if (!hasUnsavedChanges || !onUpdateOrder) return;

    // Create new serial numbers based on current order
    const updatedExpenses = draggedExpenses.map((expense, index) => ({
      ...expense,
      serialNo: index + 1,
    }));

    try {
      await onUpdateOrder(updatedExpenses);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Failed to save order:", error);
    }
  };

  const handleResetOrder = () => {
    if (expenses) {
      setDraggedExpenses([...expenses]);
      setSortConfig({ key: null, direction: "asc" });
      setHasUnsavedChanges(false);
    }
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 ml-1 text-gray-400" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-4 h-4 ml-1 text-blue-600" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1 text-blue-600" />
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
  };
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load expenses</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-primary-600 hover:text-primary-500"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No expenses added yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Click "Add Expense" to get started
        </p>
      </div>
    );
  }
  return (
    <div>
      {/* Sorting Controls */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        {/* Mobile Layout - Stack vertically */}
        <div className="flex flex-col space-y-3 sm:hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            {sortConfig.key && (
              <button
                onClick={handleResetOrder}
                className="inline-flex items-center px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSort("date")}
              className={`inline-flex items-center px-3 py-2 rounded-md text-sm ${
                sortConfig.key === "date"
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Date
              {getSortIcon("date")}
            </button>
            <button
              onClick={() => handleSort("amount")}
              className={`inline-flex items-center px-3 py-2 rounded-md text-sm ${
                sortConfig.key === "amount"
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Amount
              {getSortIcon("amount")}
            </button>
            <button
              onClick={handleCustomSort}
              className={`inline-flex items-center px-3 py-2 rounded-md text-sm ${
                sortConfig.key === "custom"
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <GripVertical className="w-4 h-4 mr-1" />
              Drag
            </button>
          </div>

          {hasUnsavedChanges && (
            <button
              onClick={handleSaveOrder}
              className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 w-full"
            >
              <Save className="w-4 h-4 mr-1" />
              Save Order
            </button>
          )}
        </div>

        {/* Desktop Layout - Original horizontal layout */}
        <div className="hidden sm:flex sm:flex-wrap sm:items-center sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <button
              onClick={() => handleSort("date")}
              className={`inline-flex items-center px-3 py-1 rounded-md text-sm ${
                sortConfig.key === "date"
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Date
              {getSortIcon("date")}
            </button>
            <button
              onClick={() => handleSort("amount")}
              className={`inline-flex items-center px-3 py-1 rounded-md text-sm ${
                sortConfig.key === "amount"
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Amount
              {getSortIcon("amount")}
            </button>
            <button
              onClick={handleCustomSort}
              className={`inline-flex items-center px-3 py-1 rounded-md text-sm ${
                sortConfig.key === "custom"
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <GripVertical className="w-4 h-4 mr-1" />
              Customise
            </button>
          </div>

          {sortConfig.key && (
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleResetOrder}
                className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </button>
              {hasUnsavedChanges && (
                <button
                  onClick={handleSaveOrder}
                  className="inline-flex items-center px-4 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save Order
                </button>
              )}
            </div>
          )}
        </div>
      </div>{" "}
      {/* Table */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <DragDropContext onDragEnd={handleDragEnd}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {sortConfig.key === "custom" && (
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Drag
                    </th>
                  )}
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serial No.
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bill No.
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issued By
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <Droppable
                droppableId="expenses"
                isDropDisabled={sortConfig.key !== "custom"}
              >
                {(provided) => (
                  <tbody
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="bg-white divide-y divide-gray-200"
                  >
                    {sortedExpenses.map((expense, index) => (
                      <Draggable
                        key={expense._id}
                        draggableId={expense._id}
                        index={index}
                        isDragDisabled={sortConfig.key !== "custom"}
                      >
                        {(provided, snapshot) => (
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`hover:bg-gray-50 ${
                              snapshot.isDragging ? "bg-blue-50 shadow-lg" : ""
                            }`}
                          >
                            {sortConfig.key === "custom" && (
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
                                >
                                  <GripVertical className="w-4 h-4 text-gray-400" />
                                </div>
                              </td>
                            )}
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {sortConfig.key === "custom"
                                ? index + 1
                                : expense.serialNo}
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {expense.billNo}
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(expense.date)}
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {expense.issuedBy}
                            </td>
                            <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                              <span title={expense.details}>
                                {expense.details}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              {formatCurrency(expense.amount)}
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex space-x-1 sm:space-x-2">
                                <button
                                  onClick={() => onEdit(expense)}
                                  className="text-primary-600 hover:text-primary-900 p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  title="Edit expense"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => onDelete(expense._id)}
                                  disabled={isDeleting}
                                  className="text-red-600 hover:text-red-900 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                                  title="Delete expense"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </tbody>
                )}
              </Droppable>
              <tfoot className="bg-gray-50">
                <tr>
                  <td
                    colSpan={sortConfig.key === "custom" ? "6" : "5"}
                    className="px-3 sm:px-6 py-4 text-sm font-medium text-gray-900 text-right"
                  >
                    Total:
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm font-bold text-green-600">
                    {formatCurrency(
                      sortedExpenses.reduce(
                        (total, expense) => total + expense.amount,
                        0
                      )
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-4"></td>
                </tr>
              </tfoot>
            </table>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTable;
