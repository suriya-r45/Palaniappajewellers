import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertBillSchema, loginSchema, insertUserSchema, insertEstimateSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import PDFDocument from "pdfkit";
import Stripe from "stripe";
import { MetalRatesService } from "./services/testmetalRatesService.js";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
});

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: "jewelerypalaniappa@gmail.com",
  password: "P@lani@ppA@321"
};

// WhatsApp messaging function
async function sendWelcomeWhatsAppMessage(name: string, phone: string) {
  const message = `✨ Welcome, ${name}! You are now part of the Palaniappa Jewellers legacy, where every jewel is crafted for elegance that lasts generations.`;
  
  // Format phone number for WhatsApp (remove any non-numeric characters except +)
  const formattedPhone = phone.replace(/[^\d+]/g, '');
  
  // Create WhatsApp URL
  const whatsappUrl = `https://wa.me/${formattedPhone.replace('+', '')}?text=${encodeURIComponent(message)}`;
  
  // For now, we'll log the message. In production, you would integrate with WhatsApp Business API
  console.log(`WhatsApp welcome message for ${name} (${phone}): ${message}`);
  console.log(`WhatsApp URL: ${whatsappUrl}`);
  
  // Return the URL so it can be used if needed
  return whatsappUrl;
}

// Multer configuration for file uploads
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});

