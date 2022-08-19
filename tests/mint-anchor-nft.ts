import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
  MINT_SIZE,
  // Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getMint
} from "@solana/spl-token";
import { MintAnchorNft } from "../target/types/mint_anchor_nft";
import { FindNftByMintInput, Metaplex, } from "@metaplex-foundation/js";

// import { PublicKey } from "@solana/web3.js";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import {
  createUpdateMetadataAccountV2Instruction,
  DataV2,
  UpdateMetadataAccountV2InstructionArgs,
  UpdateMetadataAccountV2InstructionAccounts,
  Metadata,
} from "@metaplex-foundation/mpl-token-metadata"

import { expect } from "chai";

const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);



const getMetadata = async (
  mint: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> => {
  return (
    await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )
  )[0];
};
const getMasterEdition = async (
  mint: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> => {
  return (
    await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        Buffer.from("edition"),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )
  )[0];
};


describe("mint-anchor-nft", () => {
  //   // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider);

  const wallet = provider.wallet as anchor.Wallet;
  const program = anchor.workspace.MintAnchorNft as Program<MintAnchorNft>;
  const connection = new Connection(clusterApiUrl("devnet"), "processed");

  // const metaplex = new Metaplex(provider.connection);

  it("Mints NFT", async () => {

    const lamports: number = await program.provider.connection.getMinimumBalanceForRentExemption(
      MINT_SIZE
    );


    const nftMint: anchor.web3.Keypair = anchor.web3.Keypair.generate()
    // const tokenMint: anchor.web3.Keypair = anchor.web3.Keypair.generate()

    // or
    // 1) use build-in function
    // let mintPubkey = await createMint(
    //   connection, // conneciton
    //   feePayer, // fee payer
    // provider.wallet.publicKey, // mint authority
    //   provider.wallet.publicKey, // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
    //   8 // decimals
    // );
    const NftTokenAccount = await getAssociatedTokenAddress(
      nftMint.publicKey,
      wallet.publicKey
    )



    const mint_tx = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: nftMint.publicKey,
        space: MINT_SIZE,
        programId: TOKEN_PROGRAM_ID,
        lamports,
      }),
      createInitializeMintInstruction(
        nftMint.publicKey,
        0,
        wallet.publicKey,
        wallet.publicKey
      ),
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        NftTokenAccount,
        wallet.publicKey,
        nftMint.publicKey
      )
    );

    const res = await program.provider.sendAndConfirm(mint_tx, [nftMint])
    // console.log("------------------getParsedAccountInfo------------------");
    // console.log(await program.provider.connection.getParsedAccountInfo(nftMint.publicKey));

    // console.log("Accounts created successfully: ", res);


    const metadataAddress = await getMetadata(nftMint.publicKey)
    const masterEdition = await getMasterEdition(nftMint.publicKey)

    const tx = await program.methods.mintNftAndUpdate(
      nftMint.publicKey,
      "https://arweave.net/y5e5DJsiwH0s_ayfMwYk-SnrZtVZzHLQDSTZ5dNRUHA",
      "iMEF NFT"
    ).accounts({
      mintAuthority: wallet.publicKey,
      mint: nftMint.publicKey,
      tokenAccount: NftTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      metadata: metadataAddress,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      payer: wallet.publicKey,
      masterEdition: masterEdition,
    }).rpc()
    console.log("------------------NFT Minted Successfully-------------------");
    console.log("User NFT token Acct", NftTokenAccount.toBase58());
    console.log("NFT Mint key: ", nftMint.publicKey.toString());
    console.log("User wallet: ", wallet.publicKey.toString());
    console.log("Your Transaction signature", tx);


    let mintInfo = await getMint(connection, nftMint.publicKey);
    console.log(mintInfo.mintAuthority.toBase58());
    console.log(nftMint.publicKey.toBase58());


    //Mint Acct tests
    expect(mintInfo.decimals).equal(0);
    expect(mintInfo.freezeAuthority?.toBase58()).equal(masterEdition.toBase58());
    expect(mintInfo.isInitialized).equal(true);
    expect(mintInfo.mintAuthority?.toBase58()).equal(masterEdition.toBase58());
    expect(Number(mintInfo.supply)).eq(1);

    //NFT MEtadata tests
    const nft = await Metadata.fromAccountAddress(connection, metadataAddress)
    // console.log(nft);

    expect(nft.mint.toBase58()).equal(nftMint.publicKey.toBase58());
    expect(nft.updateAuthority.toBase58()).equal(wallet.publicKey.toBase58());
    expect(nft.primarySaleHappened).eq(true);
    // expect(nft.ed).eq(true);

    // mint and freeze authority should be edition
    //     // tests to run
    //     //get the nft metadata
    //     //check that the generated accounts match the expected
    //     // check that owner actually some authority on the nft
    //     //check that generated token account (using mint / wallet) matches the
    //     //token acct 
    //     //check the Primary Sale Happened property (metadata)
    //     // check token standard to ensure it's NonFungible (metadata)
    //     //check supply === 1 (mint)
    //     //check decimals === 0 (mint)
    //     //check mint === mint (metadata)
    //     //check if it's a master edition account or edition account
    //     // check that freeze authority == masteredition (mint) we dont need edition
    //     // check that mint authority == masteredition (mint) we dont need edition
    //     //check the uses property
    //     // check edition marker acct to get edition
  });

  // it("verifies NFT", async () => {
  //   const mintAddress = new PublicKey("71yX1LNspdNxdTdhvSKR2ifxrUH7Av7NRH4ENsFZGxn1");

  //   const props: FindNftByMintInput = {
  //     mintAddress: mintAddress,
  //     // tokenOwner: wallet.publicKey,
  //   }
  //   const nft = await metaplex.nfts().findByMint(props).run();
  //   console.log(nft);
  //   // const updated_data: DataV2 = {
  //   //   name: nft.name,
  //   //   symbol: nft.symbol,
  //   //   uri: nft.uri,
  //   //   sellerFeeBasisPoints: nft.sellerFeeBasisPoints,
  //   //   creators: nft.creators,
  //   //   collection: null,
  //   //   uses: null,
  //   // };

  //   // //instruction accounts
  //   // const accounts: UpdateMetadataAccountV2InstructionAccounts = {
  //   //   metadata: await getMetadata(mintAddress),
  //   //   updateAuthority: wallet.publicKey,
  //   // }

  //   // //instruction args
  //   // const { blockhash } = await connection.getLatestBlockhash();

  //   // const args: UpdateMetadataAccountV2InstructionArgs = {
  //   //   updateMetadataAccountArgsV2: {
  //   //     data: updated_data,
  //   //     updateAuthority: wallet.publicKey,
  //   //     primarySaleHappened: true,
  //   //     isMutable: true,
  //   //   }
  //   // }

  //   // const updateMetadataAccount = createUpdateMetadataAccountV2Instruction(
  //   //   accounts,
  //   //   args
  //   // );
  //   // const transaction = new anchor.web3.Transaction()
  //   // transaction.add(updateMetadataAccount);
  //   // transaction.recentBlockhash = blockhash;
  //   // transaction.feePayer = wallet.publicKey;
  //   // const signedTx = await wallet.signTransaction(transaction);

  //   // try {
  //   //   const txid = await connection.sendRawTransaction(signedTx.serialize());
  //   //   console.log("Transaction ID --", txid);
  //   //   const nft = await metaplex.nfts().findByMint(props).run();
  //   //   console.log(nft.updateAuthorityAddress.toBase58());
  //   // } catch (e) {
  //   //   console.log("------------------STATEMENT------------------");
  //   //   console.log(e);
  //   //   console.log("------------------STATEMENT------------------");
  //   // }



  // })


});




// anchor test --skip-deploy  --skip-local-validator   --skip-build