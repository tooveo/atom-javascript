#!/bin/bash -x
# Small script to auto-deploy docs to gh-pages branch
set -e # Exit with nonzero exit code if anything fails

SOURCE_BRANCH="master"
TARGET_BRANCH="gh-pages"

rm -rf apidocs/
git clone -b $TARGET_BRANCH --single-branch https://github.com/ironSource/atom-javascript.git apidocs
apidoc -i atom-sdk/ -o apidocs/
cd apidocs
git add .
git commit -m "Deploy to GitHub Pages"
git push
cd ..
rm -rf apidocs
