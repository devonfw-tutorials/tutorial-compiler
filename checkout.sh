#!/bin/bash

rm -rf playbooks || true;
TUTORIAL_REPO_URL=$(cat config.properties | grep tutorials_repo_url | cut -d "=" -f2)
if [ "$GITHUB_EVENT_NAME" = "pull_request" ]; then (git clone https://github.com/${GITHUB_ACTOR}/tutorials.git playbooks || git clone $TUTORIAL_REPO_URL playbooks) else (git clone $TUTORIAL_REPO_URL playbooks) fi && cd playbooks && (git checkout ${GITHUB_HEAD_REF} || git checkout ${GITHUB_BASE_REF} || true) && git status && git config --list
