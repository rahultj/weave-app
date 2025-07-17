// Test migration script
// Run this before applying the migration to production

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testMigration() {
  console.log('🔍 Testing migration prerequisites...')
  
  try {
    // 1. Check database connection
    const { data, error } = await supabase.from('scraps').select('count').limit(1)
    if (error) {
      console.error('❌ Database connection failed:', error)
      return false
    }
    console.log('✅ Database connection OK')
    
    // 2. Check existing schema
    const { data: scraps, error: scrapsError } = await supabase
      .from('scraps')
      .select('id, title, content, source, creator, medium')
      .limit(5)
    
    if (scrapsError) {
      console.error('❌ Schema check failed:', scrapsError)
      return false
    }
    
    console.log('✅ Current schema accessible')
    console.log('📊 Sample data:', scraps?.length, 'records found')
    
    // 3. Check for NULL titles
    const { data: nullTitles, error: nullError } = await supabase
      .from('scraps')
      .select('id')
      .is('title', null)
    
    if (nullError) {
      console.error('❌ NULL title check failed:', nullError)
      return false
    }
    
    console.log('📋 NULL titles found:', nullTitles?.length || 0)
    
    // 4. Check for content data
    const { data: contentData, error: contentError } = await supabase
      .from('scraps')
      .select('id')
      .not('content', 'is', null)
    
    if (contentError) {
      console.error('❌ Content check failed:', contentError)
      return false
    }
    
    console.log('📝 Records with content:', contentData?.length || 0)
    
    console.log('\n🎉 Migration test completed successfully!')
    console.log('✅ Ready to proceed with migration')
    
    return true
    
  } catch (error) {
    console.error('❌ Migration test failed:', error)
    return false
  }
}

// Run test
testMigration().then(success => {
  process.exit(success ? 0 : 1)
}) 