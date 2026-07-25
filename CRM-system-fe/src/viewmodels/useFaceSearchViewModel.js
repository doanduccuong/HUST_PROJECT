"use client";

import { useEffect, useState } from "react";
import { CustomerApi } from "../data/datasources/customer.api";
import { CustomerRepositoryImpl } from "../data/repositories/customer.repository.impl";
import { ConfirmCustomerIdentityUseCase } from "../domain/usecases/confirmCustomerIdentity.usecase";
import { GetCustomer360UseCase } from "../domain/usecases/getCustomer360.usecase";
import { IdentifyCustomerUseCase } from "../domain/usecases/identifyCustomer.usecase";

const api = new CustomerApi();
const repository = new CustomerRepositoryImpl(api);
const identifyCustomer = new IdentifyCustomerUseCase(repository);
const confirmIdentity = new ConfirmCustomerIdentityUseCase(repository);
const getCustomer360 = new GetCustomer360UseCase(repository);

export function useFaceSearchViewModel() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const selectFile = (nextFile) => {
    setFile(nextFile || null);
    setPreviewUrl(nextFile ? URL.createObjectURL(nextFile) : null);
    setSearchResult(null);
    setProfile(null);
    setError(null);
  };

  const loadProfile = async (customerId) => {
    setProfileLoading(true);
    setError(null);
    try {
      setProfile(await getCustomer360.execute(customerId));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Không tải được hồ sơ 360.");
    } finally {
      setProfileLoading(false);
    }
  };

  const identify = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setProfile(null);
    try {
      const result = await identifyCustomer.execute(file);
      setSearchResult(result);
      if (result.status === "MATCH" && result.candidates[0]) {
        await loadProfile(result.candidates[0].customerId);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Không thể nhận diện ảnh.");
    } finally {
      setLoading(false);
    }
  };

  const confirmCandidate = async (customerId) => {
    if (!searchResult) return;
    setLoading(true);
    setError(null);
    try {
      await confirmIdentity.execute(searchResult.searchId, customerId);
      setSearchResult((current) => ({ ...current, status: "MATCH" }));
      await loadProfile(customerId);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Không thể xác nhận khách hàng.");
    } finally {
      setLoading(false);
    }
  };

  return {
    file,
    previewUrl,
    searchResult,
    profile,
    loading,
    profileLoading,
    error,
    selectFile,
    identify,
    confirmCandidate,
    loadProfile,
  };
}
