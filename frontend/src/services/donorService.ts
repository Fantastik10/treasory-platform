// frontend/src/services/donorService.ts
import { api } from './api';

export interface Donor {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  typeDon: 'jeunes' | 'structure' | 'libre' | 'mission';
  moyenPaiement: string;
  dateSoutienPrevu: number;
  montant: number;
  dateSoutienRecu: string;
  virementEffectue: boolean;
  relancesActives: boolean;
}

export interface DonorFilters {
  search?: string;
  typeDon?: string;
  statut?: string;
}

class DonorService {
  async getDonors(bureauId: number, filters?: DonorFilters): Promise<Donor[]> {
    const response = await api.get(`/bureau/${bureauId}/donors`, { params: filters });
    return response.data;
  }

  async createDonor(bureauId: number, donorData: Partial<Donor>): Promise<Donor> {
    const response = await api.post(`/bureau/${bureauId}/donors`, donorData);
    return response.data;
  }

  async importDonors(bureauId: number, donorsData: any[]): Promise<Donor[]> {
    const response = await api.post(`/bureau/${bureauId}/donors/import`, donorsData);
    return response.data;
  }

  async updateDonor(id: number, updateData: Partial<Donor>): Promise<Donor> {
    const response = await api.put(`/donors/${id}`, updateData);
    return response.data;
  }

  async deleteDonor(id: number): Promise<void> {
    await api.delete(`/donors/${id}`);
  }
}

export default new DonorService();