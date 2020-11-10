#!/bin/sh

echo "Waiting setup script to complete"
while [ ! -d "/root/devonfw-settings/settings/git/" ]
  do sleep 1s
done

while [ ! -d "/root/devonfw-settings/settings/.git/" ]
  do sleep 1s
  mv /root/devonfw-settings/settings/git/ /root/devonfw-settings/settings/.git/
done

echo "Done"