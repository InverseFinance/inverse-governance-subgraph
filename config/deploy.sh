#!/usr/bin/env bash

set -euo pipefail -x

npx graph-compiler --config config/mainnet.json --include src/datasources --include node_modules/@openzeppelin/subgraphs/src/datasources --export-schema --export-subgraph
npx graph codegen                                               ./generated/mainnet.subgraph.yaml
npx graph deploy --product hosted-service amxx/inverse-protocol ./generated/mainnet.subgraph.yaml
