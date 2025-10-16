import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Layout } from '../components/Layout'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { executeWorkflow, type WorkflowResponse } from '../services/n8nService'
import { Send, Bot, User, Lightbulb } from 'lucide-react'

const SAMPLE_QUESTIONS = [
  "Find the top 20 selling products in electronics",
  "Find products with high sales but fewer than 5 sellers in the Beauty category",
  "What are the trending products in Home & Kitchen?",
  "Show me profitable products with low competition in Sports",
]

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m Seller Scout AI. Skip the data digging - just ask what\'s selling, what\'s trending, or where the next opportunity lies. How can I help you today?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSamples, setShowSamples] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSampleClick = async (question: string) => {
    if (isLoading) return

    setShowSamples(false)
    setInput('')

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Send the user's message to the n8n workflow
      const response: WorkflowResponse = await executeWorkflow({
        message: userMessage.content,
        timestamp: userMessage.timestamp.toISOString()
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.success
          ? (response.data?.output || response.data?.message || JSON.stringify(response.data, null, 2))
          : `I apologize, but I encountered an error: ${response.error || 'Unknown error'}`,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an unexpected error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    setShowSamples(false)

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Send the user's message to the n8n workflow
      const response: WorkflowResponse = await executeWorkflow({
        message: userMessage.content,
        timestamp: userMessage.timestamp.toISOString()
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.success
          ? (response.data?.output || response.data?.message || JSON.stringify(response.data, null, 2))
          : `I apologize, but I encountered an error: ${response.error || 'Unknown error'}`,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an unexpected error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
        {/* Chat Container */}
        <Card className="flex-1 flex flex-col overflow-hidden min-h-0">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Marketplace Insights
                </CardTitle>
                <CardDescription>
                  Ask about products, trends, pricing, or market opportunities
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSamples(!showSamples)}
                className="gap-2"
              >
                <Lightbulb className="h-4 w-4" />
                {showSamples ? 'Hide' : 'Show'} Examples
              </Button>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Sample Questions */}
            {showSamples && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                  <Lightbulb className="h-4 w-4" />
                  <span className="text-sm font-medium">Try asking:</span>
                </div>
                <div className="grid gap-2">
                  {SAMPLE_QUESTIONS.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSampleClick(question)}
                      className="text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-sm"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`flex-1 rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-12'
                      : 'bg-muted mr-12'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex-1 rounded-lg p-3 bg-muted mr-12">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Form */}
          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about products, trends, or market insights..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </Layout>
  )
}
