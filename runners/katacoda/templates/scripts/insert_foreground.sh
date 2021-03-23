#!/bin/bash

while [ grep -Fxq "!#Placeholder#!" filename ]; do sleep 2; done