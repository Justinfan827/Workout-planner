import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'

export const AnsaLoginEmail = () => {
  const previewText = `Your Magic Link`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-[40px] w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Section className="mt-[32px]">
              <Img
                src={`https://zqktqjoqwgxpszfvrwfm.supabase.co/storage/v1/object/public/ansa_public/logo.jpg`}
                width="80"
                height="80"
                alt="Ansa"
                className="mx-auto my-0"
              />
            </Section>
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              Verify your email to log on to <strong>Ansa</strong>
            </Heading>
            <Text className="text-center text-[14px] leading-[24px] text-black">
              To complete the login process, please click the following link
            </Text>
            <Section className="mb-[32px] mt-[32px] text-center">
              <Button
                pX={20}
                pY={12}
                className="rounded bg-[#000000] text-center text-[12px] font-semibold text-white no-underline"
                href="{{ .ConfirmationURL }}"
              >
                Log in
              </Button>
            </Section>
            <Text className="text-[14px] leading-[24px] text-black">
              or copy and paste this URL into your browser:{' '}
              <Link
                href="{{ .ConfirmationURL }}"
                className="text-blue-600 no-underline"
              >
                {'{{ .ConfirmationURL }}'}
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default AnsaLoginEmail
