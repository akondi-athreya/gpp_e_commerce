import { getServerSession } from "next-auth/next";
import { z } from "zod";
import prisma from "../../../lib/prisma";
import { authOptions } from "../auth/[...nextauth]";

const addSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
});

const removeSchema = z.object({
  productId: z.string().min(1),
});

async function getUserFromSession(session) {
  if (!session?.user?.email) {
    return null;
  }

  return prisma.user.findUnique({
    where: { email: session.user.email },
  });
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await getUserFromSession(session);

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      const newCart = await prisma.cart.create({
        data: {
          userId: user.id,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      return res.status(200).json(newCart);
    }

    return res.status(200).json(cart);
  }

  if (req.method === "POST") {
    const parsed = addSchema.safeParse(req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.issues.map((issue) => issue.message).join(", ") });
    }

    const { productId, quantity } = parsed.data;

    const cart = await prisma.cart.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
      },
      update: {},
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      create: {
        cartId: cart.id,
        productId,
        quantity,
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return res.status(200).json(updatedCart);
  }

  if (req.method === "DELETE") {
    const parsed = removeSchema.safeParse(req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.issues.map((issue) => issue.message).join(", ") });
    }

    const { productId } = parsed.data;

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });

    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return res.status(200).json(updatedCart);
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
