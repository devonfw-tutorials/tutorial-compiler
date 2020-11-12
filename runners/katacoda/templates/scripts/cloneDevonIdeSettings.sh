#!/bin/sh

mkdir <%= cloneDir; %>
cd <%= cloneDir; %>

git clone https://github.com/devonfw/ide-settings.git settings

TOOLS="DEVON_IDE_TOOLS=(<%= tools; %>)"
echo $TOOLS > settings/devon.properties

mv /root/devonfw-settings/settings/ /root/devonfw-settings/settings.git