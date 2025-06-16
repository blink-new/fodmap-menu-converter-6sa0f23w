import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, FileImage, Brain, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type ProcessingState = 'idle' | 'uploading' | 'analyzing' | 'complete'

interface FodmapItem {
  name: string
  description?: string
  fodmapLevel: 'low' | 'moderate' | 'high'
  concerns: string[]
  alternatives?: string[]
}

function App() {
  const [state, setState] = useState<ProcessingState>('idle')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [menuItems, setMenuItems] = useState<FodmapItem[]>([])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        startProcessing()
      }
      reader.readAsDataURL(file)
    }
  }

  const startProcessing = async () => {
    setState('uploading')
    setProgress(0)
    
    // Simulate upload progress
    for (let i = 0; i <= 30; i += 5) {
      setProgress(i)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    setState('analyzing')
    
    // Simulate analysis progress
    for (let i = 30; i <= 90; i += 10) {
      setProgress(i)
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    // Mock results
    setMenuItems([
      {
        name: "Caesar Salad",
        description: "Romaine lettuce, parmesan, croutons, caesar dressing",
        fodmapLevel: 'moderate',
        concerns: ['Garlic in dressing', 'Wheat croutons'],
        alternatives: ['Ask for dressing on side', 'Replace croutons with nuts']
      },
      {
        name: "Grilled Salmon",
        description: "Fresh Atlantic salmon with herbs",
        fodmapLevel: 'low',
        concerns: [],
        alternatives: []
      },
      {
        name: "Pasta Carbonara",
        description: "Spaghetti with eggs, cheese, pancetta",
        fodmapLevel: 'high',
        concerns: ['Wheat pasta', 'Potential garlic/onion'],
        alternatives: ['Ask for gluten-free pasta', 'Request no garlic/onion']
      },
      {
        name: "Apple Pie",
        description: "Traditional apple pie with crust",
        fodmapLevel: 'high',
        concerns: ['Wheat flour', 'High fructose from apples'],
        alternatives: ['Consider fruit salad instead']
      }
    ])
    
    setProgress(100)
    setState('complete')
  }

  const resetApp = () => {
    setState('idle')
    setUploadedImage(null)
    setProgress(0)
    setMenuItems([])
  }

  const getFodmapColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-emerald-100 text-emerald-800'
      case 'moderate': return 'bg-amber-100 text-amber-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFodmapIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="w-4 h-4" />
      case 'moderate': return <AlertTriangle className="w-4 h-4" />
      case 'high': return <XCircle className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            FODMAP Menu Converter
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload restaurant menu photos and get personalized FODMAP information for each dish
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="max-w-2xl mx-auto">
                <CardContent className="p-12">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <Upload className="w-12 h-12 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-4">Upload Menu Image</h2>
                    <p className="text-gray-600 mb-8">
                      Take a photo or upload an image of a restaurant menu to get started
                    </p>
                    <label htmlFor="menu-upload" className="cursor-pointer">
                      <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                        <FileImage className="w-5 h-5 mr-2" />
                        Choose Image
                      </Button>
                      <input
                        id="menu-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {(state === 'uploading' || state === 'analyzing') && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="max-w-2xl mx-auto">
                <CardContent className="p-12">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <Brain className="w-12 h-12 text-purple-600 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-4">
                      {state === 'uploading' ? 'Uploading Image...' : 'Analyzing Menu...'}
                    </h2>
                    <p className="text-gray-600 mb-8">
                      {state === 'uploading' 
                        ? 'Processing your menu image' 
                        : 'Identifying dishes and analyzing FODMAP content'
                      }
                    </p>
                    <div className="w-full max-w-md mx-auto">
                      <Progress value={progress} className="h-3" />
                      <p className="text-sm text-gray-500 mt-2">{progress}% complete</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {state === 'complete' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid lg:grid-cols-2 gap-8"
            >
              {/* Original Menu */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileImage className="w-5 h-5" />
                    Original Menu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {uploadedImage && (
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded menu" 
                      className="w-full rounded-lg shadow-sm"
                    />
                  )}
                </CardContent>
              </Card>

              {/* FODMAP Analysis */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    FODMAP Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <Badge className={`${getFodmapColor(item.fodmapLevel)} flex items-center gap-1`}>
                          {getFodmapIcon(item.fodmapLevel)}
                          {item.fodmapLevel.toUpperCase()}
                        </Badge>
                      </div>
                      
                      {item.description && (
                        <p className="text-gray-600 mb-3">{item.description}</p>
                      )}
                      
                      {item.concerns.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-red-700 mb-1">Concerns:</p>
                          <ul className="text-sm text-red-600 list-disc list-inside">
                            {item.concerns.map((concern, i) => (
                              <li key={i}>{concern}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {item.alternatives && item.alternatives.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-green-700 mb-1">Alternatives:</p>
                          <ul className="text-sm text-green-600 list-disc list-inside">
                            {item.alternatives.map((alt, i) => (
                              <li key={i}>{alt}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  
                  <div className="pt-4 border-t">
                    <Button onClick={resetApp} variant="secondary" className="w-full">
                      Analyze Another Menu
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App