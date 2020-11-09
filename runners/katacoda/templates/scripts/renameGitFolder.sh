#!/bin/sh

echo "Waiting setup script to complete"
while [ ! -d "/root/devonfw/settings/git/" ]
  do sleep 1s
done

while [ ! -d "/root/devonfw/settings/.git/" ]
  do sleep 1s
  mv /root/devonfw/settings/git/ /root/devonfw/settings/.git/
done

echo "Done"