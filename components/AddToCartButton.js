import { useState } from "react";

export default function AddToCartButton({
  productId,
  className = "",
  testId,
  quantity = 1,
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity }),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      data-testid={testId}
      className={`rounded bg-blue-600 px-3 py-2 text-sm text-white ${className}`}
      disabled={isLoading}
    >
      {isLoading ? "Adding..." : "Add to cart"}
    </button>
  );
}
