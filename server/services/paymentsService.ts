import { Payments, EnvironmentName } from "@nevermined-io/payments";
import { PlanDDOHelper } from "./planDDOHelper";
import {
  hasSufficientERC20Balance,
  findMintEvent,
  getCurrentBlockNumber,
  findBurnEvent,
} from "./blockchainService";
import { Client as McpClient } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

/**
 * Initializes the Nevermined Payments library.
 * @param {string} nvmApiKey - Nevermined API key
 * @param {string} environment - testing, staging or production
 * @returns {Payments} - Authenticated Payments instance
 */
export function initializePayments(
  nvmApiKey: string,
  environment: string
): Payments {
  const payments = Payments.getInstance({
    nvmApiKey,
    environment: environment as EnvironmentName,
  });
  if (!payments.isLoggedIn) {
    throw new Error("Failed to log in to the Nevermined Payments Library");
  }
  return payments;
}

/**
 * Gets the available credits for a plan.
 * @param {string} nvmApiKey - Nevermined API key
 * @param {string} environment - testing, staging or production
 * @param {string} planId - The plan DID
 * @returns {Promise<number>} - The available credits
 */
export async function getUserCredits(nvmApiKey: string): Promise<number> {
  const environment = process.env.NVM_ENVIRONMENT || "testing";
  const planId = process.env.PLAN_ID;
  if (!nvmApiKey || !planId) {
    throw new Error("Missing Nevermined API key or plan DID");
  }
  const payments = initializePayments(nvmApiKey, environment);
  const balanceResult = await payments.plans.getPlanBalance(planId);
  const credit = parseInt(balanceResult.balance.toString());
  return credit;
}

/**
 * Gets the agent access token for making direct HTTP requests to the agent.
 * @param {string} nvmApiKey - Nevermined API key
 * @returns {Promise<{accessToken: string, agentId: string}>} - The access token and agent ID
 */
export async function getAgentAccessToken(nvmApiKey: string): Promise<{
  accessToken: string;
  agentId: string;
}> {
  const environment = process.env.NVM_ENVIRONMENT || "testing";
  const planId = process.env.PLAN_ID;
  const agentDid = process.env.AGENT_DID;

  if (!nvmApiKey || !planId || !agentDid) {
    throw new Error("Missing config: nvmApiKey, planId, or agentDid");
  }

  const payments = initializePayments(nvmApiKey, environment);
  const agentAccessParams = await payments.agents.getAgentAccessToken(
    planId,
    agentDid
  );

  return {
    accessToken: agentAccessParams.accessToken,
    agentId: agentDid,
  };
}

/**
 * Calls the agent using MCP. Accepts either a plain input text or an explicit tool call.
 * - If tool payload is provided, it will be used directly.
 * - Otherwise, it will call the default tool with a basic mapping from input.
 * @param {string | { tool: string; args: Record<string, any> }} input - Text intent or MCP tool payload
 * @param {string} nvmApiKey - Nevermined API key
 * @returns {Promise<any>} - Normalized agent response
 */
