import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Upload, Calculator, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { Product, MetalRate } from '@shared/schema';

// Categories from home page
const HOME_CATEGORIES = {
  'rings': {
    name: 'Rings',
    subcategories: [
      'Engagement Rings',
      'Wedding Bands', 
      'Fashion Rings',
      'Cocktail Rings',
      'Promise Rings',
      'Birthstone Rings'
    ]
  },
  'necklaces': {
    name: 'Necklaces & Pendants',
    subcategories: [
      'Chains',
      'Lockets',
      'Statement Necklaces',
      'Pendant Necklaces',
      'Chokers',
      'Layered Necklaces'
    ]
  },
  'earrings': { 
    name: 'Earrings',
    subcategories: [
      'Stud Earrings',
      'Hoop Earrings',
      'Drop Earrings',
      'Dangle Earrings',
      'Ear Cuffs',
      'Huggie Earrings'
    ]
  },
  'bracelets': {
    name: 'Bracelets & Bangles',
    subcategories: [
      'Charm Bracelets',
      'Bangles',
      'Cuff Bracelets',
      'Chain Bracelets',
      'Tennis Bracelets'
    ]
  },
  'watches': {
    name: 'Watches',
    subcategories: [
      "Men's Watches",
      "Women's Watches",
      'Smartwatches',
      'Luxury Watches',
      'Sport Watches'
    ]
  },
  'mens': {
    name: "Men's Jewellery",
    subcategories: [
      'Rings',
      'Bracelets', 
      'Necklaces',
      'Cufflinks',
      'Tie Clips'
    ]
  },
  'children': {
    name: "Children's Jewellery",
    subcategories: [
      "Kids' Rings",
      "Kids' Necklaces",
      "Kids' Earrings",
      "Kids' Bracelets"
    ]
  },
  'materials': {
    name: 'Materials',
    subcategories: [
      'Gold Jewellery',
      'Silver Jewellery',
      'Platinum Jewellery',
      'Diamond Jewellery',
      'Gemstone Jewellery',
      'Pearl Jewellery'
    ]
  },
  'collections': {
    name: 'Collections',
    subcategories: [
      'Bridal Collection',
      'Vintage Collection',
      'Contemporary Collection',
      'Minimalist Collection',
      'Celebrity Collection'
    ]
  },
  'custom': {
    name: 'Custom Jewellery',
    subcategories: [
      'Design Your Own',
      'Engraving Services',
      'Repairs & Restorations'
    ]
  }
};
import { Currency } from '@/lib/currency';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ProductFormProps {
  currency: Currency;
}

