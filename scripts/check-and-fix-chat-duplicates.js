#!/usr/bin/env node

/**
 * Script to check for and optionally fix duplicate chat history records
 * 
 * Usage:
 * node scripts/check-and-fix-chat-duplicates.js [--fix]
 * 
 * Without --fix: Just checks for duplicates
 * With --fix: Removes duplicates (keeps most recent)
 */

const { createClient } = require('@supabase/supabase-js')
const { join } = require('path')
const { config } = require('dotenv')

// Load environment variables
config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkForDuplicates() {
  console.log('🔍 Checking for duplicate chat history records...\n')
  
  try {
    // Query to find duplicates
    const { data, error } = await supabase
      .from('chat_history')
      .select('scrap_id, user_id, id, created_at, updated_at')
      .order('scrap_id')
      .order('user_id')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('❌ Error querying chat history:', error.message)
      return { hasDuplicates: false, duplicates: [] }
    }

    if (!data || data.length === 0) {
      console.log('ℹ️  No chat history records found')
      return { hasDuplicates: false, duplicates: [] }
    }

    // Group by scrap_id + user_id to find duplicates
    const grouped = {}
    for (const record of data) {
      const key = `${record.scrap_id}-${record.user_id}`
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(record)
    }

    // Find groups with more than one record
    const duplicates = Object.entries(grouped)
      .filter(([key, records]) => records.length > 1)
      .map(([key, records]) => ({ key, records }))

    if (duplicates.length === 0) {
      console.log('✅ No duplicate records found! Your chat history is clean.')
      return { hasDuplicates: false, duplicates: [] }
    }

    console.log(`⚠️  Found ${duplicates.length} sets of duplicate records:\n`)
    
    let totalDuplicateRecords = 0
    duplicates.forEach(({ key, records }, index) => {
      const [scrapId, userId] = key.split('-')
      console.log(`${index + 1}. Scrap: ${scrapId}, User: ${userId}`)
      console.log(`   ${records.length} records (${records.length - 1} duplicates):`)
      
      records.forEach((record, i) => {
        const status = i === 0 ? '(KEEP - most recent)' : '(DELETE)'
        console.log(`   - ${record.id} | ${record.updated_at} ${status}`)
      })
      console.log()
      
      totalDuplicateRecords += records.length - 1
    })

    console.log(`📊 Summary:`)
    console.log(`   - Total records: ${data.length}`)
    console.log(`   - Duplicate sets: ${duplicates.length}`)
    console.log(`   - Records to delete: ${totalDuplicateRecords}`)
    console.log(`   - Records after cleanup: ${data.length - totalDuplicateRecords}`)

    return { hasDuplicates: true, duplicates, totalDuplicateRecords }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    return { hasDuplicates: false, duplicates: [] }
  }
}

async function removeDuplicates(duplicates) {
  console.log('\n🧹 Removing duplicate records...\n')
  
  try {
    let deletedCount = 0
    
    for (const { key, records } of duplicates) {
      const [scrapId, userId] = key.split('-')
      
      // Keep the first record (most recent), delete the rest
      const recordsToDelete = records.slice(1)
      
      for (const record of recordsToDelete) {
        const { error } = await supabase
          .from('chat_history')
          .delete()
          .eq('id', record.id)
        
        if (error) {
          console.error(`❌ Failed to delete record ${record.id}:`, error.message)
        } else {
          console.log(`✅ Deleted duplicate record ${record.id}`)
          deletedCount++
        }
      }
    }
    
    console.log(`\n🎉 Successfully deleted ${deletedCount} duplicate records!`)
    
    // Verify cleanup
    console.log('\n🔍 Verifying cleanup...')
    const verification = await checkForDuplicates()
    
    if (!verification.hasDuplicates) {
      console.log('✅ Cleanup verified! No duplicates remaining.')
    } else {
      console.log('⚠️  Some duplicates may still remain. Please run the script again.')
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message)
  }
}

async function main() {
  const shouldFix = process.argv.includes('--fix')
  
  console.log('🗄️  Chat History Duplicate Checker\n')
  
  const result = await checkForDuplicates()
  
  if (!result.hasDuplicates) {
    console.log('\n✨ Your database is ready for the unique constraint!')
    return
  }
  
  if (shouldFix) {
    console.log('\n❓ Proceeding with duplicate removal...')
    await removeDuplicates(result.duplicates)
  } else {
    console.log('\n💡 To remove these duplicates, run:')
    console.log('   node scripts/check-and-fix-chat-duplicates.js --fix')
    console.log('\n⚠️  Note: You must clean up duplicates before the unique constraint can be applied.')
  }
}

main().catch(console.error) 