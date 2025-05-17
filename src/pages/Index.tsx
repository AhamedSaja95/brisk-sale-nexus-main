
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";

const Index = () => {
  const navigate = useNavigate();
  const { products, invoices } = useAppContext();
  
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const totalSales = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  
  const dashboardCards = [
    {
      title: "Products",
      description: "Manage your product inventory",
      value: products.length,
      action: () => navigate("/products"),
      actionText: "View Products"
    },
    {
      title: "Total Stock",
      description: "Current items in stock",
      value: totalStock,
      action: () => navigate("/products"),
      actionText: "Manage Inventory"
    },
    {
      title: "Invoices",
      description: "View all sales invoices",
      value: invoices.length,
      action: () => navigate("/invoices"),
      actionText: "View Invoices"
    },
    {
      title: "Total Sales",
      description: "Revenue from all invoices",
      value: totalSales.toFixed(2),
      prefix: "₹",
      action: () => navigate("/create-invoice"),
      actionText: "New Invoice"
    }
  ];

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card, index) => (
          <Card key={index} className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{card.prefix || ""}{card.value}</p>
            </CardContent>
            <CardFooter>
              <button
                onClick={card.action}
                className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                {card.actionText}
              </button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <button 
              onClick={() => navigate("/create-invoice")}
              className="w-full py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Create New Invoice
            </button>
            <button 
              onClick={() => navigate("/products")}
              className="w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Manage Products
            </button>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length > 0 ? (
              <div className="space-y-4">
                {invoices.slice(0, 5).map((invoice) => (
                  <div key={invoice.id} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <p className="font-medium">INV:{invoice.invoiceNumber}</p>
                      <p className="text-sm text-gray-500">{invoice.customerName || "Customer"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{invoice.totalAmount.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(invoice.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No invoices yet</p>
            )}
          </CardContent>
          {invoices.length > 0 && (
            <CardFooter>
              <button
                onClick={() => navigate("/invoices")}
                className="w-full py-2 text-blue-500 border border-blue-500 rounded-md hover:bg-blue-50 transition-colors"
              >
                View All Invoices
              </button>
            </CardFooter>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
