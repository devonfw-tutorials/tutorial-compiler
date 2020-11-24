#!/bin/sh

cd /root/setup/

curl https://api.github.com/repos/devonfw-forge/cobigen-vscode-plugin/releases/latest |
	grep '"browser_download_url":' |
    sed -E 's/.*"([^"]+)".*/\1/' >> download_url.txt
curl $(cat download_url.txt) -L --output cobigen-plugin.vsix

apt install libarchive-tools -y
bsdtar -xvf cobigen-plugin.vsix - extension
mv extension /opt/.katacodacode/extensions/cobigen
