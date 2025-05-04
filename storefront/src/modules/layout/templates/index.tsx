import React from "react"

import Footer from "@modules/layout/templates/footer"
import { NavigationHeader } from "@modules/layout/templates/nav"
import { retrieveCustomer } from "@lib/data/customer"
import { retrieveCart } from "@lib/data/cart"
import { StoreFreeShippingPrice } from "@starter/types/shipping-option/http"
import { listCategories } from "@lib/data/categories"
import { listCartFreeShippingPrices } from "@lib/data/fulfillment"

const Layout: React.FC<{
  children: React.ReactNode
}> = async ({ children }) => {
  const customer = await retrieveCustomer().catch(() => null)
  const cart = await retrieveCart().catch(() => null)
  let freeShippingPrices: StoreFreeShippingPrice[] = []
  const categories = await listCategories().catch(() => [])

  if (cart) {
    freeShippingPrices = await listCartFreeShippingPrices(cart.id)
  }
  return (
    <div>
      <NavigationHeader
        customer={customer}
        cart={cart}
        categories={categories}
        freeShippingPrices={freeShippingPrices}
      />
      <main className="relative">{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
