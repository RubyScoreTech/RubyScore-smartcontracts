# Solidity API

## Rubyscore_Achievement

_An ERC1155 token contract for minting and managing achievements with URI support.
Rubyscore_Achievement can be minted by users with the MINTER_ROLE after proper authorization.
Rubyscore_Achievement can have their URIs set by operators with the MINTER_ROLE.
Rubyscore_Achievement can be safely transferred with restrictions on certain tokens._

### OPERATOR_ROLE

```solidity
bytes32 OPERATOR_ROLE
```

### MINTER_ROLE

```solidity
bytes32 MINTER_ROLE
```

### NAME

```solidity
string NAME
```

### VERSION

```solidity
string VERSION
```

### name

```solidity
string name
```

Get token name.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |

### symbol

```solidity
string symbol
```

Get token symbol.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view returns (bool)
```

_See {IRubyscore_Achievement}_

### uri

```solidity
function uri(uint256 tokenId) public view returns (string)
```

_See {IRubyscore_Achievement}_

### getTransferStatus

```solidity
function getTransferStatus(uint256 tokenId) external view returns (bool)
```

_See {IRubyscore_Achievement}_

### getPrice

```solidity
function getPrice() external view returns (uint256)
```

_See {IRubyscore_Achievement}_

### getUserNonce

```solidity
function getUserNonce(address userAddress) external view returns (uint256)
```

_See {IRubyscore_Achievement}_

### tokenURI

```solidity
function tokenURI(uint256 tokenId) public view returns (string)
```

_See {IRubyscore_Achievement}_

### constructor

```solidity
constructor(address admin, address operator, address minter, string baseURI, string _name, string _symbol) public
```

Constructor for the Rubyscore_Achievement contract.

_Initializes the contract with roles and settings.
It sets the base URI for token metadata to the provided `baseURI`.
It grants the DEFAULT_ADMIN_ROLE, OPERATOR_ROLE, and MINTER_ROLE to the specified addresses.
It also initializes the contract with EIP712 support and ERC1155 functionality._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| admin | address | The address of the admin role, which has overall control. |
| operator | address | The address of the operator role, responsible for unlock tokens and set base URI. |
| minter | address | The address of the minter role, authorized to mint achievements and responsible for setting token URIs. |
| baseURI | string | The base URI for token metadata. |
| _name | string |  |
| _symbol | string |  |

### setTokenURI

```solidity
function setTokenURI(uint256 tokenId, string newTokenURI) public
```

_See {IRubyscore_Achievement}_

### setBatchTokenURI

```solidity
function setBatchTokenURI(uint256[] tokenIds, string[] newTokenURIs) external
```

_See {IRubyscore_Achievement}_

### setBaseURI

```solidity
function setBaseURI(string newBaseURI) external
```

_See {IRubyscore_Achievement}_

### setPrice

```solidity
function setPrice(uint256 newPrice) external
```

_See {IRubyscore_Achievement}_

### safeMint

```solidity
function safeMint(struct IRubyscore_Achievement.MintParams mintParams, bytes operatorSignature) external payable
```

_See {IRubyscore_Achievement}_

### setTransferUnlock

```solidity
function setTransferUnlock(uint256 tokenId, bool lock) external
```

_See {IRubyscore_Achievement}_

### withdraw

```solidity
function withdraw() external
```

_See {IRubyscore_Achievement}_

### _mint

```solidity
function _mint(address to, uint256 id, bytes data) internal
```

_See {IRubyscore_Achievement}_

### _mintBatch

```solidity
function _mintBatch(address to, uint256[] ids, bytes data) internal
```

Internal function to safely mint multiple NFTs in a batch for a specified recipient.

_This function checks if the recipient already owns any of the specified NFTs to prevent duplicates.
It is intended for batch minting operations where multiple NFTs can be minted at once._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | The address of the recipient to mint the NFTs for. |
| ids | uint256[] | An array of NFT IDs to mint. |
| data | bytes | Additional data to include in the minting transaction. |

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address operator, address from, address to, uint256[] ids, uint256[] amounts, bytes data) internal
```

Internal function that is called before the transfer of tokens.

_This function enforces transfer restrictions based on the 'transferUnlock' status of individual tokens.
If a token has its transfer locked and the 'from' address is not zero (indicating a user-to-contract transfer),
it will revert to prevent unauthorized transfers.
It then delegates the transfer logic to the parent contracts 'ERC1155' and 'ERC1155Supply'._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| operator | address | The address that initiates or approves the transfer. |
| from | address | The address from which the tokens are being transferred. |
| to | address | The address to which the tokens are being transferred. |
| ids | uint256[] | An array of token IDs to be transferred. |
| amounts | uint256[] | An array of token amounts corresponding to the IDs to be transferred. |
| data | bytes | Additional data to include in the transfer. |

