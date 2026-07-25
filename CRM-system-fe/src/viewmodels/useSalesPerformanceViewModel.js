"use client";

import { useEffect, useState } from "react";
import { SalesAnalyticsApi } from "../data/datasources/salesAnalytics.api";
import { SalesAnalyticsRepositoryImpl } from "../data/repositories/salesAnalytics.repository.impl";
import { GetSalesPerformanceUseCase } from "../domain/usecases/getSalesPerformance.usecase";

const useCase = new GetSalesPerformanceUseCase(
  new SalesAnalyticsRepositoryImpl(new SalesAnalyticsApi()),
);

export function useSalesPerformanceViewModel(enabled) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return undefined;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        setData(await useCase.execute());
      } catch (err) {
        setError(err.message || "Không tải được hiệu suất sale.");
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [enabled]);

  return { data, loading, error };
}
