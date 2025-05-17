
import { supabase } from "@/integrations/supabase/client";
import { Product, Invoice, InvoiceItem } from "@/types";

// Product APIs
export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*');
  
  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
  
  return data as Product[];
}

export async function addProduct(product: Omit<Product, 'id'>) {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select();
  
  if (error) {
    console.error('Error adding product:', error);
    throw error;
  }
  
  return data[0] as Product;
}

export async function updateProduct(id: string, product: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }
  
  return data[0] as Product;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
  
  return true;
}

// Invoice APIs
export async function fetchInvoices() {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      invoice_items (
        *,
        products:product_id (*)
      )
    `);
  
  if (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
  
  // Transform the data to match our Invoice type
  const invoices = data.map(invoice => {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoicenumber,
      date: new Date(invoice.date),
      customerName: invoice.customername,
      totalAmount: invoice.totalamount,
      cashAmount: invoice.cashamount,
      balanceAmount: invoice.balanceamount,
      items: invoice.invoice_items.map((item: any) => ({
        product: item.products,
        quantity: item.quantity,
        discount: item.discount,
        amount: item.amount
      }))
    };
  });
  
  return invoices as Invoice[];
}

export async function addInvoice(invoice: Invoice) {
  // Start a transaction
  const { data: invoiceData, error: invoiceError } = await supabase
    .from('invoices')
    .insert([{
      invoicenumber: invoice.invoiceNumber,
      date: invoice.date.toISOString(),
      customername: invoice.customerName,
      totalamount: invoice.totalAmount,
      cashamount: invoice.cashAmount,
      balanceamount: invoice.balanceAmount
    }])
    .select();
  
  if (invoiceError) {
    console.error('Error adding invoice:', invoiceError);
    throw invoiceError;
  }
  
  const invoiceId = invoiceData[0].id;
  
  // Add invoice items
  const invoiceItems = invoice.items.map(item => ({
    invoice_id: invoiceId,
    product_id: item.product.id,
    quantity: item.quantity,
    discount: item.discount,
    amount: item.amount
  }));
  
  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(invoiceItems);
  
  if (itemsError) {
    console.error('Error adding invoice items:', itemsError);
    throw itemsError;
  }
  
  // Update product stock
  for (const item of invoice.items) {
    const { error: stockError } = await supabase
      .from('products')
      .update({ stock: item.product.stock - item.quantity })
      .eq('id', item.product.id);
    
    if (stockError) {
      console.error('Error updating product stock:', stockError);
      throw stockError;
    }
  }
  
  return { ...invoice, id: invoiceId };
}

export async function updateInvoice(invoice: Invoice) {
  // First get the original invoice to calculate stock changes
  const { data: originalInvoiceData, error: originalError } = await supabase
    .from('invoices')
    .select(`
      *,
      invoice_items (
        *,
        products:product_id (*)
      )
    `)
    .eq('id', invoice.id)
    .single();

  if (originalError) {
    console.error('Error fetching original invoice:', originalError);
    throw originalError;
  }

  // Transform original invoice data
  const originalInvoice = {
    id: originalInvoiceData.id,
    invoiceNumber: originalInvoiceData.invoicenumber,
    date: new Date(originalInvoiceData.date),
    customerName: originalInvoiceData.customername,
    totalAmount: originalInvoiceData.totalamount,
    cashAmount: originalInvoiceData.cashamount,
    balanceAmount: originalInvoiceData.balanceamount,
    items: originalInvoiceData.invoice_items.map((item: any) => ({
      product: item.products,
      quantity: item.quantity,
      discount: item.discount,
      amount: item.amount
    }))
  };

  // Update invoice
  const { error: invoiceError } = await supabase
    .from('invoices')
    .update({
      invoicenumber: invoice.invoiceNumber,
      customername: invoice.customerName,
      totalamount: invoice.totalAmount,
      cashamount: invoice.cashAmount,
      balanceamount: invoice.balanceAmount
    })
    .eq('id', invoice.id);

  if (invoiceError) {
    console.error('Error updating invoice:', invoiceError);
    throw invoiceError;
  }

  // Delete all invoice items
  const { error: deleteItemsError } = await supabase
    .from('invoice_items')
    .delete()
    .eq('invoice_id', invoice.id);

  if (deleteItemsError) {
    console.error('Error deleting invoice items:', deleteItemsError);
    throw deleteItemsError;
  }

  // Add new invoice items
  const invoiceItems = invoice.items.map(item => ({
    invoice_id: invoice.id,
    product_id: item.product.id,
    quantity: item.quantity,
    discount: item.discount,
    amount: item.amount
  }));

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(invoiceItems);

  if (itemsError) {
    console.error('Error adding invoice items:', itemsError);
    throw itemsError;
  }

  // Update product stock
  // First restore original quantities
  for (const item of originalInvoice.items) {
    const { error: stockError } = await supabase
      .from('products')
      .update({ stock: item.product.stock + item.quantity })
      .eq('id', item.product.id);

    if (stockError) {
      console.error('Error restoring product stock:', stockError);
      throw stockError;
    }
  }

  // Then subtract new quantities
  for (const item of invoice.items) {
    const { error: stockError } = await supabase
      .from('products')
      .update({ stock: item.product.stock - item.quantity })
      .eq('id', item.product.id);

    if (stockError) {
      console.error('Error updating product stock:', stockError);
      throw stockError;
    }
  }

  return invoice;
}

export async function deleteInvoice(invoiceId: string) {
  // First get the invoice to restore product stock
  const { data: invoiceData, error: fetchError } = await supabase
    .from('invoices')
    .select(`
      *,
      invoice_items (
        *,
        products:product_id (*)
      )
    `)
    .eq('id', invoiceId)
    .single();

  if (fetchError) {
    console.error('Error fetching invoice:', fetchError);
    throw fetchError;
  }

  // Transform invoice data for stock calculations
  const invoice = {
    items: invoiceData.invoice_items.map((item: any) => ({
      product: item.products,
      quantity: item.quantity
    }))
  };

  // Restore product stock
  for (const item of invoice.items) {
    const { error: stockError } = await supabase
      .from('products')
      .update({ stock: item.product.stock + item.quantity })
      .eq('id', item.product.id);

    if (stockError) {
      console.error('Error restoring product stock:', stockError);
      throw stockError;
    }
  }

  // Delete invoice items
  const { error: itemsError } = await supabase
    .from('invoice_items')
    .delete()
    .eq('invoice_id', invoiceId);

  if (itemsError) {
    console.error('Error deleting invoice items:', itemsError);
    throw itemsError;
  }

  // Delete invoice
  const { error: invoiceError } = await supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId);

  if (invoiceError) {
    console.error('Error deleting invoice:', invoiceError);
    throw invoiceError;
  }

  return true;
}
