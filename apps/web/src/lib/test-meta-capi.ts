// Test CAPI events - Add this to your dashboard temporarily
// You can call this from browser console or add a test button

import { sendMetaEvent } from '@/lib/metaCapi'

// Test functions you can run in browser console:
window.testMetaCAPI = {
  testLead: async () => {
    console.log('🧪 Testing Lead event...')
    await sendMetaEvent('Lead', 'test@example.com')
    console.log('✅ Lead event sent')
  },
  
  testRegistration: async () => {
    console.log('🧪 Testing CompleteRegistration event...')
    await sendMetaEvent('CompleteRegistration', 'test@example.com')
    console.log('✅ CompleteRegistration event sent')
  },
  
  testPurchase: async () => {
    console.log('🧪 Testing Purchase event...')
    await sendMetaEvent('Purchase', 'test@example.com', 14.99)
    console.log('✅ Purchase event sent')
  }
}

// Usage in browser console:
// window.testMetaCAPI.testLead()
// window.testMetaCAPI.testRegistration()
// window.testMetaCAPI.testPurchase()
