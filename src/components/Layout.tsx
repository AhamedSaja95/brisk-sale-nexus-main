
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: "/", label: "Dashboard" },
    { path: "/products", label: "Products" },
    { path: "/create-invoice", label: "Create Invoice" },
    { path: "/invoices", label: "Invoices" }
  ];

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">SUN TRADERS POS</h1>
          <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut size={16} /> Logout
          </Button>
        </div>
      </header>
      <nav className="bg-gray-100 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex space-x-4 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`py-3 px-3 inline-flex whitespace-nowrap ${
                  location.pathname === item.path
                    ? "border-b-2 border-blue-500 font-medium text-blue-600"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} SUN TRADERS - Dedicated Economic Center
        </div>
      </footer>
    </div>
  );
};

export default Layout;
