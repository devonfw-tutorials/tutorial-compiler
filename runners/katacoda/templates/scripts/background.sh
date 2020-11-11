#!/bin/sh

cd /root/scripts/step<%= stepCount; %>/

FILES=/root/scripts/step<%= stepCount; %>/*
for f in $FILES
do
  bash $f
done

touch /root/scripts/step<%= stepCount; %>/FINISHED
