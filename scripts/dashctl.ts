import { input } from '@inquirer/prompts'
import { randCompanyName } from '@ngneat/falso'
import { Command } from 'commander'

import runAnsaMerchantSetup from './commands/ansaMerchantSetup'
import runUserCreation from './commands/createUser'
import { errorLog, infoLog, requireEnvVars, successLog } from './utils'
import { getError } from '@/lib/utils'

/**
 * dashctl is a cli for our app. Use it to help setup local dev / create scripts for local dev
 */
const program = new Command()
program
  .command('run-a-command')
  .description('Test Command')
  .action(async () => {
    const email = await input({ message: 'User Email?' })
    successLog(`Welcome ${email}!`)
  })

program
  .command('setup-test-merchant')
  .option('-e, --email <email>', 'Email of user to create')
  .option('-n, --numCustomers <number>', 'Number of customers to create')
  .description(
    'Seed db with merchant info and associate superadmin with merchant'
  )
  .action(async (options) => {
    const email =
      options.email || (await input({ message: 'User Email to create?' }))

    const customersToCreateStr =
      options.numCustomers ||
      (await input({ message: '# customers to create?' }))

    const customersToCreate = parseInt(customersToCreateStr, 10)
    if (isNaN(customersToCreate) || customersToCreate < 1) {
      errorLog('Invalid number of customers')
      return
    }
    const {
      SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_SUPABASE_URL,
      ANSA_HOST,
      ANSA_ADMIN_API_KEY,
    } = requireEnvVars(
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_SUPABASE_URL',
      'ANSA_HOST',
      'ANSA_ADMIN_API_KEY'
    )
    try {
      infoLog(`Setting up user: ${email}...`)
      const userUUID = await runUserCreation({
        email,
        supabaseServiceRoleKey: SUPABASE_SERVICE_ROLE_KEY!,
        supabaseURL: NEXT_PUBLIC_SUPABASE_URL!,
      })
      infoLog(`Setting up merchant...`)
      await runAnsaMerchantSetup({
        userUUID,
        supabaseServiceRoleKey: SUPABASE_SERVICE_ROLE_KEY!,
        supabaseURL: NEXT_PUBLIC_SUPABASE_URL!,
        ansaHost: ANSA_HOST!,
        ansaAdminApiKey: ANSA_ADMIN_API_KEY!,
        merchantsToCreate: [randCompanyName()],
        customersToCreate,
      })
    } catch (err) {
      errorLog(getError(err).message)
    }
  })

program.parse(process.argv)
