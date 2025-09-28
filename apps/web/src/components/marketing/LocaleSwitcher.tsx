'use client'

import React, { useState, useEffect } from 'react'

const LocaleSwitcher = () => {
  const [language, setLanguage] = useState('EN')
  const [currency, setCurrency] = useState('EUR')

  useEffect(() => {
    // Load from localStorage on mount
    const savedLang = localStorage.getItem('nutriai-language')
    const savedCurrency = localStorage.getItem('nutriai-currency')
    
    if (savedLang) setLanguage(savedLang)
    if (savedCurrency) setCurrency(savedCurrency)
  }, [])

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang)
    localStorage.setItem('nutriai-language', newLang)
    
    // Emit analytics event
    if (typeof window !== 'undefined') {
      ;(window as any).dataLayer = (window as any).dataLayer || []
      ;(window as any).dataLayer.push({
        event: 'locale_change',
        language: newLang,
        currency: currency
      })
    }
  }

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency)
    localStorage.setItem('nutriai-currency', newCurrency)
    
    // Emit analytics event
    if (typeof window !== 'undefined') {
      ;(window as any).dataLayer = (window as any).dataLayer || []
      ;(window as any).dataLayer.push({
        event: 'locale_change',
        language: language,
        currency: newCurrency
      })
    }
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Language Switcher */}
      <div className="flex items-center space-x-2">
        <label htmlFor="language-select" className="text-sm text-gray-600 sr-only">
          Select Language
        </label>
        <select
          id="language-select"
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Language selection"
        >
          <option value="EN">🇺🇸 EN</option>
          <option value="DE">🇩🇪 DE</option>
          <option value="SL">🇸🇮 SL</option>
        </select>
      </div>

      {/* Currency Switcher */}
      <div className="flex items-center space-x-2">
        <label htmlFor="currency-select" className="text-sm text-gray-600 sr-only">
          Select Currency
        </label>
        <select
          id="currency-select"
          value={currency}
          onChange={(e) => handleCurrencyChange(e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Currency selection"
        >
          <option value="EUR">€ EUR</option>
          <option value="USD">$ USD</option>
          <option value="GBP">£ GBP</option>
        </select>
      </div>
    </div>
  )
}

export default LocaleSwitcher
