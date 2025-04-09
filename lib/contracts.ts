import { ethers } from "ethers"

// Combined ABI for ProductTransportMarketplace contract
export const productMarketplaceAbi = [
  "function registerProduct(string memory name, string memory details, string memory quantity, uint256 price) external returns (uint256)",
  "function updateProduct(uint256 productId, string memory quantity, uint256 price, string memory details) external",
  "function changeProductStatus(uint256 productId, uint8 newStatus) external",
  "function getProduct(uint256 productId) external view returns (tuple(uint256 productId, address producer, string name, string quantity, string details, uint256 price, uint8 status, uint256 timestamp, uint256 lastUpdated, uint256 auctionId))",
  "function getProductCount() external view returns (uint256)",
  "function grantProducerRole(address account) external",
  "function revokeProducerRole(address account) external",
  "function getProductsByProducer(address producer, uint256 startId, uint256 count) external view returns (tuple(uint256 productId, address producer, string name, string quantity, string details, uint256 price, uint8 status, uint256 timestamp, uint256 lastUpdated, uint256 auctionId)[] memory)",
  "function hasRole(bytes32 role, address account) external view returns (bool)",
  "function PRODUCER_ROLE() external view returns (bytes32)",
  "function CARRIER_ROLE() external view returns (bytes32)",
  "function createProductAuction(uint256 productId, string memory title, string memory description, uint256 duration, string memory originLocation, string memory destinationLocation, uint256 startingPrice, string memory specialRequirements, uint256 weight) external returns (uint256)",
  "function placeBid(uint256 auctionId, uint256 bidAmount, string memory notes) external",
  "function completeAuction(uint256 auctionId) external",
  "function cancelAuction(uint256 auctionId) external",
  "function getAuction(uint256 auctionId) external view returns (tuple(uint256 auctionId, uint256 productId, string title, string description, address producer, uint256 startTime, uint256 endTime, string originLocation, string destinationLocation, uint256 startingPrice, uint256 currentLowestBid, address lowestBidder, uint256 bidCount, uint8 status, string specialRequirements, uint256 weight, uint256 lastUpdated))",
  "function getAuctionBids(uint256 auctionId) external view returns (tuple(address carrier, uint256 amount, uint256 timestamp, string notes)[] memory)",
  "function isAuctionEnded(uint256 auctionId) external view returns (bool)",
  "function getTimeRemaining(uint256 auctionId) external view returns (uint256)",
  "function getActiveAuctions(uint256 startId, uint256 count) external view returns (tuple(uint256 auctionId, uint256 productId, string title, string description, address producer, uint256 startTime, uint256 endTime, string originLocation, string destinationLocation, uint256 startingPrice, uint256 currentLowestBid, address lowestBidder, uint256 bidCount, uint8 status, string specialRequirements, uint256 weight, uint256 lastUpdated)[] memory)",
  "function getMyBids() external view returns (uint256[] memory)",
  "function getCompletedAuctions(uint256 startId, uint256 count) external view returns (uint256[] memory)",
  "function grantCarrierRole(address account) external",
  "function revokeCarrierRole(address account) external",
  "event ProductRegistered(uint256 indexed productId, address indexed producer, string name, string quantity, uint256 price, uint256 timestamp)",
  "event ProductUpdated(uint256 indexed productId, address indexed producer, string quantity, uint256 price, uint8 status, uint256 timestamp)",
  "event ProductStatusChanged(uint256 indexed productId, uint8 status, uint256 timestamp)",
  "event AuctionCreated(uint256 indexed auctionId, uint256 indexed productId, string title, address indexed producer, uint256 startTime, uint256 endTime, uint256 startingPrice)",
  "event BidPlaced(uint256 indexed auctionId, address indexed carrier, uint256 amount, uint256 timestamp)",
  "event AuctionCompleted(uint256 indexed auctionId, uint256 indexed productId, address indexed winner, uint256 lowestBid, uint256 timestamp)",
  "event AuctionCancelled(uint256 indexed auctionId, uint256 timestamp)",
]

// Contract address from deployment
export const CONTRACT_ADDRESSES = {
  productRegistration: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // ProductTransportMarketplace contract
}

// Helper function to check if a contract exists at the given address
export async function isContract(address: string): Promise<boolean> {
  if (typeof window === "undefined" || typeof window.ethereum === "undefined") {
    return false
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const code = await provider.getCode(address)
    // If the address is a contract, the code will be non-empty
    return code !== "0x"
  } catch (error) {
    console.error("Error checking if address is a contract:", error)
    return false
  }
}

// Helper function to get contract instance
export async function getContract() {
  if (typeof window === "undefined" || typeof window.ethereum === "undefined") {
    throw new Error("MetaMask is not installed")
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()

    // Check if contract exists at the address
    const contractExists = await isContract(CONTRACT_ADDRESSES.productRegistration)
    if (!contractExists) {
      console.error(`No contract found at address: ${CONTRACT_ADDRESSES.productRegistration}`)
    }

    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESSES.productRegistration, productRegistrationAbi, signer)

    return { contract, provider, signer }
  } catch (error) {
    console.error("Error initializing contract:", error)
    throw error
  }
}

