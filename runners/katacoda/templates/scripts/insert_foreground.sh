#!/bin/bash
FILE="/root/<%= filename; %>"
PH="##PLACEHOLDER##"
INSERTED=$(sed -n <%= lineNumber%>p $FILE)
while [[ $INSERTED != $PH ]] ;
do
    sleep 1
    INSERTED=$(sed -n <%= lineNumber%>p $FILE)
done
