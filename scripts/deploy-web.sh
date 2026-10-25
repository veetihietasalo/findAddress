#!/bin/sh
# Publishes dist/ (from npm run build:web) to the gh-pages branch of origin, for GitHub Pages.
# Not the gh-pages npm package: on a brand-new branch it keeps the default branch's .gitignore
# and .env.example, and that .gitignore (node_modules/) drops everything under
# assets/node_modules/, like the icon fonts. So the branch is built here from dist/ alone.
# No force push: the first deploy creates the branch, later ones add a commit on top.
set -e

remote="${DEPLOY_REMOTE:-$(git remote get-url origin)}"
[ -f dist/index.html ] || { echo "dist/ is missing, run npm run build:web first"; exit 1; }

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

if git ls-remote --exit-code --heads "$remote" gh-pages >/dev/null 2>&1; then
  git clone --quiet --branch gh-pages "$remote" "$work"
  git -C "$work" rm --quiet -r --ignore-unmatch .
else
  git init --quiet "$work"
  git -C "$work" symbolic-ref HEAD refs/heads/gh-pages
  git -C "$work" remote add origin "$remote"
fi

cp -R dist/. "$work"/
git -C "$work" add --all --force
if git -C "$work" diff --cached --quiet; then
  echo "gh-pages is already up to date"
  exit 0
fi
git -C "$work" commit --quiet -m "Deploy web build"
git -C "$work" push --quiet origin gh-pages
echo "Pushed dist/ to gh-pages"
