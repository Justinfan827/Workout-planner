'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { NumericFormat } from 'react-number-format'
import { z } from 'zod'

import { Icons } from '@/components/Icons'
import { NumericInput } from '@/components/NumericInput'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from '@/components/ui/use-toast'
import { getError } from '@/lib/utils'
import { SelectItemText } from '@radix-ui/react-select'
import { useRouter } from 'next/navigation'

const FormSchema = z.object({
  promotionType: z.enum(['first_top_up', 'once_per_tier', 'tiered']),
  tiers: z
    .array(
      z
        .object({
          // these are in $ amounts, not cents
          minTransactionRequirement: z.number().min(1).max(999.99),
          promotionAmount: z.number().min(0.01).max(250),
        })
        .required()
    )
    .min(1)
    .max(5),
})

async function updateMerchantPromotionConfig(
  merchantId: string,
  body: z.infer<typeof FormSchema> | null
) {
  const newBody = body
    ? {
        promoConfig: {
          ...body,
          tiers: body.tiers.map((tier) => ({
            minTransactionRequirement: tier.minTransactionRequirement * 100,
            promotionAmount: tier.promotionAmount * 100,
          })),
        },
      }
    : { promoConfig: null }

  try {
    const data = await fetch(`/api/ansa/merchants/${merchantId}`, {
      method: 'PUT',
      body: JSON.stringify(newBody),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    })
    if (!data.ok) {
      const bodyMsg = await data.text()
      return {
        data: null,
        error: new Error(bodyMsg || data.statusText),
      }
    }
    return {
      ...((await data.json()) as { data: { email: string } }),
      error: null,
    }
  } catch (e) {
    return {
      error: getError(e),
      data: null,
    }
  }
}

