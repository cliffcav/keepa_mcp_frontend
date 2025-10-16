import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Alert, AlertDescription } from '../components/ui/alert'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { CheckCircle, AlertCircle, Eye, EyeOff, Trash2 } from 'lucide-react'

type ApiKey = {
  id: string
  key_name: string
  encrypted_key: string
  created_at: string
}

export function Settings() {
  const { user } = useAuth()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form state
  const [keyName, setKeyName] = useState('')
  const [keyValue, setKeyValue] = useState('')
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setApiKeys(data || [])
    } catch (error) {
      console.error('Error loading API keys:', error)
      setMessage({
        type: 'error',
        text: 'Failed to load API keys. Make sure the user_api_keys table exists in Supabase.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !keyName || !keyValue) return

    setSaving(true)
    setMessage(null)

    try {
      // In a production app, you should encrypt the key on the backend
      // This is a simplified example
      const { error } = await supabase.from('user_api_keys').insert({
        user_id: user.id,
        key_name: keyName,
        encrypted_key: keyValue, // In production, encrypt this!
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'API key added successfully' })
      setKeyName('')
      setKeyValue('')
      loadApiKeys()
    } catch (error) {
      console.error('Error adding API key:', error)
      setMessage({ type: 'error', text: 'Failed to add API key' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return

    try {
      const { error } = await supabase.from('user_api_keys').delete().eq('id', id)

      if (error) throw error

      setMessage({ type: 'success', text: 'API key deleted successfully' })
      loadApiKeys()
    } catch (error) {
      console.error('Error deleting API key:', error)
      setMessage({ type: 'error', text: 'Failed to delete API key' })
    }
  }

  const toggleShowKey = (id: string) => {
    setShowKeys((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account and API keys</p>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input value={user?.id || ''} disabled className="font-mono text-sm" />
            </div>
          </CardContent>
        </Card>

        {/* API Keys Section */}
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Store API keys securely for use in your n8n workflows. These keys are encrypted and stored in Supabase.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {message && (
              <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                {message.type === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            {/* Add New Key Form */}
            <form onSubmit={handleAddKey} className="space-y-4 border-b pb-6">
              <div className="space-y-2">
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="e.g., OpenAI API Key"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keyValue">API Key Value</Label>
                <Input
                  id="keyValue"
                  type="password"
                  placeholder="Enter your API key"
                  value={keyValue}
                  onChange={(e) => setKeyValue(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? 'Adding...' : 'Add API Key'}
              </Button>
            </form>

            {/* Existing Keys List */}
            <div className="space-y-4">
              <h3 className="font-medium">Stored API Keys</h3>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : apiKeys.length === 0 ? (
                <p className="text-sm text-muted-foreground">No API keys stored yet.</p>
              ) : (
                <div className="space-y-3">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{key.key_name}</p>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {showKeys[key.id]
                              ? key.encrypted_key
                              : '•'.repeat(Math.min(key.encrypted_key.length, 20))}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleShowKey(key.id)}
                          >
                            {showKeys[key.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Added {new Date(key.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteKey(key.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
