import { Request, Response } from 'express';
import { SyncService } from '../services/sync/SyncService';
import { BankSyncService } from '../services/sync/BankSyncService';
import { ExcelSyncService } from '../services/sync/ExcelSyncService';
import { z } from 'zod';

const testConnectionSchema = z.object({
  connectionType: z.string(),
  credentials: z.record(z.any())
});

const excelSyncSchema = z.object({
  filePath: z.string(),
  accountId: z.string().uuid()
});

export const syncController = {
  async testConnection(req: Request, res: Response) {
    try {
      const { connectionType, credentials } = testConnectionSchema.parse(req.body);
      
      const result = await SyncService.testConnection(connectionType, credentials);
      
      res.json({
        message: result.success ? 'Connection test successful' : 'Connection test failed',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Error testing connection'
      });
    }
  },

  async syncConnection(req: Request, res: Response) {
    try {
      const { connectionId } = req.params;
      const userId = (req as any).user.userId;
      
      await SyncService.syncBankConnection(connectionId, userId);
      
      res.json({
        message: 'Synchronization started successfully'
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Error starting synchronization'
      });
    }
  },

  async getConnectionStatus(req: Request, res: Response) {
    try {
      const { connectionId } = req.params;
      
      const status = await BankSyncService.getConnectionStatus(connectionId);
      
      res.json({
        message: 'Connection status retrieved',
        data: status
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Error getting connection status'
      });
    }
  },

  async getSyncLogs(req: Request, res: Response) {
    try {
      const { connectionId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const logs = await SyncService.getSyncLogs(connectionId, page, limit);
      
      res.json({
        message: 'Sync logs retrieved',
        data: logs
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Error getting sync logs'
      });
    }
  },

  async setupExcelSync(req: Request, res: Response) {
    try {
      const { filePath, accountId } = excelSyncSchema.parse(req.body);
      const userId = (req as any).user.userId;
      const bureauId = req.params.bureauId;
      
      await ExcelSyncService.setupFileWatcher(filePath, bureauId, accountId, userId);
      
      res.json({
        message: 'Excel file synchronization setup successfully'
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Error setting up Excel sync'
      });
    }
  },

  async generateExcelTemplate(req: Request, res: Response) {
    try {
      const buffer = await ExcelSyncService.generateExcelTemplate();
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=template-caisse.xlsx');
      
      res.send(buffer);
    } catch (error) {
      res.status(500).json({
        error: 'Error generating Excel template'
      });
    }
  }
};