
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import InvoiceForm from "@/components/InvoiceForm";
import InvoicePrint from "@/components/InvoicePrint";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAppContext } from "@/context/AppContext";
import { Invoice } from "@/types";
import { useToast } from "@/components/ui/use-toast";

const CreateInvoice = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { products, addInvoice, getNextInvoiceNumber, isLoading } = useAppContext();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState("");

  useEffect(() => {
    if (!isLoading) {
      setNextInvoiceNumber(getNextInvoiceNumber());
    }
  }, [isLoading, getNextInvoiceNumber]);

  const handleSubmit = (newInvoice: Invoice) => {
    setInvoice(newInvoice);
    setPrintDialogOpen(true);
  };

  const handleSaveInvoice = async (callback: () => void) => {
    if (!invoice) return;
    
    setIsSaving(true);
    try {
      await addInvoice(invoice);
      toast({
        title: "Success",
        description: "Invoice created successfully"
      });
      callback();
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast({
        title: "Error",
        description: "Failed to save invoice",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndPrint = () => {
    handleSaveInvoice(() => {
      setTimeout(() => {
        window.print();
      }, 500);
    });
  };

  const handleSaveAndNew = () => {
    handleSaveInvoice(() => {
      setInvoice(null);
      setPrintDialogOpen(false);
      // Update the next invoice number
      setNextInvoiceNumber(getNextInvoiceNumber());
    });
  };

  const handleViewInvoices = () => {
    handleSaveInvoice(() => {
      navigate("/invoices");
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Loading products...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Create Invoice</h2>
      </div>

      <InvoiceForm
        products={products}
        onSubmit={handleSubmit}
        initialInvoiceNumber={nextInvoiceNumber}
      />

      <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
            <DialogDescription>
              Review the invoice before saving
            </DialogDescription>
          </DialogHeader>
          
          {invoice && <InvoicePrint invoice={invoice} />}
          
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setPrintDialogOpen(false)} disabled={isSaving}>
              Back to Edit
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleSaveAndNew} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save & New"}
              </Button>
              <Button variant="outline" onClick={handleViewInvoices} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save & View All"}
              </Button>
              <Button onClick={handleSaveAndPrint} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save & Print"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default CreateInvoice;
