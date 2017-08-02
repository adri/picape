#!/usr/bin/env bash
# Runs any given command but makes sure it is killed
# when a 'close' signal is received.
#
# Example usage:
# bin/spawn_execute.sh node node_modules/bin/dist/next-dev -p 4001
"$@"
pid=$!
while read line ; do
  :
done
kill -KILL $pid
