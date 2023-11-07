import { Command } from 'commander'

import {  input } from '@inquirer/prompts'
import { successLog } from './utils'

// dashctl is a cli for our dashboard app.
// Use it to help setup local dev
const program = new Command()

program
  .command('run-a-command')
  .description('Test Command')
  .action(async () => {
    const email = await input({ message: 'User Email?' })
      successLog(`Welcome ${email}!`)
  })

