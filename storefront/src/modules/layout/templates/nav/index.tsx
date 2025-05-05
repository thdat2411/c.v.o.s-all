"use client"
import { HttpTypes, StoreRegion } from "@medusajs/types"
import AccountButton from "@modules/account/components/account-button"
import CartButton from "@modules/cart/components/cart-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FilePlus from "@modules/common/icons/file-plus"
import LogoIcon from "@modules/common/icons/logo"
import { MegaMenuWrapper } from "@modules/layout/components/mega-menu"
import SearchBar from "@modules/layout/components/search-bar"
import { RequestQuotePrompt } from "@modules/quotes/components/request-quote-prompt"
import SkeletonAccountButton from "@modules/skeletons/components/skeleton-account-button"
import SkeletonCartButton from "@modules/skeletons/components/skeleton-cart-button"
import SkeletonMegaMenu from "@modules/skeletons/components/skeleton-mega-menu"
import { B2BCart, B2BCustomer } from "@starter/types"
import { StoreFreeShippingPrice } from "@starter/types/shipping-option/http"
import { Suspense } from "react"

interface NavigationHeaderProps {
  region: StoreRegion | null
  customer: B2BCustomer | null
  cart: B2BCart | null
  categories: HttpTypes.StoreProductCategory[]
  freeShippingPrices: StoreFreeShippingPrice[] | null
}

export function NavigationHeader({
  region,
  customer,
  cart,
  categories,
  freeShippingPrices,
}: NavigationHeaderProps) {
  return (
    <div className="sticky top-0 inset-x-0 group bg-white text-zinc-900 small:p-4 p-2 text-sm border-b duration-200 border-ui-border-base z-50">
      <header className="flex w-full content-container relative small:mx-auto justify-between">
        <div className="small:mx-auto flex justify-between items-center min-w-full">
          <div className="flex items-center small:space-x-4">
            <LocalizedClientLink
              className="hover:text-ui-fg-base flex items-center w-fit"
              href="/"
            >
              <h1 className="small:text-base text-sm font-medium flex items-center">
                <LogoIcon className="inline mr-2" />
                Medusa B2B Starter
              </h1>
            </LocalizedClientLink>

            <nav>
              <ul className="space-x-4 hidden small:flex">
                <li>
                  <Suspense fallback={<SkeletonMegaMenu />}>
                    <MegaMenuWrapper categories={categories} />
                  </Suspense>
                </li>
              </ul>
            </nav>
          </div>
          <div className="flex justify-end items-center gap-2">
            {/* <div className="relative mr-2 hidden small:inline-flex">
              <input
                type="text"
                placeholder="Search for products"
                className="bg-gray-100 text-zinc-900 px-4 py-2 rounded-full pr-10 shadow-borders-base hidden small:inline-block"
              />
            </div> */}
            <SearchBar region={region!} />

            <div className="h-4 w-px bg-neutral-300" />

            <RequestQuotePrompt>
              <button className="flex gap-1.5 items-center rounded-2xl bg-none shadow-none border-none hover:bg-neutral-100 px-2 py-1">
                <FilePlus />
                <span className="hidden small:inline-block">Quote</span>
              </button>
            </RequestQuotePrompt>

            <Suspense fallback={<SkeletonAccountButton />}>
              <AccountButton customer={customer!} />
            </Suspense>

            <Suspense fallback={<SkeletonCartButton />}>
              <CartButton
                cart={cart!}
                customer={customer!}
                freeShippingPrices={freeShippingPrices!}
              />
            </Suspense>
          </div>
        </div>
      </header>
    </div>
  )
}
