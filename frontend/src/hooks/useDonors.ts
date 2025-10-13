// frontend/src/hooks/useDonors.ts
import { useState, useEffect } from 'react';
import donorService, { Donor, DonorFilters } from '../services/donorService';

export const useDonors = (bureauId: number, filters?: DonorFilters) => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDonors = async () => {
    if (!bureauId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await donorService.getDonors(bureauId, filters);
      setDonors(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement des donateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [bureauId, filters?.search, filters?.typeDon]);

  const createDonor = async (donorData: Partial<Donor>) => {
    try {
      const newDonor = await donorService.createDonor(bureauId, donorData);
      setDonors(prev => [...prev, newDonor]);
      return newDonor;
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création');
      throw err;
    }
  };

  const importDonors = async (donorsData: any[]) => {
    try {
      const newDonors = await donorService.importDonors(bureauId, donorsData);
      setDonors(prev => [...prev, ...newDonors]);
      return newDonors;
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'import');
      throw err;
    }
  };

  return {
    donors,
    loading,
    error,
    createDonor,
    importDonors,
    refetch: fetchDonors
  };
};