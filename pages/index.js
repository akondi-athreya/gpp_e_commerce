import Link from "next/link";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";
import prisma from "../lib/prisma";

const PRODUCTS_PER_PAGE = 12;

export async function getServerSideProps(context) {
  const { q = "", page = "1" } = context.query;
  const pageNumber = Math.max(parseInt(Array.isArray(page) ? page[0] : page, 10) || 1, 1);
  const searchTerm = Array.isArray(q) ? q[0] : q;

  const where = searchTerm
    ? {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
        ],
      }
    : {};

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (pageNumber - 1) * PRODUCTS_PER_PAGE,
      take: PRODUCTS_PER_PAGE,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    props: {
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        imageUrl: product.imageUrl,
      })),
      pageNumber,
      totalPages: Math.max(Math.ceil(totalCount / PRODUCTS_PER_PAGE), 1),
      searchTerm,
    },
  };
}

export default function Home({ products, pageNumber, totalPages, searchTerm }) {
  const nextPage = pageNumber + 1;
  const prevPage = pageNumber - 1;

  const buildQuery = (page) => {
    const params = new URLSearchParams();
    if (searchTerm) {
      params.set("q", searchTerm);
    }
    if (page > 1) {
      params.set("page", String(page));
    }
    const queryString = params.toString();
    return queryString ? `/?${queryString}` : "/";
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Product catalog</h1>
          <p className="text-sm text-gray-600">
            Browse our latest drops and find the perfect fit.
          </p>
        </div>

        <form method="get" className="flex flex-wrap gap-3">
          <input
            type="text"
            name="q"
            defaultValue={searchTerm}
            placeholder="Search products"
            data-testid="search-input"
            className="w-full max-w-md rounded border border-gray-200 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            data-testid="search-button"
            className="rounded bg-gray-900 px-4 py-2 text-sm text-white"
          >
            Search
          </button>
        </form>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="flex items-center justify-between">
          {pageNumber > 1 ? (
            <Link
              href={buildQuery(prevPage)}
              data-testid="pagination-prev"
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            >
              Previous
            </Link>
          ) : (
            <button
              type="button"
              data-testid="pagination-prev"
              className="rounded border border-gray-200 px-3 py-2 text-sm text-gray-400"
              disabled
            >
              Previous
            </button>
          )}

          <p className="text-sm text-gray-600">
            Page {pageNumber} of {totalPages}
          </p>

          {pageNumber < totalPages ? (
            <Link
              href={buildQuery(nextPage)}
              data-testid="pagination-next"
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            >
              Next
            </Link>
          ) : (
            <button
              type="button"
              data-testid="pagination-next"
              className="rounded border border-gray-200 px-3 py-2 text-sm text-gray-400"
              disabled
            >
              Next
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}
