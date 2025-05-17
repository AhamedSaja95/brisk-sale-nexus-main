
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Product, Invoice } from "@/types";
import { fetchProducts, addProduct, updateProduct, deleteProduct, fetchInvoices, addInvoice as addInvoiceToDb, updateInvoice as updateInvoiceInDb, deleteInvoice as deleteInvoiceFromDb } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface AppContextType {
  products: Product[];
  invoices: Invoice[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addInvoice: (invoice: Invoice) => Promise<void>;
  updateInvoice: (invoice: Invoice) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  getNextInvoiceNumber: () => string;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [productsData, invoicesData] = await Promise.all([
        fetchProducts(),
        fetchInvoices()
      ]);
      
      setProducts(productsData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load data from the database",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [toast]);

  const addProductToState = async (product: Product) => {
    try {
      const newProduct = await addProduct({
        code: product.code,
        description: product.description,
        price: product.price,
        stock: product.stock
      });
      
      setProducts([...products, newProduct]);
      return Promise.resolve();
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  };

  const updateProductInState = async (id: string, updatedProduct: Product) => {
    try {
      await updateProduct(id, updatedProduct);
      setProducts(products.map(product => product.id === id ? updatedProduct : product));
      return Promise.resolve();
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  };

  const deleteProductFromState = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts(products.filter(product => product.id !== id));
      return Promise.resolve();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  };

  const addInvoiceToState = async (invoice: Invoice) => {
    try {
      const newInvoice = await addInvoiceToDb(invoice);
      setInvoices([...invoices, newInvoice]);
      
      // Update product stock in state
      const updatedProducts = products.map(product => {
        const invoiceItem = invoice.items.find(item => item.product.id === product.id);
        if (invoiceItem) {
          return {
            ...product,
            stock: product.stock - invoiceItem.quantity
          };
        }
        return product;
      });
      
      setProducts(updatedProducts);
      return Promise.resolve();
    } catch (error) {
      console.error("Error adding invoice:", error);
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  };

  const updateInvoiceInState = async (invoice: Invoice) => {
    try {
      const updatedInvoice = await updateInvoiceInDb(invoice);
      setInvoices(invoices.map(inv => inv.id === invoice.id ? updatedInvoice : inv));
      
      // Refresh products to get updated stock values
      const updatedProducts = await fetchProducts();
      setProducts(updatedProducts);
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  };

  const deleteInvoiceFromState = async (id: string) => {
    try {
      await deleteInvoiceFromDb(id);
      setInvoices(invoices.filter(invoice => invoice.id !== id));
      
      // Refresh products to get updated stock values
      const updatedProducts = await fetchProducts();
      setProducts(updatedProducts);
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  };

  const getNextInvoiceNumber = () => {
    const prefix = "A";
    const nextNumber = (invoices.length + 1).toString().padStart(3, "0");
    return `${prefix}${nextNumber}`;
  };

  const refreshData = async () => {
    return loadData();
  };

  return (
    <AppContext.Provider
      value={{
        products,
        invoices,
        addProduct: addProductToState,
        updateProduct: updateProductInState,
        deleteProduct: deleteProductFromState,
        addInvoice: addInvoiceToState,
        updateInvoice: updateInvoiceInState,
        deleteInvoice: deleteInvoiceFromState,
        getNextInvoiceNumber,
        isLoading,
        refreshData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
