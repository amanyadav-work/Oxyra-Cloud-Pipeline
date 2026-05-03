#!/bin/bash
if [ -z "$GIT_REPOSITORY__URL" ]; then
    echo "Error: GIT_REPOSITORY__URL is not set"
    exit 1
fi

BRANCH="${GIT_BRANCH:-main}"
echo "Cloning repository from $GIT_REPOSITORY__URL, branch: $BRANCH"

git clone -b "$BRANCH" --single-branch "$GIT_REPOSITORY__URL" /home/app/output || exit 1

echo "Executing the Go binary..."
./script_binary

echo "Task finished."
exit 0