// Authentication middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      // Check for admin credentials
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        const token = jwt.sign(
          { id: "admin", email, role: "admin", name: "Admin" },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        return res.json({
          user: { id: "admin", email, role: "admin", name: "Admin" },
          token
        });
      }

      // Regular user authentication
      const user = await storage.authenticateUser(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ user: { id: user.id, email: user.email, role: user.role, name: user.name }, token });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser({
        ...userData,
        role: "guest"
      });

      // Send WhatsApp welcome message if phone number is provided
      if (userData.phone) {
        try {
          await sendWelcomeWhatsAppMessage(userData.name, userData.phone);
        } catch (error) {
          console.error('Failed to send WhatsApp message:', error);
          // Continue with registration even if WhatsApp fails
        }
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ user: { id: user.id, email: user.email, role: user.role, name: user.name }, token });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category } = req.query;
      let products;

      if (category && typeof category === 'string') {
        products = await storage.getProductsByCategory(category);
      } else {
        products = await storage.getAllProducts();
      }

      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", authenticateToken, requireAdmin, upload.array('images', 5), async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);

      // Handle uploaded images
      const imageUrls: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          const filename = `${Date.now()}-${file.originalname}`;
          const filepath = path.join(uploadsDir, filename);
          fs.renameSync(file.path, filepath);
          imageUrls.push(`/uploads/${filename}`);
        }
      }

      const product = await storage.createProduct({
        ...productData,
        images: imageUrls,
        isActive: productData.isActive ?? true
      });

      res.status(201).json(product);
    } catch (error) {
      console.error("Product creation error:", error);
      res.status(400).json({ message: "Invalid product data", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.put("/api/products/:id", authenticateToken, requireAdmin, upload.array('images', 5), async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);

      // Handle uploaded images
      let updateData = { ...productData };
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const imageUrls: string[] = [];
        for (const file of req.files) {
          const filename = `${Date.now()}-${file.originalname}`;
          const filepath = path.join(uploadsDir, filename);
          fs.renameSync(file.path, filepath);
          imageUrls.push(`/uploads/${filename}`);
        }
        updateData.images = imageUrls;
      }

      const product = await storage.updateProduct(req.params.id, updateData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.delete("/api/products/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Bill routes
  app.get("/api/bills", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { search, startDate, endDate } = req.query;
      let bills;

      if (search && typeof search === 'string') {
        bills = await storage.searchBills(search);
      } else if (startDate && endDate) {
        bills = await storage.getBillsByDateRange(new Date(startDate as string), new Date(endDate as string));
      } else {
        bills = await storage.getAllBills();
      }

      res.json(bills);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bills" });
    }
  });

  app.get("/api/bills/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const bill = await storage.getBill(req.params.id);
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }
      res.json(bill);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bill" });
    }
  });

  //app.post("/api/bills", authenticateToken, requireAdmin, async (req, res) => {
  // app.post("/api/bills", requireAdmin, async (req, res) => {
  //   try {
  //     const billData = insertBillSchema.parse(req.body);

  //     // Generate bill number
  //     const billCount = (await storage.getAllBills()).length;
  //     const billNumber = `INV-${String(billCount + 1).padStart(3, '0')}`;

  //     const bill = await storage.createBill({
  //       ...billData,
  //       billNumber
  //     });

  //     res.status(201).json(bill);
  //   } catch (error) {
  //     console.error(error);
  //     res.status(400).json({ message: "Invalid bill data" });
  //   }
  // });

  app.post("/api/bills", async (req, res) => {
    try {
      const billData = insertBillSchema.parse(req.body);
      const billCount = (await storage.getAllBills()).length;
      const date = new Date();
      const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
      const billNumber = `PJ/${formattedDate}-${String(billCount + 1).padStart(3, '0')}`;

      const bill = await storage.createBill({
        ...billData,
        billNumber: billNumber
      } as any);

      res.status(201).json(bill);
    } catch (error: any) {
      console.error("Zod validation error:", error.errors || error);
      res.status(400).json({
        message: "Invalid bill data",
        details: error.errors || error.message
      });
    }
  });

  // Send bill to WhatsApp
  app.post("/api/bills/:id/send-whatsapp", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const bill = await storage.getBill(req.params.id);
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }

      // Format the bill for WhatsApp message with PDF link
      const currencySymbol = bill.currency === 'INR' ? '₹' : 'BD';
      const pdfUrl = `${req.protocol}://${req.get('host')}/api/bills/${bill.id}/pdf`;
      
      const message = `*BILL GENERATED*

*Palaniappa Jewellers Since 2025*

━━━━━━━━━━━━━━━━━━━━━
*Bill Details*
━━━━━━━━━━━━━━━━━━━━━

Bill Number: *${bill.billNumber}*
Customer: *${bill.customerName}*
Email: ${bill.customerEmail}
Phone: ${bill.customerPhone}
Address: ${bill.customerAddress}

*Total Amount: ${currencySymbol} ${parseFloat(bill.total).toLocaleString()}*

*Items:*
${(typeof bill.items === 'string' ? JSON.parse(bill.items) : bill.items).map((item: any, index: number) => 
  `${index + 1}. ${item.productName} - ${currencySymbol}${parseFloat(item.price).toLocaleString()} × ${item.quantity}`
).join('\n')}

━━━━━━━━━━━━━━━━━━━━━
*Payment Summary*
━━━━━━━━━━━━━━━━━━━━━
Subtotal: ${currencySymbol}${parseFloat(bill.subtotal).toLocaleString()}
Making Charges: ${currencySymbol}${parseFloat(bill.makingCharges).toLocaleString()}
GST: ${currencySymbol}${parseFloat(bill.gst).toLocaleString()}
VAT: ${currencySymbol}${parseFloat(bill.vat).toLocaleString()}
*Total: ${currencySymbol}${parseFloat(bill.total).toLocaleString()}*

Thank you for choosing Palaniappa Jewellers!
Where every jewel is crafted for elegance that lasts generations.

Contact us: +919597201554
Premium quality, timeless beauty.`;

      // Create WhatsApp URL
      const phoneNumber = bill.customerPhone.replace(/[^\d]/g, '');
      const whatsappUrl = `https://wa.me/${phoneNumber.startsWith('91') ? phoneNumber : '91' + phoneNumber}?text=${encodeURIComponent(message)}`;

      // Log for production integration
      console.log(`[WhatsApp Bill] Sending bill ${bill.billNumber} to ${bill.customerName} (${bill.customerPhone})`);
      console.log(`[WhatsApp URL] ${whatsappUrl}`);
      console.log(`[PDF URL] ${pdfUrl}`);

      res.json({
        success: true,
        message: "Bill prepared for WhatsApp with PDF link",
        whatsappUrl: whatsappUrl,
        pdfUrl: pdfUrl,
        messagePreview: message
      });
    } catch (error) {
      console.error("Error preparing bill for WhatsApp:", error);
      res.status(500).json({ message: "Failed to prepare bill for WhatsApp" });
    }
  });



  // Professional Bill PDF generation - Exact replica of sample bill (public access for WhatsApp sharing)
  app.get("/api/bills/:id/pdf", async (req, res) => {
    try {
      const bill = await storage.getBill(req.params.id);
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }

      // Create PDF matching the sample bill format exactly
      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 30,
        bufferPages: true,
        font: 'Helvetica',
        info: {
          Title: `Tax Invoice ${bill.billNumber}`,
          Author: 'Palaniappa Jewellers',
          Subject: 'Tax Invoice',
        }
      });
      
      const filename = `${bill.customerName.replace(/\s+/g, '_')}_${bill.billNumber.replace(/[\/\\]/g, '')}.pdf`;

      // Set headers for PDF download with better compatibility for WhatsApp
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`); // Changed to inline for better WhatsApp compatibility
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('X-Frame-Options', 'ALLOWALL');
      res.setHeader('X-Content-Type-Options', 'nosniff');

      doc.pipe(res);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 30;
      let currentY = 50;

      // Add company logo (centered at top)
      try {
        const logoSize = 60;
        doc.image('./attached_assets/1000284180_1755240849891_1755763107777.jpg', 
                 (pageWidth - logoSize) / 2, currentY, { width: logoSize, height: logoSize });
        currentY += logoSize + 20;
      } catch (error) {
        // If no logo, add company name
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text('PALANIAPPA', 0, currentY, { align: 'center', width: pageWidth });
        currentY += 25;
      }

      // Customer copy header (top right)
      doc.fontSize(10)
         .font('Helvetica')
         .text('CUSTOMER COPY', pageWidth - 120, 50)
         .text(`Date: ${new Date(bill.createdAt!).toLocaleDateString('en-IN')} ${new Date(bill.createdAt!).toLocaleTimeString('en-IN')}`, pageWidth - 140, 65);

      currentY += 20;

      // TAX INVOICE header with border - matching preview style
      const headerY = currentY;
      doc.rect(margin, headerY, pageWidth - (margin * 2), 30)
         .fill('#F5F5F5')
         .stroke('#000000')
         .lineWidth(1);

      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text('TAX INVOICE', margin + 8, headerY + 8);

      currentY += 40;

      // Company and Customer details section with border - matching preview
      const detailsY = currentY;
      const detailsHeight = 140;
      const leftColumnWidth = (pageWidth - margin * 2) / 2 - 10;
      
      // Draw border around details section
      doc.rect(margin, detailsY, pageWidth - (margin * 2), detailsHeight)
         .stroke('#000000')
         .lineWidth(1);
      
      // Left side - Company details
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text('PALANIAPPA JEWELLERS', margin + 8, detailsY + 10);
      
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#000000')
         .text('Premium Jewelry Store', margin + 8, detailsY + 25)
         .text('123 Jewelry Street', margin + 8, detailsY + 38)
         .text('Chennai, Tamil Nadu', margin + 8, detailsY + 51)
         .text('PINCODE: 600001', margin + 8, detailsY + 64)
         .text('Phone Number: +919597201554', margin + 8, detailsY + 77)
         .text('GSTIN: 33AAACT5712A124', margin + 8, detailsY + 90)
         .text('Email: jewelerypalaniappa@gmail.com', margin + 8, detailsY + 103);

      // Right side - Customer details
      const rightX = margin + leftColumnWidth + 20;
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text('CUSTOMER DETAILS:', rightX, detailsY + 10);
      
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#000000')
         .text(`${bill.customerName || 'N/A'}`, rightX, detailsY + 25)
         .text(`${bill.customerPhone || 'N/A'}`, rightX, detailsY + 38)
         .text(`${bill.customerEmail || 'N/A'}`, rightX, detailsY + 51)
         .text(`${bill.customerAddress || 'N/A'}`, rightX, detailsY + 64, { width: leftColumnWidth - 10 });

      currentY = detailsY + detailsHeight + 20;

      // Removed standard rates section as requested by user

      // Items table matching preview layout exactly
      const tableY = currentY;
      const vatHeader = bill.currency === 'INR' ? 'GST (3%)' : 'VAT\n(5%)';
      const tableHeaders = ['Product\nDescription', 'Qty', 'Gross\nWeight(gms)', 'Net\nWeight(gms)', 'Product\nPrice', 'Making\nCharges', 'Discount', vatHeader, 'Value'];
      const colWidths = [80, 30, 60, 60, 60, 60, 60, 50, 60];
      
      // Table header with gray background like preview
      doc.rect(margin, tableY, pageWidth - (margin * 2), 35)
         .fill('#E5E5E5')
         .stroke('#000000');

      let headerX = margin + 2;
      doc.fontSize(8)
         .font('Helvetica-Bold')
         .fillColor('#000000');
      
      tableHeaders.forEach((header, i) => {
        doc.text(header, headerX, tableY + 8, { width: colWidths[i] - 2, align: 'center' });
        headerX += colWidths[i];
      });

      currentY = tableY + 35;

      // Table rows
      doc.fontSize(7)
         .font('Helvetica');

      const currency = bill.currency === 'INR' ? 'Rs.' : 'BD';
      
      bill.items.forEach((item, index) => {
        const rowY = currentY;
        const rowHeight = 25;
        
        // Row background
        if (index % 2 === 1) {
          doc.rect(margin, rowY, pageWidth - (margin * 2), rowHeight)
             .fill('#F8F8F8');
        }
        
        // Row border
        doc.rect(margin, rowY, pageWidth - (margin * 2), rowHeight)
           .stroke('#000000');

        let cellX = margin + 3;
        doc.fillColor('#000000');
        
        // Product Description
        doc.text(item.productName, cellX, rowY + 8, { width: colWidths[0] - 2 });
        cellX += colWidths[0];
        
        // Purity
        doc.text('22K', cellX, rowY + 8, { width: colWidths[1] - 2, align: 'center' });
        cellX += colWidths[1];
        
        // Net Weight
        const netWeight = parseFloat(item.netWeight) || 5.0;
        doc.text(netWeight.toFixed(3), cellX, rowY + 8, { width: colWidths[2] - 2, align: 'center' });
        cellX += colWidths[2];
        
        // Gross Weight
        const grossWeight = parseFloat(item.grossWeight) || netWeight + 0.5;
        doc.text(grossWeight.toFixed(3), cellX, rowY + 8, { width: colWidths[3] - 2, align: 'center' });
        cellX += colWidths[3];
        
        // Product Price
        const rate = bill.currency === 'INR' ? parseFloat(item.priceInr) : parseFloat(item.priceBhd);
        doc.text(`${currency} ${rate.toFixed(2)}`, cellX, rowY + 8, { width: colWidths[4] - 2, align: 'right' });
        cellX += colWidths[4];
        
        // Making Charges
        const makingCharges = parseFloat(item.makingCharges) || 0;
        doc.text(`${currency} ${makingCharges.toFixed(2)}`, cellX, rowY + 8, { width: colWidths[5] - 2, align: 'right' });
        cellX += colWidths[5];
        
        // Discount
        const discount = parseFloat(item.discount) || 0;
        doc.text(`${currency} ${discount.toFixed(2)}`, cellX, rowY + 8, { width: colWidths[6] - 2, align: 'right' });
        cellX += colWidths[6];
        
        // Tax (GST for India, VAT for Bahrain)
        const tax = bill.currency === 'INR' ? parseFloat(item.sgst) + parseFloat(item.cgst) : parseFloat(item.vat);
        const taxLabel = bill.currency === 'INR' ? 'GST' : 'VAT';
        const taxPercentage = bill.currency === 'INR' ? '3' : '10';
        doc.text(`${taxLabel} (${taxPercentage}%)`, cellX, rowY + 8, { width: colWidths[7] - 2, align: 'center' });
        cellX += colWidths[7];
        
        // Total Amount
        doc.text(`${currency} ${parseFloat(item.total).toFixed(2)}`, cellX, rowY + 8, { width: colWidths[8] - 2, align: 'right' });

        currentY += rowHeight;
      });

      // Total row
      const totalRowY = currentY;
      doc.rect(margin, totalRowY, pageWidth - (margin * 2), 20)
         .fill('#E5E5E5')
         .stroke('#000000');

      doc.fontSize(8)
         .font('Helvetica-Bold')
         .text('Total', margin + 5, totalRowY + 8)
         .text(bill.items.length.toString(), margin + 120, totalRowY + 8, { align: 'center' })
         .text(parseFloat(bill.total).toFixed(2), pageWidth - 80, totalRowY + 8, { align: 'right' });

      currentY = totalRowY + 30;

      // Payment Details and Bill Summary - Two column layout like preview
      const summaryY = currentY + 10;
      const leftBoxWidth = (pageWidth - (margin * 2)) / 2 - 10;
      const rightBoxWidth = leftBoxWidth;
      const boxHeight = 100;
      
      // Left box - Payment Details
      doc.rect(margin, summaryY, leftBoxWidth, boxHeight)
         .stroke('#000000');
      
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text('Payment Details', margin + 5, summaryY + 5);
      
      // Payment details table
      doc.fontSize(8)
         .font('Helvetica-Bold')
         .text('Payment Mode', margin + 5, summaryY + 25)
         .text('Amount (BHD)', margin + 120, summaryY + 25);
      
      doc.font('Helvetica')
         .text(bill.paymentMethod || 'CASH', margin + 5, summaryY + 40)
         .text(`${currency}${parseFloat(bill.paidAmount).toFixed(2)}`, margin + 120, summaryY + 40);
      
      doc.font('Helvetica-Bold')
         .text('Total Amount Paid', margin + 5, summaryY + 60)
         .text(`${currency}${parseFloat(bill.paidAmount).toFixed(2)}`, margin + 120, summaryY + 60);
      
      // Right box - Bill Summary
      const rightBoxX = margin + leftBoxWidth + 20;
      doc.rect(rightBoxX, summaryY, rightBoxWidth, boxHeight)
         .stroke('#000000');
      
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text('Bill Summary', rightBoxX + 5, summaryY + 5);
      
      // Bill summary details
      const subtotal = parseFloat(bill.subtotal);
      const makingCharges = parseFloat(bill.makingCharges);
      const discount = parseFloat(bill.discount) || 0;
      const gst = parseFloat(bill.gst) || 0;
      const vat = parseFloat(bill.vat) || 0;
      const taxAmount = bill.currency === 'INR' ? gst : vat;
      
      doc.fontSize(8)
         .font('Helvetica')
         .text('Subtotal:', rightBoxX + 5, summaryY + 25)
         .text(`${currency}${subtotal.toFixed(2)}`, rightBoxX + rightBoxWidth - 60, summaryY + 25, { align: 'right' })
         .text('Making Charges:', rightBoxX + 5, summaryY + 38)
         .text(`${currency}${makingCharges.toFixed(2)}`, rightBoxX + rightBoxWidth - 60, summaryY + 38, { align: 'right' })
         .text(bill.currency === 'BHD' ? 'VAT:' : 'GST:', rightBoxX + 5, summaryY + 51)
         .text(`${currency}${taxAmount.toFixed(2)}`, rightBoxX + rightBoxWidth - 60, summaryY + 51, { align: 'right' })
         .text('Discount:', rightBoxX + 5, summaryY + 64)
         .text(`${currency}${discount.toFixed(2)}`, rightBoxX + rightBoxWidth - 60, summaryY + 64, { align: 'right' });
      
      doc.font('Helvetica-Bold')
         .text('Total Amount:', rightBoxX + 5, summaryY + 77)
         .text(`${currency}${parseFloat(bill.total).toFixed(2)}`, rightBoxX + rightBoxWidth - 60, summaryY + 77, { align: 'right' });

      currentY = summaryY + boxHeight + 10;

      // Amount in words section - matching preview
      doc.fontSize(8)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text('Amount in Words:', margin + 5, currentY + 10);
      
      const total = parseFloat(bill.total);
      const amountInWords = bill.currency === 'INR' 
        ? `Rupees ${Math.floor(total)} and ${Math.round((total - Math.floor(total)) * 100)} Paise Only`
        : `Bahrain Dinars ${Math.floor(total)} and ${Math.round((total - Math.floor(total)) * 1000)} Fils Only`;
      
      doc.font('Helvetica')
         .text(amountInWords, margin + 90, currentY + 10);

      currentY += 40;

      // Final total amount section - exactly matching preview style
      const totalSectionY = currentY;
      const totalBoxWidth = pageWidth - (margin * 2);
      const totalBoxHeight = 30;
      
      // Black background box with yellow text - matching preview
      doc.rect(margin, totalSectionY, totalBoxWidth, totalBoxHeight)
         .fill('#000000')
         .stroke('#000000');

      // Left side - "TOTAL AMOUNT TO BE PAID:"
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#FFD700')
         .text('TOTAL AMOUNT TO BE PAID:', margin + 10, totalSectionY + 8);
      
      // Right side - Amount
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#FFD700')
         .text(`${currency} ${parseFloat(bill.total).toFixed(2)}`, pageWidth - 120, totalSectionY + 8, { 
           align: 'right',
           width: 100
         });

      currentY = totalSectionY + totalBoxHeight + 20;

      currentY += 20;

      // Footer text - matching preview exactly
      doc.fontSize(8)
         .font('Helvetica')
         .fillColor('#666666')
         .text('This is a computer-generated bill.No signature required', 0, currentY, { 
           align: 'center', 
           width: pageWidth 
         })
         .text('Thank you for shopping with Palaniappa Jewellery!', 0, currentY + 15, { 
           align: 'center', 
           width: pageWidth 
         });

      doc.end();
    } catch (error) {
      console.error('PDF generation error:', error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, currency = 'inr', items } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * (currency === 'bhd' ? 1000 : 100)), // Convert to minor units
        currency: currency.toLowerCase(),
        metadata: {
          integration_check: 'accept_a_payment',
          items: JSON.stringify(items || [])
        },
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error('Stripe payment intent error:', error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Orders routes (for e-commerce checkout)
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = req.body;
      
      // Generate order number
      const orderCount = (await storage.getAllBills()).length; // Reuse bill count for now
      const date = new Date();
      const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
      const orderNumber = `ORD/${formattedDate}-${String(orderCount + 1).padStart(3, '0')}`;

      // For now, create as a bill since we haven't migrated the schema yet
      const bill = await storage.createBill({
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        customerAddress: orderData.customerAddress,
        currency: orderData.currency || 'INR',
        subtotal: orderData.subtotal.toString(),
        makingCharges: (orderData.makingCharges || 0).toString(),
        gst: (orderData.gst || 0).toString(),
        vat: (orderData.vat || 0).toString(),
        discount: (orderData.discount || 0).toString(),
        total: orderData.total.toString(),
        paidAmount: orderData.paidAmount.toString(),
        paymentMethod: orderData.paymentMethod || 'CASH',
        items: orderData.items || [],
      });

      res.status(201).json({
        orderNumber: bill.billNumber,
        ...bill
      });
    } catch (error: any) {
      console.error("Order creation error:", error);
      res.status(400).json({
        message: "Failed to create order",
        details: error.message
      });
    }
  });

  // Metal rates API routes
  app.get("/api/metal-rates", async (req, res) => {
    try {
      const { market } = req.query;
      const rates = await MetalRatesService.getLatestRates(
        market as "INDIA" | "BAHRAIN" | undefined
      );
      
      res.json(rates);
    } catch (error: any) {
      console.error("Error fetching metal rates:", error);
      res.status(500).json({ 
        message: "Failed to fetch metal rates",
        error: error.message 
      });
    }
  });

  // Force update metal rates (admin only)
  app.post("/api/metal-rates/update", authenticateToken, requireAdmin, async (req, res) => {
    try {
      await MetalRatesService.fetchLiveRates();
      const rates = await MetalRatesService.getLatestRates();
      
      res.json({ 
        message: "Metal rates updated successfully", 
        rates 
      });
    } catch (error: any) {
      console.error("Error updating metal rates:", error);
      res.status(500).json({ 
        message: "Failed to update metal rates",
        error: error.message 
      });
    }
  });

  // Estimates routes
  app.get('/api/estimates', authenticateToken, async (req, res) => {
    try {
      const estimatesList = await storage.getAllEstimates();
      res.json(estimatesList);
    } catch (error) {
      console.error('Error fetching estimates:', error);
      res.status(500).json({ error: 'Failed to fetch estimates' });
    }
  });

  app.post('/api/estimates', authenticateToken, async (req, res) => {
    try {
      const estimate = await storage.createEstimate(req.body);
      res.status(201).json(estimate);
    } catch (error) {
      console.error('Error creating estimate:', error);
      res.status(500).json({ error: 'Failed to create estimate' });
    }
  });

  app.get('/api/estimates/:id', authenticateToken, async (req, res) => {
    try {
      const estimateId = req.params.id;
      const estimate = await storage.getEstimate(estimateId);
      
      if (!estimate) {
        return res.status(404).json({ error: 'Estimate not found' });
      }

      res.json(estimate);
    } catch (error) {
      console.error('Error fetching estimate:', error);
      res.status(500).json({ error: 'Failed to fetch estimate' });
    }
  });

  // Send estimate to WhatsApp
  app.post('/api/estimates/:id/send-whatsapp', authenticateToken, async (req, res) => {
    try {
      const estimateId = req.params.id;
      const estimate = await storage.getEstimate(estimateId);
      
      if (!estimate) {
        return res.status(404).json({ error: 'Estimate not found' });
      }
      
      // Format WhatsApp message
      const message = `*JEWELLERY QUOTATION*
