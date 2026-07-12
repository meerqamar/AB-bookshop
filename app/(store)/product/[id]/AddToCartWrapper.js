'use client';
import { useCart } from '@/components/CartProvider';
import { useToast } from '@/components/Toast';

export default function AddToCartWrapper({ product }) {
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const handleAdd = () => {
    addToCart(product.id, 1);
    addToast(`${product.title} added to cart!`, 'success');
  };

  if (product.in_stock === false) {
    return (
      <button className="w-full bg-surface-variant text-on-surface-variant font-label-md text-label-md py-md rounded-lg cursor-not-allowed shadow-none" disabled>
        Out of Stock
      </button>
    );
  }

  return (
    <button className="w-full bg-primary text-on-primary font-label-md text-label-md py-md rounded-lg hover:opacity-90 transition-opacity btn-focus shadow-lg flex items-center justify-center gap-2" onClick={handleAdd}>
      Add to Cart
    </button>
  );
}
