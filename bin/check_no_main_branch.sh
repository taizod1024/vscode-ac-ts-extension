#!/bin/sh

# if the branch is master, then fail.

branch="$(git symbolic-ref HEAD 2>/dev/null)" || \
       "$(git describe --contains --all HEAD)"
last_comment="$(git log -n 1 --pretty=%s)"

echo "pre-commit:"
if [ "${branch##refs/heads/}" = "main" ]; then
  if [ "${last_comment}" != "Merge branch 'develop'" ]; then
    echo "*** do not commit on the main branch ***"
    exit 1
  else
    echo "=> ok(merge comment)"
  fi
else
  echo "=> ok(no main branch)"
fi
