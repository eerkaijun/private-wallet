import { BigNumber, BigNumberish } from "ethers";

import { BytesLike } from "@ethersproject/bytes";
import { Keypair } from "./keypair";

export type Store<T extends object | string | number> = {
  add(id: string, data: T): Promise<boolean>;
  get(id: string): Promise<T | undefined>;
  getAll(): Promise<T[]>;
  remove(id: string): Promise<boolean>;
  removeAll(): Promise<boolean>;
};

export type NewCommitment = {
  type: "NewCommitment";
  commitment: string;
  index: number;
  encryptedOutput: string;
};

export type NewNullifier = {
  type: "NewNullifier";
  nullifier: string;
};

export type ContractEvent = NewCommitment | NewNullifier;

export type ProofArguments = {
  proof: string;
  pubSignals: string[];
  root: string;
  inputNullifiers: string[];
  outputCommitments: [string, string];
  publicAmount: BigNumber;
  extDataHash: string;
};

export type ExtData = {
  recipient: string;
  extAmount: BigNumber;
  encryptedOutput1: string;
  encryptedOutput2: string;
};

export type FormattedProof = {
  proofArguments: ProofArguments;
  extData: ExtData;
};

export type CommitmentEvent = {
  blockNumber: number;
  transactionHash: string;
  index: number;
  commitment: string;
  encryptedOutput: string;
};

export type CommitmentEvents = CommitmentEvent[];

export interface UtxoOptions {
  amount?: BigNumber | number | string;
  blinding?: BigNumber;
  index?: number | null;
  keypair?: Keypair;
}

export interface BaseUtxo {
  keypair: BaseKeypair;
  amount: BigNumber;
  blinding: BigNumber;
  index: number;
  commitment?: BigNumber;
  nullifier?: BigNumber;

  getNullifier: () => BigNumber;
  getCommitment: () => BigNumber;
  encrypt: () => string;
}

export type CustomUtxo = BaseUtxo & { transactionHash: string };

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class UtxoStatic {
  // @ts-expect-error
  static decrypt(keypair: BaseKeypair, data: string, index: number): BaseUtxo;
}

export interface BaseKeypair {
  privkey: string;
  pubkey: BigNumber;
  encryptionKey: string;

  toString: () => string;
  address: () => string;
  encrypt: (bytes: Buffer) => string;
  decrypt: (data: string) => Buffer;
  sign: (commitment: BigNumber, merklePath: BigNumberish) => BigNumber;
}

export type PrepareTxParams = {
  outputs?: BaseUtxo[];
  inputs?: BaseUtxo[];
  fee?: BigNumber;
  relayer?: string | BigNumber;
  rootHex?: string;
  recipient?: string | BigNumber;
  events?: CommitmentEvents;
  isL1Withdrawal?: boolean;
  l1Fee?: BigNumber;
};

export type ProofParams = {
  inputs: BaseUtxo[];
  outputs: BaseUtxo[];
  // eslint-disable-next-line
  tree: any;
  isL1Withdrawal: boolean;
  l1Fee: BigNumber;
  extAmount: BigNumber;
  fee: BigNumber;
  recipient: string | BigNumber;
  relayer: string | BigNumber;
};

export type ArgsProof = {
  proof: BytesLike;
  root: BytesLike;
  inputNullifiers: string[];
  outputCommitments: [BytesLike, BytesLike];
  publicAmount: BigNumberish;
  extDataHash: string;
};

export type DownloadParams = {
  prefix: string;
  name: string;
  contentType: string;
};

export type FetchFileParams = {
  id?: string;
  url: string;
  name: string;
  retryAttempt?: number;
};

export type CreateTransactionParams = {
  outputs?: BaseUtxo[];
  inputs?: BaseUtxo[];
  fee?: BigNumber;
  relayer?: string | BigNumber;
  recipient?: string | BigNumber;
  rootHex?: string;
  events?: CommitmentEvents;
  isL1Withdrawal?: boolean;
  l1Fee?: BigNumber;
};

export type EstimateTransactParams = {
  args: ArgsProof;
  extData: ExtData;
};
