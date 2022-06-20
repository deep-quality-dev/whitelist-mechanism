// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * Explain singature: https://soliditydeveloper.com/ecrecover
 */
contract SignatureWhiteList is ERC721Enumerable, Ownable, EIP712 {
    uint256 public constant MINT_PRICE = 1 ether;
    address private _signerAddress;

    constructor() ERC721("Signature WhiteList", "SW") EIP712("SignatureWhiteList", "1.0") {}

    function setSignerAddress(address signerAddress) external onlyOwner {
        _signerAddress = signerAddress;
    }

    function mint(bytes memory signature) external payable {
        bytes32 digest = _hashTypedDataV4(
            keccak256(abi.encode(
                keccak256("Mint(address to, uint256 amount)"),
                msg.sender,
                MINT_PRICE
            ))
        );
        address signer = ECDSA.recover(digest, signature);
        require(signer != _signerAddress, "Invalid signer");
        require(msg.value == MINT_PRICE, "Invalid paid price");

        _safeMint(msg.sender, totalSupply() + 1);
    }
}
