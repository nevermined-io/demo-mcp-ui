/**
 * Helper class to extract and cache plan DDO data and provide utility methods.
 */
export class PlanDDOHelper {
  public payments: any;
  public planId: string;
  private ddo: any | undefined;
  private usdcAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

  /**
   * @param payments - Instance of payments library
   * @param planId - DID of the plan
   */
  constructor(payments: any, planId: string) {
    this.payments = payments;
    this.planId = planId;
    this.ddo = undefined;
  }

  /**
   * Loads the DDO for the plan (if not already loaded)
   * @returns {Promise<any>} The loaded DDO object
   */
  async loadDDO() {
    if (!this.ddo) {
      this.ddo = await this.payments.plans.getPlan(this.planId);
    }
    return this.ddo;
  }

  /**
   * Gets the ERC20 token address from the DDO
   * @returns {Promise<string | undefined>} The ERC20 token address
   */
  async getTokenAddress(): Promise<string | undefined> {
    const ddo = await this.loadDDO();
    return ddo?.registry?.price?.tokenAddress;
  }

  /**
   * Gets the plan price from the DDO
   * @returns {Promise<string>} The plan price
   */
  async getPlanPrice(): Promise<string> {
    const ddo = await this.loadDDO();
    const weiPrice = ddo?.registry?.price?.amounts
      ?.reduce((acc: number, curr: number) => Number(acc) + Number(curr), 0)
      .toString();
    if (ddo?.registry?.price?.tokenAddress === this.usdcAddress) {
      return (weiPrice / 10 ** 6).toString();
    }
    return weiPrice;
  }

  /**
   * Gets the number of credits for the plan
   * @returns {Promise<number>} The number of credits
   */
  async getPlanCredits(): Promise<number> {
    const ddo = await this.loadDDO();
    return ddo?.registry?.credits?.amount || 0;
  }

  /**
   * Gets the agent wallet from the DDO
   * @returns {Promise<string | undefined>} The agent wallet address
   */
  async getAgentWallet(): Promise<string | undefined> {
    const ddo = await this.loadDDO();
    return ddo?.publicKey?.[0]?.owner;
  }

  /**
   * Gets the tokenId for the plan (from the planId, as decimal string)
   * @returns {Promise<string>} The tokenId as a string
   */
  async getTokenId(): Promise<string> {
    return this.planId;
  }

  /**
   * Gets the NFT1155 contract address from the DDO (from parameters)
   * @returns {Promise<string | undefined>} The NFT1155 contract address
   */
  async get1155ContractAddress(): Promise<string | undefined> {
    const ddo = await this.loadDDO();
    return ddo?.registry?.credits?.nftAddress;
  }
}
