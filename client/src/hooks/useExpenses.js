import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expensesAPI } from "../services/api";
import { CLAIM_SHEET_QUERY_KEY } from "./useClaimSheets";
import toast from "react-hot-toast";

// Query Keys
export const EXPENSES_QUERY_KEY = "expenses";
export const EXPENSE_QUERY_KEY = "expense";

// Get expenses by claim sheet
export const useExpenses = (claimSheetId) => {
  return useQuery({
    queryKey: [EXPENSES_QUERY_KEY, claimSheetId],
    queryFn: async () => {
      const response = await expensesAPI.getByClaimSheet(claimSheetId);
      return response.data;
    },
    enabled: !!claimSheetId,
  });
};

// Get single expense
export const useExpense = (id) => {
  return useQuery({
    queryKey: [EXPENSE_QUERY_KEY, id],
    queryFn: async () => {
      const response = await expensesAPI.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

// Create expense
export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: expensesAPI.create,
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: [EXPENSES_QUERY_KEY, variables.claimSheetId],
      });
      queryClient.invalidateQueries({
        queryKey: [CLAIM_SHEET_QUERY_KEY, variables.claimSheetId],
      });
      toast.success("Expense added successfully!");
      return response.data;
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to create expense";
      toast.error(message);
    },
  });
};

// Update expense
export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => expensesAPI.update(id, data),
    onSuccess: (response, variables) => {
      // Get the claim sheet ID from the response or cache
      const expense = response.data;
      queryClient.invalidateQueries({
        queryKey: [EXPENSES_QUERY_KEY, expense.claimSheetId],
      });
      queryClient.invalidateQueries({
        queryKey: [CLAIM_SHEET_QUERY_KEY, expense.claimSheetId],
      });
      queryClient.invalidateQueries({
        queryKey: [EXPENSE_QUERY_KEY, variables.id],
      });
      toast.success("Expense updated successfully!");
      return response.data;
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to update expense";
      toast.error(message);
    },
  });
};

// Delete expense
export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: expensesAPI.delete,
    onSuccess: (response, expenseId) => {
      // Invalidate all expenses queries and claim sheets
      queryClient.invalidateQueries({ queryKey: [EXPENSES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CLAIM_SHEET_QUERY_KEY] });
      toast.success("Expense deleted successfully!");
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to delete expense";
      toast.error(message);
    },
  });
};
