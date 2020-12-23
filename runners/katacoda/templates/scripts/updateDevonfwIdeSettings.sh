#!/bin/sh

cd <%= updateDir; %>settings.git

TOOLS="DEVON_IDE_TOOLS=(<%= tools; %>)"
echo $TOOLS > devon.properties

git add -A
git config user.email "devonfw"
git config user.name "devonfw"
git commit -m "devonfw"