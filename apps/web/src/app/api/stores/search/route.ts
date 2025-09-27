import { NextRequest, NextResponse } from 'next/server'
import { StoreAPIManager, openFoodFactsAPI } from '@/lib/store-apis'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const store = searchParams.get('store')
    const useOpenFoodFacts = searchParams.get('fallback') === 'true'
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }
    
    const apiManager = new StoreAPIManager()
    
    if (store && store !== 'all') {
      // Search specific store
      try {
        const products = await apiManager.searchStore(store, query)
        return NextResponse.json({ 
          store, 
          products,
          source: 'store-api'
        })
      } catch (error) {
        // Fallback to Open Food Facts if store API fails
        if (useOpenFoodFacts) {
          const products = await openFoodFactsAPI.searchProducts(query)
          return NextResponse.json({ 
            store, 
            products: products.slice(0, 10),
            source: 'open-food-facts',
            fallback: true
          })
        }
        throw error
      }
    } else {
      // Search all stores
      const results = await apiManager.searchAllStores(query)
      
      // Convert Map to object for JSON response
      const storeResults: Record<string, any[]> = {}
      results.forEach((products, storeName) => {
        storeResults[storeName] = products
      })
      
      return NextResponse.json({ 
        stores: storeResults,
        source: 'store-apis'
      })
    }
    
  } catch (error) {
    console.error('Store search error:', error)
    
    // Fallback to Open Food Facts
    try {
      const query = new URL(request.url).searchParams.get('q')
      if (query) {
        const products = await openFoodFactsAPI.searchProducts(query)
        return NextResponse.json({ 
          products: products.slice(0, 10),
          source: 'open-food-facts',
          fallback: true,
          error: 'Store APIs unavailable, using fallback data'
        })
      }
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError)
    }
    
    return NextResponse.json({ 
      error: 'Failed to search stores',
      products: []
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, stores, preferences } = body
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }
    
    const apiManager = new StoreAPIManager()
    const results = new Map()
    
    // Search specified stores or all stores
    const storesToSearch = stores && stores.length > 0 ? stores : ['REWE', 'Albert Heijn', 'ICA']
    
    for (const store of storesToSearch) {
      try {
        const products = await apiManager.searchStore(store, query)
        
        // Apply preferences filtering
        let filteredProducts = products
        if (preferences) {
          if (preferences.maxPrice) {
            filteredProducts = filteredProducts.filter(p => p.price <= preferences.maxPrice)
          }
          if (preferences.categories && preferences.categories.length > 0) {
            filteredProducts = filteredProducts.filter(p => 
              preferences.categories.includes(p.category)
            )
          }
          if (preferences.brands && preferences.brands.length > 0) {
            filteredProducts = filteredProducts.filter(p => 
              preferences.brands.includes(p.brand)
            )
          }
        }
        
        results.set(store, filteredProducts)
      } catch (error) {
        console.error(`Error searching ${store}:`, error)
        results.set(store, [])
      }
    }
    
    // Convert Map to object
    const storeResults: Record<string, any[]> = {}
    results.forEach((products, storeName) => {
      storeResults[storeName] = products
    })
    
    return NextResponse.json({ 
      stores: storeResults,
      query,
      preferences,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Store search POST error:', error)
    return NextResponse.json({ 
      error: 'Failed to search stores',
      stores: {}
    }, { status: 500 })
  }
}
