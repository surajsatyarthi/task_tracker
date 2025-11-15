import { NextResponse } from 'next/server'
import { migrateMockDataToDatabase, checkMigrationStatus, clearAllTasks } from '@/lib/migration'

export async function GET() {
  try {
    // Check if migration is needed
    const status = await checkMigrationStatus()
    
    if (!status.needsMigration) {
      return NextResponse.json({
        message: 'Migration not needed',
        currentTaskCount: status.currentTaskCount,
        needsMigration: false
      })
    }
    
    return NextResponse.json({
      message: 'Migration needed',
      needsMigration: true,
      currentTaskCount: status.currentTaskCount
    })
  } catch (error) {
    console.error('Error checking migration status:', error)
    return NextResponse.json({ error: 'Failed to check migration status' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { action = 'migrate' } = await request.json()
    
    if (action === 'migrate') {
      // Run migration
      const result = await migrateMockDataToDatabase()
      
      if (result.success) {
        return NextResponse.json({
          message: 'Migration completed successfully',
          data: result.data
        })
      } else {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }
    } else if (action === 'clear') {
      // Clear all tasks
      const result = await clearAllTasks()
      
      if (result.success) {
        return NextResponse.json({ message: 'All tasks cleared successfully' })
      } else {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 })
  }
}