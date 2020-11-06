#!/bin/sh
#cd /root/

git clone https://github.com/devonfw/ide-settings.git settings

TOOLS="DEVON_IDE_TOOLS=(<%= tools; %>)"
echo $TOOLS > settings/devon.properties