import { paths } from '@/app/api/ansa/swagger/client'
import logSymbols from 'log-symbols'
import createAnsaClient from 'openapi-fetch'
import mapLimit from 'promise-map-limit'

import { Database } from '@/lib/supabase/database.types'
import { createClient } from '@supabase/supabase-js'
import { infoLog } from '../utils'
import { createMerchant } from './ansa/creation'
import { customerScenario1 } from './ansa/scenarios/customerScenarios'

export default async function runAnsaMerchantSetup({
  userUUID,
  supabaseServiceRoleKey,
  supabaseURL,
  ansaHost,
  ansaAdminApiKey,
  merchantsToCreate,
  customersToCreate,
}: {
  userUUID: string
  supabaseServiceRoleKey: string
  supabaseURL: string
  ansaHost: string
  ansaAdminApiKey: string
  merchantsToCreate: string[]
  customersToCreate: number
}) {
  const supabase = createClient<Database>(supabaseURL, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const ansaClient = createAnsaClient<paths>({ baseUrl: ansaHost })
  infoLog(
    logSymbols.info,
    `creating merchants: ${merchantsToCreate.join(', ')}`
  )
  const merchants = await mapLimit(
    merchantsToCreate,
    2,
    async (merchantName) => {
      const { merchantId, merchantSecretKey } = await createMerchant(
        ansaClient,
        merchantName,
        ansaAdminApiKey
      )

      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .insert({
          ansa_merchant_name: merchantName,
          ansa_merchant_uuid: merchantId,
        })
        .select()
        .single()
      if (merchantError) {
        throw new Error(merchantError.message)
      }

      if (!merchantData) {
        throw new Error('no data from supabase')
      }

      const { data: merchantKeyData, error: merchantKeyError } = await supabase
        .from('merchant_keys')
        .insert({
          ansa_merchant_secret_key: merchantSecretKey,
          merchant_uuid: merchantData.uuid,
        })
        .select()
        .single()
      if (merchantKeyError) {
        throw new Error(merchantKeyError.message)
      }

      if (!merchantKeyData) {
        throw new Error('no data from supabase')
      }

      const { error: insertErr } = await supabase
        .from(`user_merchants`)
        .upsert(
          {
            merchant_uuid: merchantData.uuid,
            user_uuid: userUUID,
          },
          { onConflict: 'user_uuid', ignoreDuplicates: false }
        ).select()

      if (insertErr) {
        throw new Error(insertErr.message)
      }

      infoLog(`creating ${customersToCreate} customers for ${merchantName}`)
      await mapLimit(Array.from(Array(customersToCreate)), 10, async () => {
        const customerId = await customerScenario1(
          ansaClient,
          merchantSecretKey
        )
        infoLog(`created customer: ${customerId} for merchant ${merchantName}`)
      }) // end customers

      infoLog(logSymbols.success, 'inserted row into merchant_keys')
      return {
        merchant: {
          merchantUUID: merchantData.uuid,
          ansaMerchantUUID: merchantData.ansa_merchant_uuid,
          ansaMerchantSecretKey: merchantKeyData.ansa_merchant_secret_key,
        },
      }
    } // end merchant
  ) // end merchants

  infoLog(logSymbols.success, 'inserted row into user_merchants')
}
