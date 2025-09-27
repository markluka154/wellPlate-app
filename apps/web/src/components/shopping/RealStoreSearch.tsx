'use client'

import React, { useState } from 'react'
import { 
  Search, 
  Store, 
  Package, 
  Euro, 
  MapPin, 
  Star,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { useStoreSearch } from '@/hooks/useStoreSearch'

interface RealStoreSearchProps {
  onAddToCart: (product: any) => void
  selectedStore?: string
}

export function RealStoreSearch({ onAddToCart, selectedStore }: RealStoreSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [maxPrice, setMaxPrice] = useState<number | undefined>()
  
  const {
    isLoading,
    error,
    results,
    searchStores,
    getProductsByStore,
    getAllProducts,
    getAvailableStores,
    isFallback
  } = useStoreSearch({
    fallbackToOpenFoodFacts: true,
    maxResults: 20
  })

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const preferences = {
        maxPrice,
        categories: selectedCategory !== 'all' ? [selectedCategory] : undefined
      }
      
      if (selectedStore && selectedStore !== 'all') {
        searchStores(searchQuery, [selectedStore], preferences)
      } else {
        searchStores(searchQuery, undefined, preferences)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  const getStoreColor = (store: string) => {
    const colors: Record<string, string> = {
      'REWE': 'bg-red-100 text-red-800',
      'Albert Heijn': 'bg-blue-100 text-blue-800',
      'ICA': 'bg-green-100 text-green-800',
      'Edeka': 'bg-yellow-100 text-yellow-800',
      'Lidl': 'bg-orange-100 text-orange-800',
      'Aldi': 'bg-purple-100 text-purple-800'
    }
    return colors[store] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <Search className="h-4 w-4 text-blue-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Real Store Search</h2>
        {isFallback && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
            Fallback Data
          </span>
        )}
      </div>

      {/* Search Form */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="Protein">Protein</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Grains">Grains</option>
            <option value="Dairy">Dairy</option>
            <option value="Oils">Oils</option>
          </select>
        </div>

        <div>
          <input
            type="number"
            placeholder="Max price (€)"
            value={maxPrice || ''}
            onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        onClick={handleSearch}
        disabled={isLoading || !searchQuery.trim()}
        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search className="h-4 w-4" />
            Search Stores
          </>
        )}
      </button>

      {/* Error State */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Search Error</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results ({getAllProducts().length} products)
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Source: {results.source}</span>
              {isFallback && (
                <span className="text-yellow-600">• Using fallback data</span>
              )}
            </div>
          </div>

          {/* Store Tabs */}
          {getAvailableStores().length > 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {getAvailableStores().map(store => (
                <span
                  key={store}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStoreColor(store)}`}
                >
                  {store} ({getProductsByStore(store).length})
                </span>
              ))}
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getAllProducts().map(product => (
              <div
                key={`${product.store}-${product.id}`}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Product Image */}
                <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Package className="h-8 w-8 text-gray-400" />
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                      {product.name}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStoreColor(product.store)}`}>
                      {product.store}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600">
                      {product.price > 0 ? formatPrice(product.price, product.currency) : 'Price N/A'}
                    </span>
                  </div>

                  {product.brand && (
                    <p className="text-xs text-gray-600">Brand: {product.brand}</p>
                  )}

                  {product.aisle && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>{product.aisle}</span>
                    </div>
                  )}

                  {/* Nutrition Info */}
                  {product.nutrition && (
                    <div className="text-xs text-gray-500">
                      {product.nutrition.calories && (
                        <span>{product.nutrition.calories} cal/100g</span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => onAddToCart(product)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Add to List
                    </button>
                    {product.image && (
                      <button
                        onClick={() => window.open(product.image, '_blank')}
                        className="p-2 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                        title="View full image"
                      >
                        <ExternalLink className="h-3 w-3 text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {getAllProducts().length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">
                Try adjusting your search terms or filters.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
