import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

export interface ProductBarcodeData {
  productCode: string;
  productName: string;
  purity: string;
  grossWeight: string;
  netWeight: string;
  stones: string;
  goldRate: string;
  approxPrice: string;
}

export function generateProductCode(category: string, year: number = new Date().getFullYear()): string {
  // Get category abbreviation
  const categoryAbbreviation = getCategoryAbbreviation(category);
  
  // Generate a unique number based on timestamp
  const timestamp = Date.now();
  const uniqueId = timestamp.toString().slice(-3).padStart(3, '0');
  
  return `PJ-${categoryAbbreviation}-${year}-${uniqueId}`;
}

function getCategoryAbbreviation(category: string): string {
  const abbreviations: { [key: string]: string } = {
    'rings': 'RG',
    'necklaces': 'NK',
    'pendants': 'PD',
    'earrings': 'ER',
    'bracelets': 'BR',
    'bangles': 'BG',
    'watches': 'WC',
    'mens': 'MN',
    'children': 'CH',
    'materials': 'MT',
    'collections': 'CL',
    'custom': 'CT',
    'new_arrivals': 'NA',
    'gold_coins': 'GC'
  };
  
  // Handle nose pins specifically
  if (category.toLowerCase().includes('nose') || category.toLowerCase().includes('pin')) {
    return 'NP';
  }
  
  return abbreviations[category.toLowerCase()] || 'GN'; // GN for General
}

export function formatProductDataForBarcode(data: ProductBarcodeData): string {
  return JSON.stringify({
    code: data.productCode,
    name: data.productName,
    purity: data.purity,
    grossWeight: data.grossWeight,
    netWeight: data.netWeight,
    stones: data.stones,
    goldRate: data.goldRate,
    price: data.approxPrice
  });
}

export async function generateBarcode(data: string, productCode: string): Promise<{ barcode: string, imagePath: string }> {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'barcodes');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // For now, just return the product code
    // The actual barcode rendering will be done on the frontend
    const filename = `barcode-${productCode.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.txt`;
    const imagePath = path.join(uploadsDir, filename);
    fs.writeFileSync(imagePath, productCode);

    return {
      barcode: productCode,
      imagePath: `/uploads/barcodes/${filename}`
    };
  } catch (error) {
    console.error('Error generating barcode:', error);
    // Return a simple fallback
    return {
      barcode: productCode,
      imagePath: ''
    };
  }
}

export async function generateQRCode(data: ProductBarcodeData, productCode: string): Promise<string> {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'qrcodes');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Format data for QR code
    const qrData = `Product Code: ${data.productCode}
Product Name: ${data.productName}
Purity: ${data.purity}
Gross Weight: ${data.grossWeight}
Net Weight: ${data.netWeight}
Stone: ${data.stones}
Gold Rate: ${data.goldRate}
Approx Price: ${data.approxPrice}`;

    // Generate QR code
    const filename = `qr-${productCode.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.png`;
    const imagePath = path.join(uploadsDir, filename);
    
    await QRCode.toFile(imagePath, qrData, {
      width: 200,
      margin: 2
    });

    return `/uploads/qrcodes/${filename}`;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

export function parseProductFromBarcode(barcodeData: string): ProductBarcodeData | null {
  try {
    const parsed = JSON.parse(barcodeData);
    return {
      productCode: parsed.code,
      productName: parsed.name,
      purity: parsed.purity,
      grossWeight: parsed.grossWeight,
      netWeight: parsed.netWeight,
      stones: parsed.stones,
      goldRate: parsed.goldRate,
      approxPrice: parsed.price
    };
  } catch (error) {
    console.error('Error parsing barcode data:', error);
    return null;
  }
}