export default function ProductForm({ currency }: ProductFormProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subCategory: '',
    priceInr: '',
    priceBhd: '',
    grossWeight: '',
    netWeight: '',
    stock: '',
    metalType: 'GOLD',
    isMetalPriceBased: false,
    makingChargesPercentage: '15',
    customPriceInr: '',
    customPriceBhd: '',
    purity: '22K'
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isGoldSelected, setIsGoldSelected] = useState(false);
  const [isSilverSelected, setIsSilverSelected] = useState(false);
  const [isDiamondSelected, setIsDiamondSelected] = useState(false);
  const [isOtherSelected, setIsOtherSelected] = useState(true);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    enabled: !!token,
  });

  // Fetch current metal rates for automatic pricing
  const { data: metalRates = [] } = useQuery<MetalRate[]>({
    queryKey: ['/api/metal-rates'],
    enabled: !!token,
  });

  // Calculate prices based on metal rates
  const calculateMetalBasedPrice = () => {
    const weight = parseFloat(formData.netWeight);
    // Removed making charges calculation
    
    if (!weight || weight <= 0) return { inr: 0, bhd: 0 };

    let goldRate = null;
    let silverRate = null;
    
    if (isGoldSelected) {
      goldRate = metalRates.find(rate => 
        rate.metal === 'GOLD' && 
        rate.purity === formData.purity &&
        rate.market === 'INDIA'
      );
    }
    
    if (isSilverSelected) {
      silverRate = metalRates.find(rate => 
        rate.metal === 'SILVER' && 
        rate.market === 'INDIA'
      );
    }

    let basePrice = 0;
    let basePriceBhd = 0;

    if (goldRate && isGoldSelected) {
      basePrice = weight * parseFloat(goldRate.pricePerGramInr);
      basePriceBhd = weight * parseFloat(goldRate.pricePerGramBhd);
    } else if (silverRate && isSilverSelected) {
      basePrice = weight * parseFloat(silverRate.pricePerGramInr);
      basePriceBhd = weight * parseFloat(silverRate.pricePerGramBhd);
    }

    // Add making charges
    const finalPriceInr = basePrice;
    const finalPriceBhd = basePriceBhd;

    return {
      inr: Math.round(finalPriceInr * 100) / 100,
      bhd: Math.round(finalPriceBhd * 1000) / 1000
    };
  };

  // Auto-calculate prices when metal selection or weight changes
  useEffect(() => {
    if ((isGoldSelected || isSilverSelected) && formData.netWeight) {
      const calculatedPrices = calculateMetalBasedPrice();
      setFormData(prev => ({
        ...prev,
        priceInr: calculatedPrices.inr.toString(),
        priceBhd: calculatedPrices.bhd.toString(),
        isMetalPriceBased: true,
        metalType: isGoldSelected ? 'GOLD' : 'SILVER'
      }));
    } else if (isOtherSelected) {
      setFormData(prev => ({
        ...prev,
        isMetalPriceBased: false,
        metalType: 'OTHER'
      }));
    }
  }, [isGoldSelected, isSilverSelected, isOtherSelected, formData.netWeight, formData.purity, metalRates]);

  const addProductMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!token) {
        throw new Error('Authentication required');
      }
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data,
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to create product');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Success",
        description: "Product added successfully!",
      });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add product.",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Success",
        description: "Product deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, typeof value === 'boolean' ? value.toString() : value);
    });
    
    selectedFiles.forEach(file => {
      data.append('images', file);
    });

    addProductMutation.mutate(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      subCategory: '',
      priceInr: '',
      priceBhd: '',
      grossWeight: '',
      netWeight: '',
      stock: '',
      metalType: 'GOLD',
      isMetalPriceBased: false,
      makingChargesPercentage: '15',
      customPriceInr: '',
      customPriceBhd: '',
      purity: '22K'
    });
    setSelectedFiles([]);
    setEditingProduct(null);
    setIsGoldSelected(false);
    setIsSilverSelected(false);
    setIsDiamondSelected(false);
    setIsOtherSelected(true);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(id);
    }
  };

  return (
    <div>
      <Button
        variant="ghost"
        onClick={() => setLocation('/admin')}
        className="mb-4 text-luxury-black hover:bg-champagne/20 border border-gold/30"
        data-testid="button-back-to-dashboard-product"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Admin Dashboard
      </Button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Add Product Form */}
      <Card data-testid="card-add-product">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add New Product</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-add-product">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                  required
                  data-testid="input-product-name"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value, subCategory: '' })}
                  required
                >
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(HOME_CATEGORIES).map(([key, category]) => (
                      <SelectItem key={key} value={key}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="subCategory">Sub Category</Label>
                <Select 
                  value={formData.subCategory} 
                  onValueChange={(value) => setFormData({ ...formData, subCategory: value })}
                  disabled={!formData.category}
                >
                  <SelectTrigger data-testid="select-subcategory">
                    <SelectValue placeholder={formData.category ? "Select Sub Category" : "Select Category First"} />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.category && HOME_CATEGORIES[formData.category as keyof typeof HOME_CATEGORIES]?.subcategories.map((subCat) => (
                      <SelectItem key={subCat} value={subCat}>
                        {subCat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Product Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter detailed description"
                rows={3}
                required
                data-testid="textarea-description"
              />
            </div>

            {/* Hidden price fields - prices are calculated automatically */}
            <input type="hidden" name="priceInr" value={formData.priceInr} />
            <input type="hidden" name="priceBhd" value={formData.priceBhd} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grossWeight">Gross Weight (g)</Label>
                <Input
                  id="grossWeight"
                  type="number"
                  step="0.1"
                  value={formData.grossWeight}
                  onChange={(e) => setFormData({ ...formData, grossWeight: e.target.value })}
                  placeholder="0.0"
                  required
                  data-testid="input-gross-weight"
                />
              </div>
              
              <div>
                <Label htmlFor="netWeight">Net Weight (g)</Label>
                <Input
                  id="netWeight"
                  type="number"
                  step="0.1"
                  value={formData.netWeight}
                  onChange={(e) => setFormData({ ...formData, netWeight: e.target.value })}
                  placeholder="0.0"
                  required
                  data-testid="input-net-weight"
                />
              </div>
            </div>

            {/* Enhanced Pricing Section */}
            <div className="border-2 border-yellow-400 rounded-lg p-6 bg-gradient-to-r from-gray-50 to-yellow-50">
              <div className="flex items-center space-x-2 mb-4">
                <Calculator className="h-5 w-5 text-yellow-600" />
                <Label className="text-lg font-semibold text-gray-800">Smart Pricing Calculator</Label>
              </div>
              
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">Select Metal Type for Automatic Pricing:</Label>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2 p-3 border rounded-lg bg-white">
                    <Checkbox
                      id="gold"
                      checked={isGoldSelected}
                      onCheckedChange={(checked) => {
                        setIsGoldSelected(!!checked);
                        if (checked) {
                          setIsSilverSelected(false);
                          setIsDiamondSelected(false);
                          setIsOtherSelected(false);
                        }
                      }}
                      className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                    />
                    <Label htmlFor="gold" className="text-sm font-medium text-yellow-700">🥇 Gold</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 border rounded-lg bg-white">
                    <Checkbox
                      id="silver"
                      checked={isSilverSelected}
                      onCheckedChange={(checked) => {
                        setIsSilverSelected(!!checked);
                        if (checked) {
                          setIsGoldSelected(false);
                          setIsDiamondSelected(false);
                          setIsOtherSelected(false);
                        }
                      }}
                      className="data-[state=checked]:bg-gray-400 data-[state=checked]:border-gray-400"
                    />
                    <Label htmlFor="silver" className="text-sm font-medium text-gray-600">🥈 Silver</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 border rounded-lg bg-white">
                    <Checkbox
                      id="diamond"
                      checked={isDiamondSelected}
                      onCheckedChange={(checked) => {
                        setIsDiamondSelected(!!checked);
                        if (checked) {
                          setIsGoldSelected(false);
                          setIsSilverSelected(false);
                          setIsOtherSelected(false);
                        }
                      }}
                      className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <Label htmlFor="diamond" className="text-sm font-medium text-blue-600">💎 Diamond</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 border rounded-lg bg-white">
                    <Checkbox
                      id="other"
                      checked={isOtherSelected}
                      onCheckedChange={(checked) => {
                        setIsOtherSelected(!!checked);
                        if (checked) {
                          setIsGoldSelected(false);
                          setIsSilverSelected(false);
                          setIsDiamondSelected(false);
                        }
                      }}
                      className="data-[state=checked]:bg-gray-500 data-[state=checked]:border-gray-500"
                    />
                    <Label htmlFor="other" className="text-sm font-medium text-gray-600">⚡ Other</Label>
                  </div>
                </div>

                {(isGoldSelected || isSilverSelected) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    {isGoldSelected && (
                      <div>
                        <Label htmlFor="purity">Gold Purity</Label>
                        <Select 
                          value={formData.purity} 
                          onValueChange={(value) => setFormData({ ...formData, purity: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Purity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="24K">24K (Pure Gold)</SelectItem>
                            <SelectItem value="22K">22K (91.6% Gold)</SelectItem>
                            <SelectItem value="18K">18K (75% Gold)</SelectItem>
                            <SelectItem value="14K">14K (58.3% Gold)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    

                  </div>
                )}

                {(isGoldSelected || isSilverSelected) && formData.netWeight && (
                  <div className="p-4 bg-gradient-to-r from-gray-100 to-yellow-100 rounded-lg border">
                    <div className="text-sm text-gray-700 mb-2">💰 Calculated Prices:</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-semibold text-gray-800">₹{formData.priceInr}</div>
                        <div className="text-xs text-gray-600">Indian Rupees</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-semibold text-yellow-600">BD {formData.priceBhd}</div>
                        <div className="text-xs text-gray-600">Bahrain Dinar</div>
                      </div>
                    </div>
                  </div>
                )}

                {isOtherSelected && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">Manual Price Entry:</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customPriceInr">Custom Price (INR)</Label>
                        <Input
                          id="customPriceInr"
                          type="number"
                          step="0.01"
                          value={formData.customPriceInr}
                          onChange={(e) => {
                            setFormData({ 
                              ...formData, 
                              customPriceInr: e.target.value,
                              priceInr: e.target.value 
                            });
                          }}
                          placeholder="Enter manual price"
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="customPriceBhd">Custom Price (BHD)</Label>
                        <Input
                          id="customPriceBhd"
                          type="number"
                          step="0.001"
                          value={formData.customPriceBhd}
                          onChange={(e) => {
                            setFormData({ 
                              ...formData, 
                              customPriceBhd: e.target.value,
                              priceBhd: e.target.value 
                            });
                          }}
                          placeholder="Enter manual price"
                          className="bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
                required
                data-testid="input-stock"
              />
            </div>

            <div>
              <Label htmlFor="images">Product Images</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  data-testid="input-images"
                />
                <label htmlFor="images" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Click to upload images or drag and drop</p>
                  <p className="text-sm text-gray-500">PNG, JPG up to 10MB each</p>
                </label>
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="preview-images">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                        data-testid={`button-remove-image-${index}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 border border-yellow-400"
              disabled={addProductMutation.isPending}
              data-testid="button-add-product"
            >
              {addProductMutation.isPending ? 'Adding Product...' : '✨ Add Product to Inventory'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Product List */}
      <Card data-testid="card-product-inventory">
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {products.length === 0 ? (
              <p className="text-gray-500 text-center py-8" data-testid="message-no-products">
                No products added yet.
              </p>
            ) : (
              products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg p-4 border shadow-sm" data-testid={`item-product-${product.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={product.images[0] || "https://images.unsplash.com/photo-1603561596112-db2eca6c9df4?w=60"}
                        alt={product.name}
                        className="w-15 h-15 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-black">{product.name}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant={product.stock > 5 ? "default" : product.stock > 0 ? "destructive" : "secondary"}>
                            Stock: {product.stock}
                          </Badge>
                          <Badge variant="outline">{product.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          ₹{parseInt(product.priceInr).toLocaleString('en-IN')} | BD {parseFloat(product.priceBhd).toFixed(3)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingProduct(product)}
                        data-testid={`button-edit-${product.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={deleteProductMutation.isPending}
                        data-testid={`button-delete-${product.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
