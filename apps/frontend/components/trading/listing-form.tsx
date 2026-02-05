'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PriceInput } from './price-input'
import { LISTING_DURATIONS, createListing } from '@/lib/trading/listing'
import { Tag, Loader2 } from 'lucide-react'

interface ListingFormProps {
  nftId: string
  onSuccess: (listingId: string) => void
  onError: (error: string) => void
}

export function ListingForm({ nftId, onSuccess, onError }: ListingFormProps) {
  const [priceInSol, setPriceInSol] = useState<number | null>(null)
  const [durationDays, setDurationDays] = useState<number>(7)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [priceError, setPriceError] = useState<string | undefined>()

  const handleSubmit = async () => {
    // Validate price
    if (priceInSol === null || priceInSol <= 0) {
      setPriceError('Price must be greater than 0')
      return
    }
    if (priceInSol > 1_000_000) {
      setPriceError('Price exceeds maximum')
      return
    }
    setPriceError(undefined)

    if (!agreedToTerms) {
      onError('You must agree to the terms')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createListing({
        nftId,
        priceInSol,
        durationDays,
        agreedToTerms: true,
      })
      onSuccess(result.id)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to create listing')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Price */}
      <PriceInput
        value={priceInSol}
        onChange={(val) => {
          setPriceInSol(val)
          setPriceError(undefined)
        }}
        error={priceError}
      />

      {/* Duration */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#00FF41]">Listing Duration</label>
        <Select
          value={durationDays.toString()}
          onValueChange={(val) => setDurationDays(parseInt(val, 10))}
        >
          <SelectTrigger className="border-[#1A3A2A] bg-[#111318] text-[#00FF41]">
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent className="border-[#1A3A2A] bg-[#111318]">
            {LISTING_DURATIONS.map((d) => (
              <SelectItem
                key={d.value}
                value={d.value.toString()}
                className="text-[#00FF41] focus:bg-[#1A3A2A] focus:text-[#00FF41]"
              >
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Terms */}
      <div className="flex items-start gap-3">
        <Checkbox
          id="terms"
          checked={agreedToTerms}
          onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
          className="mt-0.5 border-[#1A3A2A] data-[state=checked]:bg-[#00FF41] data-[state=checked]:border-[#00FF41]"
        />
        <label htmlFor="terms" className="text-xs leading-relaxed text-[#00AA2A] cursor-pointer">
          I understand that by listing this NFT for sale, a 2.5% marketplace fee will be deducted
          from the sale price. Listings can be cancelled at any time before purchase.
        </label>
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || priceInSol === null || priceInSol <= 0 || !agreedToTerms}
        className="w-full bg-[#00FF41] text-black hover:bg-[#00CC33] disabled:opacity-50"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Listing...
          </>
        ) : (
          <>
            <Tag className="mr-2 h-4 w-4" />
            List for Sale
          </>
        )}
      </Button>
    </div>
  )
}

export { type ListingFormProps }
