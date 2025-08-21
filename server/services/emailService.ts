import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static readonly FROM_EMAIL = "jewelerypalaniappa@gmail.com"; // Your verified sender email
  private static readonly COMPANY_NAME = "Palaniappa Jewellers";

  static async sendEmail(params: EmailParams): Promise<boolean> {
    try {
      await sgMail.send({
        to: params.to,
        from: {
          email: this.FROM_EMAIL,
          name: this.COMPANY_NAME
        },
        subject: params.subject,
        html: params.html,
        text: params.text || params.html.replace(/<[^>]*>/g, '') // Strip HTML for text version
      });
      
      console.log(`[Email Sent] ${params.subject} to ${params.to}`);
      return true;
    } catch (error) {
      console.error(`[Email Error] Failed to send email to ${params.to}:`, error);
      return false;
    }
  }

  static async sendOrderConfirmation(orderData: {
    customerName: string;
    customerEmail: string;
    orderNumber: string;
    total: string;
    currency: string;
    items: any[];
    customerPhone: string;
    customerAddress: string;
  }): Promise<boolean> {
    const currencySymbol = orderData.currency === 'INR' ? '₹' : 'BD';
    
    const itemsHtml = orderData.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.productName}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${currencySymbol} ${parseFloat(item.total).toLocaleString()}</td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation - ${this.COMPANY_NAME}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #C08C6A 0%, #E3C7AF 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✨ Order Confirmed!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Thank you for choosing ${this.COMPANY_NAME}</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none;">
          <h2 style="color: #C08C6A; margin-top: 0;">Hello ${orderData.customerName}!</h2>
          
          <p>We're excited to confirm that your order has been received and is being processed. Here are your order details:</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #C08C6A;">Order Details</h3>
            <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
            <p><strong>Total Amount:</strong> ${currencySymbol} ${parseFloat(orderData.total).toLocaleString()}</p>
            <p><strong>Phone:</strong> ${orderData.customerPhone}</p>
            <p><strong>Delivery Address:</strong> ${orderData.customerAddress}</p>
          </div>
          
          <h3 style="color: #C08C6A;">Items Ordered</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #C08C6A; color: white;">
                <th style="padding: 12px; text-align: left;">Product</th>
                <th style="padding: 12px; text-align: center;">Quantity</th>
                <th style="padding: 12px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #C08C6A;">What happens next?</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Our team will process your order within 1-2 business days</li>
              <li>You'll receive a shipping confirmation email once your order is dispatched</li>
              <li>Our customer service team will contact you if we need any additional information</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p>Need help? Contact us:</p>
            <p>
              📞 <strong>+919597201554</strong><br>
              📧 <strong>jewelerypalaniappa@gmail.com</strong><br>
              💬 <a href="https://wa.me/919597201554" style="color: #C08C6A;">WhatsApp Support</a>
            </p>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 14px;">
            <p><strong>${this.COMPANY_NAME}</strong> - Since 2025</p>
            <p>Where every jewel is crafted for elegance that lasts generations.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: orderData.customerEmail,
      subject: `Order Confirmation - ${orderData.orderNumber} | ${this.COMPANY_NAME}`,
      html: emailHtml
    });
  }

  static async sendShippingNotification(orderData: {
    customerName: string;
    customerEmail: string;
    orderNumber: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
  }): Promise<boolean> {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your Order is on the Way! - ${this.COMPANY_NAME}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📦 Your Order is Shipped!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your precious jewelry is on its way</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none;">
          <h2 style="color: #4CAF50; margin-top: 0;">Hello ${orderData.customerName}!</h2>
          
          <p>Great news! Your order has been shipped and is on its way to you.</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #4CAF50;">Shipping Details</h3>
            <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
            ${orderData.trackingNumber ? `<p><strong>Tracking Number:</strong> ${orderData.trackingNumber}</p>` : ''}
            ${orderData.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${orderData.estimatedDelivery}</p>` : ''}
          </div>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #4CAF50;">Delivery Information</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Your package is carefully secured and insured</li>
              <li>A signature will be required upon delivery</li>
              <li>If you're not available, we'll attempt delivery the next business day</li>
              <li>Please ensure someone is available to receive the package</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p>Questions about your delivery?</p>
            <p>
              📞 <strong>+919597201554</strong><br>
              📧 <strong>jewelerypalaniappa@gmail.com</strong><br>
              💬 <a href="https://wa.me/919597201554" style="color: #4CAF50;">WhatsApp Support</a>
            </p>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 14px;">
            <p><strong>${this.COMPANY_NAME}</strong> - Since 2025</p>
            <p>Where every jewel is crafted for elegance that lasts generations.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: orderData.customerEmail,
      subject: `Your Order is Shipped - ${orderData.orderNumber} | ${this.COMPANY_NAME}`,
      html: emailHtml
    });
  }

  static async sendWelcomeEmail(userData: {
    customerName: string;
    customerEmail: string;
  }): Promise<boolean> {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to ${this.COMPANY_NAME}!</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #C08C6A 0%, #E3C7AF 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 32px;">✨ Welcome to ${this.COMPANY_NAME}!</h1>
          <p style="color: white; margin: 15px 0 0 0; font-size: 18px;">Where every jewel is crafted for elegance that lasts generations</p>
        </div>
        
        <div style="background: white; padding: 40px; border: 1px solid #ddd; border-top: none;">
          <h2 style="color: #C08C6A; margin-top: 0; font-size: 24px;">Hello ${userData.customerName}!</h2>
          
          <p style="font-size: 16px; margin-bottom: 25px;">
            Thank you for joining the ${this.COMPANY_NAME} family! We're delighted to have you as part of our legacy of fine jewelry craftsmanship.
          </p>
          
          <div style="background: #f9f6f3; padding: 30px; border-radius: 10px; margin: 30px 0; border-left: 5px solid #C08C6A;">
            <h3 style="margin-top: 0; color: #C08C6A; font-size: 20px;">🎁 Special Welcome Benefits</h3>
            <ul style="margin: 0; padding-left: 20px; font-size: 15px;">
              <li style="margin-bottom: 10px;">Exclusive access to new collections before anyone else</li>
              <li style="margin-bottom: 10px;">Personalized jewelry recommendations based on your preferences</li>
              <li style="margin-bottom: 10px;">Priority customer support via WhatsApp and email</li>
              <li style="margin-bottom: 10px;">Special member pricing on select premium pieces</li>
              <li>Complimentary jewelry care and maintenance tips</li>
            </ul>
          </div>
          
          <div style="background: #fff8f0; padding: 25px; border-radius: 10px; margin: 30px 0;">
            <h3 style="margin-top: 0; color: #C08C6A; font-size: 18px;">✨ Discover Our Collections</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 15px;">
              <div style="flex: 1; min-width: 120px; text-align: center; padding: 15px; background: white; border-radius: 8px;">
                <div style="font-size: 24px; margin-bottom: 5px;">💍</div>
                <strong style="color: #C08C6A;">Rings</strong>
              </div>
              <div style="flex: 1; min-width: 120px; text-align: center; padding: 15px; background: white; border-radius: 8px;">
                <div style="font-size: 24px; margin-bottom: 5px;">📿</div>
                <strong style="color: #C08C6A;">Necklaces</strong>
              </div>
              <div style="flex: 1; min-width: 120px; text-align: center; padding: 15px; background: white; border-radius: 8px;">
                <div style="font-size: 24px; margin-bottom: 5px;">💎</div>
                <strong style="color: #C08C6A;">Earrings</strong>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 35px 0; padding: 25px; background: #f0f8ff; border-radius: 10px;">
            <h3 style="margin-top: 0; color: #C08C6A;">Ready to explore our collection?</h3>
            <a href="${process.env.FRONTEND_URL || 'https://your-jewelry-store.com'}" 
               style="display: inline-block; background: #C08C6A; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; margin-top: 10px;">
              Browse Our Jewelry
            </a>
          </div>
          
          <div style="text-align: center; margin: 30px 0; padding: 20px; border: 2px dashed #C08C6A; border-radius: 10px;">
            <h4 style="margin-top: 0; color: #C08C6A;">Need Help? We're Here for You!</h4>
            <p style="margin: 10px 0;">
              📞 <strong>+919597201554</strong><br>
              📧 <strong>jewelerypalaniappa@gmail.com</strong><br>
              💬 <a href="https://wa.me/919597201554" style="color: #C08C6A; text-decoration: none;">WhatsApp Support</a>
            </p>
            <p style="font-size: 14px; color: #666; margin-top: 15px;">
              Our jewelry experts are available to help you find the perfect piece for every occasion.
            </p>
          </div>
          
          <div style="border-top: 2px solid #eee; padding-top: 25px; text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 5px 0;"><strong>${this.COMPANY_NAME}</strong> - Since 2025</p>
            <p style="margin: 5px 0; font-style: italic;">"Where every jewel is crafted for elegance that lasts generations"</p>
            <p style="margin: 15px 0 5px 0; font-size: 12px; color: #888;">
              You're receiving this email because you created an account with us. 
              We're excited to have you as part of our jewelry family!
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: userData.customerEmail,
      subject: `Welcome to ${this.COMPANY_NAME} - Your Journey in Fine Jewelry Begins! ✨`,
      html: emailHtml
    });
  }

  static async sendBillConfirmation(billData: {
    customerName: string;
    customerEmail: string;
    billNumber: string;
    total: string;
    currency: string;
    items: any[];
    customerPhone: string;
    customerAddress: string;
  }): Promise<boolean> {
    const currencySymbol = billData.currency === 'INR' ? '₹' : 'BD';
    
    const itemsHtml = billData.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.productName}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${currencySymbol} ${parseFloat(item.total).toLocaleString()}</td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bill Generated - ${this.COMPANY_NAME}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #C08C6A 0%, #E3C7AF 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📄 Bill Generated</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">${this.COMPANY_NAME}</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none;">
          <h2 style="color: #C08C6A; margin-top: 0;">Hello ${billData.customerName}!</h2>
          
          <p>Your bill has been generated. Here are the details:</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #C08C6A;">Bill Details</h3>
            <p><strong>Bill Number:</strong> ${billData.billNumber}</p>
            <p><strong>Total Amount:</strong> ${currencySymbol} ${parseFloat(billData.total).toLocaleString()}</p>
            <p><strong>Phone:</strong> ${billData.customerPhone}</p>
            <p><strong>Address:</strong> ${billData.customerAddress}</p>
          </div>
          
          <h3 style="color: #C08C6A;">Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #C08C6A; color: white;">
                <th style="padding: 12px; text-align: left;">Product</th>
                <th style="padding: 12px; text-align: center;">Quantity</th>
                <th style="padding: 12px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="text-align: center; margin: 30px 0;">
            <p>Need assistance? Contact us:</p>
            <p>
              📞 <strong>+919597201554</strong><br>
              📧 <strong>jewelerypalaniappa@gmail.com</strong><br>
              💬 <a href="https://wa.me/919597201554" style="color: #C08C6A;">WhatsApp Support</a>
            </p>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 14px;">
            <p><strong>${this.COMPANY_NAME}</strong> - Since 2025</p>
            <p>Where every jewel is crafted for elegance that lasts generations.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: billData.customerEmail,
      subject: `Bill Generated - ${billData.billNumber} | ${this.COMPANY_NAME}`,
      html: emailHtml
    });
  }
}