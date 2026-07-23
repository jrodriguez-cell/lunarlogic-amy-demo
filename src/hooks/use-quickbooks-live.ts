"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  ApplicationApiError,
  disconnectQuickBooksConnection,
  fetchQuickBooksConnectionStatus,
  fetchQuickBooksLiveOverview,
  refreshQuickBooksCompanyInfo,
  refreshQuickBooksLiveOverview,
} from "@/lib/quickbooks-live-api";

export const quickBooksLiveKeys = {
  all: ["quickbooks", "live"] as const,
  connection: (legalEntityId: string) =>
    [...quickBooksLiveKeys.all, "connection", legalEntityId] as const,
  overview: (legalEntityId: string) =>
    [...quickBooksLiveKeys.all, "overview", legalEntityId] as const,
};

const DEMO_LEGAL_ENTITY_ID = "entity_vanguard_digital_llc";

function shouldRetry(failureCount: number, error: Error): boolean {
  if (
    error instanceof ApplicationApiError &&
    error.status >= 400 &&
    error.status < 500
  ) {
    return false;
  }

  return failureCount < 1;
}

export function useQuickBooksLiveOverview() {
  return useQuery({
    queryKey: quickBooksLiveKeys.overview(DEMO_LEGAL_ENTITY_ID),
    queryFn: fetchQuickBooksLiveOverview,
    staleTime: 2 * 60_000,
    retry: shouldRetry,
  });
}

export function useQuickBooksConnectionStatus() {
  return useQuery({
    queryKey: quickBooksLiveKeys.connection(DEMO_LEGAL_ENTITY_ID),
    queryFn: fetchQuickBooksConnectionStatus,
    staleTime: 30_000,
    retry: shouldRetry,
  });
}

export function useRefreshQuickBooksLiveOverview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshQuickBooksLiveOverview,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: quickBooksLiveKeys.all,
      });
    },
  });
}

export function useRefreshQuickBooksCompanyInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshQuickBooksCompanyInfo,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: quickBooksLiveKeys.all,
      });
    },
  });
}

export function useDisconnectQuickBooksConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disconnectQuickBooksConnection,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: quickBooksLiveKeys.all,
      });
    },
  });
}
