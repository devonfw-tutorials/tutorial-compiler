#!/bin/sh

apt install libarchive-tools -y
cd /root/setup/
bsdtar -xvf <%= vsixFile; %> - extension
mv extension /opt/.katacodacode/extensions/<%= pluginName; %>
