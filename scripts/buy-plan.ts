#!/usr/bin/env tsx
import "dotenv/config";
import { Payments, EnvironmentName } from "@nevermined-io/payments";

let ddo: any;
const usdcAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
let payments: Payments;

const apiKey = (process.env.CLIENT_NVM_API_KEY || "").trim();
const planIdArg = process.argv[2]?.trim();
const planId = planIdArg || (process.env.PLAN_ID || "").trim();
const environment = ((
  process.env.NVM_ENVIRONMENT || "staging_sandbox"
).trim() || "staging_sandbox") as EnvironmentName;

if (!apiKey) {
  console.error(
    "Missing CLIENT_NVM_API_KEY. Please export your Nevermined API key as CLIENT_NVM_API_KEY."
  );
  process.exit(1);
}
if (!planId) {
  console.error(
    "Missing plan DID. Provide it as CLI arg or set PLAN_ID in the environment."
  );
  process.exit(1);
}

console.log("Environment:", environment);
console.log("Plan:", planId);

/**
 * CLI script to purchase a Nevermined plan using the Payments library.
 * - Reads the buyer API key from the environment variable CLIENT_NVM_API_KEY
 * - Reads the plan DID from CLI arg or PLAN_ID env
 * - Uses NVM_ENVIRONMENT (testing/staging/production), default "testing"
 *
 * Usage:
 *   npm run plan:buy -- <PLAN_ID>
 * or set PLAN_ID in the environment.
 */
async function main(): Promise<void> {
  // Initialize Payments
  payments = Payments.getInstance({ nvmApiKey: apiKey, environment });
  if (!payments.isLoggedIn) {
    throw new Error("Failed to log in to the Nevermined Payments Library");
  }

  // Optional: display plan price and credits
  try {
    const price = await getPlanPrice();
    const credits = await getPlanCredits();
    console.log(
      `Plan details → price: ${price} (USDC units), credits: ${credits}`
    );
  } catch (e) {
    console.warn("Warning: could not fetch plan details (continuing)");
  }

  // Place the order
  console.log(
    "Ordering plan credits… with account address",
    payments.getAccountAddress()
  );
  const result = await payments.plans.orderPlan(planId);
  if (!result?.success) {
    throw new Error(result?.message || "Failed to order credits for plan");
  }

  console.log("Success:", result.message || "Credits purchased and added.");
  if (result.txHash) console.log("tx:", result.txHash);
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});

/**
 * Gets the plan price from the DDO
 * @returns {Promise<string>} The plan price
 */
async function getPlanPrice(): Promise<string> {
  await loadDDO();
  const weiPrice = ddo?.registry?.price?.amounts
    ?.reduce((acc: number, curr: number) => Number(acc) + Number(curr), 0)
    .toString();
  if (ddo?.registry?.price?.tokenAddress === usdcAddress) {
    return (weiPrice / 10 ** 6).toString();
  }
  return weiPrice;
}

async function getPlanCredits(): Promise<number> {
  await loadDDO();
  return ddo?.registry?.credits?.amount || 0;
}

async function loadDDO() {
  if (!ddo) {
    ddo = await payments.plans.getPlan(planId);
  }
}
