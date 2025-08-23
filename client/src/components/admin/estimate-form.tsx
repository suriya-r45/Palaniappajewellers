import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Clock, DollarSign, ArrowLeft } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface EstimateFormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  productName: string;
  category: string;
  purity: string;
  grossWeight: string;
  netWeight: string;
  productCode: string;
  metalValue: string;
  makingChargesPercentage: string;
  makingCharges: string;
  stoneDiamondChargesPercentage: string;
  stoneDiamondCharges: string;
  wastagePercentage: string;
  wastageCharges: string;
  hallmarkingCharges: string;
  gstPercentage: string;
  gstAmount: string;
  vatPercentage: string;
  vatAmount: string;
  subtotal: string;
  totalAmount: string;
  validUntil: string;
  currency: string;
}

export function EstimateForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEstimateId, setEditingEstimateId] = useState<string | null>(null);

  const [formData, setFormData] = useState<EstimateFormData>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    productName: "",
    category: "",
    purity: "22K",
    grossWeight: "",
    netWeight: "",
    productCode: "",
    metalValue: "",
    makingChargesPercentage: "15",
    makingCharges: "",
    stoneDiamondChargesPercentage: "0",
    stoneDiamondCharges: "0",
    wastagePercentage: "2",
    wastageCharges: "",
    hallmarkingCharges: "450",
    gstPercentage: "3",
    gstAmount: "",
    vatPercentage: "1",
    vatAmount: "",
    subtotal: "",
    totalAmount: "",
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    currency: "INR"
  });

  // Check for edit estimate data in localStorage
  useEffect(() => {
    const editEstimateData = localStorage.getItem('editEstimate');
    if (editEstimateData) {
      try {
        const estimateData = JSON.parse(editEstimateData);
        
        setFormData({
          customerName: estimateData.customerName || "",
          customerPhone: estimateData.customerPhone || "",
          customerEmail: estimateData.customerEmail || "",
          productName: estimateData.productName || "",
          category: estimateData.category || "",
          purity: estimateData.purity || "22K",
          grossWeight: estimateData.grossWeight || "",
          netWeight: estimateData.netWeight || "",
          productCode: estimateData.productCode || "",
          metalValue: estimateData.metalValue || "",
          makingChargesPercentage: estimateData.makingChargesPercentage || "15",
          makingCharges: estimateData.makingCharges || "",
          stoneDiamondChargesPercentage: estimateData.stoneDiamondChargesPercentage || "0",
          stoneDiamondCharges: estimateData.stoneDiamondCharges || "0",
          wastagePercentage: estimateData.wastagePercentage || "2",
          wastageCharges: estimateData.wastageCharges || "",
          hallmarkingCharges: estimateData.hallmarkingCharges || "450",
          gstPercentage: estimateData.gstPercentage || "3",
          gstAmount: estimateData.gstAmount || "",
          vatPercentage: estimateData.vatPercentage || "1",
          vatAmount: estimateData.vatAmount || "",
          subtotal: estimateData.subtotal || "",
          totalAmount: estimateData.totalAmount || "",
          validUntil: estimateData.validUntil ? new Date(estimateData.validUntil).toISOString().split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          currency: estimateData.currency || "INR"
        });
        
        setIsEditMode(true);
        setEditingEstimateId(estimateData.id);
        
        // Clear the edit data from localStorage after loading
        localStorage.removeItem('editEstimate');
        
        toast({
          title: "Edit Mode",
          description: "Estimate loaded for editing. Make your changes and update the estimate.",
        });
      } catch (error) {
        console.error('Error loading edit estimate data:', error);
        localStorage.removeItem('editEstimate');
      }
    }
  }, []);

  const createEstimateMutation = useMutation({
    mutationFn: async (data: EstimateFormData) => {
      // Ensure all numeric fields are properly formatted (convert empty strings to "0")
      const cleanedData = {
        ...data,
        grossWeight: data.grossWeight || "0",
        netWeight: data.netWeight || "0",
        metalValue: data.metalValue || "0",
        makingCharges: data.makingCharges || "0",
        stoneDiamondCharges: data.stoneDiamondCharges || "0",
        wastageCharges: data.wastageCharges || "0",
        hallmarkingCharges: data.hallmarkingCharges || "0",
        gstAmount: data.gstAmount || "0",
        vatAmount: data.vatAmount || "0",
        subtotal: data.subtotal || "0",
        totalAmount: data.totalAmount || "0",
        validUntil: data.validUntil,
      };
      
      const response = await fetch("/api/estimates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(cleanedData),
      });
      if (!response.ok) {
        throw new Error("Failed to create estimate");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Estimate created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
      // Reset form
      setFormData({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        productName: "",
        category: "",
        purity: "22K",
        grossWeight: "",
        netWeight: "",
        productCode: "",
        metalValue: "",
        makingChargesPercentage: "15",
        makingCharges: "",
        stoneDiamondChargesPercentage: "0",
        stoneDiamondCharges: "0",
        wastagePercentage: "2",
        wastageCharges: "",
        hallmarkingCharges: "450",
        gstPercentage: "3",
        gstAmount: "",
        vatPercentage: "1",
        vatAmount: "",
        subtotal: "",
        totalAmount: "",
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currency: "INR"
      });
      // Redirect to estimates section in admin dashboard
      setLocation('/admin?tab=estimates');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create estimate. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateEstimateMutation = useMutation({
    mutationFn: async (data: EstimateFormData) => {
      const cleanedData = {
        ...data,
        grossWeight: data.grossWeight || "0",
        netWeight: data.netWeight || "0",
        metalValue: data.metalValue || "0",
        makingCharges: data.makingCharges || "0",
        stoneDiamondCharges: data.stoneDiamondCharges || "0",
        wastageCharges: data.wastageCharges || "0",
        hallmarkingCharges: data.hallmarkingCharges || "0",
        gstAmount: data.gstAmount || "0",
        vatAmount: data.vatAmount || "0",
        subtotal: data.subtotal || "0",
        totalAmount: data.totalAmount || "0",
        validUntil: data.validUntil,
      };
      
      const response = await fetch(`/api/estimates/${editingEstimateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(cleanedData),
      });
      if (!response.ok) {
        throw new Error("Failed to update estimate");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Estimate updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
      resetForm();
      setLocation('/estimates?tab=list');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update estimate. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      productName: "",
      category: "",
      purity: "22K",
      grossWeight: "",
      netWeight: "",
      productCode: "",
      metalValue: "",
      makingChargesPercentage: "15",
      makingCharges: "",
      stoneDiamondChargesPercentage: "0",
      stoneDiamondCharges: "0",
      wastagePercentage: "2",
      wastageCharges: "",
      hallmarkingCharges: "450",
      gstPercentage: "3",
      gstAmount: "",
      vatPercentage: "1",
      vatAmount: "",
      subtotal: "",
      totalAmount: "",
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: "INR"
    });
    setIsEditMode(false);
    setEditingEstimateId(null);
  };

  const calculatePricing = () => {
    const metalVal = parseFloat(formData.metalValue) || 0;
    const makingPercent = parseFloat(formData.makingChargesPercentage) || 0;
    const stonePercent = parseFloat(formData.stoneDiamondChargesPercentage) || 0;
    const wastagePercent = parseFloat(formData.wastagePercentage) || 0;
    const hallmarking = parseFloat(formData.hallmarkingCharges) || 0;
    const gstPercent = parseFloat(formData.gstPercentage) || 0;
    const vatPercent = parseFloat(formData.vatPercentage) || 0;

    const makingCharges = (metalVal * makingPercent) / 100;
    const stoneCharges = (metalVal * stonePercent) / 100;
    const wastageCharges = (metalVal * wastagePercent) / 100;
    const subtotal = metalVal + makingCharges + stoneCharges + wastageCharges + hallmarking;
    
    const gstAmount = (subtotal * gstPercent) / 100;
    const vatAmount = (subtotal * vatPercent) / 100;
    const totalAmount = subtotal + gstAmount + vatAmount;

    setFormData(prev => ({
      ...prev,
      makingCharges: makingCharges.toFixed(2),
      stoneDiamondCharges: stoneCharges.toFixed(2),
      wastageCharges: wastageCharges.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      vatAmount: vatAmount.toFixed(2),
      subtotal: subtotal.toFixed(2),
      totalAmount: totalAmount.toFixed(2)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone || !formData.productName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (isEditMode) {
      updateEstimateMutation.mutate(formData);
    } else {
      createEstimateMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: keyof EstimateFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <Button
        variant="ghost"
        onClick={() => setLocation('/admin')}
        className="mb-4 text-luxury-black hover:bg-champagne/20 border border-gold/30"
        data-testid="button-back-to-dashboard-form"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Admin Dashboard
      </Button>
      <Card className="border-2 border-gold bg-gradient-to-r from-cream to-champagne/30 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-800">
            <Calculator className="h-6 w-6 text-yellow-600" />
            <span>{isEditMode ? 'Edit Customer Estimate' : 'Create Customer Estimate'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange("customerName", e.target.value)}
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Customer Phone *</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="customerEmail">Customer Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>

            {/* Product Information */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    id="productName"
                    value={formData.productName}
                    onChange={(e) => handleInputChange("productName", e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rings">Rings</SelectItem>
                      <SelectItem value="necklaces">Necklaces</SelectItem>
                      <SelectItem value="pendants">Pendants</SelectItem>
                      <SelectItem value="earrings">Earrings</SelectItem>
                      <SelectItem value="bracelets">Bracelets</SelectItem>
                      <SelectItem value="bangles">Bangles</SelectItem>
                      <SelectItem value="watches">Watches</SelectItem>
                      <SelectItem value="mens">Men's Jewellery</SelectItem>
                      <SelectItem value="children">Children's Jewellery</SelectItem>
                      <SelectItem value="materials">Materials</SelectItem>
                      <SelectItem value="custom">Custom Jewellery</SelectItem>
                      <SelectItem value="collections">Collections</SelectItem>
                      <SelectItem value="gold_coins">Gold Coins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="purity">Purity</Label>
                  <Select value={formData.purity} onValueChange={(value) => handleInputChange("purity", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24K">24K Gold</SelectItem>
                      <SelectItem value="22K">22K Gold</SelectItem>
                      <SelectItem value="18K">18K Gold</SelectItem>
                      <SelectItem value="916">916 Hallmark</SelectItem>
                      <SelectItem value="999">999 Silver</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="productCode">Product Code</Label>
                  <Input
                    id="productCode"
                    value={formData.productCode}
                    onChange={(e) => handleInputChange("productCode", e.target.value)}
                    placeholder="Enter product code"
                  />
                </div>
                <div>
                  <Label htmlFor="grossWeight">Gross Weight (g)</Label>
                  <Input
                    id="grossWeight"
                    type="number"
                    step="0.01"
                    value={formData.grossWeight}
                    onChange={(e) => handleInputChange("grossWeight", e.target.value)}
                    placeholder="Enter gross weight"
                  />
                </div>
                <div>
                  <Label htmlFor="netWeight">Net Weight (g)</Label>
                  <Input
                    id="netWeight"
                    type="number"
                    step="0.01"
                    value={formData.netWeight}
                    onChange={(e) => handleInputChange("netWeight", e.target.value)}
                    placeholder="Enter net weight"
                  />
                </div>
              </div>
            </div>

            {/* Pricing Calculation */}
            <div className="bg-gradient-to-r from-gray-100 to-yellow-100 p-4 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-yellow-600" />
                Pricing Calculation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="metalValue">Metal Value (₹)</Label>
                  <Input
                    id="metalValue"
                    type="number"
                    step="0.01"
                    value={formData.metalValue}
                    onChange={(e) => handleInputChange("metalValue", e.target.value)}
                    placeholder="Enter metal value"
                  />
                </div>

                <div>
                  <Label htmlFor="makingChargesPercentage">Making Charges (%)</Label>
                  <Input
                    id="makingChargesPercentage"
                    type="number"
                    step="0.01"
                    value={formData.makingChargesPercentage}
                    onChange={(e) => handleInputChange("makingChargesPercentage", e.target.value)}
                    placeholder="Making charges percentage"
                  />
                </div>
                <div>
                  <Label htmlFor="stoneDiamondChargesPercentage">Stone/Diamond Charges (%)</Label>
                  <Input
                    id="stoneDiamondChargesPercentage"
                    type="number"
                    step="0.01"
                    value={formData.stoneDiamondChargesPercentage}
                    onChange={(e) => handleInputChange("stoneDiamondChargesPercentage", e.target.value)}
                    placeholder="Stone charges percentage"
                  />
                </div>
                <div>
                  <Label htmlFor="wastagePercentage">Wastage (%)</Label>
                  <Input
                    id="wastagePercentage"
                    type="number"
                    step="0.01"
                    value={formData.wastagePercentage}
                    onChange={(e) => handleInputChange("wastagePercentage", e.target.value)}
                    placeholder="Wastage percentage"
                  />
                </div>
                <div>
                  <Label htmlFor="hallmarkingCharges">Hallmarking Charges (₹)</Label>
                  <Input
                    id="hallmarkingCharges"
                    type="number"
                    step="0.01"
                    value={formData.hallmarkingCharges}
                    onChange={(e) => handleInputChange("hallmarkingCharges", e.target.value)}
                    placeholder="Hallmarking charges"
                  />
                </div>
                <div>
                  <Label htmlFor="gstPercentage">GST (%)</Label>
                  <Input
                    id="gstPercentage"
                    type="number"
                    step="0.01"
                    value={formData.gstPercentage}
                    onChange={(e) => handleInputChange("gstPercentage", e.target.value)}
                    placeholder="GST percentage"
                  />
                </div>
                <div>
                  <Label htmlFor="vatPercentage">VAT (%)</Label>
                  <Input
                    id="vatPercentage"
                    type="number"
                    step="0.01"
                    value={formData.vatPercentage}
                    onChange={(e) => handleInputChange("vatPercentage", e.target.value)}
                    placeholder="VAT percentage"
                  />
                </div>
                <div>
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => handleInputChange("validUntil", e.target.value)}
                  />
                </div>
              </div>
              
              <Button
                type="button"
                onClick={calculatePricing}
                className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Calculate Pricing
              </Button>

              {/* Calculated Values Display */}
              {formData.totalAmount && (
                <div className="mt-4 p-4 bg-white rounded-lg border">
                  <h4 className="font-semibold text-gray-800 mb-2">Calculated Pricing</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">

                    <div>
                      <span className="text-gray-600">Stone Charges:</span>
                      <div className="font-semibold">₹{formData.stoneDiamondCharges}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Wastage:</span>
                      <div className="font-semibold">₹{formData.wastageCharges}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">GST:</span>
                      <div className="font-semibold">₹{formData.gstAmount}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">VAT:</span>
                      <div className="font-semibold">₹{formData.vatAmount}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Subtotal:</span>
                      <div className="font-semibold">₹{formData.subtotal}</div>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-4 border-t pt-2">
                      <span className="text-gray-600">Total Amount:</span>
                      <div className="text-xl font-bold text-yellow-600">₹{formData.totalAmount}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              {isEditMode && (
                <Button 
                  type="button" 
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-600 hover:bg-gray-50"
                  onClick={resetForm}
                >
                  Cancel Edit
                </Button>
              )}
              <Button
                type="submit"
                className={`${isEditMode ? 'flex-1' : 'w-full'} bg-rose-800 hover:bg-rose-700 text-rose-100 font-semibold py-3 rounded-lg shadow-lg border border-rose-700 transition-all`}
                disabled={createEstimateMutation.isPending || updateEstimateMutation.isPending}
              >
                {createEstimateMutation.isPending ? "Creating Estimate..." : 
                 updateEstimateMutation.isPending ? "Updating Estimate..." : 
                 isEditMode ? "Update Estimate" : "Create Estimate"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}