import Layout from "@/components/layout";
import { useRouter } from "next/router";

/**
 * Page with an interview.
 */
export default function Interview() {
  const router = useRouter();
  const { id } = router.query;

  return <Layout>...</Layout>;
}
