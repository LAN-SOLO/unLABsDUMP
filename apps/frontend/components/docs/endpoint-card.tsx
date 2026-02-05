'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { CodeBlock } from './code-block'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/30',
  POST: 'bg-[#00FFFF]/20 text-[#00FFFF] border-[#00FFFF]/30',
  PUT: 'bg-[#FFB000]/20 text-[#FFB000] border-[#FFB000]/30',
  DELETE: 'bg-[#FF3333]/20 text-[#FF3333] border-[#FF3333]/30',
  PATCH: 'bg-[#FFB000]/20 text-[#FFB000] border-[#FFB000]/30',
}

interface Parameter {
  name: string
  type: string
  required: boolean
  description: string
  location: 'path' | 'query' | 'body' | 'header'
}

interface EndpointCardProps {
  method: HttpMethod
  path: string
  description: string
  parameters?: Parameter[]
  requestExample?: string
  responseExample?: string
  className?: string
}

export function EndpointCard({
  method,
  path,
  description,
  parameters,
  requestExample,
  responseExample,
  className,
}: EndpointCardProps) {
  return (
    <Card className={cn('border-[#0D3B1E] bg-[#0D1117]/50 overflow-hidden', className)}>
      {/* Header */}
      <div className="border-b border-[#0D3B1E] px-6 py-4">
        <div className="flex items-center gap-3">
          <Badge
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-bold tracking-wider',
              METHOD_COLORS[method]
            )}
          >
            {method}
          </Badge>
          <code className="text-sm font-medium text-[#00FF41]">{path}</code>
        </div>
        <p className="mt-2 text-sm text-[#00AA2A]">{description}</p>
      </div>

      {/* Parameters */}
      {parameters && parameters.length > 0 && (
        <div className="border-b border-[#0D3B1E] px-6 py-4">
          <h4 className="mb-3 text-sm font-semibold text-[#00FF41]">Parameters</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#0D3B1E]">
                  <th className="pb-2 pr-4 text-left font-medium text-[#00AA2A]">Name</th>
                  <th className="pb-2 pr-4 text-left font-medium text-[#00AA2A]">Type</th>
                  <th className="pb-2 pr-4 text-left font-medium text-[#00AA2A]">In</th>
                  <th className="pb-2 pr-4 text-left font-medium text-[#00AA2A]">Required</th>
                  <th className="pb-2 text-left font-medium text-[#00AA2A]">Description</th>
                </tr>
              </thead>
              <tbody>
                {parameters.map((param) => (
                  <tr key={param.name} className="border-b border-[#0D3B1E]/50 last:border-0">
                    <td className="py-2 pr-4">
                      <code className="rounded bg-[#111318] px-1.5 py-0.5 text-xs text-[#00FF41]">
                        {param.name}
                      </code>
                    </td>
                    <td className="py-2 pr-4">
                      <span className="text-[#00FFFF]">{param.type}</span>
                    </td>
                    <td className="py-2 pr-4">
                      <span className="text-[#00AA2A]">{param.location}</span>
                    </td>
                    <td className="py-2 pr-4">
                      {param.required ? (
                        <span className="text-[#FF3333]">Required</span>
                      ) : (
                        <span className="text-[#1A6B35]">Optional</span>
                      )}
                    </td>
                    <td className="py-2 text-[#00CC33]">{param.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Request Example */}
      {requestExample && (
        <div className="border-b border-[#0D3B1E] px-6 py-4">
          <h4 className="mb-3 text-sm font-semibold text-[#00FF41]">Example Request</h4>
          <CodeBlock code={requestExample} language="typescript" />
        </div>
      )}

      {/* Response Example */}
      {responseExample && (
        <div className="px-6 py-4">
          <h4 className="mb-3 text-sm font-semibold text-[#00FF41]">Example Response</h4>
          <CodeBlock code={responseExample} language="json" />
        </div>
      )}
    </Card>
  )
}
