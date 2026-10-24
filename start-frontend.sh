#!/usr/bin/env bash
cd "$(dirname "$0")/frontend" || exit 1
[ -d node_modules ] || npm install
npm run dev
