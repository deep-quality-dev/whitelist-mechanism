// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleTreeWhiteList is ERC721Enumerable, Ownable {
    uint256 public constant MINT_PRICE = 1 ether;
    bytes32 private _whitelistMerkleRoot;

    constructor() ERC721("MerkleTree WhiteList", "MW") {}

    function setWhitelistMerkleRoot(bytes32 _newMerkleRoot) external onlyOwner {
        _whitelistMerkleRoot = _newMerkleRoot;
    }

    function mint(bytes32[] calldata proof) external payable {
        require(_whitelistMerkleRoot != "", "Free mint not allowed");
        require(
            MerkleProof.verify(
                proof,
                _whitelistMerkleRoot,
                keccak256(abi.encodePacked(msg.sender, MINT_PRICE))
            ),
            "Not in whitelist"
        );

        require(msg.value == MINT_PRICE, "Invalid paid price");

        _safeMint(msg.sender, totalSupply() + 1);
    }
}
