import { Request, Response } from 'express';
import { AnalyticsService, ChartData } from '../services/analytics/AnalyticsService';
import { ChartDataService } from '../services/analytics/ChartDataService';
import { ReportGenerator } from '../services/analytics/ReportGenerator';
import { z } from 'zod';

const chartQuerySchema = z.object({
  year: z.string().optional().transform(str => str ? parseInt(str) : undefined),
  months: z.string().optional().transform(str => str ? parseInt(str) : 6),
  period: z.enum(['week', 'month', 'year']).optional().default('month')
});

export const analyticsController = {
  async getDashboardStats(req: Request, res: Response) {
    try {
      const { bureauId } = req.params;
      
      const stats = await AnalyticsService.getDashboardStats(bureauId);
      
      res.json({
        message: 'Dashboard statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        error: 'Error retrieving dashboard statistics'
      });
    }
  },

  async getIncomeExpenseChart(req: Request, res: Response) {
    try {
      const { bureauId } = req.params;
      const { year } = chartQuerySchema.parse(req.query);
      
      const chartData = await AnalyticsService.getIncomeExpenseChartData(bureauId, year);
      
      res.json({
        message: 'Income/Expense chart data retrieved',
        data: chartData
      });
    } catch (error) {
      res.status(500).json({
        error: 'Error retrieving income/expense chart data'
      });
    }
  },

  async getAccountDistributionChart(req: Request, res: Response) {
    try {
      const { bureauId } = req.params;
      
      const chartData = await AnalyticsService.getAccountDistributionChartData(bureauId);
      
      res.json({
        message: 'Account distribution chart data retrieved',
        data: chartData
      });
    } catch (error) {
      res.status(500).json({
        error: 'Error retrieving account distribution chart data'
      });
    }
  },

  async getCategoryChart(req: Request, res: Response) {
    try {
      const { bureauId } = req.params;
      const { months } = chartQuerySchema.parse(req.query);
      
      const chartData = await AnalyticsService.getCategoryChartData(bureauId, months);
      
      res.json({
        message: 'Category chart data retrieved',
        data: chartData
      });
    } catch (error) {
      res.status(500).json({
        error: 'Error retrieving category chart data'
      });
    }
  },

  async getCashFlowForecast(req: Request, res: Response) {
    try {
      const { bureauId } = req.params;
      const { months } = chartQuerySchema.parse(req.query);
      
      const chartData = await AnalyticsService.getCashFlowForecast(bureauId, months);
      
      res.json({
        message: 'Cash flow forecast data retrieved',
        data: chartData
      });
    } catch (error) {
      res.status(500).json({
        error: 'Error retrieving cash flow forecast data'
      });
    }
  },

  async getTransactionTrends(req: Request, res: Response) {
    try {
      const { bureauId } = req.params;
      const { period } = chartQuerySchema.parse(req.query);
      
      const chartData = await ChartDataService.getTransactionTrends(bureauId, period);
      
      res.json({
        message: 'Transaction trends data retrieved',
        data: chartData
      });
    } catch (error) {
      res.status(500).json({
        error: 'Error retrieving transaction trends data'
      });
    }
  },

  async getCategoryAnalysis(req: Request, res: Response) {
    try {
      const { bureauId } = req.params;
      
      const chartData = await ChartDataService.getCategoryAnalysis(bureauId);
      
      res.json({
        message: 'Category analysis data retrieved',
        data: chartData
      });
    } catch (error) {
      res.status(500).json({
        error: 'Error retrieving category analysis data'
      });
    }
  },

  async getMonthlyComparison(req: Request, res: Response) {
    try {
      const { bureauId } = req.params;
      const { year } = chartQuerySchema.parse(req.query);
      
      const chartData = await ChartDataService.getMonthlyComparison(bureauId, year || new Date().getFullYear());
      
      res.json({
        message: 'Monthly comparison data retrieved',
        data: chartData
      });
    } catch (error) {
      res.status(500).json({
        error: 'Error retrieving monthly comparison data'
      });
    }
  },

  async getAccountPerformance(req: Request, res: Response) {
    try {
      const { bureauId } = req.params;
      
      const chartData = await ChartDataService.getAccountPerformance(bureauId);
      
      res.json({
        message: 'Account performance data retrieved',
        data: chartData
      });
    } catch (error) {
      res.status(500).json({
        error: 'Error retrieving account performance data'
      });
    }
  },

  async generateFinancialReport(req: Request, res: Response) {
    try {
      const { bureauId } = req.params;
      const { period, includeCharts, format } = req.query;
      
      await ReportGenerator.generateFinancialReport(bureauId, res, {
        period: (period as 'month' | 'quarter' | 'year') || 'month',
        includeCharts: includeCharts === 'true',
        format: (format as 'excel' | 'pdf') || 'excel'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Error generating financial report'
      });
    }
  },

  async generateAnalyticsReport(req: Request, res: Response) {
    try {
      const { bureauId } = req.params;
      
      await ReportGenerator.generateAnalyticsReport(bureauId, res);
    } catch (error) {
      res.status(500).json({
        error: 'Error generating analytics report'
      });
    }
  }
};