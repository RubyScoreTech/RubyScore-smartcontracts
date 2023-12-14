// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import {IRubyscore_Profile} from "./interfaces/IRubyscore_Profile.sol";
import {AccessControl, Strings} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title Rubyscore_Profile
 * @dev Rubyscore_Profile is an SBT ERC721-based smart contract for claiming and managing user names.
 * Users can claim unique names represented by ERC721 tokens.
 * Names are normalized to lowercase and can consist of lowercase letters and selected special characters.
 * The contract is NOT upgradeable and has role-based access control.
 */
contract Rubyscore_Profile is ERC721, AccessControl, IRubyscore_Profile {
    using Counters for Counters.Counter;

    // Role for operators who can manage the contract
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // Base URI for token metadata
    string private baseURI = "https://api.rubyscore.io/nft/profile/";
    // Base extension for token metadata
    string private baseExtension;
    // Price for premium name
    uint256 private premiumPrice;

    // Mapping from user address to premium status
    mapping(address => bool) private userPremiumStatus;
    // Mapping from user address to their claimed name
    mapping(address => string) private _userToName;
    // Counter for token IDs
    Counters.Counter private _tokenIdCounter;

    /**
     * @dev See {IRubyscore_Profile}
     */
    function getIdByName(string calldata name) external pure returns (uint256) {
        return _convertNameToId(name);
    }

    /**
     * @dev See {IRubyscore_Profile}
     */
    function getBaseURI() external view returns (string memory) {
        return baseURI;
    }

    /**
     * @dev See {IRubyscore_Profile}
     */
    function getBaseExtension() external view returns (string memory) {
        return baseExtension;
    }

    /**
     * @dev See {IRubyscore_Profile}
     */
    function checkName(string calldata name) external view returns (bool, uint256) {
        (string memory normalizedName, bool status) = _normalizeName(name);
        require(status, "Name is invalid");
        uint256 tokenId = _convertStringToUint256(normalizedName);
        require(!_exists(tokenId), "Name is occupied");
        return (status, tokenId);
    }

    /**
     * @dev See {IRubyscore_Profile}
     */
    function getPremiumPrice() external view returns (uint256) {
        return premiumPrice;
    }

    /**
     * @dev See {IRubyscore_Profile}
     */
    function getPremiumStatus(address userAddress) external view returns (bool) {
        return userPremiumStatus[userAddress];
    }

    /**
     * @dev See {IRubyscore_Profile}
     */
    function getOwnerByName(string calldata name) external view returns (address) {
        uint256 id = _convertNameToId(name);
        if (!_exists(id)) return address(0);
        return ownerOf(id);
    }

    /**
     * @dev See {IRubyscore_Profile}
     */
    function getNameByOwner(address userAddress) external view returns (string memory) {
        require(balanceOf(userAddress) > 0, "User does not have a name");
        return _userToName[userAddress];
    }

    /**
     * @dev See {IRubyscore_Profile}
     */
    function getNameById(uint256 id) external view returns (string memory) {
        if (!_exists(id)) return "";
        address tokenOwner = ownerOf(id);
        return _userToName[tokenOwner];
    }

    /**
     * @dev See {IRubyscore_Profile}
     */
    function getIdByOwner(address userAddress) public view returns (uint256) {
        require(balanceOf(userAddress) > 0, "User does not have a name");
        (string memory name, ) = _normalizeName(_userToName[userAddress]);
        return _convertStringToUint256(name);
    }

    /**
     * @dev See {IRubyscore_Profile}
     */
    function tokenURI(
        uint256 tokenId
    ) public view virtual override(ERC721, IRubyscore_Profile) returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");
        return string(abi.encodePacked(baseURI, Strings.toString(tokenId), baseExtension));
    }

    /**
     * @dev See {IRubyscore_Profile}
     */
    function hasName(address _user) public view returns (bool) {
        return bytes(_userToName[_user]).length > 0;
    }

    /**
     * @dev See {IRubyscore_Profile}
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, AccessControl, IRubyscore_Profile) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Constructor to initialize the contract with admin and operator addresses.
     * @param admin Address of the contract admin.
     * @param operator Address of the contract operator.
     */
    constructor(address admin, address operator) ERC721("Rubyscore_Profile", "Rubyscore_Profile") {
        require(admin != address(0), "Zero address check");
        require(operator != address(0), "Zero address check");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, operator);
    }

    /**
     * @dev See {IRubyscore_Profile}
     */
    function updateBaseURI(string memory newBaseURI) external onlyRole(OPERATOR_ROLE) {
        baseURI = newBaseURI;
        emit URIUpdated(newBaseURI);
    }

    /**
     * @dev See {IRubyscore_Profile}
     */
    function updateBaseExtension(string memory newBaseExtension) external onlyRole(OPERATOR_ROLE) {
        baseExtension = newBaseExtension;
        emit ExtensionUpdated(newBaseExtension);
    }

    /**
     * @dev See {IRubyscore_Profile}
     */
    function updatePremiumPrice(uint256 newPremiumPrice) external onlyRole(OPERATOR_ROLE) {
        premiumPrice = newPremiumPrice;
        emit PremiumPriceUpdated(newPremiumPrice);
    }

    /**
     * @dev See {IRubyscore_Profile}
     */
    function claimName(string calldata name) external payable returns (uint256 tokenId) {
        if (msg.value == premiumPrice) {
            userPremiumStatus[msg.sender] = true;
            if (hasName(msg.sender)) {
                tokenId = getIdByOwner(msg.sender);
                if (bytes(name).length != 0) {
                    _burn(tokenId);
                } else {
                    emit NameClaimed(msg.sender, tokenId, _userToName[msg.sender], true);
                    return tokenId;
                }
            }
        } else {
            require(!hasName(msg.sender), "Already has name");
            require(msg.value == 0, "Wrong ETH amount");
            require(strLength(name) > 6, "Wrong name length");
        }
        tokenId = _convertNameToId(name);
        _safeMint(msg.sender, tokenId);
        _userToName[msg.sender] = name;
        emit NameClaimed(msg.sender, tokenId, name, userPremiumStatus[msg.sender]);
        return tokenId;
    }

    /**
     * @dev See {IRubyscore_Profile}
     */
    function withdraw() external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 amount = address(this).balance;
        require(amount > 0, "Zero amount to withdraw");
        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Failed to send Ether");
        emit Withdrawed(amount);
    }

    /**
     * @notice Internal ERC721 transfer function override to prevent external transfers.
     * @dev from  The address to transfer from.
     * @dev to The address to transfer to.
     * @dev tokenId The ID of the token being transferred.
     */
    function _transfer(address /*from*/, address /*to*/, uint256 /*tokenId*/) internal pure override {
        revert("Only For you!!!");
    }

    /**
     * @notice Converts a name string to a unique identifier (ID).
     * @param str The name to convert to an ID.
     * @return The unique ID corresponding to the given name.
     */
    function _convertNameToId(string memory str) internal pure returns (uint256) {
        (string memory normalizedName, bool status) = _normalizeName(str);
        require(status, "Name is invalid");
        return uint256(keccak256(abi.encodePacked(normalizedName)));
    }

    /**
     * @notice Converts a string to a unique uint256 value.
     * @param str The string to convert to a uint256.
     * @return The unique uint256 value derived from the given string.
     */
    function _convertStringToUint256(string memory str) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(str)));
    }

    /**
     * @notice Normalizes a given name string by converting it to lowercase and validating its length and characters.
     * @param str The name to normalize.
     * @return normalizedName The normalized name string in lowercase.
     * @return status True if the normalization was successful, indicating a valid name; otherwise, false.
     */
    function _normalizeName(string memory str) internal pure returns (string memory, bool) {
        uint256 stringLength = strLength(str);
        require(stringLength > 2, "Name is too short");
        require(stringLength < 21, "Name is too long");
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        for (uint i = 0; i < bStr.length; ) {
            unchecked {
                uint8 bCharacter = uint8(bStr[i]);
                if (bCharacter >= 65 && bCharacter <= 90) {
                    bLower[i] = bytes1(bCharacter + 32); // Convert to lowercase
                } else {
                    if (!_checkValidCharacters(bCharacter)) return ("", false);
                    bLower[i] = bStr[i];
                }
                i++;
            }
        }
        return (string(bLower), true);
    }

    /**
     * @notice Checks if a given character is valid within a name.
     * @param bCharacter The character to check.
     * @return True if the character is valid; otherwise, false.
     */
    function _checkValidCharacters(uint8 bCharacter) internal pure returns (bool) {
        return ((bCharacter >= 95 && bCharacter <= 122) || (bCharacter >= 33 && bCharacter <= 64)) && bCharacter != 32; // lowercase letters, special characters and digits, except space
    }

    /**
     * @dev Returns the length of a given string
     *
     * @param s The string to measure the length of
     * @return The length of the input string
     */
    function strLength(string memory s) internal pure returns (uint256) {
        uint256 len;
        uint256 i = 0;
        uint256 bytelength = bytes(s).length;

        for (len = 0; i < bytelength; len++) {
            bytes1 b = bytes(s)[i];
            if (b < 0x80) {
                i += 1;
            } else if (b < 0xE0) {
                i += 2;
            } else if (b < 0xF0) {
                i += 3;
            } else if (b < 0xF8) {
                i += 4;
            } else if (b < 0xFC) {
                i += 5;
            } else {
                i += 6;
            }
        }
        return len;
    }
}
