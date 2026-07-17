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
      <button className="w-full bg-surface-container text-on-surface-variant font-semibold text-sm py-3.5 rounded-xl cursor-not-allowed" disabled>
        Out of Stock
      </button>
    );
  }

  return (
    <button
      className="w-full bg-primary text-white font-semibold text-sm py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-[0_8px_20px_rgba(4,120,87,0.25)] flex items-center justify-center gap-2"
      onClick={handleAdd}
    >
      <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
      Add to Cart
    </button>
  );
}
