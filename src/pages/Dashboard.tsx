import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Layout } from '../components/Layout'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select } from '../components/ui/select'
import { Textarea } from '../components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { Loading } from '../components/ui/loading'
import { executeWorkflow, type WorkflowResponse } from '../services/n8nService'
import { CheckCircle, AlertCircle, Upload } from 'lucide-react'

// Example form data type - customize this for your workflow
type WorkflowFormData = {
  textInput: string
  selectOption: string
  numberInput: number
  textareaInput: string
  dateInput: string
  checkboxInput: boolean
  file?: FileList
}

export function Dashboard() {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const { register, handleSubmit, formState: { errors }, reset } = useForm<WorkflowFormData>()

  const onSubmit = async (data: WorkflowFormData) => {
    setStatus('processing')
    setErrorMessage('')
    setResult(null)

    // Example: Send data to n8n webhook
    // Customize this based on your workflow requirements
    const workflowData = {
      textInput: data.textInput,
      selectOption: data.selectOption,
      numberInput: data.numberInput,
      textareaInput: data.textareaInput,
      dateInput: data.dateInput,
      checkboxInput: data.checkboxInput,
      // Note: For file uploads, you'll need to handle them separately
      // See executeWorkflowWithFiles in n8nService.ts
    }

    const response: WorkflowResponse = await executeWorkflow(workflowData)

    if (response.success) {
      setStatus('success')
      setResult(response.data)
    } else {
      setStatus('error')
      setErrorMessage(response.error || 'An error occurred')
    }
  }

  const handleReset = () => {
    reset()
    setStatus('idle')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Workflow Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Execute your n8n workflow with custom inputs
          </p>
        </div>

        {/* Workflow Form */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Configuration</CardTitle>
            <CardDescription>
              Fill in the form below to trigger your n8n workflow. Customize these fields based on your workflow requirements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Text Input Example */}
              <div className="space-y-2">
                <Label htmlFor="textInput">Text Input</Label>
                <Input
                  id="textInput"
                  placeholder="Enter some text"
                  {...register('textInput')}
                />
                {errors.textInput && (
                  <p className="text-sm text-destructive">{errors.textInput.message}</p>
                )}
              </div>

              {/* Select Dropdown Example */}
              <div className="space-y-2">
                <Label htmlFor="selectOption">Select Option</Label>
                <Select
                  id="selectOption"
                  {...register('selectOption')}
                >
                  <option value="">Choose an option...</option>
                  <option value="option1">Option 1</option>
                  <option value="option2">Option 2</option>
                  <option value="option3">Option 3</option>
                </Select>
                {errors.selectOption && (
                  <p className="text-sm text-destructive">{errors.selectOption.message}</p>
                )}
              </div>

              {/* Number Input Example */}
              <div className="space-y-2">
                <Label htmlFor="numberInput">Number Input</Label>
                <Input
                  id="numberInput"
                  type="number"
                  placeholder="Enter a number"
                  {...register('numberInput', {
                    valueAsNumber: true
                  })}
                />
                {errors.numberInput && (
                  <p className="text-sm text-destructive">{errors.numberInput.message}</p>
                )}
              </div>

              {/* Textarea Example */}
              <div className="space-y-2">
                <Label htmlFor="textareaInput">Description</Label>
                <Textarea
                  id="textareaInput"
                  placeholder="Enter a detailed description"
                  rows={4}
                  {...register('textareaInput')}
                />
              </div>

              {/* Date Input Example */}
              <div className="space-y-2">
                <Label htmlFor="dateInput">Date</Label>
                <Input
                  id="dateInput"
                  type="date"
                  {...register('dateInput')}
                />
                {errors.dateInput && (
                  <p className="text-sm text-destructive">{errors.dateInput.message}</p>
                )}
              </div>

              {/* Checkbox Example */}
              <div className="flex items-center space-x-2">
                <input
                  id="checkboxInput"
                  type="checkbox"
                  className="h-4 w-4 rounded border-input"
                  {...register('checkboxInput')}
                />
                <Label htmlFor="checkboxInput" className="cursor-pointer">
                  Enable optional feature
                </Label>
              </div>

              {/* File Upload Example */}
              <div className="space-y-2">
                <Label htmlFor="file">File Upload (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file"
                    type="file"
                    {...register('file')}
                  />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Note: File uploads require using executeWorkflowWithFiles() in the n8nService
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={status === 'processing'}
                  className="flex-1"
                >
                  {status === 'processing' ? 'Processing...' : 'Execute Workflow'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={status === 'processing'}
                >
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Loading State */}
        {status === 'processing' && (
          <Card>
            <CardContent className="py-8">
              <Loading size="lg" text="Processing your request..." />
            </CardContent>
          </Card>
        )}

        {/* Success Result */}
        {status === 'success' && result && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Workflow Completed Successfully</AlertTitle>
            <AlertDescription>
              <div className="mt-2">
                <p className="font-medium mb-2">Result:</p>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Error State */}
        {status === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Customization Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>To customize this form for your n8n workflow:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Modify the WorkflowFormData type to match your workflow inputs</li>
              <li>Add, remove, or modify form fields as needed</li>
              <li>Update the onSubmit function to format data for your webhook</li>
              <li>Configure your n8n webhook URL in the .env file</li>
              <li>Customize the result display based on your workflow output</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
