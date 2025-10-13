// backend/src/services/donorService.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Donor } from '../models/Donor';
import { Bureau } from '../models/Bureau';

export class DonorService {
  private donorRepository: Repository<Donor>;

  constructor() {
    this.donorRepository = AppDataSource.getRepository(Donor);
  }

  async createDonor(donorData: Partial<Donor>, bureauId: number): Promise<Donor> {
    const bureau = await AppDataSource.getRepository(Bureau).findOneBy({ id: bureauId });
    if (!bureau) {
      throw new Error('Bureau non trouvé');
    }

    const donor = this.donorRepository.create({
      ...donorData,
      bureau
    });

    return await this.donorRepository.save(donor);
  }

  async importDonorsFromExcel(data: any[], bureauId: number): Promise<Donor[]> {
    const bureau = await AppDataSource.getRepository(Bureau).findOneBy({ id: bureauId });
    if (!bureau) {
      throw new Error('Bureau non trouvé');
    }

    const donors = data.map(item => 
      this.donorRepository.create({
        nom: item.nom,
        prenom: item.prenom,
        email: item.email,
        telephone: item.telephone,
        typeDon: item.typeDon || 'libre',
        moyenPaiement: item.moyenPaiement,
        montant: parseFloat(item.montant) || 0,
        dateSoutienPrevu: parseInt(item.dateSoutienPrevu) || 15,
        bureau
      })
    );

    return await this.donorRepository.save(donors);
  }

  async getDonorsByBureau(bureauId: number, filters?: any): Promise<Donor[]> {
    const query = this.donorRepository
      .createQueryBuilder('donor')
      .where('donor.bureauId = :bureauId', { bureauId });

    if (filters?.typeDon) {
      query.andWhere('donor.typeDon = :typeDon', { typeDon: filters.typeDon });
    }

    if (filters?.search) {
      query.andWhere('(donor.nom LIKE :search OR donor.prenom LIKE :search OR donor.email LIKE :search)', {
        search: `%${filters.search}%`
      });
    }

    return await query.getMany();
  }

  async updateDonor(id: number, updateData: Partial<Donor>): Promise<Donor> {
    await this.donorRepository.update(id, updateData);
    const updated = await this.donorRepository.findOneBy({ id });
    if (!updated) {
      throw new Error('Donateur non trouvé');
    }
    return updated;
  }

  async deleteDonor(id: number): Promise<void> {
    await this.donorRepository.delete(id);
  }
}