#!/bin/bash
if [ -z "$GIT_REPOSITORY__URL" ]; then
    echo "Error: GIT_REPOSITORY__URL is not set"
    exit 1
fi
echo "Cloning repository from $GIT_REPOSITORY__URL..."
git clone "$GIT_REPOSITORY__URL" /home/app/output

echo "Executing the Go binary..."
./script_binary

echo "Task finished."
exit 0