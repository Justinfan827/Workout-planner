## Ansa's Frontend Template

This frontend template includes the following components:

1. **Supabase Authentication with Magic Emails**: This template is configured with Supabase authentication, including Magic Emails for secure login.
2. **Auto-generated Ansa Backend SDK**: Ansa's backend SDK is automatically generated from a Swagger file.
3. **Authentication Utilities**: Utilities are provided for authenticating API calls to Ansa's backend when a user is logged in.
4. **Supabase Migrations**: Basic tables are set up for storing merchant secret keys and associating them with users. Supabase migrations handle the database schema.
5. **GitHub Actions for Deployment**: GitHub Actions are in place for deploying to staging, prod-sandbox, and prod-live environments.
6. **React-email**: We can use React-email to create and enhance magic link email templates as needed.
7. **Sentry Instrumentation**: Sentry is used for monitoring and reporting errors.

## Project Setup

This template supports three environments:

- `staging`
- `prod-sandbox`
- `prod-live`

The primary branch for development is `staging`, and Pull Requests (PRs) should be opened against this branch. Merging changes
into `staging` will automatically release to Ansa's `staging` environment. Merging `staging` into `main` will trigger a release
to Ansa's `prod-sandbox` environment. Additionally, there is a GitHub Action available for manual releases to Ansa's `prod-live` environment.

### Tools and Services

- **Supabase**: Supabase is used as the "backend as a service" for database and authentication needs.
- **Vercel**: Vercel is the platform used for deploying frontend applications.
- **Next.js**: Next.js is the chosen framework for developing React applications.
- **Sentry**: Sentry is employed for error monitoring and reporting.