export async function createTask(
  input: string | { tool: string; args: Record<string, any> },
  nvmApiKey: string
): Promise<any> {
  const mcpEndpoint = process.env.MCP_ENDPOINT || "http://localhost:3001/mcp";

  const { accessToken } = await getAgentAccessToken(nvmApiKey);

  // Create MCP transport and client
  const transport = new StreamableHTTPClientTransport(new URL(mcpEndpoint), {
    requestInit: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const client = new McpClient({
    name: "weather-mcp-client",
    version: "0.1.0",
  });

  try {
    await client.connect(transport);

    // Decide tool and args
    let toolName: string;
    let toolArgs: Record<string, any> = {};

    if (
      typeof input === "object" &&
      input &&
      typeof (input as any).tool === "string"
    ) {
      toolName = (input as any).tool;
      toolArgs = (input as any).args || {};
    } else {
      // Default tool name can be overridden via env
      toolName =
        process.env.MCP_TOOL ||
        (process.env.RAW ? "weather.today.raw" : "weather.today");
      // Basic mapping: treat input as city if provided
      const inputQuery = String(input || "");
      toolArgs = inputQuery ? { city: inputQuery } : {};
    }

    const result: any = await client.callTool({
      name: toolName,
      arguments: toolArgs,
    });

    // Extract text content if present
    let outputText = "";
    if (Array.isArray(result?.content)) {
      const textItem = result.content.find(
        (c: any) => c && typeof c === "object" && c.type === "text"
      );
      if (textItem && typeof textItem.text !== "undefined") {
        outputText =
          typeof textItem.text === "string"
            ? textItem.text
            : JSON.stringify(textItem.text);
      }
    }
    if (!outputText) {
      // Fallback: stringify full result content if no text item found
      outputText = typeof result === "string" ? result : JSON.stringify(result);
    }

    return {
      output: outputText,
    };
  } catch (error) {
    console.error("Error creating task:", error);
    return {
      output: "Error creating task",
    };
  } finally {
    try {
      await client.close();
    } catch {}
  }
}

/**
 * Lists available MCP tools from the configured MCP server.
 * @param {string} nvmApiKey - Nevermined API key
 * @returns {Promise<any>} - Tools metadata as returned by the MCP server
 */
export async function listMcpTools(nvmApiKey: string): Promise<any> {
  const mcpEndpoint = process.env.MCP_ENDPOINT || "http://localhost:3001/mcp";
  const { accessToken } = await getAgentAccessToken(nvmApiKey);

  const transport = new StreamableHTTPClientTransport(new URL(mcpEndpoint), {
    requestInit: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const client = new McpClient({
    name: "weather-mcp-client",
    version: "0.1.0",
  });
  try {
    await client.connect(transport);
    const tools = await client.listTools();
    return tools;
  } catch (error) {
    console.error("Error listing MCP tools:", error);
    return [];
  } finally {
    try {
      await client.close();
    } catch {}
  }
}

/**
 * Calls a specific MCP tool with arbitrary arguments.
 * @param {string} toolName - MCP tool name (e.g., "weather.today")
 * @param {Record<string, any>} args - Arguments to pass to the tool
 * @param {string} nvmApiKey - Nevermined API key
 * @returns {Promise<{ output: string, content?: any }>} - Normalized result with extracted text
 */
export async function callMcpTool(
  toolName: string,
  args: Record<string, any>,
  nvmApiKey: string
): Promise<{ output: string; content?: any }> {
  const mcpEndpoint = process.env.MCP_ENDPOINT || "http://localhost:3001/mcp";
  const { accessToken } = await getAgentAccessToken(nvmApiKey);

  const transport = new StreamableHTTPClientTransport(new URL(mcpEndpoint), {
    requestInit: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const client = new McpClient({
    name: "weather-mcp-client",
    version: "0.1.0",
  });

  try {
    await client.connect(transport);
    const result: any = await client.callTool({
      name: toolName,
      arguments: args,
    });

    let outputText = "";
    if (Array.isArray(result?.content)) {
      const textItem = result.content.find(
        (c: any) => c && typeof c === "object" && c.type === "text"
      );
      if (textItem && typeof textItem.text !== "undefined") {
        outputText =
          typeof textItem.text === "string"
            ? textItem.text
            : JSON.stringify(textItem.text);
      }
    }
    if (!outputText) {
      outputText = typeof result === "string" ? result : JSON.stringify(result);
    }

    return { output: outputText, content: result?.content };
  } finally {
    try {
      await client.close();
    } catch {}
  }
}

/**
 * Orders credits for a plan, checks balance, and returns the mint transaction.
 * @param {string} planId - Plan DID
 * @param {string} nvmApiKey - Nevermined API key
 * @returns {Promise<{ success: boolean, txHash?: string, credits?: string, message: string }>}
 */
export async function orderPlanCredits(
  planId: string,
  nvmApiKey: string
): Promise<{
  success: boolean;
  txHash?: string;
  credits?: string;
  message: string;
}> {
  const environment = process.env.NVM_ENVIRONMENT;
  if (!nvmApiKey || !environment) {
    throw new Error("Missing Nevermined API key or environment");
  }
  const payments = initializePayments(nvmApiKey, environment);
  const planHelper = new PlanDDOHelper(payments, planId);
  await planHelper.loadDDO();

  // 1. Get plan price and token address
  const planPrice = await planHelper.getPlanPrice();
  const tokenAddress = await planHelper.getTokenAddress();
  if (!tokenAddress) {
    return { success: false, message: "Token address not found in plan DDO" };
  }

  // 2. Get our wallet address
  const ourWallet = payments.getAccountAddress() || "";
  if (!ourWallet) {
    return { success: false, message: "Wallet address not found" };
  }

  // 3. Check if we have enough USDC
  const hasBalance = await hasSufficientERC20Balance(
    tokenAddress,
    ourWallet,
    planPrice
  );
  if (!hasBalance) {
    return {
      success: false,
      message: "Insufficient USDC balance to purchase credits",
    };
  }

  // 4. Call orderPlan
  const fromBlock = await getCurrentBlockNumber();
  try {
    const orderResult = await payments.plans.orderPlan(planId);
    if (!orderResult.success) {
      return { success: false, message: "Failed to order credits for plan" };
    }
  } catch (error: any) {
    console.error("Error ordering plan credits:", error);
    return {
      success: false,
      message: error.message || "Failed to order credits for plan",
    };
  }

  // 5. Find mint event
  const contractAddress = await planHelper.get1155ContractAddress();
  const tokenId = await planHelper.getTokenId();
  const mintEvent = contractAddress
    ? await findMintEvent(contractAddress, ourWallet, tokenId, fromBlock)
    : null;

  // 6. Return result
  if (mintEvent) {
    return {
      success: true,
      txHash: mintEvent.txHash,
      credits: mintEvent.value,
      message: `Credits purchased and added to your balance. (tx: ${mintEvent.txHash})`,
    };
  }
  return {
    success: true,
    message: "Credits purchased and added to your balance.",
  };
}

/**
 * Gets the burn transaction info for the current plan and wallet from a given block.
 * @param {number} fromBlock - The block number to start searching from
 * @param {string} nvmApiKey - Nevermined API key
 * @returns {Promise<{ txHash: string, credits: string, planId: string } | null>}
 */
export async function getBurnTransactionInfo(
  fromBlock: number,
  nvmApiKey: string
): Promise<{ txHash: string; credits: string; planId: string } | null> {
  const environment = process.env.NVM_ENVIRONMENT || "testing";
  const planId = process.env.PLAN_ID;
  if (!nvmApiKey || !planId) {
    throw new Error("Missing config");
  }
  const payments = initializePayments(nvmApiKey, environment);
  const planHelper = new PlanDDOHelper(payments, planId);
  await planHelper.loadDDO();
  const contractAddress = await planHelper.get1155ContractAddress();
  const tokenId = await planHelper.getTokenId();
  const ourWallet = payments.getAccountAddress() || "";
  if (!contractAddress || !tokenId || !ourWallet) {
    throw new Error("Missing contract, tokenId or wallet");
  }
  let burnEvent = null;
  let attempts = 0;
  while (attempts < 10 && !burnEvent) {
    burnEvent = await findBurnEvent(
      contractAddress,
      ourWallet,
      tokenId,
      fromBlock
    );
    if (!burnEvent) {
      attempts++;
      if (attempts < 10) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }
  if (burnEvent) {
    return {
      txHash: burnEvent.txHash,
      credits: burnEvent.value,
      planId: planId,
    };
  }
  return null;
}

/**
 * Gets task details by making a direct HTTP request to the agent.
 * @param {string} task_id - Task ID
 * @param {string} nvmApiKey - Nevermined API key
 * @returns {Promise<any>} - Task details
 */
export async function getTask(
  task_id: string,
  _nvmApiKey: string
): Promise<any> {
  // MCP flow is synchronous in our usage; keep compatibility by returning a no-op result
  return { ok: true, task_id };
}

/**
 * Gets the plan price (in USDC units) and number of credits for a plan.
 * @param {string} nvmApiKey - Nevermined API key
 * @returns {Promise<{ planPrice: string, planCredits: number }>}
 */
export async function getPlanCost(nvmApiKey: string): Promise<{
  planPrice: string;
  planCredits: number;
}> {
  const environment = process.env.NVM_ENVIRONMENT || "testing";
  const planId = process.env.PLAN_ID;
  if (!nvmApiKey || !planId) {
    throw new Error("Missing config");
  }
  const payments = initializePayments(nvmApiKey, environment);
  const planHelper = new PlanDDOHelper(payments, planId);
  await planHelper.loadDDO();
  const planPrice = await planHelper.getPlanPrice();
  const planCredits = await planHelper.getPlanCredits();
  return { planPrice, planCredits };
}

/**
 * Redeems a given amount of credits for the current plan and wallet.
 * @param {string} planId - Plan DID
 * @param {string} creditsAmount - Amount of credits to redeem (as string)
 * @param {string} nvmApiKey - Nevermined API key
 * @returns {Promise<{ success: boolean, txHash?: string, message: string }>}
 */
export async function redeemCredits(
  planId: string,
  creditsAmount: string,
  nvmApiKey: string
): Promise<{
  success: boolean;
  txHash?: string;
  message: string;
}> {
  const environment = process.env.NVM_ENVIRONMENT || "testing";
  const agentId = process.env.AGENT_DID;
  if (!nvmApiKey || !planId || !agentId) {
    throw new Error("Missing Nevermined API key or plan DID");
  }
  const payments = initializePayments(nvmApiKey, environment);
  const redeemFrom = payments.getAccountAddress();

  if (!redeemFrom) {
    throw new Error("Wallet address not found");
  }

  try {
    const result = await payments.plans.redeemCredits(
      agentId,
      planId,
      redeemFrom as `0x${string}`,
      creditsAmount
    );
    if (result && result.success) {
      return {
        success: true,
        txHash: result.txHash,
        message: result.message || "Credits redeemed successfully.",
      };
    } else {
      return {
        success: false,
        message: result?.message || "Failed to redeem credits.",
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Error redeeming credits.",
    };
  }
}
