import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { keccak256 } from "ethers/lib/utils";
import { ethers } from "hardhat";
import MerkleTree from "merkletreejs";
import { MerkleTreeWhiteList } from "../typechain";

describe("MerkleTree", function () {
  let signers: SignerWithAddress[];
  let merkleTreeWhiteList: MerkleTreeWhiteList, mintPrice: BigNumber;

  beforeEach(async () => {
    signers = await ethers.getSigners();

    const MerkleTreeWhiteList = await ethers.getContractFactory(
      "MerkleTreeWhiteList"
    );
    merkleTreeWhiteList =
      (await MerkleTreeWhiteList.deploy()) as MerkleTreeWhiteList;
    await merkleTreeWhiteList.deployed();

    mintPrice = await merkleTreeWhiteList.MINT_PRICE();
  });

  it("should work itself by merkletreejs", async function () {
    const leaves = signers.map((signer: SignerWithAddress) =>
      ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ["address", "uint256"],
          [signer.address, mintPrice.toString()]
        )
      )
    );
    const tree = new MerkleTree(leaves, keccak256, { sort: true });
    const root = tree.getHexRoot();
    const leaf = leaves[0];
    const proof = tree.getHexProof(leaf);

    expect(tree.verify(proof, leaf, root)).to.be.equal(true);
  });

  it("should return true for valid merkle proof", async function () {
    const leaves = signers.map((signer: SignerWithAddress) =>
      ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ["address", "uint256"],
          [signer.address, mintPrice.toString()]
        )
      )
    );
    const tree = new MerkleTree(leaves, keccak256, { sort: true });
    const root = tree.getHexRoot();
    const leaf = leaves[0];
    const proof = tree.getHexProof(leaf);

    await merkleTreeWhiteList.setWhitelistMerkleRoot(root);

    await expect(
      merkleTreeWhiteList
        .connect(signers[0])
        .mint(proof, { value: BigNumber.from(10).pow(18) })
    ).to.be.not.reverted;
  });

  it("should revert for invalid merkle proof", async function () {
    const leaves = signers.map((signer: SignerWithAddress) =>
      ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ["address", "uint256"],
          [signer.address, mintPrice.toString()]
        )
      )
    );
    const tree = new MerkleTree(leaves, keccak256, { sort: true });
    const root = tree.getHexRoot();
    const leaf = leaves[0];
    const proof = tree.getHexProof(leaf);

    await merkleTreeWhiteList.setWhitelistMerkleRoot(root);

    await expect(
      merkleTreeWhiteList
        .connect(signers[0])
        .mint(proof.slice(1), { value: BigNumber.from(10).pow(18) })
    ).to.be.revertedWith("Not in whitelist");
  });

  it("should revert for invalid root of tree", async function () {
    const leaves = signers.map((signer: SignerWithAddress) =>
      ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ["address", "uint256"],
          [signer.address, mintPrice.toString()]
        )
      )
    );
    const tree = new MerkleTree(leaves, keccak256, { sort: true });
    const leaf = leaves[0];
    const proof = tree.getHexProof(leaf);

    await expect(
      merkleTreeWhiteList
        .connect(signers[0])
        .mint(proof.slice(1), { value: BigNumber.from(10).pow(18) })
    ).to.be.revertedWith("Free mint not allowed");
  });

  it("should revert for invalid signer", async function () {
    const leaves = signers.map((signer: SignerWithAddress) =>
      ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ["address", "uint256"],
          [signer.address, mintPrice.toString()]
        )
      )
    );
    const tree = new MerkleTree(leaves, keccak256, { sort: true });
    const root = tree.getHexRoot();
    const leaf = leaves[0];
    const proof = tree.getHexProof(leaf);

    await merkleTreeWhiteList.setWhitelistMerkleRoot(root);

    await expect(
      merkleTreeWhiteList
        .connect(signers[1])
        .mint(proof, { value: BigNumber.from(10).pow(18) })
    ).to.be.revertedWith("Not in whitelist");
  });
});
