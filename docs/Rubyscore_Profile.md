# Solidity API

## Rubyscore_Profile

_Rubyscore_Profile is an SBT ERC721-based smart contract for claiming and managing user names.
Users can claim unique names represented by ERC721 tokens.
Names are normalized to lowercase and can consist of lowercase letters and selected special characters.
The contract is NOT upgradeable and has role-based access control._

### OPERATOR_ROLE

```solidity
bytes32 OPERATOR_ROLE
```

### getIdByName

```solidity
function getIdByName(string name) external pure returns (uint256)
```

_See {IRubyscore_Profile}_

### getBaseURI

```solidity
function getBaseURI() external view returns (string)
```

_See {IRubyscore_Profile}_

### getBaseExtension

```solidity
function getBaseExtension() external view returns (string)
```

_See {IRubyscore_Profile}_

### checkName

```solidity
function checkName(string name) external view returns (bool, uint256)
```

_See {IRubyscore_Profile}_

### getPremiumPrice

```solidity
function getPremiumPrice() external view returns (uint256)
```

_See {IRubyscore_Profile}_

### getPremiumStatus

```solidity
function getPremiumStatus(address userAddress) external view returns (bool)
```

_See {IRubyscore_Profile}_

### getOwnerByName

```solidity
function getOwnerByName(string name) external view returns (address)
```

_See {IRubyscore_Profile}_

### getNameByOwner

```solidity
function getNameByOwner(address userAddress) external view returns (string)
```

_See {IRubyscore_Profile}_

### getNameById

```solidity
function getNameById(uint256 id) external view returns (string)
```

_See {IRubyscore_Profile}_

### getIdByOwner

```solidity
function getIdByOwner(address userAddress) public view returns (uint256)
```

_See {IRubyscore_Profile}_

### tokenURI

```solidity
function tokenURI(uint256 tokenId) public view virtual returns (string)
```

_See {IRubyscore_Profile}_

### hasName

```solidity
function hasName(address _user) public view returns (bool)
```

_See {IRubyscore_Profile}_

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view returns (bool)
```

_See {IRubyscore_Profile}_

### constructor

```solidity
constructor(address admin, address operator) public
```

_Constructor to initialize the contract with admin and operator addresses._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| admin | address | Address of the contract admin. |
| operator | address | Address of the contract operator. |

### updateBaseURI

```solidity
function updateBaseURI(string newBaseURI) external
```

_See {IRubyscore_Profile}_

### updateBaseExtension

```solidity
function updateBaseExtension(string newBaseExtension) external
```

_See {IRubyscore_Profile}_

### updatePremiumPrice

```solidity
function updatePremiumPrice(uint256 newPremiumPrice) external
```

_See {IRubyscore_Profile}_

### claimName

```solidity
function claimName(string name) external payable returns (uint256 tokenId)
```

_See {IRubyscore_Profile}_

### withdraw

```solidity
function withdraw() external
```

_See {IRubyscore_Profile}_

### _transfer

```solidity
function _transfer(address, address, uint256) internal pure
```

Internal ERC721 transfer function override to prevent external transfers.

_from  The address to transfer from.
to The address to transfer to.
tokenId The ID of the token being transferred._

### _convertNameToId

```solidity
function _convertNameToId(string str) internal pure returns (uint256)
```

Converts a name string to a unique identifier (ID).

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| str | string | The name to convert to an ID. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The unique ID corresponding to the given name. |

### _convertStringToUint256

```solidity
function _convertStringToUint256(string str) internal pure returns (uint256)
```

Converts a string to a unique uint256 value.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| str | string | The string to convert to a uint256. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The unique uint256 value derived from the given string. |

### _normalizeName

```solidity
function _normalizeName(string str) internal pure returns (string, bool)
```

Normalizes a given name string by converting it to lowercase and validating its length and characters.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| str | string | The name to normalize. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | normalizedName The normalized name string in lowercase. |
| [1] | bool | status True if the normalization was successful, indicating a valid name; otherwise, false. |

### _checkValidCharacters

```solidity
function _checkValidCharacters(uint8 bCharacter) internal pure returns (bool)
```

Checks if a given character is valid within a name.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| bCharacter | uint8 | The character to check. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | True if the character is valid; otherwise, false. |

### strLength

```solidity
function strLength(string s) internal pure returns (uint256)
```

_Returns the length of a given string_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| s | string | The string to measure the length of |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The length of the input string |

