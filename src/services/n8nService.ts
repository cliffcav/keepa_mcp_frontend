/**
 * n8n Workflow Service
 *
 * This service handles communication with n8n webhooks.
 * Configure your webhook URLs in the .env file.
 */

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL

export type WorkflowStatus = 'idle' | 'processing' | 'success' | 'error'

export type WorkflowResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Execute an n8n workflow via webhook
 * @param data - The data to send to the workflow
 * @param webhookUrl - Optional override for the webhook URL
 */
export async function executeWorkflow<T = any>(
  data: Record<string, any>,
  webhookUrl?: string
): Promise<WorkflowResponse<T>> {
  const url = webhookUrl || N8N_WEBHOOK_URL

  if (!url) {
    return {
      success: false,
      error: 'Webhook URL not configured. Please set VITE_N8N_WEBHOOK_URL in your .env file.',
    }
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error('Workflow execution error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    }
  }
}

/**
 * Execute an n8n workflow with file upload
 * @param formData - FormData containing files and other data
 * @param webhookUrl - Optional override for the webhook URL
 */
export async function executeWorkflowWithFiles<T = any>(
  formData: FormData,
  webhookUrl?: string
): Promise<WorkflowResponse<T>> {
  const url = webhookUrl || N8N_WEBHOOK_URL

  if (!url) {
    return {
      success: false,
      error: 'Webhook URL not configured. Please set VITE_N8N_WEBHOOK_URL in your .env file.',
    }
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error('Workflow execution error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    }
  }
}

/**
 * Poll an n8n workflow for results
 * Useful for long-running workflows that return a job ID
 * @param jobId - The job ID to poll for
 * @param statusUrl - The URL to check job status
 * @param interval - Polling interval in milliseconds (default: 2000)
 * @param maxAttempts - Maximum number of polling attempts (default: 30)
 */
export async function pollWorkflowStatus<T = any>(
  jobId: string,
  statusUrl: string,
  interval = 2000,
  maxAttempts = 30
): Promise<WorkflowResponse<T>> {
  let attempts = 0

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`${statusUrl}/${jobId}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // Adjust these conditions based on your n8n workflow response structure
      if (result.status === 'completed' || result.status === 'success') {
        return {
          success: true,
          data: result,
        }
      }

      if (result.status === 'failed' || result.status === 'error') {
        return {
          success: false,
          error: result.error || 'Workflow execution failed',
        }
      }

      // If still processing, wait and try again
      await new Promise((resolve) => setTimeout(resolve, interval))
      attempts++
    } catch (error) {
      console.error('Polling error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }
    }
  }

  return {
    success: false,
    error: 'Workflow execution timed out',
  }
}
