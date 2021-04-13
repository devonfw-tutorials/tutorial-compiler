#!/bin/sh

sed '<%= lineNumber; %>##PLACEHOLDER##' <%= filename; %> -i;