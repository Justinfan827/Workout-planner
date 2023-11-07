## Setup local dev

1.  Install node version 18.18 with `nvm`. Install yarn version 1.22 with npm.
2.  Run `make setup` to setup get the supabase cli + install project dependencies + pull staging env vars from vercel.
    When prompted to login to Vercel on the CLI, login to `eng-logins@getansa.com` email. When prompted with setting
    up your vercel project, here are the answers:

    ```
    ? Set up “~/code/ansa-dashboard”? [Y/n] y
    ? Which scope should contain your project? Ansa
    ? Link to existing project? [y/N] y
    ? What’s the name of your existing project? ansa-dashboard-prod-sandbox
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
    supabase link --project-ref zqktqjoqwgxpszfvrwfm --password '<DB password from 1password (ansa-dashboard-staging)>'
    supabase db reset # apply migrations
    supabase status # check that everything is up and running

    # connect to the local supabase db to test your db is up
    psql postgresql://postgres:postgres@localhost:64322/postgres
    ```

    > \*Note: if you run into: `authorization failed for the access token...` it means that you haven't been added to the project correctly. Make sure that you created an access token + you can view the ansa team in the supabase dashboard\*

4.  Copy `.env.example` into a new file `.env.local` and populate these env vars:

- `NEXT_PUBLIC_SUPABASE_URL`: defaults to `http://localhost:64321`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`= get from `supabase status` output
- `SUPABASE_SERVICE_ROLE_KEY`= get from `supabase status` output
- `ANSA_ADMIN_API_KEY`= get from 1password (Ansa Dev/Staging API Key)
- `ANSA_HOST`= The host ansa backend is running on e.g. `http://127.0.0.1:8080/v1` (DON'T FORGET THE `/v1` base path)

5. Start your ansa backend locally
6. Seed the database with a superadmin user + merchant:

   `yarn dashctl setup-test-merchant -s -e "<EMAIL>" -n 10`

   **Note: ANY email will work here! Supabase is running a dummy email server at: `http://localhost:64324/monitor.`. Your magic
   link will get sent to this localhost inbox.**

   This commands goes and creates a new user with the email `<EMAIL>` in the supabase backend and also hits your local ansa
   backend to create a couple of test users.

   You can configure this behavior via the `supabase/config.toml` file.

7. Run `nvm use` to make sure you have the right version of node.
   Start the ansa dashboard frontend with `yarn dev`.

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

1. Configure redirect URLs via: https://supabase.com/dashboard/project/zqktqjoqwgxpszfvrwfm/auth/url-configuration
2. More info at [supabase docs](https://supabase.com/docs/guides/auth#redirect-urls-and-wildcards)

## Getting Started

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
