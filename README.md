# Smart Contract Whitelist

This project demonstrates the several ways to implement a whitelist mechanism.

## Primitive

This is the most primitive way that store whitelist in storage.

It is a quite reasonable and easy way to handle a series of data.
To store whitelist in storage, we can simply declare a mapping to record all the valid address that is eligible to whitelist mint. This way will cause a `LOT OF GAS`, but it will be easier for anyone to test whether certain account is on the whitelist.

<b>Pros</b>: Easy to valid, code, add/remove new address

<b>Cons</b>: Expensive for publisher

## Merkle Tree

Merkle tree allows us to compress a list of data of any length into one single hash.

The compressing algorithm works by creating pairs of elements, summing the pairs, and hashing the sums of the pairs. This process repeats, until, we receive a single <b>root hash</b>.

We can compress the data into one hash, and passing this hash onto the contract costs a low amount of gas.

We need to generate merkle tree in the frontend or backend with `merkletreejs` and take half of the minting process off-chain in order to save gas.

We need to store the root in the contract via solidity function, and on-chain verification with the library `MerkleProof`.
Proof of merkle tree is generated by `tree.getHexProof`.

<b>Pros</b>: Economic efficient, easy to valid

<b>Cons</b>: Slightly more gas for user to mint, need to reset the root every time to alter the whitelist

## Signature

This way is also cheaper than primitive way, but a bit more centralized than previous ways.

We need to set up an address with private key at the backend and keep it credentialed.

Whenever a whitelisted user wishes to mint, we need to verify it at the backend.
After verify it, sign the message and pass it back to the user.

User will mint with signature. We can choose proper signing method, e.g. `EIP712`.

<b>Pros</b>: Cheaper for developers, easier to manage the whitelist at the backend

<b>Cons</b>: More gas require to mint, less decentralized
