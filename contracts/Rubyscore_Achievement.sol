// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import {IRubyscore_Achievement} from "./interfaces/IRubyscore_Achievement.sol";
import {EIP712, ECDSA} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {ERC1155URIStorage} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import {AccessControl, Strings} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC1155, ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

/**
 * @title Rubyscore_Achievement
 * @dev An ERC1155 token contract for minting and managing achievements with URI support.
 * @dev Rubyscore_Achievement can be minted by users with the MINTER_ROLE after proper authorization.
 * @dev Rubyscore_Achievement can have their URIs set by operators with the MINTER_ROLE.
 * @dev Rubyscore_Achievement can be safely transferred with restrictions on certain tokens.
 */
contract Rubyscore_Achievement is
    ERC1155,
    EIP712,
    AccessControl,
    ERC1155Supply,
    ERC1155URIStorage,
    ReentrancyGuard,
    IRubyscore_Achievement
{
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    string public constant NAME = "Rubyscore_Achievement";
    string public constant VERSION = "0.0.1";

    uint256 private price;

    string public name;
    string public symbol;

    mapping(uint256 => bool) private transferUnlock;
    mapping(address => uint256) private userNonce;

    /**
     * @dev See {IRubyscore_Achievement}
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155, AccessControl, IRubyscore_Achievement) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev See {IRubyscore_Achievement}
     */
    function uri(
        uint256 tokenId
    ) public view override(ERC1155, ERC1155URIStorage, IRubyscore_Achievement) returns (string memory) {
        return super.uri(tokenId);
    }

    /**
     * @dev See {IRubyscore_Achievement}
     */
    function getTransferStatus(uint256 tokenId) external view returns (bool) {
        return transferUnlock[tokenId];
    }

    /**
     * @dev See {IRubyscore_Achievement}
     */
    function getPrice() external view returns (uint256) {
        return price;
    }

    /**
     * @dev See {IRubyscore_Achievement}
     */
    function getUserNonce(address userAddress) external view returns (uint256) {
        return userNonce[userAddress];
    }

    /**
     * @dev See {IRubyscore_Achievement}
     */
    function tokenURI(uint256 tokenId) public view returns (string memory) {
        return uri(tokenId);
    }

    /**
     * @notice Constructor for the Rubyscore_Achievement contract.
     * @dev Initializes the contract with roles and settings.
     * @param admin The address of the admin role, which has overall control.
     * @param operator The address of the operator role, responsible for unlock tokens and set base URI.
     * @param minter The address of the minter role, authorized to mint achievements and responsible for setting token URIs.
     * @param baseURI The base URI for token metadata.
     * @dev It sets the base URI for token metadata to the provided `baseURI`.
     * @dev It grants the DEFAULT_ADMIN_ROLE, OPERATOR_ROLE, and MINTER_ROLE to the specified addresses.
     * @dev It also initializes the contract with EIP712 support and ERC1155 functionality.
     */
    constructor(
        address admin,
        address operator,
        address minter,
        string memory baseURI,
        string memory _name,
        string memory _symbol
    ) ERC1155("ipfs://") EIP712(NAME, VERSION) {
        require(admin != address(0), "Zero address check");
        require(operator != address(0), "Zero address check");
        require(minter != address(0), "Zero address check");
        name = _name;
        symbol = _symbol;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, operator);
        _grantRole(MINTER_ROLE, minter);
        _setBaseURI(baseURI);
    }

    /**
     * @dev See {IRubyscore_Achievement}
     */
    function setTokenURI(uint256 tokenId, string memory newTokenURI) public onlyRole(MINTER_ROLE) {
        super._setURI(tokenId, newTokenURI);
        emit TokenURISet(tokenId, newTokenURI);
    }

    /**
     * @dev See {IRubyscore_Achievement}
     */
    function setBatchTokenURI(
        uint256[] calldata tokenIds,
        string[] calldata newTokenURIs
    ) external onlyRole(MINTER_ROLE) {
        require(tokenIds.length == newTokenURIs.length, "Invalid params");
        for (uint256 i = 0; i < tokenIds.length; i++) {
            setTokenURI(tokenIds[i], newTokenURIs[i]);
        }
    }

    /**
     * @dev See {IRubyscore_Achievement}
     */
    function setBaseURI(string memory newBaseURI) external onlyRole(OPERATOR_ROLE) {
        super._setBaseURI(newBaseURI);
        emit BaseURISet(newBaseURI);
    }

    /**
     * @dev See {IRubyscore_Achievement}
     */
    function setPrice(uint256 newPrice) external onlyRole(OPERATOR_ROLE) {
        price = newPrice;
        emit PriceUpdated(newPrice);
    }

    /**
     * @dev See {IRubyscore_Achievement}
     */
    function safeMint(MintParams memory mintParams, bytes calldata operatorSignature) external payable nonReentrant {
        require(mintParams.nftIds.length >= 1, "Invalid NFT ids");
        require(msg.value == price, "Wrong payment amount");
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256("MintParams(address userAddress,uint256 userNonce,uint256[] nftIds)"),
                    msg.sender,
                    userNonce[msg.sender],
                    keccak256(abi.encodePacked(mintParams.nftIds))
                )
            )
        );
        _checkRole(MINTER_ROLE, ECDSA.recover(digest, operatorSignature));
        userNonce[mintParams.userAddress] += 1;
        if (mintParams.nftIds.length > 1) _mintBatch(mintParams.userAddress, mintParams.nftIds, "");
        else _mint(mintParams.userAddress, mintParams.nftIds[0], "");
        emit Minted(mintParams.userAddress, mintParams.userNonce, mintParams.nftIds);
    }

    /**
     * @dev See {IRubyscore_Achievement}
     */
    function setTransferUnlock(uint256 tokenId, bool lock) external onlyRole(OPERATOR_ROLE) {
        transferUnlock[tokenId] = lock;
        emit TokenUnlockSet(tokenId, lock);
    }

    /**
     * @dev See {IRubyscore_Achievement}
     */
    function withdraw() external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 amount = address(this).balance;
        require(amount > 0, "Zero amount to withdraw");
        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Failed to send Ether");
        emit Withdrawed(amount);
    }

    /**
     * @dev See {IRubyscore_Achievement}
     */
    function _mint(address to, uint256 id, bytes memory data) internal {
        require(balanceOf(to, id) == 0, "You already have this achievement");
        super._mint(to, id, 1, data);
    }

    /**
     * @notice Internal function to safely mint multiple NFTs in a batch for a specified recipient.
     * @param to The address of the recipient to mint the NFTs for.
     * @param ids An array of NFT IDs to mint.
     * @param data Additional data to include in the minting transaction.
     * @dev This function checks if the recipient already owns any of the specified NFTs to prevent duplicates.
     * @dev It is intended for batch minting operations where multiple NFTs can be minted at once.
     */
    function _mintBatch(address to, uint256[] memory ids, bytes memory data) internal {
        uint256[] memory amounts = new uint256[](ids.length);
        for (uint8 i = 0; i < ids.length; i++) {
            require(balanceOf(to, ids[i]) == 0, "You already have this achievement"); // TODO: custom error with problem token id
            amounts[i] = 1;
        }
        super._mintBatch(to, ids, amounts, data);
    }

    /**
     * @notice Internal function that is called before the transfer of tokens.
     * @param operator The address that initiates or approves the transfer.
     * @param from The address from which the tokens are being transferred.
     * @param to The address to which the tokens are being transferred.
     * @param ids An array of token IDs to be transferred.
     * @param amounts An array of token amounts corresponding to the IDs to be transferred.
     * @param data Additional data to include in the transfer.
     * @dev This function enforces transfer restrictions based on the 'transferUnlock' status of individual tokens.
     * @dev If a token has its transfer locked and the 'from' address is not zero (indicating a user-to-contract transfer),
     * it will revert to prevent unauthorized transfers.
     * @dev It then delegates the transfer logic to the parent contracts 'ERC1155' and 'ERC1155Supply'.
     */
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) {
        for (uint256 i = 0; i < ids.length; i++) {
            if (!transferUnlock[ids[i]] && from != address(0)) revert("This token only for you");
        }
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}
