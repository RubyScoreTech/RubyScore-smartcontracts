// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.19;

import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

/**
 * @title IRubyscore_Achievement
 * @dev IRubyscore_Achievement is an interface for Rubyscore_Achievement contract
 */
interface IRubyscore_Achievement is IERC1155 {
    struct MintParams {
        address userAddress; // Address of the buyer.
        uint256 userNonce; // Nonce associated with the user's address for preventing replay attacks.
        uint256[] nftIds; // ids of NFTs to mint
    }

    /**
     * @notice Emitted when the base URI for token metadata is updated.
     * @param newBaseURI The new base URI that will be used to construct token metadata URIs.
     * @dev This event is triggered when the contract operator updates the base URI
     * for retrieving metadata associated with tokens. The 'newBaseURI' parameter represents
     * the updated base URI.
     */
    event BaseURISet(string indexed newBaseURI);

    /**
     * @notice Emitted when NFTs are minted for a user.
     * @param userAddress The address of the user receiving the NFTs.
     * @param userNonce The user's nonce used to prevent replay attacks.
     * @param nftIds An array of NFT IDs that were minted.
     * @dev This event is emitted when new NFTs are created and assigned to a user.
     * @dev It includes the user's address, nonce, and the IDs of the minted NFTs for transparency.
     */
    event Minted(address indexed userAddress, uint256 indexed userNonce, uint256[] nftIds);

    /**
     * @notice Emitted when the URI for a specific token is updated.
     * @param tokenId The ID of the token for which the URI is updated.
     * @param newTokenURI The new URI assigned to the token.
     * @dev This event is emitted when the URI for a token is modified, providing transparency
     * when metadata URIs are changed for specific tokens.
     */
    event TokenURISet(uint256 indexed tokenId, string indexed newTokenURI);

    /**
     * @notice Emitted when the transfer lock status for a token is updated.
     * @param tokenId The ID of the token for which the transfer lock status changes.
     * @param lock The new transfer lock status (true for locked, false for unlocked).
     * @dev This event is emitted when the transfer lock status of a specific token is modified.
     * @dev It provides transparency regarding whether a token can be transferred or not.
     */
    event TokenUnlockSet(uint256 indexed tokenId, bool indexed lock);

    /**
     * @notice Emitted when the price for a token mint is updated.
     * @param newPrice The new price for mint.
     * @dev This event is emitted when the price for mint a token is modified.
     */
    event PriceUpdated(uint256 newPrice);

    /**
     * @notice Get token name.
     * @return Token name.
     */
    function name() external view returns (string memory);

    /**
     * @notice Get token symbol.
     * @return Token symbol.
     */
    function symbol() external view returns (string memory);

    /**
     * @notice Get the URI of a token.
     * @param tokenId The ID of the token.
     * @return The URI of the token.
     */
    function uri(uint256 tokenId) external view returns (string memory);

    /**
     * @notice Get the transfer status of a token.
     * @param tokenId The ID of the token.
     * @return Whether the token's transfer is unlocked (true) or restricted (false).
     */
    function getTransferStatus(uint256 tokenId) external view returns (bool);

    /**
     * @notice Get the user's nonce associated with their address.
     * @param userAddress The address of the user.
     * @return The user's nonce.
     */
    function getUserNonce(address userAddress) external view returns (uint256);

    /**
     * @notice Get the token URI for a given tokenId.
     * @param tokenId The ID of the token.
     * @return The URI of the token.
     * @dev Diblicate for uri() method
     */
    function tokenURI(uint256 tokenId) external view returns (string memory);

    /**
     * @notice Set the URI for a token.
     * @param tokenId The ID of the token.
     * @param newTokenURI The new URI to set for the token.
     * @dev Requires the MINTER_ROLE.
     */
    function setTokenURI(uint256 tokenId, string memory newTokenURI) external;

    /**
     * @notice Set the URIs for multiple tokens in a batch.
     * @param tokenIds An array of token IDs to set URIs for.
     * @param newTokenURIs An array of new URIs to set for the tokens.
     * @dev Requires the MINTER_ROLE.
     * @dev Requires that the tokenIds and newTokenURIs arrays have the same length.
     */
    function setBatchTokenURI(uint256[] calldata tokenIds, string[] calldata newTokenURIs) external;

    /**
     * @notice Set the base URI for all tokens.
     * @param newBaseURI The new base URI to set.
     * @dev Requires the OPERATOR_ROLE.
     */
    function setBaseURI(string memory newBaseURI) external;

    /**
     * @notice Safely mints NFTs for a user based on provided parameters and a valid minter signature.
     * @param mintParams The struct containing user address, user nonce, and NFT IDs to mint.
     * @param operatorSignature The ECDSA signature of the data, validating the operator's role.
     * @dev This function safely mints NFTs for a user while ensuring the validity of the operator's signature.
     * @dev It requires that the provided NFT IDs are valid and that the operator has the MINTER_ROLE.
     * @dev User nonces are used to prevent replay attacks.
     * @dev Multiple NFTs can be minted in a batch or a single NFT can be minted based on the number of NFT IDs provided.
     * @dev Emits the 'Minted' event to indicate the successful minting of NFTs.
     */
    function safeMint(MintParams memory mintParams, bytes calldata operatorSignature) external payable;

    event Withdrawed(uint256 amount);

    /**
     * @notice Sets the transfer lock status for a specific token ID.
     * @param tokenId The ID of the token to set the transfer lock status for.
     * @param lock The boolean value to determine whether transfers of this token are locked or unlocked.
     * @dev This function can only be called by an operator with the OPERATOR_ROLE.
     * @dev It allows operators to control the transferability of specific tokens.
     * @dev Emits the 'tokenUnlockSet' event to indicate the change in transfer lock status.
     */
    function setTransferUnlock(uint256 tokenId, bool lock) external;

    /**
     * @notice Check if a given interface is supported by this contract.
     * @param interfaceId The interface identifier to check for support.
     * @return Whether the contract supports the specified interface.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}
