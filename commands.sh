 solana logs -u devnet GmCTiB5hb9MqLJnBmzXFzc4NDziAejG8Nhf6RAiLzowG


 bash <(curl -sSf https://sugar.metaplex.com/install.sh)
sugar --version

sh -c "$(curl -sSfL https://release.solana.com/v1.10.32/install)"
solana --version

#JQD7okr9T4tphbgqga3M7WHcGVxjJMSm4La7TN17YzP
solana-keygen new --outfile ./wallets/Owner.json
# Gc15nCy8ijWugY91WmYB4LywrfZeNxueSuParQpWs75e
solana-keygen new --outfile ./wallets/Treasury.json
# 8f3hB45XZVRE6i5X1Ywax75SG3NsUMJtXFMoX8njV6mL
solana-keygen new --outfile ./wallets/Creator.json
# 7PRNTRAZ2VhqeqR4v2Z2Hgu7RkNkZvSzFZ6w4T9kM2Bw
solana-keygen new --outfile ./wallets/Buyer.json

# solana config set --keypair ./wallets/Owner.json
solana config set --keypair /Users/m1/Desktop/MyFiles/Code/solana/hello-sugar/wallets/Owner.json
solana config set --url https://metaplex.devnet.rpcpool.com/
solana config set --url https://api.devnet.solana.com
solana airdrop 2

solana airdrop 2 7PRNTRAZ2VhqeqR4v2Z2Hgu7RkNkZvSzFZ6w4T9kM2Bw --url https://metaplex.devnet.rpcpool.com/
solana balance 7PRNTRAZ2VhqeqR4v2Z2Hgu7RkNkZvSzFZ6w4T9kM2Bw --url https://metaplex.devnet.rpcpool.com/
curl https://docs.metaplex.com/assets/files/assets-ff6bd873ecd07b49c86faf3c7aab82d2.zip --output ./assets.zip
unzip assets.zip

# sugar launch -l off 
sugar launch -l debug

Candy machine ID: 7wL8ahR8EZV11CVTdf4k8uN2yq64uBKa4DLo3tqEswHL

Collection mint ID: FVainhEPJ9b6cEN9T4wy82GJRRmqWDD84dwPUJnYcwkw

Candy Machine ui repo
https://github.com/metaplex-foundation/candy-machine-ui.git
candy-machine-ui
yarn install

cp .env.example .env
yarn start