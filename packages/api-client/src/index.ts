import type { ApiResponse, PaginatedResponse, NFTPackage, Transaction } from '@unstablecoins/types'

export interface ApiClientConfig {
  baseUrl: string
  headers?: Record<string, string>
}

export class ApiClient {
  private baseUrl: string
  private headers: Record<string, string>

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    }
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.headers,
          ...options?.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Request failed' }
      }

      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async getPackages(): Promise<ApiResponse<PaginatedResponse<NFTPackage>>> {
    return this.request('/api/packages')
  }

  async getPackage(id: string): Promise<ApiResponse<NFTPackage>> {
    return this.request(`/api/packages/${id}`)
  }

  async getTransactions(userId: string): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    return this.request(`/api/users/${userId}/transactions`)
  }
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config)
}
