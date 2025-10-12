import { Request, Response } from 'express';
import { BankConfigService } from '../services/config/bankConfigService';
import { z } from 'zod';

const createConnectionSchema = z.object({
  bankName: z.string().min(1),
  connectionType: z.string(),
  country: z.string().min(1),
  credentials: z.record(z.any()),
  syncConfig: z.object({
    frequency: z.string().optional(),
    autoSync: z.boolean().optional(),
    syncTransactions: z.boolean().optional(),
    syncBalance: z.boolean().optional()
  }).optional()
});

const updateConnectionSchema = z.object({
  bankName: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  credentials: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
  syncConfig: z.object({
    frequency: z.string().optional(),
    autoSync: z.boolean().optional(),
    syncTransactions: z.boolean().optional(),
    syncBalance: z.boolean().optional()
  }).optional()
});

export const bankConfigController = {
  async createConnection(req: Request, res: Response) {
    try {
      const data = createConnectionSchema.parse(req.body);
      const bureauId = req.params.bureauId;
      
      const connection = await BankConfigService.createBankConnection({
        ...data,
        bureauId
      });
      
      res.status(201).json({
        message: 'Bank connection created successfully',
        data: connection
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Error creating bank connection'
      });
    }
  },

  async getConnection(req: Request, res: Response) {
    try {
      const { connectionId } = req.params;
      
      const connection = await BankConfigService.getBankConnection(connectionId);
      
      res.json({
        message: 'Bank connection retrieved',
        data: connection
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Error getting bank connection'
      });
    }
  },

  async getBureauConnections(req: Request, res: Response) {
    try {
      const { bureauId } = req.params;
      
      const connections = await BankConfigService.getBureauConnections(bureauId);
      
      res.json({
        message: 'Bank connections retrieved',
        data: connections
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Error getting bank connections'
      });
    }
  },

  async updateConnection(req: Request, res: Response) {
    try {
      const { connectionId } = req.params;
      const data = updateConnectionSchema.parse(req.body);
      
      const connection = await BankConfigService.updateBankConnection(connectionId, data);
      
      res.json({
        message: 'Bank connection updated successfully',
        data: connection
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Error updating bank connection'
      });
    }
  },

  async deleteConnection(req: Request, res: Response) {
    try {
      const { connectionId } = req.params;
      
      await BankConfigService.deleteBankConnection(connectionId);
      
      res.json({
        message: 'Bank connection deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Error deleting bank connection'
      });
    }
  },

  async getSupportedBanks(req: Request, res: Response) {
    try {
      const { countryCode } = req.params;
      
      const banks = await BankConfigService.getSupportedBanksByCountry(countryCode);
      
      res.json({
        message: 'Supported banks retrieved',
        data: banks
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Error getting supported banks'
      });
    }
  }
};