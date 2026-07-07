'use client';

import { useState } from 'react';

import { Check, Minus, Star } from 'lucide-react';
import { motion } from 'motion/react';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

/* Hallmark · macrostructure: Narrative Workflow · genre: editorial · tone: utilitarian
 * theme: Linen (site tokens) · enrichment: none
 * audience: clinic owners · use: choose a listing tier · anchor: site blue
 */

type BillingCycle = 'monthly' | 'yearly';

interface PlanFeature {
  text: string;
  note?: string;
}

interface Plan {
  stage: string;
  tagline: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  introPrice?: number;
  features: PlanFeature[];
  badge?: string;
  highlighted?: boolean;
}

const plans: Plan[] = [
  {
    stage: '01',
    tagline: 'Get found',
    name: 'Featured',
    description: 'Perfect for clinics that want stronger local placement in search results.',
    monthlyPrice: 59,
    yearlyPrice: 565,
    badge: 'Most popular',
    highlighted: true,
    features: [
      { text: 'Priority placement in your selected city or area' },
      { text: 'Featured badge on your clinic profile' },
      { text: 'Ad-free clinic profile' },
      { text: 'Do-follow backlink to your website' },
      { text: '1 promotional image' },
      { text: 'Priority listing placement above free listings' },
    ],
  },
  {
    stage: '02',
    tagline: 'Appear on the homepage',
    name: 'Featured Plus',
    description: 'Everything in Featured, plus homepage exposure.',
    monthlyPrice: 89,
    yearlyPrice: 855,
    features: [
      { text: 'Everything in Featured' },
      { text: 'Up to 5 promotional images' },
      {
        text: 'Featured in our rotating Homepage Featured Clinics section',
        note: 'Clinics are rotated fairly to ensure balanced homepage exposure.',
      },
      { text: 'Increased exposure across AestheticClinics.my' },
    ],
  },
  {
    stage: '03',
    tagline: 'Lead premium homepage placements',
    name: 'Featured Partner',
    description: 'For clinics that want top-tier placement across premium slots.',
    monthlyPrice: 149,
    yearlyPrice: 1430,
    features: [
      { text: 'Everything in Featured Plus' },
      {
        text: 'Large Hero placement in the rotating homepage spotlight',
        note: 'Hero placements rotate among Featured Partners to provide fair exposure.',
      },
      { text: 'Featured Partner badge' },
    ],
  },
];

const comparisonRows = [
  {
    feature: 'Priority placement in city listings',
    featured: 'check' as const,
    plus: 'check' as const,
    partner: 'highest' as const,
  },
  {
    feature: 'Featured badge',
    featured: 'check' as const,
    plus: 'check' as const,
    partner: 'partner' as const,
  },
  {
    feature: 'Ad-free clinic profile',
    featured: 'check' as const,
    plus: 'check' as const,
    partner: 'check' as const,
  },
  {
    feature: 'Do-follow website link',
    featured: 'check' as const,
    plus: 'check' as const,
    partner: 'check' as const,
  },
  {
    feature: 'Promotional images',
    featured: '1',
    plus: '5',
    partner: '5',
  },
  {
    feature: 'Homepage Featured Clinics',
    featured: 'dash' as const,
    plus: 'rotating' as const,
    partner: 'priority' as const,
  },
  {
    feature: 'Hero homepage spotlight',
    featured: 'dash' as const,
    plus: 'dash' as const,
    partner: 'check' as const,
  },
];

function CellValue({
  value,
}: {
  value: string | 'check' | 'dash' | 'highest' | 'partner' | 'rotating' | 'priority';
}) {
  if (value === 'check') {
    return (
      <Check className="mx-auto size-5 text-green-600 dark:text-green-400" aria-label="Included" />
    );
  }
  if (value === 'dash') {
    return (
      <Minus
        className="mx-auto size-5 text-gray-300 dark:text-gray-600"
        aria-label="Not included"
      />
    );
  }
  if (value === 'highest') {
    return (
      <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
        <Check
          className="mr-1 inline size-4 text-green-600 dark:text-green-400"
          aria-hidden="true"
        />
        Highest
      </span>
    );
  }
  if (value === 'partner') {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700 dark:text-amber-300">
        <Star className="size-4 fill-amber-500 text-amber-500" aria-hidden="true" />
        Partner
      </span>
    );
  }
  if (value === 'rotating') {
    return <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rotating</span>;
  }
  if (value === 'priority') {
    return (
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Priority rotation
      </span>
    );
  }
  return <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{value}</span>;
}

