#!/usr/bin/env bash

# Init.
sudo apt-get update

# Install nvm
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.30.1/install.sh | bash
echo ". ~/.nvm/nvm.sh" >> ~/.bash_profile
source ~/.bash_profile

# Install node v4.2.4
nvm install 4
