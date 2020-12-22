#!/bin/sh

mkdir devonfw
cd devonfw

wget -c https://bit.ly/2BCkFa9 -O - | tar -xz

yes | bash setup /root/devonfw-settings/settings.git 


. ~/.bashrc

exit 0