export function PricingPlan() {
  const [billing, setBilling] = useState<BillingCycle>('monthly');

  return (
    <div className="flex flex-col gap-12 md:gap-16">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Three ways to grow
          </p>
          <h2 className="font-display max-w-2xl text-balance text-3xl font-black leading-tight tracking-tight text-gray-900 sm:text-4xl dark:text-gray-50">
            Simple, transparent pricing
          </h2>
          <p className="mt-3 max-w-xl text-base text-gray-600 dark:text-gray-300">
            Each plan adds a clear, tangible benefit — from local placement to homepage spotlight
            placement.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={cn(
              'text-sm font-semibold',
              billing === 'monthly'
                ? 'text-gray-900 dark:text-gray-100'
                : 'text-gray-500 dark:text-gray-400',
            )}>
            Monthly
          </span>
          <Switch
            checked={billing === 'yearly'}
            onCheckedChange={(checked) => setBilling(checked ? 'yearly' : 'monthly')}
            aria-label="Toggle yearly billing"
          />
          <span
            className={cn(
              'text-sm font-semibold',
              billing === 'yearly'
                ? 'text-gray-900 dark:text-gray-100'
                : 'text-gray-500 dark:text-gray-400',
            )}>
            Yearly
          </span>
          {billing === 'yearly' && (
            <Badge variant="green" className="ml-1">
              Save 20%
            </Badge>
          )}
        </div>
      </div>

      <ol className="relative flex flex-col gap-0">
        {plans.map((plan, index) => {
          const price = billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
          const isLast = index === plans.length - 1;

          return (
            <li key={plan.name} className="relative flex min-w-0 gap-0 md:gap-8">
              <div className="hidden w-16 shrink-0 flex-col items-center md:flex">
                <span className="font-display text-2xl font-black tabular-nums text-blue-500/80 dark:text-blue-400/80">
                  {plan.stage}
                </span>
                {!isLast && (
                  <div
                    className="mt-2 w-px flex-1 bg-gradient-to-b from-blue-300/60 to-blue-100/20 dark:from-blue-600/40 dark:to-gray-800"
                    aria-hidden="true"
                  />
                )}
              </div>

              <motion.article
                whileHover={{ y: -2 }}
                className={cn(
                  'mb-8 min-w-0 flex-1 rounded-2xl border p-6 shadow-sm transition-shadow hover:shadow-md md:mb-10 md:p-8',
                  plan.highlighted
                    ? 'dark:from-blue-950/40 border-blue-300 bg-gradient-to-br from-blue-50/80 via-white to-white dark:border-blue-700 dark:via-gray-900 dark:to-gray-900'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/60',
                )}>
                <div className="mb-5 flex min-w-0 flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display mb-1 text-xs font-bold uppercase tracking-widest text-blue-600 md:hidden dark:text-blue-400">
                      {plan.stage} · {plan.tagline}
                    </p>
                    <p className="font-display mb-1 hidden text-sm font-bold uppercase tracking-wide text-blue-600 md:block dark:text-blue-400">
                      {plan.tagline}
                    </p>
                    <h3 className="font-display text-2xl font-black text-gray-900 dark:text-gray-50">
                      {plan.name}
                    </h3>
                    <p className="mt-2 max-w-prose text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                      {plan.description}
                    </p>
                  </div>
                  {plan.badge && <Badge variant="brand">{plan.badge}</Badge>}
                </div>

                <div className="mb-6 border-b border-gray-100 pb-6 dark:border-gray-800">
                  {billing === 'monthly' && plan.introPrice ? (
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <p className="font-display text-3xl font-black tabular-nums text-blue-600 dark:text-blue-400">
                        RM{plan.introPrice}
                        <span className="text-base font-semibold text-gray-500 dark:text-gray-400">
                          /month
                        </span>
                      </p>
                      <p className="text-sm text-gray-500 line-through dark:text-gray-400">
                        RM{plan.monthlyPrice}/month
                      </p>
                      <p className="w-full text-sm font-medium text-amber-700 dark:text-amber-300">
                        Introductory pricing
                      </p>
                    </div>
                  ) : (
                    <p className="font-display text-3xl font-black tabular-nums text-blue-600 dark:text-blue-400">
                      RM{price}
                      <span className="text-base font-semibold text-gray-500 dark:text-gray-400">
                        /{billing === 'monthly' ? 'month' : 'year'}
                      </span>
                    </p>
                  )}
                  {billing === 'yearly' && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="line-through">RM{plan.monthlyPrice * 12}/year</span>
                    </p>
                  )}
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Includes
                  </p>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex min-w-0 items-start gap-2.5">
                        <Check
                          className="mt-0.5 size-5 shrink-0 text-green-600 dark:text-green-400"
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <span className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                            {feature.text}
                          </span>
                          {feature.note && (
                            <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                              ({feature.note})
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <a
                    href={`mailto:hello@aestheticclinics.my?subject=${encodeURIComponent(`Featured Listing Enquiry — ${plan.name}`)}`}
                    className={cn(
                      buttonVariants({ variant: plan.highlighted ? 'primary' : 'outline' }),
                      'min-h-11',
                    )}>
                    Contact us
                  </a>
                </div>
              </motion.article>
            </li>
          );
        })}
      </ol>

      <div className="min-w-0">
        <h3 className="font-display mb-4 text-xl font-bold text-gray-900 dark:text-gray-50">
          Compare plans
        </h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80">
                <th
                  scope="col"
                  className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                  Feature
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-gray-100">
                  Featured
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-gray-100">
                  Featured Plus
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-gray-100">
                  Featured Partner
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, rowIndex) => (
                <tr
                  key={row.feature}
                  className={cn(
                    'border-b border-gray-100 dark:border-gray-800',
                    rowIndex % 2 === 1 && 'bg-gray-50/50 dark:bg-gray-900/30',
                  )}>
                  <th
                    scope="row"
                    className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">
                    {row.feature}
                  </th>
                  <td className="px-4 py-3 text-center">
                    <CellValue value={row.featured} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <CellValue value={row.plus} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <CellValue value={row.partner} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
