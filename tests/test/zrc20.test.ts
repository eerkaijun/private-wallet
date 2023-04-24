// Need this or ethers fails in node

import { ethers } from "hardhat";
import { Account } from "../../sdk/src";
import { Verifier__factory, ZRC20__factory } from "../typechain-types";
import { expect } from "chai";
import artifact from "../../sdk/contracts/generated/Hasher.json";
import { sleep, tend, time } from "../utils";

async function deployZrc() {
  // Prepare signers
  const [deployer] = await ethers.getSigners();

  // Deploy the poseidon hasher
  const { abi, bytecode } = artifact;
  const Hasher = await ethers.getContractFactory(abi, bytecode);
  const hasher = await Hasher.deploy();

  // Deploy the Verifier
  const verifierFactory = new Verifier__factory(deployer);
  const verifier = await verifierFactory.deploy();

  // Deploy the ZRC20 passing in the hasher and verifier
  const zrc20Factory = new ZRC20__factory(deployer);
  const contract = await zrc20Factory.deploy(hasher.address, verifier.address);

  return { contract };
}

it.skip("Test zrc20 transfer", async function () {
  const TEN = 10 * 1_000_000;
  const FIVE = 5 * 1_000_000;

  let { contract } = await deployZrc();

  const [deployer, aliceEth, bobEth] = await ethers.getSigners();

  // CREATE ACCOUNTS
  const alice = await Account.create(contract, aliceEth, "password123");
  await alice.login();

  const bob = await Account.create(contract, bobEth, "password123");
  await bob.login();

  let tx, t, proof, publicBalance, privateBalance;

  // MINT TOKENS
  contract = contract.connect(deployer);
  tx = await contract.mint(aliceEth.address, TEN);
  await tx.wait();

  contract = contract.connect(aliceEth);

  /// DEPOSIT
  t = time("Alice creates shield proof for 10 coins");
  proof = await alice.proveShield(TEN);
  tend(t);

  t = time("Alice approves ERC20 payment");
  tx = await contract.approve(contract.address, TEN);
  await tx.wait();
  tend(t);

  t = time("Alice submits transaction");
  tx = await contract.transact(proof);
  await tx.wait();
  tend(t);

  await sleep(10_000); // Waiting for sync

  /// Check balances
  t = time("Check that Alice's ERC20 balance is 0");
  publicBalance = await contract.balanceOf(aliceEth.address);
  expect(publicBalance).to.eq(0);
  tend(t);

  t = time("Check Alice's private balance is 10");
  privateBalance = await alice.getBalance();
  expect(privateBalance).to.eq(TEN); // Transfer to the darkside worked! :)
  tend(t);

  /// TRANSFER
  const bobKeypair = bob.getKeypair(); // receiver has to send sender a public keypair
  const bobPubkey = bobKeypair.address(); // contains only the public key

  t = time("Alice creates a proof to transfer 5 coins to Bob");
  proof = await alice.proveTransfer(FIVE, bobPubkey);
  tend(t);

  t = time("Alice submits her transaction");
  tx = await contract.transact(proof);
  await tx.wait();
  tend(t);

  await sleep(10_000); // Waiting for sync

  // Check private balances
  t = time("Check Alice's private balance is 5");
  const alicePrivateBal = await alice.getBalance();
  tend(t);
  expect(alicePrivateBal).to.eq(FIVE);

  t = time("Check Bob's private balance is 5");
  const bobPrivateBal = await bob.getBalance();
  tend(t);
  expect(bobPrivateBal).to.eq(FIVE);

  /// WITHDRAW

  t = time("Alice creates a proof to unshield 5");
  proof = await alice.proveUnshield(FIVE, aliceEth.address);
  tend(t);

  t = time("Alice submits her transaction");
  tx = await contract.transact(proof);
  tx.wait();
  tend(t);

  await sleep(10_000); // Waiting for sync

  /// Check balances
  t = time("Check Alice's public balance is 5");
  publicBalance = await contract.balanceOf(aliceEth.address);
  expect(publicBalance).to.eq(FIVE);
  tend(t);

  alice.destroy();
  bob.destroy();

  console.log("Ok");
});
