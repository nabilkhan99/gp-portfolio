'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MultiSelect } from '@/components/multi-select'
import { ReviewSection } from '@/components/review-section'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function Home() {
  const [caseDescription, setCaseDescription] = useState('')
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [reviewContent, setReviewContent] = useState<ReviewContent | null>(null)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!caseDescription) {
      toast({
        title: "Error",
        description: "Please enter a case description",
        variant: "destructive"
      })
      return
    }

    if (selectedCapabilities.length === 0 || selectedCapabilities.length > 3) {
      toast({
        title: "Error",
        description: "Please select 1-3 capabilities",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseDescription,
          capabilities: selectedCapabilities,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate review')
      }

      setReviewContent(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate review",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="container mx-auto p-4 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center">GP Portfolio Generator 🏥</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="case-description">Case Description</Label>
                <Textarea
                  id="case-description"
                  placeholder="Enter your case description..."
                  className="min-h-[200px]"
                  value={caseDescription}
                  onChange={(e) => setCaseDescription(e.target.value)}
                />
              </div>

              <div>
                <Label>Capabilities</Label>
                <MultiSelect
                  selected={selectedCapabilities}
                  onChange={setSelectedCapabilities}
                  maxItems={3}
                />
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !caseDescription || selectedCapabilities.length === 0}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Case Review'
                )}
              </Button>
            </div>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">How to use</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Enter your case description in detail</li>
              <li>Select 1-3 capabilities from the dropdown</li>
              <li>Click &apos;Generate Case Review&apos;</li>
              <li>Edit the generated sections as needed</li>
              <li>Copy sections to your portfolio</li>
            </ol>
          </Card>
        </div>
      </div>

      {reviewContent && (
        <div className="mt-8">
          <ReviewSection content={reviewContent} />
        </div>
      )}
    </main>
  )
}
