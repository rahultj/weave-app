// Test migration script for STAGING environment
// This tests the migration against the staging database

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Check if we're testing against staging
const isStaging = process.env.NEXT_PUBLIC_APP_ENV === 'staging'
const stagingUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

console.log('🔍 Migration Test Configuration:')
console.log('Environment:', process.env.NEXT_PUBLIC_APP_ENV || 'unknown')
console.log('Supabase URL:', stagingUrl)
console.log('Is Staging:', isStaging)

if (!isStaging) {
  console.log('⚠️  WARNING: This appears to be running against production!')
  console.log('Please set NEXT_PUBLIC_APP_ENV=staging in your .env.local for testing')
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testStagingMigration() {
  console.log('\n🧪 Testing staging migration prerequisites...')
  
  try {
    // 1. Check database connection
    const { data, error } = await supabase.from('scraps').select('count').limit(1)
    if (error) {
      console.error('❌ Database connection failed:', error.message)
      return false
    }
    console.log('✅ Database connection OK')
    
    // 2. Check current schema structure
    const { data: scraps, error: scrapsError } = await supabase
      .from('scraps')
      .select('id, title, content, creator, medium, type, created_at')
      .limit(3)
    
    if (scrapsError) {
      console.error('❌ Schema check failed:', scrapsError.message)
      return false
    }
    
    console.log('✅ Current schema accessible')
    console.log('📊 Sample data structure:')
    if (scraps && scraps.length > 0) {
      console.log('  - Records found:', scraps.length)
      console.log('  - Sample fields:', Object.keys(scraps[0]))
      console.log('  - Sample record:', scraps[0])
    } else {
      console.log('  - No records found (empty database)')
    }
    
    // 3. Test data creation (with current schema)
    console.log('\n🧪 Testing data creation...')
    const testData = {
      type: 'text',
      title: 'Migration Test',
      content: 'This is a test observation',
      creator: 'Test Creator',
      medium: 'Test Medium',
      tags: ['test', 'migration']
    }
    
    const { data: newScrap, error: createError } = await supabase
      .from('scraps')
      .insert([testData])
      .select()
      .single()
    
    if (createError) {
      console.error('❌ Test data creation failed:', createError.message)
      return false
    }
    
    console.log('✅ Test data created successfully')
    console.log('📝 Created record:', newScrap)
    
    // 4. Test data update
    const { data: updatedScrap, error: updateError } = await supabase
      .from('scraps')
      .update({ content: 'Updated test observation' })
      .eq('id', newScrap.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('❌ Test data update failed:', updateError.message)
      return false
    }
    
    console.log('✅ Test data updated successfully')
    
    // 5. Clean up test data
    const { error: deleteError } = await supabase
      .from('scraps')
      .delete()
      .eq('id', newScrap.id)
    
    if (deleteError) {
      console.error('❌ Test data cleanup failed:', deleteError.message)
      return false
    }
    
    console.log('✅ Test data cleaned up successfully')
    
    // 6. Check for NULL titles (migration concern)
    const { data: nullTitles, error: nullError } = await supabase
      .from('scraps')
      .select('id, title')
      .is('title', null)
    
    if (nullError) {
      console.error('❌ NULL title check failed:', nullError.message)
      return false
    }
    
    console.log('📋 NULL titles found:', nullTitles?.length || 0)
    if (nullTitles && nullTitles.length > 0) {
      console.log('  - These will be set to "Untitled" during migration')
    }
    
    // 7. Check for existing content
    const { data: contentData, error: contentError } = await supabase
      .from('scraps')
      .select('id, content')
      .not('content', 'is', null)
    
    if (contentError) {
      console.error('❌ Content check failed:', contentError.message)
      return false
    }
    
    console.log('📝 Records with content:', contentData?.length || 0)
    if (contentData && contentData.length > 0) {
      console.log('  - These will be migrated to "observations" field')
    }
    
    console.log('\n🎉 Staging migration test completed successfully!')
    console.log('✅ Ready to proceed with migration on staging')
    console.log('\n📋 Next steps:')
    console.log('1. Run the migration SQL in staging Supabase dashboard')
    console.log('2. Test the application thoroughly')
    console.log('3. If successful, apply same migration to production')
    
    return true
    
  } catch (error) {
    console.error('❌ Migration test failed:', error.message)
    return false
  }
}

// Run test
testStagingMigration().then(success => {
  if (success) {
    console.log('\n🚀 Migration test PASSED - proceed with confidence!')
  } else {
    console.log('\n🚨 Migration test FAILED - investigate issues before proceeding!')
  }
  process.exit(success ? 0 : 1)
}) 