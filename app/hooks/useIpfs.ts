import { upload } from "@spheron/browser-upload";
import axios from "axios";
import { ipfsUriToHttpUri } from "utils/converters";

/**
 * Hook for work with IPFS.
 */
export default function useIpfs() {
  const ipfsUriPrefix = "ipfs://";

  const uploadFileToIpfs = async function (file: File): Promise<{
    cid: string;
    uri: string;
  }> {
    const { data } = await axios.get("/api/initiateUpload");
    const uploadResult = await upload([file], { token: data.uploadToken });
    // Return result
    const cid =
      uploadResult.protocolLink.match(/(?<=https:\/\/).*?(?=.ipfs)/)?.[0] +
      "/" +
      file.name;
    const uri = `${ipfsUriPrefix}${cid}`;
    return { cid, uri };
  };

  const uploadJsonToIpfs = async function (json: object): Promise<{
    cid: string;
    uri: string;
  }> {
    const file = new File([JSON.stringify(json)], "data.json", {
      type: "text/plain",
    });
    return uploadFileToIpfs(file);
  };

  const loadJsonFromIpfs = async function (uri: string): Promise<any> {
    const response = await axios.get(ipfsUriToHttpUri(uri));
    if (response.data.errors) {
      throw new Error(
        `Fail to loading json from IPFS: ${response.data.errors}`
      );
    }
    return response.data;
  };

  return {
    uploadFileToIpfs,
    uploadJsonToIpfs,
    loadJsonFromIpfs,
  };
}
