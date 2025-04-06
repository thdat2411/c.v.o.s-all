import { listCategories } from "@lib/data/categories"
import MegaMenu from "./mega-menu"
import { HttpTypes } from "@medusajs/types"

export function MegaMenuWrapper({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) {
  return <MegaMenu categories={categories} />
}

export default MegaMenuWrapper
