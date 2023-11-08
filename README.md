## Ansa's frontend template

This is a frontend template set up with:

1. Supabase auth with magic emails set up
2. Auto generated Ansa backend SDK from a swagger file
3. Auth utilities to authenticate API calls to Ansa's backend given a logged in user.
4. Supabase migrations set up with some basic tables for storing merchant secret keys
   and associating them with users
5. Github actions to deploy to a staging, prod-sandbox, and a prod-live environment.
6. React-email to iterate and improve on magic link email templates if necessary.
7. Sentry instrumentation.

## Project Setup

This template supports 3 environments and is set up to work with a branch based workflow.

`staging`
`prod-sandbox`
`prod-live`

The primary branch for development is `staging`, and Pull Requests (PRs) should be opened against this branch. 
Merging changes into `staging` will automatically release to Ansa's `staging` environment. Merging `staging` into 
`main` will trigger a release to Ansa's `prod-sandbox` environment. Additionally, there is a GitHub Action available
for manual releases to Ansa's `prod-live` environment.

We use Supabase as our frontend's 'backend as a service' for all things necessary for db / auth.
We use Vercel to deploy our frontend apps.
We use NextJS as our framework for React.
We use Sentry to monitor errors.

Take a look at our [Ansa dashboard](https://github.com/GetAnsa/ansa-dashboard) as an example for how things
are set up if you get stuck.

1. Set up supabase:
   - Create a supabase separate project for all 3 environments.
   - Update the site URL / redirect URL ([Dashboard example](https://supabase.com/dashboard/project/zqktqjoqwgxpszfvrwfm/auth/url-configuration))
   - Customize magic link template if you wish: ([Dashboard example](https://supabase.com/dashboard/project/zqktqjoqwgxpszfvrwfm/auth/templates))
2. Set up Vercel:
   - Create 2 projects: one for `prod-live` and another for `staging` and `prod-sandbox`.
     We do this since Vercel only supports a `preview` and `production` environment for each project.
3. Set up sentry:
   - Create a new sentry project.
4. Update repo github secrets so that GH actions can run.
5. Populate the appropriate env vars in the different Vercel project / environments.

Again, take a look at the Ansa dashboard project as an example for how to set up / where to grab these env vars.

Github secrets:

- `PROD_LIVE_SUPABASE_DB_PASSWORD`: Supabase prod-live database password
- `PROD_LIVE_SUPABASE_PROJECT_ID`: Supabase prod-live project id
- `PROD_LIVE_VERCEL_PROJECT_ID`: Vercel prod-live project id
- `PROD_SANDBOX_SUPABASE_DB_PASSWORD`: Supabase prod-sandbox database password
- `PROD_SANDBOX_SUPABASE_PROJECT_ID`: Supabase prod-sandbox project id
- `PROD_SANDBOX_VERCEL_PROJECT_ID` Vercel non prod-live project id from `.vercel/project.json`
- `STAGING_SUPABASE_DB_PASSWORD`: Supabase staging project database password (get from supabase GUI)
- `STAGING_SUPABASE_PROJECT_ID`: Supabase staging project id
- `SUPABASE_ACCESS_TOKEN`: supabase access token found [here](https://supabase.com/dashboard/account/tokens)
- `VERCEL_ORG_ID`: the id of the vercel org from `.vercel/project.json`. See dashboard as an example.
- `VERCEL_TOKEN`: a vercel access token created [ here ](https://vercel.com/account/tokens)

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

5. Start your ansa backend locally
6. Run `nvm use` to make sure you have the right version of node.
   Start the ansa dashboard frontend with `yarn dev`.

7. Go to `localhost:3000` and sign in with the email you used in the `dashctl` command above! Check your dummy inbox at:
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
