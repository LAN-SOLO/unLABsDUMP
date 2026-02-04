'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { CodeBlock } from './code-block'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'bg-green-600/20 text-green-400 border-green-600/30',
  POST: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
  PUT: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
  DELETE: 'bg-red-600/20 text-red-400 border-red-600/30',
  PATCH: 'bg-orange-600/20 text-orange-400 border-orange-600/30',
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
    <Card className={cn('border-slate-800 bg-slate-900/50 overflow-hidden', className)}>
      {/* Header */}
      <div className="border-b border-slate-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <Badge
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-bold tracking-wider',
              METHOD_COLORS[method]
            )}
          >
            {method}
          </Badge>
          <code className="text-sm font-medium text-white">{path}</code>
        </div>
        <p className="mt-2 text-sm text-slate-400">{description}</p>
      </div>

      {/* Parameters */}
      {parameters && parameters.length > 0 && (
        <div className="border-b border-slate-800 px-6 py-4">
          <h4 className="mb-3 text-sm font-semibold text-slate-200">Parameters</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="pb-2 pr-4 text-left font-medium text-slate-400">Name</th>
                  <th className="pb-2 pr-4 text-left font-medium text-slate-400">Type</th>
                  <th className="pb-2 pr-4 text-left font-medium text-slate-400">In</th>
                  <th className="pb-2 pr-4 text-left font-medium text-slate-400">Required</th>
                  <th className="pb-2 text-left font-medium text-slate-400">Description</th>
                </tr>
              </thead>
              <tbody>
                {parameters.map((param) => (
                  <tr key={param.name} className="border-b border-slate-800/50 last:border-0">
                    <td className="py-2 pr-4">
                      <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-purple-400">
                        {param.name}
                      </code>
                    </td>
                    <td className="py-2 pr-4">
                      <span className="text-cyan-400">{param.type}</span>
                    </td>
                    <td className="py-2 pr-4">
                      <span className="text-slate-400">{param.location}</span>
                    </td>
                    <td className="py-2 pr-4">
                      {param.required ? (
                        <span className="text-red-400">Required</span>
                      ) : (
                        <span className="text-slate-500">Optional</span>
                      )}
                    </td>
                    <td className="py-2 text-slate-300">{param.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Request Example */}
      {requestExample && (
        <div className="border-b border-slate-800 px-6 py-4">
          <h4 className="mb-3 text-sm font-semibold text-slate-200">Example Request</h4>
          <CodeBlock code={requestExample} language="typescript" />
        </div>
      )}

      {/* Response Example */}
      {responseExample && (
        <div className="px-6 py-4">
          <h4 className="mb-3 text-sm font-semibold text-slate-200">Example Response</h4>
          <CodeBlock code={responseExample} language="json" />
        </div>
      )}
    </Card>
  )
}
