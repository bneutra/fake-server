#!/bin/bash
# builds and pushes docker image
# Usage: scripts/push_image.sh [TAG] (defaults to using <DATE>-<GIT_SHORT_HASH>)
TAG=$1

set -euo pipefail

if [ -z "$TAG" ]; then
  GIT_HASH=`git rev-parse --short HEAD`
  DATE=`date +%Y_%m_%d`
  TAG="v${DATE}-${GIT_HASH}"
  echo "Release tag: ${TAG}"
fi

AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="$(aws sts get-caller-identity --output text --query 'Account')"
eval $(aws ecr get-login --no-include-email --region ${AWS_REGION} | sed 's|https://||')

URL="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/fake-service:${TAG}"
docker build -t $URL .
docker push $URL
echo
echo "built and pushed $URL"
