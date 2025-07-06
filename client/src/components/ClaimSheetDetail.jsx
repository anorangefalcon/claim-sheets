import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, FileText, Printer, Sparkles } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useClaimSheet } from "../hooks/useClaimSheets";
import { useExpenses, useDeleteExpense } from "../hooks/useExpenses";
import { useExpenseReorder } from "../hooks/useExpenseReorder";
import { useBillUpload } from "../hooks/useBillUpload";
import LoadingSpinner from "./ui/LoadingSpinner";
import StarryLoader from "./ui/StarryLoader";
import ExpenseTable from "./ExpenseTable";
import AddExpenseModal from "./modals/AddExpenseModal";
import EditExpenseModal from "./modals/EditExpenseModal";
import BillUploadModal from "./modals/BillUploadModal";
import PrintableClaimSheet from "./PrintableClaimSheet";

const ClaimSheetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isBillUploadModalOpen, setIsBillUploadModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const printableRef = useRef();

  const {
    data: claimSheet,
    isLoading: isLoadingClaimSheet,
    error: claimSheetError,
  } = useClaimSheet(id);
  const {
    data: expenses,
    isLoading: isLoadingExpenses,
    error: expensesError,
  } = useExpenses(id);
  const deleteExpenseMutation = useDeleteExpense();
  const reorderExpensesMutation = useExpenseReorder();
  const billUploadMutation = useBillUpload();

  const handleDeleteExpense = async (expenseId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this expense? This action cannot be undone."
      )
    ) {
      deleteExpenseMutation.mutate(expenseId);
    }
  };
  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
  };

  const handleUpdateExpenseOrder = async (updatedExpenses) => {
    await reorderExpensesMutation.mutateAsync({
      claimSheetId: id,
      expenses: updatedExpenses,
    });
  };

  const handlePrint = () => {
    const printContent = printableRef.current;
    if (!printContent) return;

    const originalContents = document.body.innerHTML;
    const printContents = printContent.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const handleDownloadPDF = async () => {
    if (!printableRef.current) return;

    setIsGeneratingPDF(true);
    try {
      const element = printableRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `claim-sheet-${claimSheet.claimNumber}-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
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

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Draft":
        return "bg-gray-100 text-gray-800";
      case "Submitted":
        return "bg-blue-100 text-blue-800";
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoadingClaimSheet) {
    return <LoadingSpinner />;
  }

  if (claimSheetError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <FileText className="w-12 h-12 mx-auto mb-4" />
          <p>Failed to load claim sheet</p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-primary-600 hover:text-primary-500"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!claimSheet) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Claim sheet not found
        </h3>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-primary-600 hover:text-primary-500"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </button>{" "}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-primary-500 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {claimSheet.name}
                  </h1>
                  <p className="text-sm text-gray-500">
                    Claim #{claimSheet.claimNumber}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </button>
              {/* <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4 mr-2" />
                {isGeneratingPDF ? "Generating..." : "Download PDF"}
              </button> */}
              {/* <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor(
                  claimSheet.status
                )}`}
              >
                {claimSheet.status}
              </span> */}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Claim Type</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {claimSheet.claimType}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Total Amount
              </dt>
              <dd className="mt-1 text-lg font-semibold text-green-600">
                {formatCurrency(claimSheet.totalAmount)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Created Date
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDate(claimSheet.createdAt)}
              </dd>
            </div>
          </div>
        </div>
      </div>
      {/* Expenses Section */}
      <div className="bg-white shadow rounded-lg">
        {" "}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Expense Items</h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsBillUploadModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
                Upload Bills
              </button>
              <button
                onClick={() => setIsAddExpenseModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </button>
            </div>
          </div>
        </div>{" "}
        <div className="p-6 relative">
          {/* AI Processing Overlay */}
          {billUploadMutation.isPending && (
            <div className="absolute inset-0 z-10 rounded-lg">
              <StarryLoader message="Processing your bills with AI..." />
            </div>
          )}{" "}
          <ExpenseTable
            expenses={expenses}
            isLoading={isLoadingExpenses}
            error={expensesError}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
            isDeleting={deleteExpenseMutation.isPending}
            onUpdateOrder={handleUpdateExpenseOrder}
          />
        </div>
      </div>{" "}
      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        claimSheetId={id}
      />{" "}
      <EditExpenseModal
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        expense={editingExpense}
      />
      <BillUploadModal
        isOpen={isBillUploadModalOpen}
        onClose={() => setIsBillUploadModalOpen(false)}
        claimSheetId={id}
      />
      {/* Hidden Printable Component */}
      <div className="hidden">
        <PrintableClaimSheet
          ref={printableRef}
          claimSheet={claimSheet}
          expenses={expenses}
        />
      </div>
    </div>
  );
};

export default ClaimSheetDetail;
