# Solidity API

## IRubyscore_Achievement

_IRubyscore_Achievement is an interface for Rubyscore_Achievement contract_

### MintParams

```solidity
struct MintParams {
  address userAddress;
  uint256 userNonce;
  uint256[] nftIds;
}
```

### BaseURISet

```solidity
event BaseURISet(string newBaseURI)
```

Emitted when the base URI for token metadata is updated.

_This event is triggered when the contract operator updates the base URI
for retrieving metadata associated with tokens. The 'newBaseURI' parameter represents
the updated base URI._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newBaseURI | string | The new base URI that will be used to construct token metadata URIs. |

### Minted

```solidity
event Minted(address userAddress, uint256 userNonce, uint256[] nftIds)
```

Emitted when NFTs are minted for a user.

_This event is emitted when new NFTs are created and assigned to a user.
It includes the user's address, nonce, and the IDs of the minted NFTs for transparency._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| userAddress | address | The address of the user receiving the NFTs. |
| userNonce | uint256 | The user's nonce used to prevent replay attacks. |
| nftIds | uint256[] | An array of NFT IDs that were minted. |

### TokenURISet

```solidity
event TokenURISet(uint256 tokenId, string newTokenURI)
```

Emitted when the URI for a specific token is updated.

_This event is emitted when the URI for a token is modified, providing transparency
when metadata URIs are changed for specific tokens._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The ID of the token for which the URI is updated. |
| newTokenURI | string | The new URI assigned to the token. |

### TokenUnlockSet

```solidity
event TokenUnlockSet(uint256 tokenId, bool lock)
```

Emitted when the transfer lock status for a token is updated.

_This event is emitted when the transfer lock status of a specific token is modified.
It provides transparency regarding whether a token can be transferred or not._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The ID of the token for which the transfer lock status changes. |
| lock | bool | The new transfer lock status (true for locked, false for unlocked). |

### PriceUpdated

```solidity
event PriceUpdated(uint256 newPrice)
```

Emitted when the price for a token mint is updated.

_This event is emitted when the price for mint a token is modified._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newPrice | uint256 | The new price for mint. |

### name

```solidity
function name() external view returns (string)
```

Get token name.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | Token name. |

### symbol

```solidity
function symbol() external view returns (string)
```

Get token symbol.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | Token symbol. |

### uri

```solidity
function uri(uint256 tokenId) external view returns (string)
```

Get the URI of a token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The ID of the token. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | The URI of the token. |

### getTransferStatus

```solidity
function getTransferStatus(uint256 tokenId) external view returns (bool)
```

Get the transfer status of a token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The ID of the token. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | Whether the token's transfer is unlocked (true) or restricted (false). |

### getUserNonce

```solidity
function getUserNonce(address userAddress) external view returns (uint256)
```

Get the user's nonce associated with their address.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| userAddress | address | The address of the user. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The user's nonce. |

### tokenURI

```solidity
function tokenURI(uint256 tokenId) external view returns (string)
```

Get the token URI for a given tokenId.

_Diblicate for uri() method_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The ID of the token. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | The URI of the token. |

### setTokenURI

```solidity
function setTokenURI(uint256 tokenId, string newTokenURI) external
```

Set the URI for a token.

_Requires the MINTER_ROLE._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The ID of the token. |
| newTokenURI | string | The new URI to set for the token. |

### setBatchTokenURI

```solidity
function setBatchTokenURI(uint256[] tokenIds, string[] newTokenURIs) external
```

Set the URIs for multiple tokens in a batch.

_Requires the MINTER_ROLE.
Requires that the tokenIds and newTokenURIs arrays have the same length._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenIds | uint256[] | An array of token IDs to set URIs for. |
| newTokenURIs | string[] | An array of new URIs to set for the tokens. |

### setBaseURI

```solidity
function setBaseURI(string newBaseURI) external
```

Set the base URI for all tokens.

_Requires the OPERATOR_ROLE._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newBaseURI | string | The new base URI to set. |

### safeMint

```solidity
function safeMint(struct IRubyscore_Achievement.MintParams mintParams, bytes operatorSignature) external payable
```

Safely mints NFTs for a user based on provided parameters and a valid minter signature.

_This function safely mints NFTs for a user while ensuring the validity of the operator's signature.
It requires that the provided NFT IDs are valid and that the operator has the MINTER_ROLE.
User nonces are used to prevent replay attacks.
Multiple NFTs can be minted in a batch or a single NFT can be minted based on the number of NFT IDs provided.
Emits the 'Minted' event to indicate the successful minting of NFTs._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| mintParams | struct IRubyscore_Achievement.MintParams | The struct containing user address, user nonce, and NFT IDs to mint. |
| operatorSignature | bytes | The ECDSA signature of the data, validating the operator's role. |

### Withdrawed

```solidity
event Withdrawed(uint256 amount)
```

### setTransferUnlock

```solidity
function setTransferUnlock(uint256 tokenId, bool lock) external
```

Sets the transfer lock status for a specific token ID.

_This function can only be called by an operator with the OPERATOR_ROLE.
It allows operators to control the transferability of specific tokens.
Emits the 'tokenUnlockSet' event to indicate the change in transfer lock status._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The ID of the token to set the transfer lock status for. |
| lock | bool | The boolean value to determine whether transfers of this token are locked or unlocked. |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```

Check if a given interface is supported by this contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| interfaceId | bytes4 | The interface identifier to check for support. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | Whether the contract supports the specified interface. |

