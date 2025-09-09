'use client'

import { useState, useCallback, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Music, 
  File, 
  FolderPlus,
  Loader2,
  Check,
  X,
  Eye
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import Image from 'next/image'

// Helper function to determine content type from URL
const getContentTypeFromUrl = (url: string): string | null => {
  // Try to extract extension from the pathname, looking for common image extensions
  // even if they're not at the very end (due to timestamps or other suffixes)
  const extensionMatch = url.match(/\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|mp3|wav|pdf|doc|docx|txt)(?:-\d+)?(?:\?.*)?$/i)
  const extension = extensionMatch ? extensionMatch[1].toLowerCase() : null
  
  if (!extension) {
    // Fallback: check if the URL contains any image extension
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
    for (const ext of imageExtensions) {
      if (url.toLowerCase().includes(`.${ext}`)) {
        return getExtensionMimeType(ext)
      }
    }
    return null
  }
  
  return getExtensionMimeType(extension)
}

// Helper function to map extensions to MIME types
const getExtensionMimeType = (extension: string): string | null => {
  const extensionMap: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg', 
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain'
  }
  return extensionMap[extension] || null
}

export interface MediaFile {
  id: string
  name: string
  type: 'file' | 'folder'
  size?: number
  mimeType?: string
  url?: string
  path: string
  createdAt: string
  uploadedBy: {
    id: string
    name: string
  }
}

interface MediaSelectorProps {
  onSelect: (file: MediaFile) => void
  selectedUrl?: string
  allowedTypes?: string[] // e.g., ['image/*', 'video/*']
  children: React.ReactNode
}

