const { Client } = require('pg')

const client = new Client({
  connectionString: process.env.DATABASE_URL,
})

async function resetUsage() {
  try {
    await client.connect()
    console.log('Connected to database')
    
    // Delete all meal plans for the current user
    const result = await client.query(
      'DELETE FROM "MealPlan" WHERE "userId" = (SELECT id FROM "User" WHERE email = $1)',
      ['markluka154@gmail.com']
    )
    
    console.log(`Deleted ${result.rowCount} meal plans`)
    console.log('✅ Usage reset! You can now generate a new meal plan.')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.end()
  }
}

resetUsage()
