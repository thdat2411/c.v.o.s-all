import { useEffect, useState } from "react"
import { MagnifyingGlassMini } from "@medusajs/icons"
import { useRouter, useSearchParams } from "next/navigation"

const SearchInResults = ({ listName }: { listName?: string }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  const placeholder = listName ? `Search in ${listName}` : "Search in products"

  useEffect(() => {
    const query = new URLSearchParams(searchParams)
    if (searchTerm.length > 0) {
      query.set("search", searchTerm)
    } else {
      query.delete("search")
    }
    router.push(`?${query.toString()}`)
  }, [searchTerm])

  return (
    <div className="group relative text-sm focus-within:border-neutral-500 rounded-t-lg focus-within:outline focus-within:outline-neutral-500">
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        type="text"
        placeholder={placeholder}
        className="w-full p-2 pr-8 focus:outline-none rounded-lg"
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <MagnifyingGlassMini className="w-4 h-4 text-neutral-500" />
      </div>
    </div>
  )
}

export default SearchInResults
