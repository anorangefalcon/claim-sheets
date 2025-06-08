import React from "react";

const PrintableClaimSheet = React.forwardRef(
  ({ claimSheet, expenses }, ref) => {
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

    const totalAmount =
      expenses?.reduce((total, expense) => total + expense.amount, 0) || 0;

    return (
      <div ref={ref} className="print-container bg-white p-6 max-w-4xl mx-auto">
        {/* Claim Sheet Information - Simplified and Smaller */}
        <div className="mb-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-sm">
              <span className="font-medium text-gray-700">Name: </span>
              <span className="text-gray-900 border-b border-dotted border-gray-400 pb-1">
                {claimSheet?.name}
              </span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-700">Claim #: </span>
              <span className="text-gray-900 border-b border-dotted border-gray-400 pb-1">
                {claimSheet?.claimNumber}
              </span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-700">Type: </span>
              <span className="text-gray-900 border-b border-dotted border-gray-400 pb-1">
                {claimSheet?.claimType}
              </span>
            </div>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="mb-4">
          {expenses && expenses.length > 0 ? (
            <table className="w-full border-collapse border border-gray-800">
              <thead>
                <tr className="bg-white">
                  <th className="border border-gray-800 px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">
                    S.No.
                  </th>
                  <th className="border border-gray-800 px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">
                    Bill No.
                  </th>
                  <th className="border border-gray-800 px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">
                    Date
                  </th>
                  <th className="border border-gray-800 px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">
                    Issued By
                  </th>
                  <th className="border border-gray-800 px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase">
                    Details
                  </th>
                  <th className="border border-gray-800 px-3 py-2 text-right text-xs font-semibold text-gray-900 uppercase">
                    Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense, index) => (
                  <tr key={expense._id} className="bg-white">
                    <td className="border border-gray-800 px-3 py-2 text-sm text-gray-900">
                      {expense.serialNo}
                    </td>
                    <td className="border border-gray-800 px-3 py-2 text-sm text-gray-900">
                      {expense.billNo}
                    </td>
                    <td className="border border-gray-800 px-3 py-2 text-sm text-gray-900">
                      {formatDate(expense.date)}
                    </td>
                    <td className="border border-gray-800 px-3 py-2 text-sm text-gray-900">
                      {expense.issuedBy}
                    </td>
                    <td className="border border-gray-800 px-3 py-2 text-sm text-gray-900">
                      {expense.details}
                    </td>
                    <td className="border border-gray-800 px-3 py-2 text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(expense.amount)}
                    </td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="bg-white font-semibold">
                  <td
                    colSpan="5"
                    className="border border-gray-800 px-3 py-2 text-sm text-gray-900 text-right"
                  >
                    TOTAL AMOUNT:
                  </td>
                  <td className="border border-gray-800 px-3 py-2 text-sm text-gray-900 text-right font-bold">
                    {formatCurrency(totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="border border-gray-800 p-8 text-center bg-white">
              <p className="text-gray-600">
                No expenses recorded for this claim sheet.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-2 border-t border-gray-300 text-center">
          <p className="text-xs text-gray-600">
            Generated on{" "}
            {new Date().toLocaleDateString("en-GB", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    );
  }
);

PrintableClaimSheet.displayName = "PrintableClaimSheet";

export default PrintableClaimSheet;
