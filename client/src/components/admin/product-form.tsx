import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Upload, ArrowLeft } from 'lucide-react';
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
    name: 'Necklaces',
    subcategories: [
      'Chains',
      'Chokers',
      'Lockets',
      'Beaded Necklaces',
      'Collars',
      'Long Necklaces/Opera Chains',
      'Multi-layered Necklaces'
    ]
  },
  'pendants': {
    name: 'Pendants',
    subcategories: [
      'Solitaire',
      'Halo',
      'Cluster',
      'Heart',
      'Cross',
      'Initial',
      'Diamond',
      'Gemstone',
      'Pearl',
      'Bridal',
      'Minimalist',
      'Traditional'
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
    name: 'Bracelets',
    subcategories: [
      'Cuff',
      'Tennis',
      'Charm',
      'Chain',
      'Beaded',
      'Link',
      'Bolo',
      'Leather',
      'Diamond',
      'Gemstone',
      'Pearl',
      'Bridal',
      'Minimalist',
      'Traditional'
    ]
  },
  'bangles': {
    name: 'Bangles',
    subcategories: [
      'Classic',
      'Kada',
      'Cuff',
      'Openable',
      'Adjustable',
      'Charm',
      'Diamond',
      'Gemstone',
      'Pearl',
      'Bridal',
      'Minimalist',
      'Traditional',
      'Temple',
      'Kundan',
      'Polki',
      'Navratna'
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
  },
  'new_arrivals': {
    name: 'New Arrivals',
    subcategories: [
      'Latest Products',
      'Featured Items',
      'Trending Now',
      'Exclusive Pieces'
    ]
  },
  'gold_coins': {
    name: 'Gold Coins',
    subcategories: [
      'Investment',
      'Religious',
      'Customized',
      'Occasion',
      'Corporate Gifting',
      'Collectible',
      'Plain',
      'Hallmarked'
    ]
  }
};

const MATERIAL_OPTIONS = [
  { value: 'GOLD_22K', label: 'Gold 22K' },
  { value: 'GOLD_18K', label: 'Gold 18K' },
  { value: 'SILVER_925', label: 'Silver 925' },
  { value: 'PLATINUM', label: 'Platinum' },
  { value: 'DIAMOND', label: 'Diamond' },
  { value: 'GEMSTONE', label: 'Gemstone' },
  { value: 'PEARL', label: 'Pearl' },
  { value: 'new_arrivals', label: 'New Arrivals' },
  { value: 'OTHER', label: 'Other' }
];

import { Currency } from '@/lib/currency';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ProductFormProps {
  currency: Currency;
}

function ProductForm({ currency }: ProductFormProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subCategory: '',
    material: 'GOLD_22K',
    metalType: 'GOLD', // Add metalType field
    priceInr: '',
    priceBhd: '',
    grossWeight: '',
    netWeight: '',
    stock: ''
  });

  // Helper function to determine metalType from material
  const getMetalTypeFromMaterial = (material: string): string => {
    if (material.includes('GOLD')) return 'GOLD';
    if (material.includes('SILVER')) return 'SILVER';
    if (material.includes('DIAMOND')) return 'DIAMOND';
    if (material.includes('PLATINUM')) return 'OTHER';
    if (material.includes('PEARL') || material.includes('GEMSTONE')) return 'OTHER';
    return 'OTHER';
  };
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);


  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    enabled: !!token,
  });

  // Fetch categories from API
  const { data: apiCategories = [] } = useQuery<any[]>({
    queryKey: ['/api/categories'],
    enabled: !!token,
  });



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
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
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
      data.append(key, String(value));
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
      material: 'GOLD_22K',
      metalType: 'GOLD',
      priceInr: '',
      priceBhd: '',
      grossWeight: '',
      netWeight: '',
      stock: ''
    });
    setSelectedFiles([]);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(id);
    }
  };

  return (
    <div>
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
                    {/* Static predefined categories */}
                    {Object.entries(HOME_CATEGORIES).map(([key, category]) => (
                      <SelectItem key={key} value={key}>{category.name}</SelectItem>
                    ))}
                    {/* Dynamic categories from API */}
                    {apiCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
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
                    {/* For API categories, show subcategories if available */}
                    {formData.category && apiCategories.find(cat => cat.id === formData.category)?.subcategories?.map((subCat: string) => (
                      <SelectItem key={subCat} value={subCat}>
                        {subCat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="material">Material</Label>
                <Select 
                  value={formData.material} 
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    material: value,
                    metalType: getMetalTypeFromMaterial(value) // Auto-set metalType
                  })}
                >
                  <SelectTrigger data-testid="select-material">
                    <SelectValue placeholder="Select Material" />
                  </SelectTrigger>
                  <SelectContent>
                    {MATERIAL_OPTIONS.map((material) => (
                      <SelectItem key={material.value} value={material.value}>
                        {material.label}
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

            {/* Editable price fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priceInr">Price (INR)</Label>
                <Input
                  id="priceInr"
                  type="number"
                  step="0.01"
                  value={formData.priceInr}
                  onChange={(e) => setFormData({ ...formData, priceInr: e.target.value })}
                  placeholder="Enter price in INR"
                  required
                  data-testid="input-price-inr"
                  className="bg-white"
                />
              </div>
              
              <div>
                <Label htmlFor="priceBhd">Price (BHD)</Label>
                <Input
                  id="priceBhd"
                  type="number"
                  step="0.001"
                  value={formData.priceBhd}
                  onChange={(e) => setFormData({ ...formData, priceBhd: e.target.value })}
                  placeholder="Enter price in BHD"
                  required
                  data-testid="input-price-bhd"
                  className="bg-white"
                />
              </div>
            </div>

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
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400">
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
              className="w-full bg-rose-800 hover:bg-rose-700 text-rose-100 font-semibold py-3 rounded-lg shadow-lg border border-rose-700 transition-all"
              disabled={addProductMutation.isPending}
              data-testid="button-add-product"
            >
              {addProductMutation.isPending ? 'Adding Product...' : 'Add Product'}
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

export default ProductForm;
