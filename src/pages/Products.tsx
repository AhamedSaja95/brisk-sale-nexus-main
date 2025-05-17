
import { useState } from "react";
import Layout from "@/components/Layout";
import ProductForm from "@/components/ProductForm";
import ProductList from "@/components/ProductList";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAppContext } from "@/context/AppContext";
import { Product } from "@/types";
import { useToast } from "@/components/ui/use-toast";

const Products = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useAppContext();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const handleAddClick = () => {
    setEditingProduct(undefined);
    setFormOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleSubmit = (product: Product) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, product);
      toast({
        title: "Product updated",
        description: "Product has been updated successfully"
      });
    } else {
      addProduct(product);
      toast({
        title: "Product added",
        description: "Product has been added to inventory"
      });
    }
    setFormOpen(false);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete);
      toast({
        title: "Product deleted",
        description: "Product has been removed from inventory"
      });
      setProductToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Products</h2>
        <Button onClick={handleAddClick}>Add New Product</Button>
      </div>

      <ProductList
        products={products}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <ProductForm
            initialProduct={editingProduct}
            onSubmit={handleSubmit}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product from the inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Products;
