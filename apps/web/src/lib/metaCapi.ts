export async function sendMetaEvent(eventName: string, email?: string, value?: number) {
  async function hashEmail(email: string): Promise<string> {
    const encoded = new TextEncoder().encode(email.trim().toLowerCase())
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const hashedEmail = email ? await hashEmail(email) : undefined

  const payload: any = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    user_data: { em: hashedEmail ? [hashedEmail] : [] },
    custom_data: { 
      currency: 'EUR', 
      value: value || 0.0,
      content_name: eventName === 'Lead' ? 'Meal Plan Generated' : 
                   eventName === 'CompleteRegistration' ? 'Pro Subscription' : 
                   eventName === 'Purchase' ? 'Pro Subscription Purchase' : eventName
    },
    test_event_code: "TEST64751", // Meta Events Manager test code
  }

  console.log('📊 Meta CAPI: Sending event:', eventName, payload)
  
  try {
    const response = await fetch('/api/meta-capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    
    const result = await response.json()
    console.log('✅ Meta CAPI: Event sent successfully:', result)
  } catch (error) {
    console.error('❌ Meta CAPI: Event failed:', error)
  }
}
