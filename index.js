// Import necessary modules from the Solana web3.js and spl-token libraries
const {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
  SystemProgram,
  Transaction,
} = require("@solana/web3.js");
const {
  createInitializeMintInstruction,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAccount,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
} = require("@solana/spl-token");
require("dotenv").config(); // Load environment variables from a .env file
const bs58 = require("bs58"); // Import bs58 for Base58 encoding/decoding

// Main asynchronous function to execute the token creation and minting process
(async () => {
  try {
    // Establish a connection to the Solana devnet
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Ensure the PRIVATE_KEY environment variable is set
    if (!process.env.PRIVATE_KEY) {
      console.error("Error: PRIVATE_KEY environment variable is not set!");
      process.exit(1); // Exit the process if the private key is missing
    }

    // Decode the private key from Base58 format
    const secretKey = bs58.default.decode(process.env.PRIVATE_KEY);
    const payer = Keypair.fromSecretKey(secretKey); // Create a Keypair from the secret key

    console.log("Wallet public key:", payer.publicKey.toBase58());

    let mint; // Variable to store the mint public key
    try {
      // Begin the token creation process
      console.log("Starting token creation process...");

      // Generate a new Keypair for the mint
      const mintKeypair = Keypair.generate();
      // Calculate the minimum balance required for rent exemption
      const lamports = await connection.getMinimumBalanceForRentExemption(
        MINT_SIZE,
        "confirmed"
      );

      // Create an instruction to create a new account for the mint
      const createAccIx = SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      });

      // Create an instruction to initialize the mint
      const initIx = createInitializeMintInstruction(
        mintKeypair.publicKey,
        9, // Set the number of decimals for the token
        payer.publicKey, // Set the mint authority
        payer.publicKey // Set the freeze authority
      );

      // Create a transaction and add the instructions
      const tx = new Transaction().add(createAccIx, initIx);
      tx.feePayer = payer.publicKey; // Set the fee payer for the transaction
      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash; // Set the recent blockhash for the transaction

      // Sign the transaction with the mint keypair and payer
      tx.sign(mintKeypair, payer);
      // Send the transaction to the network
      const sig = await connection.sendTransaction(tx, [payer, mintKeypair], {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });
      // Confirm the transaction
      await connection.confirmTransaction(sig, "confirmed");

      mint = mintKeypair.publicKey; // Store the mint public key
      console.log("Token created successfully:", mint.toBase58());
    } catch (error) {
      console.error("An error occurred while creating the token:", error);
      return; // Exit if mint creation fails
    }

    // Create an associated token account for the wallet
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payer.publicKey
    );
    console.log("Token account created:", tokenAccount.address.toBase58());

    // Mint 100 tokens to the token account
    const amount = 100 * Math.pow(10, 9); // Calculate the amount in base units
    await mintTo(
      connection,
      payer,
      mint,
      tokenAccount.address,
      payer.publicKey,
      amount
    );

    console.log(
      `Minted 100 tokens to account: ${tokenAccount.address.toBase58()}`
    );

    // Retrieve and display the balance of the token account
    const accountInfo = await getAccount(connection, tokenAccount.address);
    console.log("Token account balance:", accountInfo.amount / Math.pow(10, 9));
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();
