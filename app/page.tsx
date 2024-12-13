// File: src/app/page.tsx
'use client'

import { useState } from 'react'

interface ReviewContent {
  briefDescription: string
  capabilities: Record<string, string>
  reflection: string
  learningNeeds: string
}

const CAPABILITIES = [
  'Fitness to practise',
  'Maintaining an ethical approach',
  'Communication and consultation skills',
  'Data gathering and interpretation',
  'Clinical examination and procedural skills',
  'Making a diagnosis',
  'Clinical management',
  'Managing medical complexity',
  'Working with colleagues and in teams',
  'Maintaining performance, learning and teaching',
  'Organisation, management and leadership',
  'Practising holistically and promoting health',
  'Community orientation'
]

export default function Home() {
  const [caseDescription, setCaseDescription] = useState('')
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [reviewContent, setReviewContent] = useState<ReviewContent | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleCapabilitySelect = (capability: string) => {
    if (selectedCapabilities.includes(capability)) {
      setSelectedCapabilities(selectedCapabilities.filter(cap => cap !== capability))
    } else if (selectedCapabilities.length < 3) {
      setSelectedCapabilities([...selectedCapabilities, capability])
    } else {
      showToast('You can only select up to 3 capabilities', 'error')
    }
  }

  const handleGenerate = async () => {
    if (!caseDescription) {
      showToast('Please enter a case description', 'error')
      return
    }

    if (selectedCapabilities.length === 0) {
      showToast('Please select at least one capability', 'error')
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

      if (!response.ok) {
        throw new Error('Failed to generate review')
      }

      const data = await response.json()
      setReviewContent(data)
      showToast('Portfolio entry generated successfully', 'success')
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to generate review',
        'error'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showToast(`${section} copied to clipboard`, 'success')
    } catch (err) {
      showToast('Failed to copy to clipboard', 'error')
    }
  }

  return (
    <main className="max-w-7xl mx-auto p-4 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center">GP Portfolio Generator</h1>
      
      {toast && (
        <div 
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
          } text-white`}
        >
          {toast.message}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Case Description
                </label>
                <textarea
                  className="w-full min-h-[200px] p-3 border rounded-lg resize-y"
                  placeholder="Enter your case description..."
                  value={caseDescription}
                  onChange={(e) => setCaseDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Selected Capabilities ({selectedCapabilities.length}/3)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  {selectedCapabilities.map((cap) => (
                    <div
                      key={cap}
                      className="flex items-center justify-between bg-gray-100 p-2 rounded-lg"
                    >
                      <span className="text-sm">{cap}</span>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleCapabilitySelect(cap)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <select
                  className="w-full p-2 border rounded-lg"
                  onChange={(e) => handleCapabilitySelect(e.target.value)}
                  value=""
                  disabled={selectedCapabilities.length >= 3}
                >
                  <option value="">Select a capability</option>
                  {CAPABILITIES.map((cap) => (
                    <option
                      key={cap}
                      value={cap}
                      disabled={selectedCapabilities.includes(cap)}
                    >
                      {cap}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !caseDescription || selectedCapabilities.length === 0}
                className={`w-full py-2 rounded-lg ${
                  isGenerating || !caseDescription || selectedCapabilities.length === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isGenerating ? 'Generating...' : 'Generate Portfolio Entry'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">How to use</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Enter your case description in detail</li>
              <li>Select up to 3 capabilities from the dropdown</li>
              <li>Click &apos;Generate Portfolio Entry&apos;</li>
              <li>Review and edit the generated content</li>
              <li>Copy sections to your portfolio</li>
            </ol>
          </div>
        </div>
      </div>

      {reviewContent && (
        <div className="mt-8 space-y-6">
          {['Brief Description', 'Reflection', 'Learning Needs'].map((section) => {
            const key = section.toLowerCase().replace(/ /g, '') as keyof ReviewContent
            return (
              <div key={section} className="bg-white rounded-lg shadow-lg">
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-xl font-semibold">{section}</h2>
                  <button
                    onClick={() => copyToClipboard(reviewContent[key] as string, section)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Copy
                  </button>
                </div>
                <div className="p-4">
                  <textarea
                    value={reviewContent[key] as string}
                    onChange={(e) => setReviewContent({
                      ...reviewContent,
                      [key]: e.target.value
                    })}
                    className="w-full min-h-[150px] p-3 border rounded-lg resize-y"
                  />
                </div>
              </div>
            )
          })}

          {Object.entries(reviewContent.capabilities).map(([capability, text]) => (
            <div key={capability} className="bg-white rounded-lg shadow-lg">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">{capability}</h2>
                <button
                  onClick={() => copyToClipboard(text, capability)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Copy
                </button>
              </div>
              <div className="p-4">
                <textarea
                  value={text}
                  onChange={(e) => setReviewContent({
                    ...reviewContent,
                    capabilities: {
                      ...reviewContent.capabilities,
                      [capability]: e.target.value
                    }
                  })}
                  className="w-full min-h-[150px] p-3 border rounded-lg resize-y"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
