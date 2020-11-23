#!/bin/bash

env

rm -rf playbooks || true;
(git clone https://github.com/${GITHUB_ACTOR}/tutorials.git playbooks || git clone https://github.com/devonfw-forge/tutorials.git playbooks) && cd playbooks && (git checkout ${GITHUB_HEAD_REF} || git checkout ${GITHUB_BASE_REF} || true) && git status && git config --list
