import React from "react";
import { Edit3, Trash2 } from "lucide-react";
import LoadingSpinner from "./ui/LoadingSpinner";

const ExpenseTable = ({
  expenses,
  isLoading,
  error,
  onEdit,
  onDelete,
  isDeleting,
}) => {
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
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Serial No.
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Bill No.
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Issued By
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>{" "}
        <tbody className="bg-white divide-y divide-gray-200">
          {expenses.map((expense, index) => (
            <tr key={expense._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {index + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {expense.billNo}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(expense.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {expense.issuedBy}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                <span title={expense.details}>{expense.details}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                {formatCurrency(expense.amount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex space-x-2">
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
          ))}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr>
            <td
              colSpan="5"
              className="px-6 py-4 text-sm font-medium text-gray-900 text-right"
            >
              Total:
            </td>
            <td className="px-6 py-4 text-sm font-bold text-green-600">
              {formatCurrency(
                expenses.reduce((total, expense) => total + expense.amount, 0)
              )}
            </td>
            <td className="px-6 py-4"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default ExpenseTable;
