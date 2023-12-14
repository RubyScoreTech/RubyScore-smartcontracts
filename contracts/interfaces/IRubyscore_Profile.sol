// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.19;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title IRubyscore_Profile
 * @dev IRubyscore_Profile is an interface for Rubyscore_Profile contract
 */
interface IRubyscore_Profile is IERC721 {
    /**
     * @notice Emitted when a user successfully claims a unique name as an NFT.
     * @param account The address of the account claiming the name.
     * @param tokenId The unique token ID associated with the claimed name.
     * @param name The name that was successfully claimed.
     * @param premium The premium status of name that was successfully claimed.
     */
    event NameClaimed(address indexed account, uint256 indexed tokenId, string name, bool indexed premium);

    event PremiumPriceUpdated(uint256 newPremiumPrice);

    /**
     * @notice Emitted when the base URI for token metadata is updated.
     * @param newBaseURI The new base URI used to construct token metadata URIs.
     */
    event URIUpdated(string indexed newBaseURI);

    event Withdrawed(uint256 amount);

    /**
     * @notice Emitted when the base extension for token metadata is updated.
     * @param newBaseExtension The new base extension used for token metadata files.
     */
    event ExtensionUpdated(string indexed newBaseExtension);

    /**
     * @notice Converts a name string to a unique identifier (ID).
     * @param name The name to convert to an ID.
     * @return The unique ID corresponding to the given name.
     */
    function getIdByName(string calldata name) external pure returns (uint256);

    /**
     * @notice Gets the base URI for token metadata.
     * @return The current base URI.
     */
    function getBaseURI() external view returns (string memory);

    /**
     * @notice Gets the base extension for token metadata.
     * @return The current base extension.
     */
    function getBaseExtension() external view returns (string memory);

    /**
     * @notice Retrieves the current premium price for a specific feature.
     * @dev This function allows anyone to check the current premium price without modifying it.
     * @return The current premium price as a uint256.
     */
    function getPremiumPrice() external view returns (uint256);

    /**
     * @notice Checks the premium status for a user.
     * @dev This function allows anyone to check if a specific user has a premium status.
     * @param userAddress The address of the user to check.
     * @return A boolean indicating whether the user has a premium status (true) or not (false).
     */
    function getPremiumStatus(address userAddress) external view returns (bool);

    /**
     * @notice Checks the availability of a given name and converts it into a unique token ID.
     * @param name The name to check and convert.
     * @return status True if the name is valid and available; otherwise, false.
     * @return tokenId The unique token ID corresponding to the normalized name.
     */
    function checkName(string calldata name) external view returns (bool, uint256);

    /**
     * @notice Checks if a user has claimed a name.
     * @param _user The user's address to check.
     * @return True if the user has claimed a name, otherwise false.
     */
    function hasName(address _user) external view returns (bool);

    /**
     * @notice Gets the owner of a name by its string representation.
     * @param name The name to look up.
     * @return The address of the owner of the name, or address(0) if the name does not exist.
     */
    function getOwnerByName(string calldata name) external view returns (address);

    /**
     * @notice Gets the name claimed by a specific user.
     * @param userAddress The address of the user.
     * @return The name claimed by the user, if they have claimed a name.
     */
    function getNameByOwner(address userAddress) external view returns (string memory);

    /**
     * @notice Gets the unique identifier (ID) for a name claimed by a user.
     * @param userAddress The address of the user.
     * @return The unique ID for the user's claimed name.
     */
    function getIdByOwner(address userAddress) external view returns (uint256);

    /**
     * @notice Gets the name claimed by the owner of a specific ID.
     * @param id The unique ID for which to retrieve the claimed name.
     * @return The name claimed by the owner of the given ID, or an empty string if the ID does not exist.
     */
    function getNameById(uint256 id) external view returns (string memory);

    /**
     * @notice Checks if a given interface is supported by this contract.
     * @param interfaceId The interface identifier (ERC-165) to check for support.
     * @return Whether the contract supports the specified interface (true or false).
     * @dev This function overrides the standard supportsInterface function to include AccessControl functionality.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);

    /**
     * @notice Claims a unique name for the calling user.
     * @dev The name must be unique, and the caller cannot have already claimed a name.
     * @param name The desired name to claim.
     */

    /**
     * @notice Allows users to claim a unique name, optionally with a premium status.
     * @dev Users can claim a name by providing a name string and, if desired, by paying a premium fee.
     * @param name The name to be claimed. It must be unique and follow specific length requirements.
     * @dev Requirements:
     *   - The provided name must be unique among all users.
     *   - If a premium fee is required, it must be sent along with the transaction.
     *   - Premium names must have a length greater than 2 characters.
     *   - NOT Premium names must have a length greater than 6 characters.
     *   - Names must have a length less than 21 characters.
     * @dev Effects:
     *   - If the user claims a premium name and pays the premium fee:
     *     - Their premium status is set to true.
     *     - If the user already had a name and field `name` is empty, the previous name is NOT replaced with the new one.
     *     - If the user already had a name and field `name` is NOT empty, the previous name is replaced with the new one.
     *   - If the user claims a non-premium name (no fee required):
     *     - Their premium status remains unchanged (either true or false).
     *     - The provided name must adhere to the length requirements.
     *     - If the user already had a name, transaction will reverted.
     * @dev Emits:
     *   - NameClaimed: Upon successful name claim, this event is emitted with details of the user's claim.
     * @return tokenId : The unique identifier (ID) associated with the user and claimed name.
     */
    function claimName(string calldata name) external payable returns (uint256 tokenId);

    /**
     * @notice Returns the token URI for a given token ID.
     * @param tokenId The ID of the token.
     * @return The URI for the token's metadata.
     */
    function tokenURI(uint256 tokenId) external returns (string memory);

    /**
     * @notice Updates the base extension for token metadata.
     * @dev This function can only be called by operators.
     * @param newBaseExtension The new base extension to set.
     */
    function updateBaseExtension(string memory newBaseExtension) external;

    /**
     * @notice Updates the base URI for token metadata.
     * @dev This function can only be called by operators.
     * @param newBaseURI The new base URI to set.
     */
    function updateBaseURI(string memory newBaseURI) external;

    /**
     * @notice Updates the premium price for a specific feature.
     * @param newPremiumPrice The new premium price to set.
     * @dev This function can only be called by addresses with the OPERATOR_ROLE.
     * It allows an operator to modify the premium price associated with a particular feature or service.
     * Emits a 'PremiumPriceUpdated' event with the new premium price.
     */
    function updatePremiumPrice(uint256 newPremiumPrice) external;

    /**function updatePremiumPrice(uint256 newPremiumPrice) external
     * @notice Allows the contract owner to withdraw the Ether balance from the contract.
     * @dev This function can only be called by the contract owner, typically the DEFAULT_ADMIN_ROLE.
     * It transfers the entire Ether balance held by the contract to the owner's address.
     * Emits a 'Withdrawed' event with the amount of Ether withdrawn.
     */
    function withdraw() external;
}
