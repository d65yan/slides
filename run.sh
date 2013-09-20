#!/bin/bash
NODE=node
source .env
export $(awk -F'=' '{printf "%s ",$1}' .env)
[ $(uname) = "Linux" ] && NODE=${NODE}js
${NODE} $(basename ${0} .sh).js
