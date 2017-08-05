#!/usr/bin/env bash
# Runs any given command but makes sure it is killed
# when a 'close' signal is received.
#
# Example usage:
# bin/spawn_execute.sh node node_modules/bin/dist/next-dev -p 4001

# Start process in the background
"$@ " &
CHILD_PID=$!

while read line ; do
  # This will hang until EOF received from Elixir process
  :
done

kill -s SIGKILL $CHILD_PID
