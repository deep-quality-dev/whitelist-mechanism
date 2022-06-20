import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { SignatureWhiteList } from "../typechain";

describe("Signature", function () {
  let owner: SignerWithAddress;
  let signatureWhiteList: SignatureWhiteList, mintPrice: BigNumber;

  const REQUEST_TYPEHASH = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("Mint(address to, uint256 amount)")
  );

  const EIP712DOMAIN_TYPEHASH = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(
      "EIP712Domain(string name,string version,uint256 chainId,address verifyContract)"
    )
  );

  const getDomainSeparator = (
    name: string,
    version: string,
    chainId: number,
    address: string
  ) => {
    return ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["bytes32", "bytes32", "bytes32", "uint256", "address"],
        [
          EIP712DOMAIN_TYPEHASH,
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes(name)),
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes(version)),
          chainId,
          address,
        ]
      )
    );
  };

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const SignatureWhiteList = await ethers.getContractFactory(
      "SignatureWhiteList"
    );
    signatureWhiteList =
      (await SignatureWhiteList.deploy()) as SignatureWhiteList;
    await signatureWhiteList.deployed();

    mintPrice = await signatureWhiteList.MINT_PRICE();

    await signatureWhiteList.setSignerAddress(owner.address);
  });

  it("should return true for valid signature", async function () {
    const chainId = await owner.getChainId();
    const hash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["bytes32", "address", "uint256"],
        [REQUEST_TYPEHASH, owner.address, mintPrice.toString()]
      )
    );
    const domainSeparator = getDomainSeparator(
      "SignatureWhiteList",
      "1.0",
      chainId,
      signatureWhiteList.address
    );
    const digest = ethers.utils.keccak256(
      ethers.utils.solidityPack(
        ["bytes1", "bytes1", "bytes32", "bytes32"],
        ["0x19", "0x01", domainSeparator, hash]
      )
    );

    const signature = await owner.signMessage(digest);
    await expect(
      signatureWhiteList.mint(signature, {
        value: BigNumber.from(10).pow(18),
      })
    ).to.be.not.reverted;
  });
});
