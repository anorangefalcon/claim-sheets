import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { claimSheetsAPI } from "../services/api";
import toast from "react-hot-toast";

// Query Keys
export const CLAIM_SHEETS_QUERY_KEY = "claimSheets";
export const CLAIM_SHEET_QUERY_KEY = "claimSheet";

// Get all claim sheets
export const useClaimSheets = () => {
  return useQuery({
    queryKey: [CLAIM_SHEETS_QUERY_KEY],
    queryFn: async () => {
      const response = await claimSheetsAPI.getAll();
      return response.data;
    },
  });
};

// Get single claim sheet
export const useClaimSheet = (id) => {
  return useQuery({
    queryKey: [CLAIM_SHEET_QUERY_KEY, id],
    queryFn: async () => {
      const response = await claimSheetsAPI.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

// Create claim sheet
export const useCreateClaimSheet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: claimSheetsAPI.create,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [CLAIM_SHEETS_QUERY_KEY] });
      toast.success("Claim sheet created successfully!");
      return response.data;
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to create claim sheet";
      toast.error(message);
    },
  });
};

// Update claim sheet
export const useUpdateClaimSheet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => claimSheetsAPI.update(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: [CLAIM_SHEETS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [CLAIM_SHEET_QUERY_KEY, variables.id],
      });
      toast.success("Claim sheet updated successfully!");
      return response.data;
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to update claim sheet";
      toast.error(message);
    },
  });
};

// Delete claim sheet
export const useDeleteClaimSheet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: claimSheetsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLAIM_SHEETS_QUERY_KEY] });
      toast.success("Claim sheet deleted successfully!");
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to delete claim sheet";
      toast.error(message);
    },
  });
};
