
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import InvoiceList from "@/components/InvoiceList";
import InvoicePrint from "@/components/InvoicePrint";
import InvoiceForm from "@/components/InvoiceForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAppContext } from "@/context/AppContext";
import { Invoice } from "@/types";
import { useToast } from "@/components/ui/use-toast";

const Invoices = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { invoices, updateInvoice, deleteInvoice, refreshData, isLoading } = useAppContext();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPrintDialogOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setEditDialogOpen(true);
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDeleteDialogOpen(true);
  };

  const handlePrintInvoice = () => {
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleUpdateInvoice = async (updatedInvoice: Invoice) => {
    setIsProcessing(true);
    try {
      await updateInvoice(updatedInvoice);
      await refreshData();
      setEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Invoice updated successfully"
      });
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmDeleteInvoice = async () => {
    if (!selectedInvoice) return;
    
    setIsProcessing(true);
    try {
      await deleteInvoice(selectedInvoice.id);
      setDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "Invoice deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Loading invoices...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Invoices</h2>
        <Button onClick={() => navigate("/create-invoice")}>Create New Invoice</Button>
      </div>

      <InvoiceList
        invoices={invoices}
        onView={handleViewInvoice}
        onEdit={handleEditInvoice}
        onDelete={handleDeleteInvoice}
      />

      {/* View Invoice Dialog */}
      <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
            <DialogDescription>
              Review the invoice details below
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && <InvoicePrint invoice={selectedInvoice} />}
          
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setPrintDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handlePrintInvoice}>
              Print Invoice
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
          </DialogHeader>
          
          {selectedInvoice && (
            <InvoiceForm
              products={[]} // Will be populated from context
              onSubmit={handleUpdateInvoice}
              initialInvoiceNumber={selectedInvoice.invoiceNumber}
              editMode={true}
              invoiceToEdit={selectedInvoice}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete invoice {selectedInvoice?.invoiceNumber}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteInvoice}
              disabled={isProcessing}
            >
              {isProcessing ? "Deleting..." : "Delete Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Invoices;
