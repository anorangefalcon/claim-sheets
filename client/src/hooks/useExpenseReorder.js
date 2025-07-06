import { useMutation, useQueryClient } from "@tanstack/react-query";
import { expensesAPI } from "../services/api";
import toast from "react-hot-toast";

export const useExpenseReorder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ claimSheetId, expenses }) => {
      const { data } = await expensesAPI.reorder(claimSheetId, expenses);
      return data;
    },
    onSuccess: (data, variables) => {
      // Update the expenses cache
      queryClient.setQueryData(["expenses", variables.claimSheetId], data);

      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["expenses", variables.claimSheetId],
      });

      // Update claim sheet cache to reflect new total if needed
      queryClient.invalidateQueries({
        queryKey: ["claimSheet", variables.claimSheetId],
      });

      toast.success("Expense order updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating expense order:", error);
      toast.error(
        error.response?.data?.message || "Failed to update expense order"
      );
    },
  });
};
