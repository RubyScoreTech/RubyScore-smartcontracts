import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import type { IRubyscore_Achievement } from "@contracts/interfaces/IRubyscore_Achievement";

interface RSV {
  r: string;
  s: string;
  v: number;
}

export interface Domain {
  name: string;
  version: string;
  chainId: string;
  verifyingContract: string;
}

interface IArrayItem {
  name: string;
  type: string;
}

export interface ITypes {
  [key: string]: IArrayItem[];
}

const createTypedData = (domain: Domain, types: ITypes, message: IRubyscore_Achievement.MintParamsStruct) => {
  return {
    domain,
    types,
    primaryType: "MintParams",
    message,
  };
};

export const splitSignatureToRSV = (signature: string): RSV => {
  const r = "0x" + signature.substring(2).substring(0, 64);
  const s = "0x" + signature.substring(2).substring(64, 128);
  const v = parseInt(signature.substring(2).substring(128, 130), 16);

  return { r, s, v };
};

export const sign = async (
  domain: Domain,
  types: ITypes,
  message: IRubyscore_Achievement.MintParamsStruct,
  signer: SignerWithAddress
): Promise<string> => {
  const typedData = createTypedData(domain, types, message);

  const rawSignature = await signer._signTypedData(typedData.domain, typedData.types, typedData.message);

  return rawSignature;
};
