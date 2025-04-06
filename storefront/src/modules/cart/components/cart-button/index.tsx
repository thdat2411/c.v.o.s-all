import { CartProvider } from "@lib/context/cart-context"
import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { listCartFreeShippingPrices } from "@lib/data/fulfillment"
import { StoreFreeShippingPrice } from "@starter/types/shipping-option/http"
import CartDrawer from "../cart-drawer"
import { B2BCart, B2BCustomer } from "@starter/types"

export default function CartButton({
  cart,
  customer,
  freeShippingPrices,
}: {
  cart: B2BCart
  customer: B2BCustomer
  freeShippingPrices: StoreFreeShippingPrice[]
}) {
  return (
    <CartProvider cart={cart}>
      <CartDrawer customer={customer} freeShippingPrices={freeShippingPrices} />
    </CartProvider>
  )
}
