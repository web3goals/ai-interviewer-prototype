import { ProfileUriData } from "@/types";
import {
  Avatar,
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import FormikHelper from "components/helper/FormikHelper";
import { ExtraLargeLoadingButton } from "components/styled";
import { profileContractAbi } from "contracts/abi/profileContract";
import { ethers } from "ethers";
import { Form, Formik } from "formik";
import useError from "hooks/useError";
import useIpfs from "hooks/useIpfs";
import useToasts from "hooks/useToast";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import { emojiAvatarForAddress } from "utils/avatars";
import {
  chainToSupportedChainId,
  chainToSupportedChainProfileContractAddress,
} from "utils/chains";
import { ipfsUriToHttpUri } from "utils/converters";
import {
  useAccount,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import * as yup from "yup";

/**
 * A component with form to edit account profile.
 */
export default function AccountEditProfileForm(props: {
  profileData: ProfileUriData | null;
}) {
  const { handleError } = useError();
  const { uploadJsonToIpfs, uploadFileToIpfs } = useIpfs();
  const { showToastSuccess } = useToasts();
  const router = useRouter();
  const { chain } = useNetwork();
  const { address } = useAccount();

  // Form states
  const [formImageValue, setFormImageValue] = useState<{
    file: any;
    uri: any;
  }>();
  const [formValues, setFormValues] = useState({
    name: props.profileData?.attributes?.[0]?.value || "",
    about: props.profileData?.attributes?.[1]?.value || "",
    email: props.profileData?.attributes?.[2]?.value || "",
    website: props.profileData?.attributes?.[3]?.value || "",
    twitter: props.profileData?.attributes?.[4]?.value || "",
    telegram: props.profileData?.attributes?.[5]?.value || "",
    instagram: props.profileData?.attributes?.[6]?.value || "",
  });

  const formValidationSchema = yup.object({
    name: yup.string(),
    about: yup.string(),
    email: yup.string().email(),
    website: yup.string().url(),
    twitter: yup
      .string()
      .matches(
        /^[a-zA-Z0-9_]*$/,
        "your twitter can only contain letters, numbers and '_'"
      ),
    telegram: yup
      .string()
      .matches(
        /^[a-zA-Z0-9_]*$/,
        "your telegram can only contain letters, numbers and '_'"
      ),
    instagram: yup
      .string()
      .matches(
        /^[a-zA-Z0-9_]*$/,
        "your instagram can only contain letters, numbers and '_'"
      ),
  });
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  // Uri states
  const [updatedProfileDataUri, setUpdatedProfileDataUri] = useState("");

  // Contract states
  const { config: contractConfig } = usePrepareContractWrite({
    address: chainToSupportedChainProfileContractAddress(chain),
    abi: profileContractAbi,
    functionName: "setURI",
    args: [updatedProfileDataUri],
    chainId: chainToSupportedChainId(chain),
  });
  const {
    data: contractWriteData,
    isLoading: isContractWriteLoading,
    write: contractWrite,
  } = useContractWrite(contractConfig);
  const { isLoading: isTransactionLoading, isSuccess: isTransactionSuccess } =
    useWaitForTransaction({
      hash: contractWriteData?.hash,
    });

  const isFormDisabled =
    isFormSubmitting ||
    isContractWriteLoading ||
    isTransactionLoading ||
    isTransactionSuccess;

  async function onImageChange(files: any[]) {
    try {
      // Get file
      const file = files?.[0];
      if (!file) {
        return;
      }
      // Check file size
      const isLessThan2Mb = file.size / 1024 / 1024 < 2;
      if (!isLessThan2Mb) {
        throw new Error(
          "Only files with size smaller than 2MB are currently supported!"
        );
      }
      // Read and save file
      const fileReader = new FileReader();
      fileReader.onload = () => {
        if (fileReader.readyState === 2) {
          setFormImageValue({
            file: file,
            uri: fileReader.result,
          });
        }
      };
      fileReader.readAsDataURL(file);
    } catch (error: any) {
      handleError(error, true);
    }
  }

  async function submit(values: any) {
    try {
      setIsFormSubmitting(true);
      // Upload image to ipfs
      let imageIpfsUri;
      if (formImageValue?.file) {
        const { uri } = await uploadFileToIpfs(formImageValue.file);
        imageIpfsUri = uri;
      }
      const profileUriData: ProfileUriData = {
        name: "AI Interviewer - Profile",
        image: imageIpfsUri || props.profileData?.image || "",
        attributes: [
          { trait_type: "name", value: values.name },
          { trait_type: "about", value: values.about },
          { trait_type: "email", value: values.email },
          { trait_type: "website", value: values.website },
          { trait_type: "twitter", value: values.twitter },
          { trait_type: "telegram", value: values.telegram },
          { trait_type: "instagram", value: values.instagram },
        ],
      };
      // Upload updated profile data to ipfs
      const { uri } = await uploadJsonToIpfs(profileUriData);
      setUpdatedProfileDataUri(uri);
    } catch (error: any) {
      handleError(error, true);
      setIsFormSubmitting(false);
    }
  }

  useEffect(() => {
    // Write data to contract if form was submitted
    if (
      updatedProfileDataUri !== "" &&
      contractWrite &&
      !isContractWriteLoading
    ) {
      contractWrite?.();
      setUpdatedProfileDataUri("");
      setIsFormSubmitting(false);
    }
  }, [updatedProfileDataUri, contractWrite, isContractWriteLoading]);

  useEffect(() => {
    if (isTransactionSuccess) {
      showToastSuccess("Changes saved, account will be updated soon");
      router.push(`/accounts/${address}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTransactionSuccess]);

  return (
    <Formik
      initialValues={formValues}
      validationSchema={formValidationSchema}
      onSubmit={submit}
    >
      {({ values, errors, touched, handleChange }) => (
        <Form
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <FormikHelper onChange={(values: any) => setFormValues(values)} />
          {/* Image */}
          <Dropzone
            multiple={false}
            disabled={isFormDisabled}
            onDrop={(files) => onImageChange(files)}
            accept={{ "image/*": [] }}
          >
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Avatar
                    sx={{
                      cursor: !isFormDisabled ? "pointer" : undefined,
                      width: 164,
                      height: 164,
                      borderRadius: 164,
                      background: emojiAvatarForAddress(
                        address || ethers.constants.AddressZero
                      ).color,
                    }}
                    src={
                      formImageValue?.uri ||
                      (props.profileData?.image
                        ? ipfsUriToHttpUri(props.profileData.image)
                        : undefined)
                    }
                  >
                    <Typography fontSize={64}>
                      {
                        emojiAvatarForAddress(
                          address || ethers.constants.AddressZero
                        ).emoji
                      }
                    </Typography>
                  </Avatar>
                </Box>
              </div>
            )}
          </Dropzone>
          {/* Name */}
          <TextField
            fullWidth
            id="name"
            name="name"
            label="Name"
            placeholder="Alice"
            value={values.name}
            onChange={handleChange}
            error={touched.name && Boolean(errors.name)}
            helperText={touched.name && errors.name}
            disabled={isFormDisabled}
            sx={{ mt: 4 }}
          />
          {/* About */}
          <TextField
            fullWidth
            id="about"
            name="about"
            label="About"
            placeholder="crypto enthusiast..."
            multiline={true}
            rows={3}
            value={values.about}
            onChange={handleChange}
            error={touched.about && Boolean(errors.about)}
            helperText={touched.about && errors.about}
            disabled={isFormDisabled}
            sx={{ mt: 2 }}
          />
          {/* Email */}
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            placeholder="alice@domain.io"
            value={values.email}
            onChange={handleChange}
            error={touched.email && Boolean(errors.email)}
            helperText={touched.email && errors.email}
            disabled={isFormDisabled}
            sx={{ mt: 2 }}
          />
          {/* Website */}
          <TextField
            fullWidth
            id="website"
            name="website"
            label="Website"
            placeholder="https://domain.io"
            value={values.website}
            onChange={handleChange}
            error={touched.website && Boolean(errors.website)}
            helperText={touched.website && errors.website}
            disabled={isFormDisabled}
            sx={{ mt: 2 }}
          />
          {/* Twitter */}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel htmlFor="twitter">Twitter</InputLabel>
            <OutlinedInput
              fullWidth
              id="twitter"
              name="twitter"
              label="Twitter"
              placeholder="alice"
              startAdornment={
                <InputAdornment position="start">@</InputAdornment>
              }
              value={values.twitter}
              onChange={handleChange}
              error={touched.twitter && Boolean(errors.twitter)}
              disabled={isFormDisabled}
            />
            <FormHelperText error={touched.twitter && Boolean(errors.twitter)}>
              {touched.twitter && errors.twitter}
            </FormHelperText>
          </FormControl>
          {/* Telegram */}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel htmlFor="telegram">Telegram</InputLabel>
            <OutlinedInput
              fullWidth
              id="telegram"
              name="telegram"
              label="Telegram"
              placeholder="alice"
              startAdornment={
                <InputAdornment position="start">@</InputAdornment>
              }
              value={values.telegram}
              onChange={handleChange}
              error={touched.telegram && Boolean(errors.telegram)}
              disabled={isFormDisabled}
            />
            <FormHelperText
              error={touched.telegram && Boolean(errors.telegram)}
            >
              {touched.telegram && errors.telegram}
            </FormHelperText>
          </FormControl>
          {/* Instagram */}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel htmlFor="instagram">Instagram</InputLabel>
            <OutlinedInput
              fullWidth
              id="instagram"
              name="instagram"
              label="Instagram"
              placeholder="alice"
              startAdornment={
                <InputAdornment position="start">@</InputAdornment>
              }
              value={values.instagram}
              onChange={handleChange}
              error={touched.instagram && Boolean(errors.instagram)}
              disabled={isFormDisabled}
            />
            <FormHelperText
              error={touched.instagram && Boolean(errors.instagram)}
            >
              {touched.instagram && errors.instagram}
            </FormHelperText>
          </FormControl>
          {/* Submit button */}
          <ExtraLargeLoadingButton
            loading={
              isFormSubmitting || isContractWriteLoading || isTransactionLoading
            }
            variant="contained"
            type="submit"
            disabled={isFormDisabled || !contractWrite}
            sx={{ mt: 4 }}
          >
            Save
          </ExtraLargeLoadingButton>
        </Form>
      )}
    </Formik>
  );
}
