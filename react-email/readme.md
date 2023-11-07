# React Email

This is tool to create emails templates with React. A live preview right in your browser so
you don't need to keep sending real emails during development.

## Getting Started

First, install the dependencies:

```sh
yarn install
```

Then, run the development server:

```sh
yarn dev
```

Open [localhost:3000](http://localhost:3000) with your browser to see the email previews.

## Dev Tips

Currently, we only use this to generate our magic link emails templates.

The `generate-html.ts` file will render the `AnsaLoginEmail` component into HTML. Once you're
satisfied with your changes, run `yarn generate` from the 'react-email' directory
to generate an HTML file.

Paste this output HTML into supabase: https://supabase.com/dashboard/project/zqktqjoqwgxpszfvrwfm/auth/templates
to update the email we send out to users when they receive the magic link.

Remember to do this for all environments

## License

MIT License