export default function MediaSelector({ 
  onSelect, 
  selectedUrl, 
  allowedTypes = ['image/*', 'video/*', 'audio/*'],
  children 
}: MediaSelectorProps) {
  console.log('MediaSelector component rendered')
  
  const [isOpen, setIsOpen] = useState(false)
  const [files, setFiles] = useState<MediaFile[]>([])
  const [currentPath, setCurrentPath] = useState('/')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const fetchFiles = useCallback(async () => {
    console.log('fetchFiles called, isOpen:', isOpen, 'currentPath:', currentPath)
    
    if (!isOpen) {
      console.log('Dialog not open, skipping fetch')
      return
    }
    
    setLoading(true)
    try {
      // Use our blob storage API to list files
      const searchParams = new URLSearchParams()
      
      // Use 'media' prefix for all requests for consistency with upload folder structure
      const prefix = 'media'
      console.log('Fetching files with prefix:', prefix)
      
      searchParams.set('prefix', prefix)
      searchParams.set('limit', '100')
      
      const apiUrl = `/api/upload/files?${searchParams.toString()}`
      console.log('Making API request to:', apiUrl)
      
      const response = await fetch(apiUrl)
      console.log('API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('MediaSelector API response:', data) // Debug log
        if (data.success) {
          // Transform blob storage response to MediaFile format
          const blobs = data.data?.blobs || []
          console.log('Blobs found:', blobs) // Debug log
          const transformedFiles: MediaFile[] = blobs.map((blob: any) => {
            const mimeType = getContentTypeFromUrl(blob.url) || 'application/octet-stream'
            console.log('Transforming blob:', {
              url: blob.url,
              pathname: blob.pathname,
              detectedMimeType: mimeType
            })
            return {
              id: blob.pathname,
              name: blob.pathname.split('/').pop() || blob.pathname,
              type: 'file' as const,
              size: blob.size,
              mimeType,
              url: blob.url,
              path: blob.pathname,
              createdAt: blob.uploadedAt,
              uploadedBy: {
                id: 'system',
                name: 'System'
              }
            }
          })
          
          console.log('Transformed files:', transformedFiles)
          console.log('Allowed types:', allowedTypes)
          
          // Filter files based on allowed types
          const filteredFiles = transformedFiles.filter((file: MediaFile) => {
            if (!file.mimeType) {
              console.log('File rejected - no mimeType:', file.name)
              return false
            }
            
            const isAllowed = allowedTypes.some(type => {
              if (type.endsWith('/*')) {
                const matches = file.mimeType!.startsWith(type.replace('/*', '/'))
                console.log(`Checking ${file.mimeType} against ${type}: ${matches}`)
                return matches
              }
              const matches = file.mimeType === type
              console.log(`Checking ${file.mimeType} against ${type}: ${matches}`)
              return matches
            })
            
            console.log(`File ${file.name} allowed: ${isAllowed}`)
            return isAllowed
          })
          
          console.log('Filtered files:', filteredFiles)
          setFiles(filteredFiles)
        } else {
          console.error('API request failed:', data)
          setFiles([])
        }
      } else {
        console.error('Failed to fetch files, status:', response.status)
        setFiles([])
      }
    } catch (error) {
      console.error('Error fetching files:', error)
      toast.error('Failed to load files')
    } finally {
      setLoading(false)
    }
  }, [currentPath, isOpen, allowedTypes])

  useEffect(() => {
    console.log('MediaSelector mounted, isOpen:', isOpen)
    fetchFiles()
  }, [fetchFiles, isOpen])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true)
    const formData = new FormData()
    
    acceptedFiles.forEach((file) => {
      formData.append('files', file)
    })
    
    // Set upload type and folder based on current path
    formData.append('type', 'general')
    if (currentPath !== '/') {
      formData.append('folder', currentPath.substring(1)) // Remove leading slash
    } else {
      formData.append('folder', 'media')
    }

    try {
      const response = await fetch('/api/upload/files', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast.success(`Uploaded ${data.data.length} file(s) successfully`)
          fetchFiles()
        } else {
          console.error('Upload failed with data:', data)
          throw new Error(data.message || 'Upload failed')
        }
      } else {
        const errorData = await response.text()
        console.error('Upload failed with status:', response.status, 'Response:', errorData)
        throw new Error(`Upload failed with status ${response.status}: ${errorData}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(`Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
    }
  }, [currentPath, fetchFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: allowedTypes.reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {} as Record<string, string[]>)
  })

  const handleFileSelect = (file: MediaFile) => {
    if (file.type === 'folder') {
      setCurrentPath(currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`)
      setSelectedFile(null)
      setPreviewUrl(null)
    } else {
      setSelectedFile(file)
      setPreviewUrl(file.url || null)
    }
  }

  const handleConfirmSelection = () => {
    if (selectedFile) {
      onSelect(selectedFile)
      setIsOpen(false)
      setSelectedFile(null)
      setPreviewUrl(null)
    }
  }

  const navigateUp = () => {
    const pathParts = currentPath.split('/').filter(p => p)
    if (pathParts.length > 0) {
      pathParts.pop()
      setCurrentPath(pathParts.length === 0 ? '/' : '/' + pathParts.join('/'))
    }
  }

  const getFileIcon = (file: MediaFile) => {
    if (file.type === 'folder') return <FolderPlus className="h-8 w-8 text-blue-500" />
    
    if (!file.mimeType) return <File className="h-8 w-8 text-gray-500" />
    
    if (file.mimeType.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-green-500" />
    if (file.mimeType.startsWith('video/')) return <Video className="h-8 w-8 text-red-500" />
    if (file.mimeType.startsWith('audio/')) return <Music className="h-8 w-8 text-purple-500" />
    
    return <File className="h-8 w-8 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log('Dialog onOpenChange called with:', open)
      setIsOpen(open)
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[90vh] w-[95vw] p-0">
        <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
          <DialogTitle className="text-lg sm:text-xl">Select Media</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 p-4 sm:p-6 pt-0 h-[80vh] lg:h-[600px]">
          {/* File Browser */}
          <div className="lg:col-span-2 lg:border-r lg:pr-4 flex-1 lg:flex-none">
            <Tabs defaultValue="browse" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="browse" className="text-sm">Browse Files</TabsTrigger>
                <TabsTrigger value="upload" className="text-sm">Upload New</TabsTrigger>
              </TabsList>
              
              <TabsContent value="browse" className="flex-1 flex flex-col space-y-3 sm:space-y-4">
                {/* Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  {currentPath !== '/' && (
                    <Button variant="outline" size="sm" onClick={navigateUp} className="w-fit">
                      ← Back
                    </Button>
                  )}
                  <div className="text-xs sm:text-sm text-gray-600 break-all">
                    Path: {currentPath}
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>

                {/* Files Grid */}
                <div className="flex-1 overflow-y-auto h-auto max-h-[400px]">
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                      {filteredFiles.map((file) => (
                        <div
                          key={file.id}
                          className={`relative p-2 sm:p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md touch-manipulation ${
                            selectedFile?.id === file.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200'
                          }`}
                          onClick={() => handleFileSelect(file)}
                        >
                          <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center mb-2 overflow-hidden">
                            {file.mimeType?.startsWith('image/') && file.url ? (
                              <Image
                                src={file.url}
                                alt={file.name}
                                width={80}
                                height={80}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full">
                                {getFileIcon(file)}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-xs">
                            <p className="font-medium truncate" title={file.name}>
                              {file.name}
                            </p>
                            {file.size && (
                              <p className="text-gray-500 text-xs">
                                {formatFileSize(file.size)}
                              </p>
                            )}
                          </div>
                          
                          {selectedFile?.id === file.id && (
                            <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                              <div className="bg-blue-500 text-white rounded-full p-1">
                                <Check className="h-3 w-3" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="upload" className="flex-1">
                <div
                  {...getRootProps()}
                  className={`h-full min-h-[200px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors p-4 ${
                    isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                >
                  <input {...getInputProps()} />
                  {uploading ? (
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin text-blue-500 mx-auto mb-4" />
                      <p className="text-blue-600 text-sm sm:text-base">Uploading files...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm sm:text-lg font-medium text-gray-900 mb-2">
                        Drop files here or click to browse
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Supported: {allowedTypes.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Panel */}
          <div className="flex flex-col min-h-[300px] lg:min-h-0">
            <h3 className="font-semibold mb-4 text-sm sm:text-base">Preview</h3>
            
            {selectedFile && previewUrl ? (
              <div className="flex-1 flex flex-col space-y-3 sm:space-y-4">
                <div className="aspect-4/3 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  {selectedFile.mimeType?.startsWith('image/') ? (
                    <Image
                      src={previewUrl}
                      alt={selectedFile.name}
                      width={200}
                      height={200}
                      className="object-contain w-full h-full"
                    />
                  ) : selectedFile.mimeType?.startsWith('video/') ? (
                    <video controls className="w-full h-full max-h-full">
                      <source src={previewUrl} type={selectedFile.mimeType} />
                    </video>
                  ) : selectedFile.mimeType?.startsWith('audio/') ? (
                    <div className="w-full p-4">
                      <div className="flex items-center justify-center mb-4">
                        <Music className="h-12 w-12 sm:h-16 sm:w-16 text-purple-500" />
                      </div>
                      <audio controls className="w-full">
                        <source src={previewUrl} type={selectedFile.mimeType} />
                      </audio>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      {getFileIcon(selectedFile)}
                      <p className="text-xs sm:text-sm text-gray-500 mt-2">No preview available</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <p className="font-medium text-sm break-all" title={selectedFile.name}>
                    {selectedFile.name}
                  </p>
                  {selectedFile.size && (
                    <p className="text-xs text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {selectedFile.mimeType}
                  </Badge>
                </div>
                
                <div className="space-y-2 mt-auto flex items-center justify-between gap-2">
                  <Button 
                    onClick={handleConfirmSelection}
                    className="w-full text-sm"
                    disabled={!selectedFile}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Select This File
                  </Button>
                  {selectedUrl && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        onSelect({ url: '', name: '', id: '', type: 'file', path: '', createdAt: '', uploadedBy: { id: '', name: '' } })
                        setIsOpen(false)
                      }}
                      className="w-full text-sm !m-0"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove Current
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Eye className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm sm:text-base">Select a file to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}