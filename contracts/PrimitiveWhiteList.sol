// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PrimitiveWhiteList is ERC721Enumerable, Ownable {
    uint256 public constant MINT_PRICE = 0.01 ether;
    mapping(address => bool) public whitelist;

    constructor() ERC721("Primitive WhiteList", "PW") {}

    function addWhitelist(address _account) external onlyOwner {
        whitelist[_account] = true;
    }

    function removeWhitelist(address _account) external onlyOwner {
        whitelist[_account] = false;
    }

    function mint() external payable {
        require(msg.value == MINT_PRICE, "Invalid paid price");
        require(whitelist[msg.sender], "Not in whitelist");

        _safeMint(msg.sender, totalSupply() + 1);
    }
}
