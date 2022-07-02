#!/bin/sh

# Compile problems from TypeScript to JavaScript
#
# Configuration of the TypeScript compiler can be found in
# /problems/tsconfig.json.

npx -p typescript tsc -p ./problems
