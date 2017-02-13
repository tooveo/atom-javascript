#!/usr/bin/env bash -xe
if [[ -z "$1" ]]; then
    echo "argument error"
    exit 2
fi

echo $1

if [[ $1 == "test" ]]; then
    aws --region us-east-1 s3 rm --recursive s3://cdn.atom-data.io/js/test/
    aws --region us-east-1 s3 cp dist/ s3://cdn.atom-data.io/js/test/ --recursive --acl public-read
    aws cloudfront create-invalidation --distribution-id EETANK4D76IR0 --paths /test/*
else
    aws --region us-east-1 s3 rm --recursive s3://cdn.atom-data.io/js/$1/
    aws --region us-east-1 s3 cp dist/ s3://cdn.atom-data.io/js/$1/ --recursive --acl public-read
    aws cloudfront create-invalidation --distribution-id EETANK4D76IR0 --paths /$1/*

    aws --region us-east-1 s3 rm --recursive s3://cdn.atom-data.io/js/latest/
    aws --region us-east-1 s3 cp dist/ s3://cdn.atom-data.io/js/latest/ --recursive --acl public-read
    aws cloudfront create-invalidation --distribution-id EETANK4D76IR0 --paths /latest/*
fi
