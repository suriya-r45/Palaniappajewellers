import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import Header from '@/components/header';
import ProductForm from '@/components/admin/product-form';
import BillingForm from '@/components/admin/billing-form';
import BillPreview from '@/components/admin/bill-preview';
import CategoryManagement from '@/components/admin/category-management';
import PriceManagement from '@/components/admin/price-management';
import { EstimatesList } from '@/components/admin/estimates-list';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product, Bill } from '@shared/schema';
import { Currency } from '@/lib/currency';
import { Package, FileText, TrendingUp, Users, Calculator, DollarSign, Edit, QrCode, Printer } from 'lucide-react';
import BarcodeDisplay from '@/components/barcode-display';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const { isAdmin, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('INR');
  const [activeTab, setActiveTab] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'products' || tabParam === 'billing' || tabParam === 'bills' || tabParam === 'estimates' || tabParam === 'categories' || tabParam === 'pricing' || tabParam === 'barcodes') {
      return tabParam;
    }
    return 'products';
  });
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  useEffect(() => {
    if (!isAdmin && !token) {
      window.location.href = '/login';
    }
  }, [isAdmin, token]);

  // Handle URL tab parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'products' || tabParam === 'billing' || tabParam === 'bills' || tabParam === 'estimates' || tabParam === 'categories' || tabParam === 'pricing' || tabParam === 'barcodes') {
      setActiveTab(tabParam);
    }
  }, []);

  // Listen for URL changes
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam === 'products' || tabParam === 'billing' || tabParam === 'bills' || tabParam === 'estimates' || tabParam === 'categories') {
        setActiveTab(tabParam);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Also check when location changes (for programmatic navigation)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'products' || tabParam === 'billing' || tabParam === 'bills' || tabParam === 'estimates' || tabParam === 'categories' || tabParam === 'pricing' || tabParam === 'barcodes') {
      setActiveTab(tabParam);
    }
  }, [location]);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
    enabled: !!token,
  });

  const { data: bills = [] } = useQuery<Bill[]>({
    queryKey: ['/api/bills'],
    queryFn: async () => {
      const response = await fetch('/api/bills', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch bills');
      return response.json();
    },
    enabled: !!token,
  });

  const totalRevenue = bills.reduce((sum, bill) => sum + parseFloat(bill.total), 0);
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock < 5).length;

  // WhatsApp send mutation for bills
  const sendBillToWhatsAppMutation = useMutation({
    mutationFn: async (billId: string) => {
      const response = await fetch(`/api/bills/${billId}/send-whatsapp`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to send bill to WhatsApp");
      }
      return response.json();
    },
    onSuccess: (data: { whatsappUrl: string; message: string }) => {
      toast({
        title: "Success",
        description: "Bill sent to WhatsApp successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      
      // Open WhatsApp URL
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank');
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send bill to WhatsApp.",
        variant: "destructive",
      });
    },
  });

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white" data-testid="page-admin-dashboard" style={{ backgroundColor: '#ffffff' }}>
      <Header 
        selectedCurrency={selectedCurrency} 
        onCurrencyChange={setSelectedCurrency} 
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-rose-900">Admin Dashboard</h1>
          </div>
          <Button
            onClick={() => setLocation('/estimates')}
            className="bg-gradient-to-r from-rose-800 to-red-800 hover:from-rose-900 hover:to-red-900 text-white font-semibold shadow-md w-full sm:w-auto text-sm px-3 py-2"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Create Customer Estimate
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="card-total-products">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-total-bills">
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bills</p>
                  <p className="text-2xl font-bold text-gray-900">{bills.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-total-revenue">
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-gold" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedCurrency === 'INR' ? '₹' : 'BD'} {totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-low-stock">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                  <p className="text-2xl font-bold text-gray-900">{lowStockProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" data-testid="tabs-admin">
          <div className="relative">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-7 bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 shadow-sm h-auto p-1">
              <TabsTrigger value="products" data-testid="tab-products" className="text-xs md:text-sm font-medium text-rose-700 hover:text-rose-900 hover:bg-rose-100 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-800 data-[state=active]:to-red-800 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 px-1 py-2 mx-0.5 rounded-md min-h-[40px] flex items-center justify-center">Products</TabsTrigger>
              <TabsTrigger value="billing" data-testid="tab-billing" className="text-xs md:text-sm font-medium text-rose-700 hover:text-rose-900 hover:bg-rose-100 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-800 data-[state=active]:to-red-800 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 px-1 py-2 mx-0.5 rounded-md min-h-[40px] flex items-center justify-center">Billing</TabsTrigger>
              <TabsTrigger value="bills" data-testid="tab-bills" className="text-xs md:text-sm font-medium text-rose-700 hover:text-rose-900 hover:bg-rose-100 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-800 data-[state=active]:to-red-800 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 px-1 py-2 mx-0.5 rounded-md min-h-[40px] flex items-center justify-center">Bills History</TabsTrigger>
              <TabsTrigger value="estimates" data-testid="tab-estimates" className="text-xs md:text-sm font-medium text-rose-700 hover:text-rose-900 hover:bg-rose-100 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-800 data-[state=active]:to-red-800 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 px-1 py-2 mx-0.5 rounded-md min-h-[40px] flex items-center justify-center">Customer Estimates</TabsTrigger>
              <TabsTrigger value="categories" data-testid="tab-categories" className="text-xs md:text-sm font-medium text-rose-700 hover:text-rose-900 hover:bg-rose-100 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-800 data-[state=active]:to-red-800 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 px-1 py-2 mx-0.5 rounded-md min-h-[40px] flex items-center justify-center">Categories</TabsTrigger>
              <TabsTrigger value="pricing" data-testid="tab-pricing" className="text-xs md:text-sm font-medium text-rose-700 hover:text-rose-900 hover:bg-rose-100 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-800 data-[state=active]:to-red-800 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 px-1 py-2 mx-0.5 rounded-md min-h-[40px] flex items-center justify-center">Pricing</TabsTrigger>
              <TabsTrigger value="barcodes" data-testid="tab-barcodes" className="text-xs md:text-sm font-medium text-rose-700 hover:text-rose-900 hover:bg-rose-100 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-800 data-[state=active]:to-red-800 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 px-1 py-2 mx-0.5 rounded-md min-h-[40px] flex items-center justify-center">Barcodes</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="products" className="space-y-6">
            <ProductForm currency={selectedCurrency} />
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <BillingForm 
              currency={selectedCurrency} 
              products={products} 
            />
          </TabsContent>

          <TabsContent value="bills" className="space-y-6">
            <Card data-testid="card-bills-history">
              <CardHeader>
                <CardTitle>Bills History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bills.length === 0 ? (
                    <p className="text-gray-500 text-center py-8" data-testid="message-no-bills">
                      No bills generated yet.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full bg-white rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Bill No.</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Customer</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Currency</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {bills.map((bill) => (
                            <tr key={bill.id} className="hover:bg-gray-50" data-testid={`row-bill-${bill.id}`}>
                              <td className="px-4 py-3 text-sm font-medium text-black">{bill.billNumber}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{bill.customerName}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {new Date(bill.createdAt!).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-black">
                                {bill.currency === 'INR' ? '₹' : 'BD'} {parseFloat(bill.total).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">{bill.currency}</td>
                              <td className="px-4 py-3 text-sm">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedBill(bill)}
                                    data-testid={`button-preview-${bill.id}`}
                                  >
                                    Preview
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      // Store bill data in localStorage for editing
                                      localStorage.setItem('editBill', JSON.stringify(bill));
                                      // Set active tab immediately
                                      setActiveTab('billing');
                                      // Also update URL for consistency
                                      setLocation('/admin?tab=billing');
                                      
                                      toast({
                                        title: "Bill Loaded",
                                        description: `Bill ${bill.billNumber} loaded for editing.`,
                                      });
                                    }}
                                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                                    data-testid={`button-edit-${bill.id}`}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = `/api/bills/${bill.id}/pdf`;
                                      link.download = `${bill.customerName.replace(/\s+/g, '_')}_${bill.billNumber}.pdf`;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }}
                                    data-testid={`button-download-${bill.id}`}
                                  >
                                    Download
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => sendBillToWhatsAppMutation.mutate(bill.id)}
                                    disabled={sendBillToWhatsAppMutation.isPending}
                                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                    data-testid={`button-whatsapp-${bill.id}`}
                                  >
                                    {sendBillToWhatsAppMutation.isPending ? "Sending..." : "Send to WhatsApp"}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estimates" className="space-y-6">
            <EstimatesList />
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <CategoryManagement />
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <PriceManagement />
          </TabsContent>

          <TabsContent value="barcodes" className="space-y-6">
            <Card data-testid="card-barcode-management">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Product Barcode Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {products.length === 0 ? (
                    <div className="text-center py-8">
                      <QrCode className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500" data-testid="message-no-products">
                        No products available for barcode generation.
                      </p>
                      <p className="text-sm text-gray-400">
                        Add products first to generate barcodes.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="text-sm text-gray-600 mb-4">
                        Total Products: <span className="font-semibold">{products.length}</span> | 
                        Products with Barcodes: <span className="font-semibold">{products.filter(p => p.productCode).length}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {products.map((product) => (
                          <div key={product.id} className="bg-white border rounded-lg shadow-sm">
                            <div className="p-4">
                              <div className="flex items-start gap-3 mb-4">
                                <img
                                  src={product.images?.[0] || '/placeholder-jewelry.jpg'}
                                  alt={product.name}
                                  className="w-16 h-16 rounded-lg object-cover border"
                                />
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 truncate">
                                    {product.name}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {product.category.replace(/_/g, ' ')}
                                  </p>
                                  {product.productCode && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                        {product.productCode}
                                      </span>
                                      <span className={`text-xs px-2 py-1 rounded ${
                                        product.stock > 10 
                                          ? 'bg-green-100 text-green-800' 
                                          : product.stock > 0 
                                          ? 'bg-yellow-100 text-yellow-800' 
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        Stock: {product.stock}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="space-y-2 text-sm text-gray-600 mb-4">
                                <div className="flex justify-between">
                                  <span>Price:</span>
                                  <span className="font-medium">
                                    ₹{parseInt(product.priceInr).toLocaleString('en-IN')}
                                  </span>
                                </div>
                                {product.purity && (
                                  <div className="flex justify-between">
                                    <span>Purity:</span>
                                    <span>{product.purity}</span>
                                  </div>
                                )}
                                {product.grossWeight && (
                                  <div className="flex justify-between">
                                    <span>Weight:</span>
                                    <span>{product.grossWeight}g</span>
                                  </div>
                                )}
                                {product.stones && (
                                  <div className="flex justify-between">
                                    <span>Stones:</span>
                                    <span>{product.stones}</span>
                                  </div>
                                )}
                              </div>
                              
                              {product.productCode ? (
                                <BarcodeDisplay 
                                  product={product} 
                                  className="border-0 shadow-none bg-gray-50"
                                />
                              ) : (
                                <div className="text-center py-4 bg-gray-50 rounded-lg">
                                  <QrCode className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                  <p className="text-sm text-gray-500">
                                    No barcode available
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Edit product to generate barcode
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Bulk Actions */}
                      <div className="border-t pt-6">
                        <div className="flex flex-wrap gap-3">
                          <Button 
                            variant="outline"
                            onClick={() => {
                              const printWindow = window.open('', '_blank');
                              if (printWindow) {
                                const productsWithBarcodes = products.filter(p => p.productCode);
                                const barcodesHTML = productsWithBarcodes.map(product => {
                                  const productType = product.name.split(' ')[0].toUpperCase();
                                  return `
                                    <div style="page-break-after: always; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px;">
                                      <div style="border: 3px solid #000; border-radius: 15px; padding: 30px; width: 400px; text-align: center; background: white; box-shadow: 0 4px 8px rgba(0,0,0,0.1); font-family: Arial, sans-serif;">
                                        <div style="font-size: 20px; font-weight: bold; margin-bottom: 15px; letter-spacing: 1px;">PALANIAPPA JEWELLERS</div>
                                        <div style="font-size: 28px; font-weight: bold; margin-bottom: 15px; font-family: monospace;">${product.productCode}</div>
                                        <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
                                          <span>${productType}</span>
                                          <span>${product.purity || '22K'}</span>
                                        </div>
                                        <div style="font-size: 16px; font-weight: bold; margin-bottom: 20px;">Gross Weight : ${product.grossWeight} g</div>
                                        <div style="margin: 20px 0; display: flex; justify-content: center;">
                                          <canvas id="barcode-${product.id}" style="max-width: 300px;"></canvas>
                                        </div>
                                        <div style="font-size: 18px; font-weight: bold; margin-top: 15px; font-family: monospace;">${product.productCode}</div>
                                      </div>
                                    </div>
                                  `;
                                }).join('');
                                
                                printWindow.document.write(`
                                  <html>
                                    <head>
                                      <title>All Product Barcodes</title>
                                      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
                                    </head>
                                    <body>
                                      ${barcodesHTML}
                                      <script>
                                        ${productsWithBarcodes.map(product => `
                                          JsBarcode("#barcode-${product.id}", "${product.productCode}", {
                                            format: "CODE128",
                                            width: 2,
                                            height: 60,
                                            displayValue: false,
                                            margin: 0,
                                            background: "#ffffff",
                                            lineColor: "#000000"
                                          });
                                        `).join('')}
                                        setTimeout(() => {
                                          window.print();
                                          window.close();
                                        }, 1000);
                                      </script>
                                    </body>
                                  </html>
                                `);
                                printWindow.document.close();
                              }
                            }}
                            disabled={products.filter(p => p.productCode).length === 0}
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            Print All Barcodes ({products.filter(p => p.productCode).length})
                          </Button>
                          
                          <div className="text-sm text-gray-500 flex items-center">
                            <QrCode className="h-4 w-4 mr-1" />
                            Only products with generated codes can be printed
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>

      {/* Bill Preview Modal */}
      {selectedBill && (
        <BillPreview
          bill={selectedBill}
          onClose={() => setSelectedBill(null)}
        />
      )}
    </div>
  );
}
