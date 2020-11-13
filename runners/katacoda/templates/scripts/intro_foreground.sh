#!/bin/sh
while [ ! -f /root/setup/setup.sh ] ; do sleep 1 ; done
sh /root/setup/setup.sh