import type { GetServerSideProps } from "next"

export const getServerSideProps: GetServerSideProps = async ({ resolvedUrl }) => {
  const query = resolvedUrl.includes("?") ? `?${resolvedUrl.split("?").slice(1).join("?")}` : ""
  return {
    redirect: {
      destination: `/terms/${query}`,
      permanent: true,
    },
  }
}

export default function TermsAndConditionsRedirect() {
  return null
}