*PALANIAPPA JEWELLERS*

*Quotation No:* ${estimate.quotationNo}
*Date:* ${estimate.createdAt?.toLocaleDateString()}
*Customer:* ${estimate.customerName}

*PRODUCT DETAILS*
*Product Name:* ${estimate.productName}
*Category:* ${estimate.category}
*Purity:* ${estimate.purity}
*Gross Weight:* ${estimate.grossWeight}g
*Net Weight:* ${estimate.netWeight}g
*Product Code:* ${estimate.productCode}

*PRICE ESTIMATION*
*Metal Value:* ₹${parseFloat(estimate.metalValue).toLocaleString('en-IN')}
*Making Charges (${estimate.makingChargesPercentage}%):* ₹${parseFloat(estimate.makingCharges).toLocaleString('en-IN')}
*Stone/Diamond Charges (${estimate.stoneDiamondChargesPercentage}%):* ₹${parseFloat(estimate.stoneDiamondCharges || '0').toLocaleString('en-IN')}
*Wastage (${estimate.wastagePercentage}%):* ₹${parseFloat(estimate.wastageCharges).toLocaleString('en-IN')}
*Hallmarking:* ₹${parseFloat(estimate.hallmarkingCharges || '450').toLocaleString('en-IN')}
*Subtotal:* ₹${parseFloat(estimate.subtotal).toLocaleString('en-IN')}

*TAX DETAILS*
*GST (3%):* ₹${Math.round((parseFloat(estimate.subtotal) * 3) / 100).toLocaleString('en-IN')}
*VAT (0%):* ₹0

*TOTAL AMOUNT: ₹${parseFloat(estimate.totalAmount).toLocaleString('en-IN')}*

*Valid Until:* ${estimate.validUntil.toLocaleDateString()}

Thank you for choosing Palaniappa Jewellers!`;

      const whatsappUrl = `https://wa.me/${estimate.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      
      // Mark as sent to WhatsApp
      await storage.updateEstimate(estimateId, { sentToWhatsApp: true });

      res.json({ whatsappUrl, message });
    } catch (error) {
      console.error('Error sending to WhatsApp:', error);
      res.status(500).json({ error: 'Failed to send to WhatsApp' });
    }
  });

  // Static file serving for uploads
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  });

  const httpServer = createServer(app);
  return httpServer;
}
