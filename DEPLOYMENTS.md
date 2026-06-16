# Meshwork — Arc Testnet Deployments

Chain: Arc Testnet (chainId 5042002, RPC https://rpc.testnet.arc.network)
Explorer: https://testnet.arcscan.app
Deployer wallet (also treasury): 0x7c8eba71808ff608a87a96e55464ca33fcd8b244

## Canonical (VERIFIED) — solc 0.8.34+commit.80d5c536, optimizer on, 200 runs

| Contract | Address | Status |
| --- | --- | --- |
| MeshworkRegistry | `0xdccfb2d3cebe128d319ba2c71b611541c635253d` | verified on ArcScan |
| MeshworkEscrow | `0x9bda2025d4808e883e2064e7ed3797ce4a065617` | verified on ArcScan |

- Escrow constructor: _usdc=0x3600000000000000000000000000000000000000, _registry=0xdccfb2d3cebe128d319ba2c71b611541c635253d, _treasury=0x7c8eba71808ff608a87a96e55464ca33fcd8b244
- registry.setEscrow(0x9bda2025d4808e883e2064e7ed3797ce4a065617) — done
- Frontend: https://meshwork-ten.vercel.app (Vercel env points here)

### Why solc 0.8.34 (not 0.8.35)
First deploy used solc 0.8.35 final. ArcScan/Blockscout's compiler index only goes up to 0.8.35-pre.1, so it could not verify 0.8.35-final bytecode. Redeployed with 0.8.34 (a stable release ArcScan supports). Source pragma ^0.8.20 is compatible.

## Superseded (0.8.35, UNVERIFIED — do not use)
- MeshworkRegistry 0x54436570cfa188315418b9c19ee53c12b7b48291
- MeshworkEscrow 0xdfe28a5d5d785dd14263c505201832abddd0e2a1

## Notes
- USDC = native gas token on Arc (18 dec) + ERC-20 USDC precompile at 0x3600…0000 (6 dec).
- Deployed via Circle Programmable Wallets (developer-controlled) REST contract-deploy.
