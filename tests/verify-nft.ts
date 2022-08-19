import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { BN, Program } from "@project-serum/anchor";
import { MintAnchorNft } from "../target/types/mint_anchor_nft";
import { FindNftByTokenInput, Metaplex, Nft, Pda } from "@metaplex-foundation/js";
import { expect } from "chai";

const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

type NFTWithEdition = Nft & {
    model: String,
    isOriginal: boolean,
    address: Pda,
    supply: BN,
    maxSupply: BN,
}

describe("Verifier", () => {
    //   // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env()
    anchor.setProvider(provider);

    const wallet = provider.wallet as anchor.Wallet;
    const program = anchor.workspace.MintAnchorNft as Program<MintAnchorNft>;
    const connection = new Connection(clusterApiUrl("devnet"), "processed");

    const metaplex = new Metaplex(connection);

    it("verifies NFT", async () => {
        const tokenAccount = new PublicKey("L2m2VMMdkC5AvD7TvCKwLw5KhVQqHwkW4qmGYAHDF2e");

        const props: FindNftByTokenInput = {
            token: tokenAccount,
            // tokenOwner: wallet.publicKey,
        }
        const nft =( await metaplex.nfts().findByToken(props).run() as unknown)as NFTWithEdition;
        // console.log(nft);
        console.log(nft.edition)
        expect(nft.edition.isOriginal).equal(true)
        const tx = await program.methods.verifyPayerIsOwner().accounts({
            tokenAccount: tokenAccount,
            payer: wallet.publicKey,
          }).rpc()
    })
})

// anchor test_verify --skip-deploy  --skip-local-validator   --skip-build
