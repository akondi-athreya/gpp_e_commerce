import Link from "next/link";
import AddToCartButton from "./AddToCartButton";

export default function ProductCard({ product }) {
  return (
    <div
      data-testid={`product-card-${product.id}`}
      className="flex flex-col rounded-lg border bg-white p-4 shadow-sm"
    >
      <Link href={`/products/${product.id}`} className="space-y-3">
        <div className="aspect-4/3 overflow-hidden rounded-lg bg-gray-100">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-sm text-gray-600">${product.price.toFixed(2)}</p>
        </div>
      </Link>
      <div className="mt-4">
        <AddToCartButton
          productId={product.id}
          testId={`add-to-cart-button-${product.id}`}
          className="w-full"
        />
      </div>
    </div>
  );
}
