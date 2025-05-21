import React, { useState, useEffect, useCallback } from "react";
import { Product, InvoiceItem, Invoice } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import Select from "react-select";

interface InvoiceFormProps {
  products: Product[];
  onSubmit: (invoice: Invoice) => void;
  initialInvoiceNumber: string;
  editMode?: boolean;
  invoiceToEdit?: Invoice | null;
}

const InvoiceForm = ({ 
  products, 
  onSubmit, 
  initialInvoiceNumber, 
  editMode = false, 
  invoiceToEdit = null 
}: InvoiceFormProps) => {
  const { toast } = useToast();
  const [invoiceNumber, setInvoiceNumber] = useState(initialInvoiceNumber);
  const [customerName, setCustomerName] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [cashAmountError, setCashAmountError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [cashAmount, setCashAmount] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);

  const calculateTotal = useCallback(() => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  }, [items]);

  const calculateBalance = () => {
    return cashAmount - calculateTotal();
  };

  // Initialize form with invoice data if in edit mode
  useEffect(() => {
    if (editMode && invoiceToEdit) {
      setInvoiceNumber(invoiceToEdit.invoiceNumber);
      setCustomerName(invoiceToEdit.customerName || "");
      setItems(invoiceToEdit.items);
      setCashAmount(invoiceToEdit.cashAmount);
    }
  }, [editMode, invoiceToEdit]);

  // Update cashAmount to match total whenever items change
  useEffect(() => {
    const totalAmount = calculateTotal();
    if (!editMode) {
      setCashAmount(totalAmount);
    }
  }, [items, editMode, calculateTotal]);

  // Validate form and cash amount
  useEffect(() => {
    const totalAmount = calculateTotal();
    const isValid = items.length > 0;
    
    if (cashAmount < totalAmount) {
      setCashAmountError(`Cash amount must be at least Rs. ${totalAmount.toFixed(2)}`);
      setIsFormValid(false);
    } else {
      setCashAmountError("");
      setIsFormValid(isValid);
    }
  }, [items, cashAmount, editMode, calculateTotal]);

  useEffect(() => {
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId) || null;
      setSelectedProduct(product);
      if (product) {
        setCustomPrice(product.price);
      }
    } else {
      setSelectedProduct(null);
      setCustomPrice(0);
    }
  }, [selectedProductId, products]);

  const handleAddItem = () => {
    if (!selectedProduct) {
      toast({
        title: "Error",
        description: "Please select a product",
        variant: "destructive"
      });
      return;
    }

    if (quantity <= 0) {
      toast({
        title: "Error",
        description: "Quantity must be greater than zero",
        variant: "destructive"
      });
      return;
    }

    if (!editMode && quantity > selectedProduct.stock) {
      toast({
        title: "Error",
        description: "Quantity exceeds available stock",
        variant: "destructive"
      });
      return;
    }

    const amount = (customPrice * quantity) - discount;

    const newItem: InvoiceItem = {
      product: selectedProduct,
      quantity,
      discount,
      amount
    };

    setItems([...items, newItem]);

    setSelectedProductId("");
    setQuantity(1);
    setDiscount(0);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Add at least one item to the invoice",
        variant: "destructive"
      });
      return;
    }

    if (cashAmount < calculateTotal()) {
      toast({
        title: "Error",
        description: "Cash amount must be at least equal to the total amount",
        variant: "destructive"
      });
      return;
    }

    const newInvoice: Invoice = {
      id: invoiceToEdit?.id || "",
      invoiceNumber: invoiceNumber,
      date: invoiceToEdit?.date || new Date(),
      customerName,
      items,
      totalAmount: calculateTotal(),
      cashAmount,
      balanceAmount: calculateBalance()
    };

    onSubmit(newInvoice);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-7xl mx-auto p-4 bg-white rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="invoiceNumber">Invoice Number</Label>
          <Input
            id="invoiceNumber"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerName">Customer Name (Optional)</Label>
          <Input
            id="customerName"
            placeholder="Enter customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg p-6 space-y-6 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <h3 className="font-medium mb-2">Add Items</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="product">Product</Label>
            <Select
              value={selectedProductId ? { 
                value: selectedProductId,
                label: `${products.find(p => p.id === selectedProductId)?.code} - ${products.find(p => p.id === selectedProductId)?.description}`
              } : null}
              onChange={(option) => setSelectedProductId(option?.value || "")}
              options={products.map(product => ({
                value: product.id,
                label: `${product.code} - ${product.description}`
              }))}
              isClearable
              isSearchable
              placeholder="Search and select a product"
              className="basic-select"
              classNamePrefix="select"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (Rs.)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={customPrice}
              onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={selectedProduct?.stock || 1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount">Discount</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            type="button" 
            onClick={handleAddItem}
            className="w-full md:w-auto transition-all hover:scale-105"
          >
            Add Item
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Price (Rs.)</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Discount</TableHead>
              <TableHead className="text-right">Amount (Rs.)</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? (
              items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.product.code}</TableCell>
                  <TableCell>{item.product.description}</TableCell>
                  <TableCell className="text-right">{(item.amount + item.discount) / item.quantity}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{item.discount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{item.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                  No items added to invoice
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div></div>
        <div className="space-y-6 border rounded-lg p-6 bg-gray-50 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 text-lg">Total:</span>
            <span className="font-bold text-2xl text-primary">Rs. {calculateTotal().toFixed(2)}</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cashAmount">Cash Amount</Label>
            {cashAmountError && (
              <p className="text-sm text-red-500">{cashAmountError}</p>
            )}
            <Input
              id="cashAmount"
              type="number"
              min={calculateTotal()}
              step="0.01"
              value={cashAmount || ""}
              onChange={(e) => {
                const value = e.target.value;
                setCashAmount(value === "" ? 0 : parseFloat(value) || 0);
              }}
              className={cashAmountError ? "border-red-500" : ""}
              aria-invalid={cashAmountError ? "true" : "false"}
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-700 text-lg">Balance:</span>
            <span className="font-medium text-xl text-primary">Rs. {calculateBalance().toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <Button
          type="submit"
          disabled={!isFormValid}
          className="px-8 py-2 text-lg font-medium transition-all hover:scale-105"
        >
          {editMode ? "Update Invoice" : "Create Invoice"}
        </Button>
      </div>
    </form>
  );
};

export default InvoiceForm;