import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, FileImage, Brain, CheckCircle, AlertTriangle, XCircle, Sparkles, Camera, Zap, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from './lib/supabaseClient'

type ProcessingState = 'idle' | 'uploading' | 'analyzing' | 'complete'

interface FodmapItem {
  name: string
  description?: string
  fodmapLevel: 'low' | 'moderate' | 'high' | 'unknown'
  concerns: string[]
  alternatives?: string[]
}

function App() {
  const [state, setState] = useState<ProcessingState>('idle')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [menuItems, setMenuItems] = useState<FodmapItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setState('uploading')
    setError(null)
    setProgress(0)

    try {
      // 1. Upload image to Supabase Storage
      const fileName = `${Date.now()}_${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError
      setProgress(30)

      // 2. Get public URL for the uploaded image
      const { data: urlData } = supabase.storage
        .from('menu-images')
        .getPublicUrl(uploadData.path)
      
      setUploadedImage(urlData.publicUrl)

      // 3. Call Supabase Edge Function to analyze the image
      setState('analyzing')
      setProgress(50)

      const { data: analysisResults, error: functionError } = await supabase.functions.invoke(
        'analyze-menu',
        { body: { imageUrl: urlData.publicUrl } }
      )

      if (functionError) {
        console.error("Edge function error details:", functionError.message)
        let detailedError = "Failed to analyze menu.";
        try {
          // Attempt to parse the error message if it's JSON
          const parsedError = JSON.parse(functionError.message);
          if (parsedError && parsedError.error) {
            detailedError = parsedError.error;
            if(parsedError.details) detailedError += `: ${parsedError.details}`;
          }
        } catch (parseError: unknown) {
          console.warn("Could not parse error message as JSON:", parseError); 
          // If not JSON, use the raw message
          detailedError = functionError.message;
        }
        throw new Error(detailedError);
      }
      
      // Ensure results are in the expected format
      const validatedResults = (analysisResults as FodmapItem[] || []).map(item => ({
        name: item.name || "Unknown Item",
        description: item.description || "",
        fodmapLevel: item.fodmapLevel && ['low', 'moderate', 'high'].includes(item.fodmapLevel.toLowerCase()) 
                       ? item.fodmapLevel.toLowerCase() as FodmapItem['fodmapLevel'] 
                       : 'unknown',
        concerns: Array.isArray(item.concerns) ? item.concerns : [],
        alternatives: Array.isArray(item.alternatives) ? item.alternatives : [],
      }));

      setMenuItems(validatedResults)
      setProgress(100)
      setState('complete')

    } catch (err: unknown) {
      const typedError = err as Error; 
      console.error("Error during processing:", typedError)
      setError(typedError.message || "An unexpected error occurred.")
      setState('idle') 
      setUploadedImage(null)
    }
  }

  const resetApp = () => {
    setState('idle')
    setUploadedImage(null)
    setProgress(0)
    setMenuItems([])
    setError(null) 
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const getFodmapColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200'
      case 'moderate': return 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200'
      case 'high': return 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200'
      case 'unknown': return 'bg-gradient-to-r from-slate-50 to-gray-50 text-slate-700 border-slate-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getFodmapIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="w-4 h-4" />
      case 'moderate': return <AlertTriangle className="w-4 h-4" />
      case 'high': return <XCircle className="w-4 h-4" />
      case 'unknown': return <AlertCircle className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f6,transparent)] opacity-[0.15]"></div>
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-16 max-w-7xl">
          {/* Modern Header */}
          <motion.div 
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-full text-sm text-slate-600 mb-6">
              <Sparkles className="w-4 h-4 text-blue-500" />
              Powered by AI Analysis
            </div>
            <h1 className="text-6xl md:text-7xl font-serif font-semibold text-slate-900 mb-6 tracking-tight">
              FODMAP Menu
              <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent"> Converter</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Transform any restaurant menu into a personalized FODMAP guide with intelligent AI analysis
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {state === 'idle' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-xl border-0 shadow-xl shadow-slate-200/50">
                  <CardContent className="p-16">
                    <div className="text-center">
                      <div className="relative mb-8">
                        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/25">
                          <Upload className="w-16 h-16 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                          <Camera className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <h2 className="text-3xl font-serif font-semibold text-slate-900 mb-4">Upload Your Menu</h2>
                      <p className="text-lg text-slate-600 mb-12 leading-relaxed">
                        Snap a photo or upload an image of any restaurant menu to get started
                      </p>
                      <Button 
                        size="lg" 
                        className="px-8 py-6 text-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border-0"
                        onClick={handleButtonClick}
                      >
                        <FileImage className="w-6 h-6 mr-3" />
                        Choose Image
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        ref={fileInputRef}
                      />
                      <p className="text-sm text-slate-500 mt-6">
                        Supports JPG, PNG, and other image formats
                      </p>
                      {error && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            <span>{error}</span>
                          </div>
                        </motion.div>
                      )}
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
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-xl border-0 shadow-xl shadow-slate-200/50">
                  <CardContent className="p-16">
                    <div className="text-center">
                      <div className="relative mb-8">
                        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
                          <Brain className="w-16 h-16 text-white animate-pulse" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-spin">
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <h2 className="text-3xl font-serif font-semibold text-slate-900 mb-4">
                        {state === 'uploading' ? 'Processing Image...' : 'Analyzing Menu...'}
                      </h2>
                      <p className="text-lg text-slate-600 mb-12 leading-relaxed">
                        {state === 'uploading' 
                          ? 'Preparing your menu image for analysis' 
                          : 'AI is identifying dishes and analyzing FODMAP content'
                        }
                      </p>
                      <div className="w-full max-w-md mx-auto mb-6">
                        <Progress value={progress} className="h-3 bg-slate-200" />
                      </div>
                      <p className="text-lg font-medium text-slate-700">{progress}% complete</p>
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
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="grid lg:grid-cols-2 gap-12"
              >
                {/* Original Menu */}
                <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl shadow-slate-200/50 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200/60">
                    <CardTitle className="flex items-center gap-3 text-xl font-serif">
                      <div className="w-10 h-10 bg-gradient-to-r from-slate-500 to-gray-600 rounded-lg flex items-center justify-center">
                        <FileImage className="w-5 h-5 text-white" />
                      </div>
                      Original Menu
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    {uploadedImage && (
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded menu" 
                        className="w-full rounded-xl shadow-lg border border-slate-200/60"
                      />
                    )}
                  </CardContent>
                </Card>

                {/* FODMAP Analysis */}
                <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl shadow-slate-200/50 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200/60">
                    <CardTitle className="flex items-center gap-3 text-xl font-serif">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      FODMAP Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    {menuItems.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.15, duration: 0.5 }}
                        className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="font-serif font-semibold text-xl text-slate-900">{item.name}</h3>
                          <Badge className={`${getFodmapColor(item.fodmapLevel)} flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-full`}>
                            {getFodmapIcon(item.fodmapLevel)}
                            {item.fodmapLevel.toUpperCase()}
                          </Badge>
                        </div>
                        
                        {item.description && (
                          <p className="text-slate-600 mb-4 leading-relaxed">{item.description}</p>
                        )}
                        
                        {item.concerns.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-semibold text-red-700 mb-2">⚠️ Concerns:</p>
                            <ul className="text-sm text-red-600 space-y-1">
                              {item.concerns.map((concern, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                                  {concern}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {item.alternatives && item.alternatives.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-emerald-700 mb-2">✨ Alternatives:</p>
                            <ul className="text-sm text-emerald-600 space-y-1">
                              {item.alternatives.map((alt, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                                  {alt}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    ))}
                    
                    <div className="pt-6 border-t border-slate-200/60">
                      <Button 
                        onClick={resetApp} 
                        variant="secondary" 
                        className="w-full py-3 text-lg bg-gradient-to-r from-slate-100 to-gray-100 hover:from-slate-200 hover:to-gray-200 border border-slate-300/60 rounded-xl transition-all duration-300"
                      >
                        <Upload className="w-5 h-5 mr-2" />
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
    </div>
  )
}

export default App