export default function PromotionForm({
  merchantId,
  configs,
}: {
  merchantId: string
  configs: any | null
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDisablingPromos, setIsDisablingPromos] = useState(false)
  const isLoading = isSubmitting || isDisablingPromos
  const [isPromotionEnabled, setIsPromotionEnabled] = useState(false)
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      promotionType: configs?.type || 'first_top_up',
      tiers: configs?.rewardTiers.map((tier) => ({
        minTransactionRequirement: tier.minTransactionRequirement / 100,
        promotionAmount: tier.promotionAmount / 100,
      })) || [
        {
          minTransactionRequirement: null as any,
          promotionAmount: null as any,
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control, // control props comes from useForm (optional: if you are using FormContext)
    name: 'tiers', // unique name for your Field Array
  })

  const onSubmit = async (formData: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true)
    const { error } = await updateMerchantPromotionConfig(merchantId, formData)
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong!',
        description: error.message,
      })
      setIsSubmitting(false)
      return
    }
    toast({
      // @ts-ignore
      title: (
        <div className="flex gap-2">
          <Icons.checkCircle className="h-5 w-5 text-green-400" />
          <p>Promotion configs updated</p>
        </div>
      ),
    })
    setIsSubmitting(false)
  }

  const enablePromotions = () => {
    setIsPromotionEnabled(true)
  }

  const handleDisablePromotions = async () => {
    setIsDisablingPromos(true)
    const { data: newMerchantInfo, error } =
      await updateMerchantPromotionConfig(merchantId, null)
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong!',
        description: error.message,
      })
      setIsDisablingPromos(false)
      return
    }
    toast({
      // @ts-ignore
      title: (
        <div className="flex gap-2">
          <Icons.checkCircle className="h-5 w-5 text-green-400" />
          <p>Promotion configs updated</p>
        </div>
      ),
    })
    form.reset()
    router.refresh()
    setIsPromotionEnabled(false)
    setIsDisablingPromos(false)
  }
  const handleAddTier = () => {
    append({
      minTransactionRequirement: null as any,
      promotionAmount: null as any,
    })
  }

  const handleRemoveTier = (idx: number) => {
    remove(idx)
  }
  if (!configs && !isPromotionEnabled) {
    return (
      <div className="py-4">
        <Button onClick={enablePromotions} disabled>
          Enable promotions
        </Button>
      </div>
    )
  }

  const promoTypeCopy = [
    {
      value: `first_top_up`,
      title: `First top up`,
      description: `Add funds to the user's wallet once on their first balance add.`,
    },
    {
      value: `tiered`,
      title: `Tiered`,
      description: `Add funds to the user's wallet each time they add balance, provided they meet the minimum transaction requirements.`,
    },
    {
      value: `once_per_tier`,
      title: `Once per tier`,
      description: `Add funds to the user's wallet only once per tier.`,
    },
  ]
  const promoValueToTitle = promoTypeCopy.reduce(
    (acc, { value, title }) => ({ ...acc, [value]: title }),
    {} as Record<string, string>
  )
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-4">
        <FormField
          control={form.control}
          name="promotionType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Promotion type</FormLabel>
              <p className="text-sm leading-5 text-muted-foreground">
                The type of promotion determines the frequency of earning each
                promotion.
              </p>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a promotion type">
                      {promoValueToTitle[field.value]}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {promoTypeCopy.map(({ value, title, description }) => (
                    <SelectItem
                      key={value}
                      value={value}
                      className="max-w-[calc(var(--radix-select-trigger-width))]"
                    >
                      <SelectItemText>
                        {title}
                        <p className="text-sm text-muted-foreground">
                          {description}
                        </p>
                      </SelectItemText>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium leading-none">Reward tiers</p>
            <p className="text-sm leading-5 text-muted-foreground">
              Promotions can have multiple tiers, each with its own minimum
              transaction requirement. The Ansa platform automatically
              identifies and applies the highest reward tier for which a user
              qualifies.
            </p>
          </div>
          {fields.map((field, index) => {
            return (
              <Card key={field.id} className="space-y-4 p-4">
                <FormField
                  control={form.control}
                  name={`tiers.${index}.minTransactionRequirement`}
                  render={({ field: { ref, ...field } }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-8">
                        <div>
                          <FormLabel>Minimum transaction requirement</FormLabel>
                          <TooltipProvider delayDuration={250}>
                            <Tooltip>
                              <TooltipTrigger type="button">
                                <Icons.infoCircle className="ml-2 inline h-4 w-4" />
                              </TooltipTrigger>
                              <TooltipContent
                                side="bottom"
                                sideOffset={0}
                                align="start"
                                className="max-w-[400px] space-y-[2px] p-4"
                              >
                                <p className="font-normal">
                                  This is the minimum &quot;add balance&quot;
                                  amount that is eligible for a reward.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="basis-[200px]">
                          <FormControl>
                            <NumericFormat
                              disabled
                              className="absolute"
                              customInput={NumericInput}
                              getInputRef={ref}
                              allowNegative={false}
                              value={field.value}
                              onValueChange={(v) => {
                                if (v.floatValue !== undefined) {
                                  form.setValue(
                                    `tiers.${index}.minTransactionRequirement`,
                                    v.floatValue
                                  )
                                } else {
                                  form.setValue(
                                    `tiers.${index}.minTransactionRequirement`,
                                    null as any
                                  )
                                }
                              }}
                              displayType="input"
                              thousandSeparator=","
                              decimalSeparator="."
                              prefix=""
                              placeholder=""
                              decimalScale={2}
                            />
                          </FormControl>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`tiers.${index}.promotionAmount`}
                  render={({ field: { ref, ...field } }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-8">
                        <div>
                          <FormLabel>Reward amount</FormLabel>
                          <TooltipProvider delayDuration={250}>
                            <Tooltip>
                              <TooltipTrigger type="button">
                                <Icons.infoCircle className="ml-2 inline h-4 w-4" />
                              </TooltipTrigger>
                              <TooltipContent
                                side="bottom"
                                sideOffset={0}
                                align="start"
                                className="max-w-[400px] space-y-[2px] p-4"
                              >
                                <p className="font-normal">
                                  The additional promotional bonus added to the
                                  user&apos;s balance.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="basis-[200px]">
                          <FormControl>
                            <NumericFormat
                              disabled
                              className="absolute"
                              customInput={NumericInput}
                              getInputRef={ref}
                              allowNegative={false}
                              value={field.value}
                              onValueChange={(v) => {
                                if (v.floatValue !== undefined) {
                                  form.setValue(
                                    `tiers.${index}.promotionAmount`,
                                    v.floatValue
                                  )
                                } else {
                                  form.setValue(
                                    `tiers.${index}.promotionAmount`,
                                    null as any
                                  )
                                }
                              }}
                              displayType="input"
                              thousandSeparator=","
                              decimalSeparator="."
                              prefix=""
                              placeholder=""
                              decimalScale={2}
                            />
                          </FormControl>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                {/* Below buttons are hidden to temporarily disable merchant triggered promotional config changes */}
                {/* <div className="flex justify-end">
                  <Button
                    type="button"
                    disabled={fields.length <= 1 || isLoading}
                    onClick={() => handleRemoveTier(index)}
                    variant="destructive"
                  >
                    Remove
                    <Icons.xCircle className="ml-2 h-5 w-5" />
                  </Button>
                </div> */}
              </Card>
            )
          })}
          {/* <Button
            disabled={fields.length >= 5 || isLoading}
            type="button"
            onClick={handleAddTier}
            variant="outline"
          >
            New tier
            <Icons.plusCircle className="ml-2 h-5 w-5" />
          </Button>
          <div className="flex justify-end gap-4">
            <Button
              onClick={handleDisablePromotions}
              disabled={isLoading}
              type="button"
              variant="outline"
            >
              {isDisablingPromos ? (
                <Icons.spinner className="h-5 w-5 animate-spin" />
              ) : (
                'Disable promotions'
              )}
            </Button>
            <Button
              disabled={isLoading}
              type="submit"
            >
              {isSubmitting ? (
                <Icons.spinner className="h-5 w-5 animate-spin" />
              ) : (
                'Save'
              )}
            </Button>
          </div> */}
        </div>
      </form>
    </Form>
  )
}
