import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
// import { put } from '@vercel/blob' // TODO: Install @vercel/blob package
// import { v4 as uuidv4 } from 'uuid' // TODO: Install uuid package

// Temporary UUID generator until uuid package is installed
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string || 'general'
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (10MB limit for general uploads)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 })
    }

    // Validate file type based on upload type
    const allowedTypes = {
      'member-avatar': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      'sermon-audio': ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
      'sermon-video': ['video/mp4', 'video/webm', 'video/ogg'],
      'general': ['image/*', 'audio/*', 'video/*', 'application/pdf', 'text/*']
    }

    const typeKey = type as keyof typeof allowedTypes
    if (typeKey !== 'general' && allowedTypes[typeKey]) {
      const isValidType = allowedTypes[typeKey].some(allowedType => {
        if (allowedType.endsWith('/*')) {
          return file.type.startsWith(allowedType.replace('/*', '/'))
        }
        return file.type === allowedType
      })

      if (!isValidType) {
        return NextResponse.json({ 
          error: `Invalid file type for ${type}. Allowed types: ${allowedTypes[typeKey].join(', ')}` 
        }, { status: 400 })
      }
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const uniqueFileName = `${type}/${generateUUID()}.${fileExtension}`
    
    try {
      // TODO: Replace with actual blob storage when @vercel/blob is installed
      // const blob = await put(uniqueFileName, file, {
      //   access: 'public'
      // })
      
      // Temporary response for development
      return NextResponse.json({
        success: true,
        url: `/uploads/${uniqueFileName}`, // Placeholder URL
        downloadUrl: `/uploads/${uniqueFileName}`,
        filename: uniqueFileName,
        message: 'File upload placeholder - install @vercel/blob for production'
      })
      
    } catch (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload to storage' }, { status: 500 })
    }

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to process upload' }, { status: 500 })
  }
}

// Handle file size limit using route segment config
export const maxDuration = 30
export const runtime = 'nodejs'