For a practical example of how these components are set up, refer to the [Ansa dashboard project](https://github.com/GetAnsa/ansa-dashboard).

### Setup Instructions

1. **Set up Supabase**:

   - Create separate Supabase projects for each of the three environments.
   - Update the site URL and redirect URL (example in the [Supabase Dashboard](https://supabase.com/dashboard/project/zqktqjoqwgxpszfvrwfm/auth/url-configuration)).
   - Customize the magic link template if desired (example in the [Supabase Dashboard](https://supabase.com/dashboard/project/zqktqjoqwgxpszfvrwfm/auth/templates)).

2. **Set up Vercel**:

   - Create two Vercel projects: one for `prod-live` and another for `staging` and `prod-sandbox`.
     This is done because Vercel only supports a "preview" and "production" environment for each project.
   - Set up a `staging` in Vercel in the non `prod-live` project ([more info](https://vercel.com/guides/set-up-a-staging-environment-on-vercel))

3. **Set up Sentry**:

   - Create a new Sentry project.

4. **Update GitHub Secrets**:

   - Populate GitHub secrets with the necessary credentials and keys for GitHub Actions to run successfully.

5. **Configure Environment Variables**:
   - Populate the appropriate environment variables in the different Vercel projects and environments.

Ensure you follow the Ansa dashboard project's example for the setup and location of these environment variables.

### GitHub Secrets

- `PROD_LIVE_SUPABASE_DB_PASSWORD`
- `PROD_LIVE_SUPABASE_PROJECT_ID`
- `PROD_LIVE_VERCEL_PROJECT_ID`
- `PROD_SANDBOX_SUPABASE_DB_PASSWORD`
- `PROD_SANDBOX_SUPABASE_PROJECT_ID`
- `PROD_SANDBOX_VERCEL_PROJECT_ID` (from `.vercel/project.json` after you run `vercel pull --yes --environment=preview --git-branch staging`)
- `STAGING_SUPABASE_DB_PASSWORD`
- `STAGING_SUPABASE_PROJECT_ID`
- `SUPABASE_ACCESS_TOKEN` (found [here](https://supabase.com/dashboard/account/tokens))
- `VERCEL_ORG_ID` (from `.vercel/project.json` after you run `vercel pull --yes --environment=preview --git-branch staging`)
- `VERCEL_TOKEN` (created [here](https://vercel.com/account/tokens))

## Setup local dev

1.  Install node version 18.18 with `nvm`. Install yarn version 1.22 with npm.
2.  Run `make setup` to setup get the supabase cli + install project dependencies + pull staging env vars from vercel.
    When prompted to login to Vercel on the CLI, login to `eng-logins@getansa.com` email. When prompted with setting
    up your vercel project, here are the answers:

    ```
    ? Set up “~/code/ansa-template”? [Y/n] y
    ? Which scope should contain your project? Ansa
    ? Link to existing project? [y/N] y
    ? What’s the name of your existing project? <VERCEL PROD SANDBOX PROJECT NAME>
    ```

    > _Note: if you're not prompted, run `vercel login` with the `eng-logins@getansa.com` email.
    > Note that this is a magic link and you won't need a password. Check your
    > email to verify your login. Run `vercel whoami` to verify that you're logged
    > in. Then run: `vercel link`, answering the questions, then finally
    > `vercel pull --yes --environment=preview --git-branch staging` to pull in environment
    > variables from the 'staging' environment_

3.  Create a supabase account [here](https://supabase.com) with your ansa email and have an admin invite you to the `Ansa` project.
    Run these commands to setup your local supabase instance ([more info](https://supabase.com/docs/guides/cli/getting-started)):

    ```
    supabase login # login to supabase with your OWN EMAIL (you'll be prompted to create an access token.)
    supabase start # start supabase (requires docker to be running)
    supabase link --project-ref <SUPABASE STAGING PROJECT REF> --password '<DB PASSWORD>'
    supabase db reset # apply migrations
    supabase status # check that everything is up and running

    # connect to the local supabase db to test your db is up
    psql postgresql://postgres:postgres@localhost:64322/postgres
    ```

    > \*Note: if you run into: `authorization failed for the access token...` it means that you haven't been added to the project correctly. Make sure that you created an access token + you can view the ansa team in the supabase dashboard\*

    _MAKE SURE_ to link to the `staging` supabase project! Otherwise on merge to `staging` branch, you'll apply migrations to the wrong env.

4.  Copy `.env.example` into a new file `.env.local` and populate these env vars:

- `NEXT_PUBLIC_SUPABASE_URL`: defaults to `http://localhost:64321`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`= get from `supabase status` output
- `SUPABASE_SERVICE_ROLE_KEY`= get from `supabase status` output
- `ANSA_ADMIN_API_KEY`= get from 1password (Ansa Dev/Staging API Key)
- `ANSA_HOST`= The host ansa backend is running on e.g. `http://127.0.0.1:8080/v1` (DON'T FORGET THE `/v1` base path)

5. Run Ansa backend locally

6. Setup a local merchant Run `yarn dashctl setup-test-merchant -e "<Any fake email>" -n 10`

7. Run `nvm use` to make sure you have the right version of node. Start the ansa dashboard frontend with `yarn dev`.

8. Go to `localhost:3000` and sign in with the email you used in the `dashctl` command above! Check your dummy inbox at:
   `http://localhost:64324/monitor` to sign in to the dashboard.

## Dev tips

1. If you go through the sign up flow, magic link emails are sent to the local email server.
   (defaults to `http://localhost:64324`)
2. Supabase GUI is great for looking at state of local DB and making changes. e.g. add new RLS policies.
   Once you're done making changes, you can diff the local db against existing migrations via `supabase db diff`
   and create a new migration with the output sql: `supabase migration new <name>`.
3. `supabase migration list` lets you see what migrations are applied locally vs remote linked DB.
   Read more at: [supabase](https://supabase.com/docs/guides/cli/local-development)
4. `yarn format:fix` to run prettier for formatting.
5. `yarn dashctl` to check out the CLI available to run some local dev scripts. Feel free to add more!

## Auth

1. Configure redirect URLs via: https://supabase.com/dashboard/project/<PROJECT_ID>/auth/url-configuration
2. More info at [supabase docs](https://supabase.com/docs/guides/auth#redirect-urls-and-wildcards)
