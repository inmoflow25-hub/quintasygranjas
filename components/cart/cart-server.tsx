import Cart from "@/components/cart/cart"
import { getActiveProducts } from "@/lib/products"

export const dynamic = "force-dynamic"

export default async function CartServer() {
  const products = await getActiveProducts()

  return <Cart products={products} />
}
