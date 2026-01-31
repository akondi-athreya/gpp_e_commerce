import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCart = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/cart");
      if (response.ok) {
        const data = await response.json();
        setCart(data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleRemove = async (productId) => {
    await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    loadCart();
  };

  const handleQuantityChange = async (productId, quantity) => {
    const parsed = Number(quantity);
    if (!Number.isInteger(parsed) || parsed < 1) {
      return;
    }
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: parsed }),
    });
    loadCart();
  };

  const total = useMemo(() => {
    if (!cart?.items?.length) {
      return 0;
    }

    return cart.items.reduce(
      (sum, item) => sum + item.quantity * Number(item.product.price),
      0
    );
  }, [cart]);

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Your cart</h1>

        {isLoading ? (
          <p className="text-sm text-gray-500">Loading cart...</p>
        ) : cart?.items?.length ? (
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                data-testid={`cart-item-${item.productId}`}
                className="flex flex-col gap-4 rounded-lg border bg-white p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="h-20 w-20 rounded object-cover"
                  />
                  <div>
                    <p className="text-lg font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-600">
                      ${Number(item.product.price).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    defaultValue={item.quantity}
                    onBlur={(event) =>
                      handleQuantityChange(item.productId, event.target.value)
                    }
                    data-testid={`quantity-input-${item.productId}`}
                    className="w-20 rounded border border-gray-200 px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemove(item.productId)}
                    data-testid={`remove-item-button-${item.productId}`}
                    className="rounded border border-gray-300 px-3 py-1 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Your cart is empty.</p>
        )}

        <div className="rounded-lg border bg-white p-4">
          <p className="text-lg font-semibold" data-testid="cart-total">
            Total: ${total.toFixed(2)}
          </p>
        </div>
      </div>
    </Layout>
  );
}
