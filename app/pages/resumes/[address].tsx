import AccountInterviews from "@/components/account/AccountInterviews";
import Layout from "@/components/layout";
import { useRouter } from "next/router";

/**
 * Page with an account resume.
 */
export default function Resume() {
  const router = useRouter();
  const { address } = router.query;

  return (
    <Layout maxWidth="md">
      {address && (
        <>
          <AccountInterviews address={address.toString() as `0x${string}`} />
        </>
      )}
    </Layout>
  );
}
