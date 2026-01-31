import Layout from "../../components/Layout";
import AddToCartButton from "../../components/AddToCartButton";
import prisma from "../../lib/prisma";

export async function getServerSideProps(context) {
  const { id } = context.params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    return { notFound: true };
  }

  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        imageUrl: product.imageUrl,
      },
    },
  };
}

export default function ProductDetail({ product }) {
  return (
    <Layout>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="aspect-4/3 overflow-hidden rounded-lg bg-gray-100">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="space-y-4">
          <h1 data-testid="product-name" className="text-3xl font-semibold">
            {product.name}
          </h1>
          <p data-testid="product-price" className="text-xl text-gray-700">
            ${product.price.toFixed(2)}
          </p>
          <p
            data-testid="product-description"
            className="text-sm leading-relaxed text-gray-600"
          >
            {product.description}
          </p>
          <AddToCartButton
            productId={product.id}
            testId="add-to-cart-button"
          />
        </div>
      </div>
    </Layout>
  );
}
