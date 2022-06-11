#!/usr/bin/env bash

set -euo pipefail -x

for config in config/*.json;
do
    subgraph=$(jq -r '.output' $config)
    npx graph-compiler --config ${config} --include src/datasources --include node_modules/@openzeppelin/subgraphs/src/datasources --export-schema --export-subgraph
    npx graph codegen ${subgraph}subgraph.yaml

    jq -cr '.deploy[].type+" "+.deploy[].name' config/mainnet.json | while read endpoint;
    do
        npx graph deploy --product ${endpoint} ${subgraph}subgraph.yaml
    done
done