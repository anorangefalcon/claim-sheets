import React from "react";
import { useForm } from "react-hook-form";
import { useCreateClaimSheet } from "../../hooks/useClaimSheets";
import Modal from "../ui/Modal";

const CreateClaimSheetModal = ({ isOpen, onClose }) => {
  const createClaimSheetMutation = useCreateClaimSheet();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await createClaimSheetMutation.mutateAsync(data);
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Claim Sheet">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name *
          </label>
          <input
            {...register("name", { required: "Name is required" })}
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter claimee's name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="claimNumber"
            className="block text-sm font-medium text-gray-700"
          >
            Claim Number *
          </label>
          <input
            {...register("claimNumber", {
              required: "Claim number is required",
            })}
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter claim number"
          />
          {errors.claimNumber && (
            <p className="mt-1 text-sm text-red-600">
              {errors.claimNumber.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="claimType"
            className="block text-sm font-medium text-gray-700"
          >
            Claim Type *
          </label>
          <input
            {...register("claimType", { required: "Claim type is required" })}
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter claim type (e.g., Medical, Travel, etc.)"
          />
          {errors.claimType && (
            <p className="mt-1 text-sm text-red-600">
              {errors.claimType.message}
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
            disabled={createClaimSheetMutation.isPending}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createClaimSheetMutation.isPending
              ? "Creating..."
              : "Create Claim Sheet"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateClaimSheetModal;
