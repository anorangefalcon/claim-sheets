import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useUpdateExpense } from "../../hooks/useExpenses";
import Modal from "../ui/Modal";

const EditExpenseModal = ({ isOpen, onClose, expense }) => {
  const updateExpenseMutation = useUpdateExpense();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  // Populate form when expense data changes
  useEffect(() => {
    if (expense) {
      setValue("billNo", expense.billNo);
      setValue("date", new Date(expense.date).toISOString().split("T")[0]);
      setValue("issuedBy", expense.issuedBy);
      setValue("details", expense.details);
      setValue("amount", expense.amount);
    }
  }, [expense, setValue]);

  const onSubmit = async (data) => {
    if (!expense) return;

    try {
      await updateExpenseMutation.mutateAsync({
        id: expense._id,
        data: {
          ...data,
          amount: parseFloat(data.amount),
        },
      });
      reset();
      onClose();
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Get today's date in YYYY-MM-DD format for the date input
  const today = new Date().toISOString().split("T")[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Expense"
      size="large"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="billNo"
              className="block text-sm font-medium text-gray-700"
            >
              Bill Number *
            </label>
            <input
              {...register("billNo", { required: "Bill number is required" })}
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter bill number"
            />
            {errors.billNo && (
              <p className="mt-1 text-sm text-red-600">
                {errors.billNo.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700"
            >
              Date *
            </label>
            <input
              {...register("date", { required: "Date is required" })}
              type="date"
              max={today}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="issuedBy"
              className="block text-sm font-medium text-gray-700"
            >
              Issued By *
            </label>
            <input
              {...register("issuedBy", { required: "Issued by is required" })}
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter issuer name"
            />
            {errors.issuedBy && (
              <p className="mt-1 text-sm text-red-600">
                {errors.issuedBy.message}
              </p>
            )}
          </div>{" "}
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700"
            >
              Amount (₹) *
            </label>
            <input
              {...register("amount", {
                required: "Amount is required",
                min: { value: 0.01, message: "Amount must be greater than 0" },
                pattern: {
                  value: /^\d+(\.\d{1,2})?$/,
                  message: "Please enter a valid amount",
                },
              })}
              type="number"
              step="0.01"
              min="0.01"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">
                {errors.amount.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="details"
            className="block text-sm font-medium text-gray-700"
          >
            Expense Details *
          </label>
          <textarea
            {...register("details", {
              required: "Expense details are required",
            })}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter expense details"
          />
          {errors.details && (
            <p className="mt-1 text-sm text-red-600">
              {errors.details.message}
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateExpenseMutation.isPending}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateExpenseMutation.isPending ? "Updating..." : "Update Expense"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditExpenseModal;
