import { BaseHttpClient, Invoice, InvoiceSchema } from '@/lib/api';

// Invoice Service following Single Responsibility Principle
export class InvoiceService extends BaseHttpClient {
  private static instance: InvoiceService;
  
  static getInstance(): InvoiceService {
    if (!InvoiceService.instance) {
      InvoiceService.instance = new InvoiceService();
    }
    return InvoiceService.instance;
  }
  
  async getUserInvoices(token: string): Promise<Invoice[]> {
    const response = await this.authenticatedRequest<Invoice[]>('/users/me/invoices/', token);
    return response.map(invoice => InvoiceSchema.parse(invoice));
  }
}