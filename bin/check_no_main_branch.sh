#!/bin/sh

branch="$(git symbolic-ref HEAD 2>/dev/null)" || \
       "$(git describe --contains --all HEAD)"
this_comment=$1
last_comment="$(git log -n 1 --pretty=%s)"

# no main branch
echo "branch=${branch##refs/heads/}"
if [ "${branch##refs/heads/}" != "main" ]; then
  echo "=> ok(no main branch)"
  exit 0
fi

# main branch with merge(develop) => chore(release)
echo "last_comment=${last_comment}"
if [ $last_comment == "Merge branch 'develop'" ] && [ $this_comment =~ ^chore\(release\): ]; then
  echo "=> ok(merge)"
  exit 0
fi

# main branch with chore(release) => merge(develop)
if [ $last_comment =~ ^chore\(release\): ] && [ $this_comment == "Merge branch 'develop'" ]; then
  echo "=> ok(release)"
  exit 0
fi

# main branch
echo "=> ng(main branch)"
echo "*** do not commit on the main branch ***"
exit 1
