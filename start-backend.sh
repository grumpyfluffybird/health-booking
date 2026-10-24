#!/usr/bin/env bash
cd "$(dirname "$0")/backend" || exit 1
mvn spring-boot:run -Dspring-boot.run.profiles=local
