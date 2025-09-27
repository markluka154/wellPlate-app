import { useState, useEffect, useCallback } from 'react'

interface StoreProduct {
  id: string
  name: string
  price: number
  currency: string
  category: string
  brand?: string
  image?: string
  description?: string
  availability: boolean
  store: string
  aisle?: string
  nutrition?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
  }
}

interface StoreSearchResult {
  stores: Record<string, StoreProduct[]>
  source: string
  fallback?: boolean
  error?: string
}

interface UseStoreSearchOptions {
  debounceMs?: number
  fallbackToOpenFoodFacts?: boolean
  maxResults?: number
}

export function useStoreSearch(options: UseStoreSearchOptions = {}) {
  const {
    debounceMs = 500,
    fallbackToOpenFoodFacts = true,
    maxResults = 20
  } = options

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<StoreSearchResult | null>(null)
  const [lastQuery, setLastQuery] = useState<string>('')

  const searchStores = useCallback(async (
    query: string, 
    stores?: string[],
    preferences?: {
      maxPrice?: number
      categories?: string[]
      brands?: string[]
    }
  ) => {
    if (!query.trim()) {
      setResults(null)
      return
    }

    setIsLoading(true)
    setError(null)
    setLastQuery(query)

    try {
      const params = new URLSearchParams({
        q: query,
        fallback: fallbackToOpenFoodFacts.toString()
      })

      if (stores && stores.length > 0) {
        params.append('stores', stores.join(','))
      }

      const response = await fetch(`/api/stores/search?${params}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          stores,
          preferences
        })
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed'
      setError(errorMessage)
      setResults(null)
    } finally {
      setIsLoading(false)
    }
  }, [fallbackToOpenFoodFacts])

  const searchSpecificStore = useCallback(async (store: string, query: string) => {
    if (!query.trim()) {
      setResults(null)
      return
    }

    setIsLoading(true)
    setError(null)
    setLastQuery(query)

    try {
      const params = new URLSearchParams({
        q: query,
        store,
        fallback: fallbackToOpenFoodFacts.toString()
      })

      const response = await fetch(`/api/stores/search?${params}`)

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed'
      setError(errorMessage)
      setResults(null)
    } finally {
      setIsLoading(false)
    }
  }, [fallbackToOpenFoodFacts])

  const clearResults = useCallback(() => {
    setResults(null)
    setError(null)
    setLastQuery('')
  }, [])

  const getProductsByStore = useCallback((storeName: string): StoreProduct[] => {
    if (!results?.stores) return []
    return results.stores[storeName] || []
  }, [results])

  const getAllProducts = useCallback((): StoreProduct[] => {
    if (!results?.stores) return []
    
    const allProducts: StoreProduct[] = []
    Object.values(results.stores).forEach(storeProducts => {
      allProducts.push(...storeProducts)
    })
    
    return allProducts.slice(0, maxResults)
  }, [results, maxResults])

  const getAvailableStores = useCallback((): string[] => {
    if (!results?.stores) return []
    return Object.keys(results.stores).filter(store => 
      results.stores[store].length > 0
    )
  }, [results])

  return {
    // State
    isLoading,
    error,
    results,
    lastQuery,
    
    // Actions
    searchStores,
    searchSpecificStore,
    clearResults,
    
    // Getters
    getProductsByStore,
    getAllProducts,
    getAvailableStores,
    
    // Computed
    hasResults: results !== null,
    isFallback: results?.fallback === true,
    totalProducts: getAllProducts().length
  }
}

// Debounced version of the hook
export function useDebouncedStoreSearch(options: UseStoreSearchOptions = {}) {
  const storeSearch = useStoreSearch(options)
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedQuery !== storeSearch.lastQuery) {
        storeSearch.searchStores(debouncedQuery)
      }
    }, options.debounceMs || 500)

    return () => clearTimeout(timer)
  }, [debouncedQuery, storeSearch, options.debounceMs])

  const searchWithDebounce = useCallback((query: string) => {
    setDebouncedQuery(query)
  }, [])

  return {
    ...storeSearch,
    searchStores: searchWithDebounce
  }
}
