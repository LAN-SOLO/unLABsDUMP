'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  BarChart3,
  Download,
  FileText,
  ShoppingCart,
  Package,
  Flame,
  Truck,
  Users,
  Calendar,
} from 'lucide-react'
import { REPORT_TEMPLATES, type ReportTemplate } from '@/lib/reports/templates'

const categoryIcons: Record<string, typeof BarChart3> = {
  sales: ShoppingCart,
  inventory: Package,
  burn: Flame,
  delivery: Truck,
  admin: Users,
}

const categoryColors: Record<string, string> = {
  sales: 'bg-[#00FF41]/10 border-[#0D3B1E]/50 text-[#00FF41]',
  inventory: 'bg-[#00FFFF]/10 border-[#00FFFF]/30 text-[#00FFFF]',
  burn: 'bg-[#00FF41]/10 border-[#0D3B1E]/50 text-[#00FF41]',
  delivery: 'bg-[#00FFFF]/10 border-[#00FFFF]/50 text-[#00FFFF]',
  admin: 'bg-[#FFB000]/10 border-[#FFB000]/30 text-[#FFB000]',
}

interface ReportResult {
  title: string
  generatedAt: string
  dateRange: { start: string; end: string }
  data: Record<string, unknown>
}

export default function ReportsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [report, setReport] = useState<ReportResult | null>(null)
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filteredTemplates =
    categoryFilter === 'all'
      ? REPORT_TEMPLATES
      : REPORT_TEMPLATES.filter((t) => t.category === categoryFilter)

  const generateReport = async (format: 'json' | 'csv' = 'json') => {
    if (!selectedTemplate) return

    setIsGenerating(true)
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          format,
        }),
      })

      if (format === 'csv') {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${selectedTemplate.id}-${Date.now()}.csv`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        const data = await res.json()
        if (res.ok) {
          setReport(data)
        }
      }
    } catch {
      // Handle error
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#00FF41]">Reports</h1>
        <p className="text-[#00AA2A] mt-1">Generate and export platform reports</p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'sales', 'inventory', 'burn', 'delivery', 'admin'].map((cat) => (
          <Button
            key={cat}
            variant={categoryFilter === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter(cat)}
            className={categoryFilter === cat ? 'bg-[#00FF41] text-black hover:bg-[#00CC33]' : ''}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Template Selection */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-medium text-[#00FF41]">Report Templates</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredTemplates.map((template) => {
              const Icon = categoryIcons[template.category] || FileText
              const colorClass = categoryColors[template.category]
              const isSelected = selectedTemplate?.id === template.id

              return (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-[#0D3B1E]/30 border-[#00FF41]'
                      : 'bg-[#0D1117] border-[#0D3B1E] hover:border-[#1A3A2A]'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-sm border ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[#00FF41] font-medium text-sm">{template.name}</h3>
                        <p className="text-[#00AA2A] text-xs mt-1">{template.description}</p>
                        <Badge className="mt-2 bg-[#111318] text-[#00AA2A] text-xs capitalize">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Report Generator */}
        <div className="space-y-4">
          <Card className="bg-[#0D1117] border-[#0D3B1E]">
            <CardHeader>
              <CardTitle className="text-[#00FF41] text-base">Generate Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedTemplate ? (
                <>
                  <div className="p-3 bg-[#111318] rounded-sm">
                    <p className="text-[#00FF41] font-medium text-sm">{selectedTemplate.name}</p>
                    <p className="text-[#00AA2A] text-xs mt-1">{selectedTemplate.description}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Start Date
                      </Label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-[#111318] border-[#1A3A2A]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> End Date
                      </Label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-[#111318] border-[#1A3A2A]"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => generateReport('json')}
                      disabled={isGenerating}
                      className="flex-1 bg-[#00FF41] text-black hover:bg-[#00CC33]"
                    >
                      {isGenerating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <BarChart3 className="mr-2 h-4 w-4" />
                      )}
                      Generate
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => generateReport('csv')}
                      disabled={isGenerating}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <FileText className="mx-auto h-8 w-8 text-[#1A6B35]" />
                  <p className="mt-2 text-sm text-[#00AA2A]">Select a template to get started</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Report Preview */}
          {report && (
            <Card className="bg-[#0D1117] border-[#0D3B1E]">
              <CardHeader>
                <CardTitle className="text-[#00FF41] text-base">{report.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <p className="text-[#1A6B35] text-xs">
                    Generated: {new Date(report.generatedAt).toLocaleString()}
                  </p>
                  {Object.entries(report.data).map(([key, value]) => {
                    if (typeof value === 'object') return null
                    return (
                      <div key={key} className="flex justify-between p-2 bg-[#111318] rounded">
                        <span className="text-[#00AA2A] capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="text-[#00FF41] font-mono">
                          {typeof value === 'number' ? value.toLocaleString() : String(value)}
                        </span>
                      </div>
                    )
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(report, null, 2)], {
                        type: 'application/json',
                      })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `report-${Date.now()}.json`
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download JSON
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
