#!/bin/bash
set -e # Exit with nonzero exit code if anything fails

SOURCE_BRANCH="master"
TARGET_BRANCH="gh-pages"

rm -rf out/
git clone -b $TARGET_BRANCH --single-branch https://github.com/ironSource/atom-javascript.git out
apidoc -i atom-sdk/ -o out/
cd out
git add .
git commit -m "Deploy to GitHub Pages"
git push
rm -rf out/
