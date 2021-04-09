#!/bin/bash 

if <%= useDevonCommand; %>; then
    rm -r <%= workspaceDir; %> 
fi

if ! git clone https://github.com/<%= user; %>/<%= workspace; %>.git <%= workspaceDir; %>; then
    git clone https://github.com/devonfw-tutorials/<%= workspace; %>.git <%= workspaceDir; %> 
fi

cd <%= workspaceDir; %>
git checkout <%= branch; %>
cd ~/.


if ! <%= useDevonCommand; %>; then
    cp -r ./workspaces/* /root && rm -R workspaces
fi
