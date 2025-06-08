import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, FileText, Eye, Trash2, Edit3 } from "lucide-react";
import { useClaimSheets, useDeleteClaimSheet } from "../hooks/useClaimSheets";
import CreateClaimSheetModal from "./modals/CreateClaimSheetModal";
import LoadingSpinner from "./ui/LoadingSpinner";

const Dashboard = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: claimSheets, isLoading, error } = useClaimSheets();
  const deleteClaimSheetMutation = useDeleteClaimSheet();

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this claim sheet? This action cannot be undone."
      )
    ) {
      deleteClaimSheetMutation.mutate(id);
    }
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
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <FileText className="w-12 h-12 mx-auto mb-4" />
          <p>Failed to load claim sheets</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="text-primary-600 hover:text-primary-500"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Claim Sheets</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your expense claim sheets and track their status.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Claim Sheet
          </button>
        </div>
      </div>

      {/* Claim Sheets Grid */}
      <div className="mt-8">
        {claimSheets && claimSheets.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {claimSheets.map((claimSheet) => (
              <div
                key={claimSheet._id}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="w-8 h-8 text-primary-500" />
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {claimSheet.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          #{claimSheet.claimNumber}
                        </p>
                      </div>
                    </div>
                    {/* <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                        claimSheet.status
                      )}`}
                    >
                      {claimSheet.status}
                    </span> */}
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Type:</span>
                      <span className="font-medium">
                        {claimSheet.claimType}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>Total Amount:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(claimSheet.totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>Created:</span>
                      <span>{formatDate(claimSheet.createdAt)}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between">
                    <Link
                      to={`/claim-sheet/${claimSheet._id}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Link>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDelete(claimSheet._id)}
                        disabled={deleteClaimSheetMutation.isPending}
                        className="inline-flex items-center p-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No claim sheets yet
            </h3>
            <p className="text-gray-500 mb-6">
              Get started by creating your first claim sheet.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Claim Sheet
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateClaimSheetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
