# Token Deposit Script

This script allows you to create and mint tokens on the Solana blockchain using the Solana web3.js and spl-token libraries. The script establishes a connection to the Solana devnet, creates a new token mint, and mints tokens to an associated token account.

## Prerequisites

- Node.js installed on your machine
- Yarn or npm installed on your machine
- A Solana wallet with a private key in Base58 format
- A `.env` file with the following environment variables:
  - `PRIVATE_KEY`: Your wallet's private key in Base58 format

## Installation

1. Clone the repository:

   ```sh
   git clone <repository-url>
   cd token-deposit-script
   ```

2. Install the dependencies:

   ```sh
   yarn install
   # or
   npm install
   ```

3. Create a `.env` file in the root directory and add your private key:
   ```sh
   echo "PRIVATE_KEY=<your-private-key>" > .env
   ```

## Usage

1. Run the script:

   ```sh
   node index.js
   ```

2. The script will:
   - Establish a connection to the Solana devnet
   - Create a new token mint
   - Create an associated token account for your wallet
   - Mint 100 tokens to the associated token account
   - Display the public key of your wallet, the mint address, the token account address, and the token account balance
