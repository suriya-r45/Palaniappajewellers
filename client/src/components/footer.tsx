// import { openWhatsAppGeneral } from '@/lib/whatsapp';
import { MessageCircle, Phone, Mail, MapPin } from 'lucide-react';
import logoPath from '@assets/1000284180_1755240849891.jpg';


export default function Footer() {
  return (
    <footer className="bg-white text-black py-12 border-t-2 border-black" data-testid="footer-main">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-black">
                <img
                  src={logoPath}
                  alt="Palaniappa Jewellers Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black">PALANIAPPA JEWELLERS</h3>
                <p className="text-xs text-black opacity-70">Since 2025</p>
              </div>
            </div>
            <p className="text-sm text-black opacity-80">
              Premium jewelry crafted with precision and elegance for discerning customers worldwide.
            </p>
          </div>

          {/* <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors" data-testid="link-footer-home">Home</a></li>
              <li><a href="#products" className="text-gray-400 hover:text-white transition-colors" data-testid="link-footer-products">Products</a></li>
              <li><a href="#about" className="text-gray-400 hover:text-white transition-colors" data-testid="link-footer-about">About Us</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors" data-testid="link-footer-contact">Contact</a></li>
            </ul>
          </div> */}

          <div>
            <h4 className="text-lg font-semibold mb-4 text-black">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-black opacity-80 hover:opacity-100 transition-opacity" data-testid="link-category-gold">Gold Jewelry</a></li>
              <li><a href="#" className="text-black opacity-80 hover:opacity-100 transition-opacity" data-testid="link-category-diamond">Diamond Jewelry</a></li>
              <li><a href="#" className="text-black opacity-80 hover:opacity-100 transition-opacity" data-testid="link-category-silver">Silver Jewelry</a></li>
              <li><a href="#" className="text-black opacity-80 hover:opacity-100 transition-opacity" data-testid="link-category-custom">Custom Designs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-black">Contact Info</h4>
            <div className="space-y-2 text-sm text-black">
              <p className="flex items-center space-x-2" data-testid="text-phone">
                <Phone className="h-4 w-4 text-black" />
                <span>+919597201554</span>
              </p>
              <p className="flex items-center space-x-2" data-testid="text-email">
                <Mail className="h-4 w-4 text-black" />
                <span>jewelerypalaniappa@gmail.com</span>
              </p>
              {/* <p className="flex items-center space-x-2" data-testid="text-address">
                <MapPin className="h-4 w-4" />
                <span>123 Jewelry Street, Chennai</span>
              </p> */}
              {/* <div className="flex space-x-4 mt-4">
                <button 
                  onClick={openWhatsAppGeneral}
                  className="text-green-500 hover:text-green-400 transition-colors"
                  data-testid="button-whatsapp-footer"
                >
                  <MessageCircle className="h-5 w-5" />
                </button>
              </div> */}
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-black">Locations</h4>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-black">India</h4>
                <p className="text-sm text-black opacity-80">Salem, Tamil Nadu</p>
              </div>
              <div>
                <h4 className="font-medium text-black">Bahrain</h4>
                <p className="text-sm text-black opacity-80">Gold City, Manama</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 text-center text-sm border-t-2 border-black text-black">
          <p>&copy; 2025 Palaniappa Jewellers. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
