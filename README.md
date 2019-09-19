[![Build Status](https://travis-ci.org/DeadlyBossMods/DeadlyBossMods.github.io.svg?branch=source)](https://travis-ci.org/DeadlyBossMods/DeadlyBossMods.github.io)
[![DeadlyBossMods on Discord](https://img.shields.io/badge/discord-DeadlyBossMods-738bd7.svg?style=flat)](https://discord.gg/DeadlyBossMods) 

[![Patreon](https://media.forgecdn.net/attachments/76/25/patreon-medium-button.png)](https://www.patreon.com/deadlybossmods)

# DeadlyBossMods Documentation

## Setup
```
git clone git@github.com:DeadlyBossMods/DeadlyBossMods.github.io.git
cd DeadlyBossMods.github.io
bundle exec rake bootstrap
bundle exec rake build
```

## Running locally
```
bundle exec rake serve
```

## Deploying
Travis CI will automatically deploy when new commits are pushed to the `source` branch, so you should not need to deploy from your local computer. However, if you need to deploy locally, the `bundle exec rake deploy` command is available.
