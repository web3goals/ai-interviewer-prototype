## Commands

- Install dependencies - `npm install`
- Config secured environment - `npx env-enc set-pw`
- Deploy interview contract - `npx hardhat run scripts/deploy/interview.js --network polygonMumbai`
- Verify contract - `npx hardhat verify --network polygonMumbai 0x0000000000000000000000000000000000000000`
- Add contract to chainlink subscription - `npx hardhat functions-sub-add --network polygonMumbai --subid 0 --contract 0x0000000000000000000000000000000000000000`
- Fund chainlink subscription - `npx hardhat functions-sub-fund --network polygonMumbai --subid 0 --amount 1`
