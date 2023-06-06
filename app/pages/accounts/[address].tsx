import AccountInterviews from "@/components/account/AccountInterviews";
import AccountProfile from "@/components/account/AccountProfile";
import Layout from "@/components/layout";
import { useRouter } from "next/router";

/**
 * Page with an account.
 */
export default function Account() {
  const router = useRouter();
  const { address } = router.query;

  return (
    <Layout maxWidth="md">
      {address && (
        <>
          <AccountProfile address={address.toString()} />
          <AccountInterviews
            address={address.toString() as `0x${string}`}
            sx={{ mt: 8 }}
          />
        </>
      )}
    </Layout>
  );
}
