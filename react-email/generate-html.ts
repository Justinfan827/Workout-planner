import { render } from '@react-email/render'
import * as fs from 'fs'
import {StripeWelcomeEmail  } from './emails/stripe-welcome'

const html = render(StripeWelcomeEmail(), {
  pretty: true,
})

// create directory ./out if if does not exist and save html
// into an email.html file

fs.mkdirSync('./out', { recursive: true })
fs.writeFileSync('./out/email.html', html)
