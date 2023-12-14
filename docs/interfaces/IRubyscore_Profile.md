# Solidity API

## IRubyscore_Profile

_IRubyscore_Profile is an interface for Rubyscore_Profile contract_

### NameClaimed

```solidity
event NameClaimed(address account, uint256 tokenId, string name, bool premium)
```

Emitted when a user successfully claims a unique name as an NFT.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | The address of the account claiming the name. |
| tokenId | uint256 | The unique token ID associated with the claimed name. |
| name | string | The name that was successfully claimed. |
| premium | bool | The premium status of name that was successfully claimed. |

### PremiumPriceUpdated

```solidity
event PremiumPriceUpdated(uint256 newPremiumPrice)
```

### URIUpdated

```solidity
event URIUpdated(string newBaseURI)
```

Emitted when the base URI for token metadata is updated.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newBaseURI | string | The new base URI used to construct token metadata URIs. |

### Withdrawed

```solidity
event Withdrawed(uint256 amount)
```

### ExtensionUpdated

```solidity
event ExtensionUpdated(string newBaseExtension)
```

Emitted when the base extension for token metadata is updated.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newBaseExtension | string | The new base extension used for token metadata files. |

### getIdByName

```solidity
function getIdByName(string name) external pure returns (uint256)
```

Converts a name string to a unique identifier (ID).

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| name | string | The name to convert to an ID. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The unique ID corresponding to the given name. |

### getBaseURI

```solidity
function getBaseURI() external view returns (string)
```

Gets the base URI for token metadata.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | The current base URI. |

### getBaseExtension

```solidity
function getBaseExtension() external view returns (string)
```

Gets the base extension for token metadata.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | The current base extension. |

### getPremiumPrice

```solidity
function getPremiumPrice() external view returns (uint256)
```

Retrieves the current premium price for a specific feature.

_This function allows anyone to check the current premium price without modifying it._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The current premium price as a uint256. |

### getPremiumStatus

```solidity
function getPremiumStatus(address userAddress) external view returns (bool)
```

Checks the premium status for a user.

_This function allows anyone to check if a specific user has a premium status._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| userAddress | address | The address of the user to check. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | A boolean indicating whether the user has a premium status (true) or not (false). |

### checkName

```solidity
function checkName(string name) external view returns (bool, uint256)
```

Checks the availability of a given name and converts it into a unique token ID.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| name | string | The name to check and convert. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | status True if the name is valid and available; otherwise, false. |
| [1] | uint256 | tokenId The unique token ID corresponding to the normalized name. |

### hasName

```solidity
function hasName(address _user) external view returns (bool)
```

Checks if a user has claimed a name.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _user | address | The user's address to check. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | True if the user has claimed a name, otherwise false. |

### getOwnerByName

```solidity
function getOwnerByName(string name) external view returns (address)
```

Gets the owner of a name by its string representation.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| name | string | The name to look up. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the owner of the name, or address(0) if the name does not exist. |

### getNameByOwner

```solidity
function getNameByOwner(address userAddress) external view returns (string)
```

Gets the name claimed by a specific user.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| userAddress | address | The address of the user. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | The name claimed by the user, if they have claimed a name. |

### getIdByOwner

```solidity
function getIdByOwner(address userAddress) external view returns (uint256)
```

Gets the unique identifier (ID) for a name claimed by a user.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| userAddress | address | The address of the user. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The unique ID for the user's claimed name. |

### getNameById

```solidity
function getNameById(uint256 id) external view returns (string)
```

Gets the name claimed by the owner of a specific ID.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | The unique ID for which to retrieve the claimed name. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | The name claimed by the owner of the given ID, or an empty string if the ID does not exist. |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```

Checks if a given interface is supported by this contract.

_This function overrides the standard supportsInterface function to include AccessControl functionality._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| interfaceId | bytes4 | The interface identifier (ERC-165) to check for support. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | Whether the contract supports the specified interface (true or false). |

### claimName

```solidity
function claimName(string name) external payable returns (uint256 tokenId)
```

Allows users to claim a unique name, optionally with a premium status.

_Users can claim a name by providing a name string and, if desired, by paying a premium fee.
Requirements:
  - The provided name must be unique among all users.
  - If a premium fee is required, it must be sent along with the transaction.
  - Premium names must have a length greater than 2 characters.
  - NOT Premium names must have a length greater than 6 characters.
  - Names must have a length less than 21 characters.
Effects:
  - If the user claims a premium name and pays the premium fee:
    - Their premium status is set to true.
    - If the user already had a name and field `name` is empty, the previous name is NOT replaced with the new one.
    - If the user already had a name and field `name` is NOT empty, the previous name is replaced with the new one.
  - If the user claims a non-premium name (no fee required):
    - Their premium status remains unchanged (either true or false).
    - The provided name must adhere to the length requirements.
    - If the user already had a name, transaction will reverted.
Emits:
  - NameClaimed: Upon successful name claim, this event is emitted with details of the user's claim._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| name | string | The name to be claimed. It must be unique and follow specific length requirements. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | : The unique identifier (ID) associated with the user and claimed name. |

### tokenURI

```solidity
function tokenURI(uint256 tokenId) external returns (string)
```

Returns the token URI for a given token ID.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The ID of the token. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | The URI for the token's metadata. |

### updateBaseExtension

```solidity
function updateBaseExtension(string newBaseExtension) external
```

Updates the base extension for token metadata.

_This function can only be called by operators._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newBaseExtension | string | The new base extension to set. |

### updateBaseURI

```solidity
function updateBaseURI(string newBaseURI) external
```

Updates the base URI for token metadata.

_This function can only be called by operators._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newBaseURI | string | The new base URI to set. |

### updatePremiumPrice

```solidity
function updatePremiumPrice(uint256 newPremiumPrice) external
```

Updates the premium price for a specific feature.

_This function can only be called by addresses with the OPERATOR_ROLE.
It allows an operator to modify the premium price associated with a particular feature or service.
Emits a 'PremiumPriceUpdated' event with the new premium price._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newPremiumPrice | uint256 | The new premium price to set. |

### withdraw

```solidity
function withdraw() external
```

function updatePremiumPrice(uint256 newPremiumPrice) external
Allows the contract owner to withdraw the Ether balance from the contract.

_This function can only be called by the contract owner, typically the DEFAULT_ADMIN_ROLE.
It transfers the entire Ether balance held by the contract to the owner's address.
Emits a 'Withdrawed' event with the amount of Ether withdrawn._

