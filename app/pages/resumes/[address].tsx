import Layout from "@/components/layout";
import { useRouter } from "next/router";

/**
 * Page with a resume.
 */
export default function Resume() {
  const router = useRouter();
  const { address } = router.query;

  return <Layout>...</Layout>;
}
