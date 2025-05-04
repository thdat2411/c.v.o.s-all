import { useState, useEffect, useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { sdk } from "@lib/config"

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
  const [showResults, setShowResults] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Debounce query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(handler)
  }, [query])

  // Fetch products
  useEffect(() => {
    const fetchSearchProducts = async () => {
      try {
        setLoading(true)
        const res = await fetch(
          `http://localhost:8081/search?q=${debouncedQuery}`,
          {
            headers: { "Content-Type": "application/json" },
          }
        )
        if (!res.ok) throw new Error("Network response was not ok")
        const data = await res.json()
        const products = data.products || []
        let fullProducts: HttpTypes.StoreProduct[] = []
        if (products.length > 0) {
          const productIds = products.map((product: any) => product.id)

          // Wait for the Promise to resolve using await
          const { products: retrievedProducts } = await sdk.store.product.list({
            id: productIds,
            fields: "*variants.calculated_price",
          })

          fullProducts = retrievedProducts
        }
        setProducts(fullProducts)
      } catch (err) {
        console.error("Fetch error:", err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    if (debouncedQuery.length > 2) {
      fetchSearchProducts()
    } else {
      setProducts([])
    }
  }, [debouncedQuery])

  const handleProductClick = () => {
    setQuery("")
    setProducts([])
    setShowResults(false)
  }

  return (
    <div
      ref={searchRef}
      className="relative mr-2 hidden small:inline-flex"
      onClick={() => setShowResults(true)} // Open dropdown on click inside
    >
      <input
        type="text"
        placeholder="Search for products"
        className="bg-gray-100 text-zinc-900 px-4 py-2 rounded-full pr-10 shadow-borders-base"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {showResults && (loading || products.length > 0) && (
        <ul className="absolute bg-white border rounded-md shadow-lg mt-10 w-80 max-h-80 overflow-auto z-10">
          {loading
            ? [...Array(5)].map((_, index) => (
                <div className="p-2 border-b" key={index}>
                  <li className="h-24 flex justify-between items-center rounded-md border border-gray-600 animate-pulse">
                    <div className="w-[140px] h-[90px] bg-gray-300 rounded mr-2" />
                    <div className="flex flex-col w-full justify-center space-y-2 mr-2">
                      <div className="h-6 w-full bg-gray-300 rounded self-start" />
                      <div className="h-2 w-[10%] bg-gray-300 rounded self-end" />
                    </div>
                  </li>
                </div>
              ))
            : products.map((product) => (
                <div
                  key={product.id}
                  className="border-b space-y-2 hover:bg-gray-100"
                >
                  <li className="h-24 flex justify-between rounded-md ">
                    <LocalizedClientLink
                      href={`/products/${product.handle}`}
                      className="flex items-center w-full h-full p-3"
                      onClick={handleProductClick}
                    >
                      <Image
                        src={product.thumbnail!}
                        alt={product.title}
                        width={70}
                        height={70}
                        className="mr-2 shadow-sm rounded-md"
                      />
                      <div className="flex-col w-full justify-center group">
                        <span className="text-base text-start text-gray-500 group-hover:text-black ml-2">
                          {product.title}
                        </span>
                        <p className="text-sm mr-4 text-end text-gray-500 hover:underline hover:text-black">
                          View
                        </p>
                      </div>
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
