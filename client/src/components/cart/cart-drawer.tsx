import { X, Plus, Minus, ShoppingBag, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/currency";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, totalItems, totalAmount, updateQuantity, removeFromCart, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleCheckout = () => {
    onClose();
    setLocation("/checkout");
  };

  const handleViewCart = () => {
    onClose();
    setLocation("/cart");
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
      {/* Full Screen Overlay */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 9999
        }}
        onClick={onClose}
        data-testid="cart-backdrop"
      />
      
      {/* Drawer Content */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          right: window.innerWidth <= 768 ? 0 : 0,
          left: window.innerWidth <= 768 ? 0 : 'auto',
          height: '100vh',
          width: window.innerWidth <= 768 ? '100vw' : '384px',
          maxWidth: '100vw',
          zIndex: 10000,
          background: '#ffffff',
          backgroundColor: '#ffffff',
          backgroundImage: 'none',
          display: 'flex',
          flexDirection: 'column',
          opacity: 1,
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          boxShadow: window.innerWidth <= 768 ? 'none' : '-10px 0 30px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{ 
            backgroundColor: '#ffffff',
            background: '#ffffff',
            backgroundImage: 'none',
            opacity: 1,
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none'
          }}
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({totalItems})
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            data-testid="button-close-cart"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Cart Items */}
        <div 
          className="flex-1 overflow-y-auto p-4"
          style={{ 
            backgroundColor: '#ffffff',
            background: '#ffffff',
            backgroundImage: 'none',
            opacity: 1,
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none'
          }}
        >
          {items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500" data-testid="text-empty-cart">
                Your cart is empty
              </p>
            </div>
          ) : (
            <div 
              className="space-y-4"
              style={{
                backgroundColor: '#ffffff',
                background: '#ffffff',
                backgroundImage: 'none',
                opacity: 1
              }}
            >
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                  style={{
                    backgroundColor: '#ffffff',
                    background: '#ffffff',
                    backgroundImage: 'none',
                    opacity: 1
                  }}
                  data-testid={`cart-item-${item.product.id}`}
                >
                  <img
                    src={item.product.images[0] || "https://images.unsplash.com/photo-1603561596112-db2eca6c9df4?w=100"}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate" data-testid={`cart-item-name-${item.product.id}`}>
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-gray-500" data-testid={`cart-item-price-${item.product.id}`}>
                      {formatPrice(parseFloat(item.product.priceInr), 'INR')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      data-testid={`button-decrease-cart-${item.product.id}`}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    
                    <span className="w-8 text-center text-sm font-medium" data-testid={`cart-quantity-${item.product.id}`}>
                      {item.quantity}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      data-testid={`button-increase-cart-${item.product.id}`}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-500 hover:text-red-700"
                      data-testid={`button-remove-cart-${item.product.id}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div 
            className="border-t p-4 space-y-4"
            style={{ 
              backgroundColor: '#ffffff',
              background: '#ffffff',
              backgroundImage: 'none',
              opacity: 1,
              backdropFilter: 'none',
              WebkitBackdropFilter: 'none'
            }}
          >
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total:</span>
              <span data-testid="cart-total">
                {formatPrice(totalAmount, 'INR')}
              </span>
            </div>
            
            <div className="space-y-2">
              <Button
                onClick={handleViewCart}
                className="w-full"
                data-testid="button-view-cart"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                View Cart
              </Button>
              
              <Button
                onClick={handleCheckout}
                className="w-full"
                variant="outline"
                data-testid="button-checkout"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Quick Checkout
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}