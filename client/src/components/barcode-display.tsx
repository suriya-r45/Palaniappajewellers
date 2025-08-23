import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@shared/schema';

interface BarcodeDisplayProps {
  product: Product;
  className?: string;
}

interface ProductBarcodeData {
  productCode: string;
  productName: string;
  purity: string;
  grossWeight: string;
  netWeight: string;
  stones: string;
  goldRate: string;
  approxPrice: string;
}

export function BarcodeDisplay({ product, className }: BarcodeDisplayProps) {
  // Extract barcode data from product
  const barcodeData: ProductBarcodeData = {
    productCode: product.productCode || 'N/A',
    productName: product.name,
    purity: product.purity || '22K',
    grossWeight: `${product.grossWeight} g`,
    netWeight: `${product.netWeight} g`,
    stones: product.stones || 'None',
    goldRate: product.goldRateAtCreation ? `₹${product.goldRateAtCreation} / g` : 'N/A',
    approxPrice: `₹${parseInt(product.priceInr).toLocaleString('en-IN')} (excluding charges)`
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Product Barcode - ${product.name}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .barcode-container { text-align: center; border: 2px solid #000; padding: 20px; max-width: 400px; margin: 0 auto; }
              .product-code { font-size: 24px; font-weight: bold; margin: 10px 0; }
              .detail-row { display: flex; justify-content: space-between; margin: 5px 0; }
              .label { font-weight: bold; }
              .barcode-text { font-family: monospace; font-size: 18px; margin: 15px 0; padding: 10px; background: #f0f0f0; }
            </style>
          </head>
          <body>
            <div class="barcode-container">
              <div class="product-code">${barcodeData.productCode}</div>
              <div class="barcode-text">||||| ${barcodeData.productCode} |||||</div>
              <div class="detail-row"><span class="label">Product Name:</span> <span>${barcodeData.productName}</span></div>
              <div class="detail-row"><span class="label">Purity:</span> <span>${barcodeData.purity}</span></div>
              <div class="detail-row"><span class="label">Gross Weight:</span> <span>${barcodeData.grossWeight}</span></div>
              <div class="detail-row"><span class="label">Net Weight:</span> <span>${barcodeData.netWeight}</span></div>
              <div class="detail-row"><span class="label">Stone:</span> <span>${barcodeData.stones}</span></div>
              <div class="detail-row"><span class="label">Gold Rate:</span> <span>${barcodeData.goldRate}</span></div>
              <div class="detail-row"><span class="label">Approx Price:</span> <span>${barcodeData.approxPrice}</span></div>
            </div>
            <script>window.print(); window.close();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <QrCode className="h-5 w-5" />
          Product Barcode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Code */}
        <div className="text-center">
          <Badge variant="outline" className="text-lg font-mono px-4 py-2">
            {barcodeData.productCode}
          </Badge>
        </div>

        {/* Barcode representation */}
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="font-mono text-2xl tracking-wider mb-2">
            ||||| {barcodeData.productCode} |||||
          </div>
          <div className="text-sm text-gray-600">Scannable Barcode</div>
        </div>

        {/* Product Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Product Name:</span>
            <span className="text-right">{barcodeData.productName}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Purity:</span>
            <span>{barcodeData.purity}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Gross Weight:</span>
            <span>{barcodeData.grossWeight}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Net Weight:</span>
            <span>{barcodeData.netWeight}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Stone:</span>
            <span>{barcodeData.stones}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Gold Rate:</span>
            <span>{barcodeData.goldRate}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Approx Price:</span>
            <span className="text-right">{barcodeData.approxPrice}</span>
          </div>
        </div>

        {/* Print Button */}
        <Button 
          onClick={handlePrint}
          variant="outline" 
          className="w-full mt-4"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print Barcode
        </Button>
      </CardContent>
    </Card>
  );
}

export default BarcodeDisplay;