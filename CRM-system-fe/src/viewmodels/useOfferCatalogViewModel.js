"use client";

import { useEffect, useState } from "react";
import { OfferApi } from "../data/datasources/offer.api";
import { OfferRepositoryImpl } from "../data/repositories/offer.repository.impl";
import { GetOffersUseCase } from "../domain/usecases/getOffers.usecase";

const getOffers = new GetOffersUseCase(new OfferRepositoryImpl(new OfferApi()));

export function useOfferCatalogViewModel(enabled) {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return undefined;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        setData(await getOffers.execute(search));
      } catch (err) {
        setError(err.message || "Không tải được offer catalog.");
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [enabled, search]);

  return { data, search, setSearch, loading, error };
}
