import { useMutation, useQueryClient } from "@tanstack/react-query";
import { billUploadAPI } from "../services/api";
import { EXPENSES_QUERY_KEY } from "./useExpenses";
import { CLAIM_SHEET_QUERY_KEY } from "./useClaimSheets";
import toast from "react-hot-toast";

// Upload bills and process with AI
export const useBillUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ files, claimSheetId }) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("bills", file);
      });
      formData.append("claimSheetId", claimSheetId);

      return billUploadAPI.uploadBills(formData);
    },
    onSuccess: (response, variables) => {
      const { claimSheetId } = variables;
      const { expenses, message } = response.data;

      // Invalidate and refetch expenses for this claim sheet
      queryClient.invalidateQueries({
        queryKey: [EXPENSES_QUERY_KEY, claimSheetId],
      });

      // Invalidate claim sheet data to update totals
      queryClient.invalidateQueries({
        queryKey: [CLAIM_SHEET_QUERY_KEY, claimSheetId],
      });

      toast.success(
        message ||
          `Successfully processed ${expenses?.length || 0} expense items`
      );

      return response.data;
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to process bill images";
      toast.error(message);
    },
  });
};
