
export interface Product {
  id: string;
  code: string;
  description: string;
  price: number;
  stock: number;
}

export interface InvoiceItem {
  product: Product;
  quantity: number;
  discount: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: Date;
  customerName: string;
  items: InvoiceItem[];
  totalAmount: number;
  cashAmount: number;
  balanceAmount: number;
}
