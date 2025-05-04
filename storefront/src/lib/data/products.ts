"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion } from "./regions"

export const getProductsById = async ({
  ids,
  regionId,
}: {
  ids: string[]
  regionId: string
}) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[] }>(`/store/products`, {
      credentials: "include",
      method: "GET",
      query: {
        id: ids,
        region_id: regionId,
        fields:
          "*variants,*variants.calculated_price,*variants.inventory_quantity",
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ products }) => products)
}

export const getProductByHandle = async (handle: string, regionId: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[] }>(`/store/products`, {
      credentials: "include",
      method: "GET",
      query: {
        handle,
        region_id: regionId,
        fields:
          "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags",
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ products }) => products[0])
}

export const listProducts = async ({
  pageParam = 1,
  search,
  queryParams,
  countryCode,
}: {
  pageParam?: number
  search?: string
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = (_pageParam - 1) * limit
  const region = await getRegion(countryCode)

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  // If a search term is provided, use the alternate transformer API
  if (search && search.trim().length > 0) {
    try {
      const res = await fetch(
        `http://localhost:8081/search?q=${search}`,
        {
          headers: { "Content-Type": "application/json" },
        }
      )

      if (!res.ok) {
        throw new Error(`Search fetch failed with status ${res.status}`)
      }

      const data = await res.json()
      const products = data.products || []
      let fullProducts: HttpTypes.StoreProduct[] = [];
      if (products.length > 0) {
        const productIds = products.map((product: any) => product.id);

        // Wait for the Promise to resolve using await
        const { products: retrievedProducts } = await sdk.store.product.list({
          id: productIds,
          fields: "*variants.calculated_price",
        });

        fullProducts = retrievedProducts;
      }

      const count = data.count || 0
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products: fullProducts,
          count,
        },
        nextPage,
        queryParams,
      }
    } catch (error) {
      console.error("Error fetching search results:", error)
      return {
        response: { products: [], count: 0 },
        nextPage: null,
      }
    }
  }

  // Otherwise, use the default Medusa store API
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  const query = {
    limit,
    offset,
    region_id: region.id,
    fields: "*variants.calculated_price",
    ...queryParams,
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        credentials: "include",
        method: "GET",
        query,
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage,
        queryParams,
      }
    })
}



/**
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  search,
  countryCode,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
  search?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 12


  const {
    response: { products, count },
  } = await listProducts({
    search,
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)

  const pageParam = (page - 1) * limit

  const nextPage = count > pageParam + limit ? pageParam + limit : null

  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count,
    },
    nextPage,
    queryParams,
  }
}



