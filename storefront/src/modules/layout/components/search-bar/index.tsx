import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { useState, useEffect } from "react"

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])

  // Fetch search results based on the query
  useEffect(() => {
    if (query.length > 2) {
      setLoading(true)
      sdk.store.product
        .list({ q: query })
        .then(({ products }) => {
          setProducts(products)
          setLoading(false)
        })
        .catch((err) => {
          console.error("Error fetching search results:", err)
          setLoading(false)
        })
    } else {
      setProducts([])
      setLoading(false)
    }
  }, [query])

  // Handler to clear search query and results when a product is clicked
  const handleProductClick = () => {
    setQuery("") // Clear the query
    setProducts([]) // Optionally clear the product list
  }

  return (
    <div className="relative mr-2 hidden small:inline-flex">
      <input
        type="text"
        placeholder="Search for products"
        className="bg-gray-100 text-zinc-900 px-4 py-2 rounded-full pr-10 shadow-borders-base"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {products.length > 0 && (
        <ul className="absolute bg-white border rounded-md shadow-lg mt-10 w-full max-h-60 overflow-auto">
          {products.map((product) => (
            <div key={product.id} className="p-2 border-b hover:bg-gray-100">
              <li>
                <LocalizedClientLink
                  href={`/products/${product.handle}`}
                  className="flex items-center"
                  onClick={handleProductClick} // Clear query and results on click
                >
                  <Image
                    src={product.thumbnail!}
                    alt={product.title}
                    width={80}
                    height={80}
                    className="w-10 h-10 mr-2"
                  />
                  <span>{product.title}</span>
                </LocalizedClientLink>
              </li>
            </div>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SearchBar
