#!/bin/bash
branch=${GITHUB_REF#refs/heads/}
echo $branch
owner=${GITHUB_REPOSITORY%/*}
echo $owner

if [ "$branch" = "main" ] && [ "${owner%-*}" = "devonfw" ];
then
    echo "Commiting to katacoda-scenarios"
    #TODO
else
    echo "Commiting to katacoda-scenarios-dev"

    #delete old builds
    oldestId="$(($GITHUB_RUN_NUMBER - 10))"
    echo $oldestId
    re='^[0-9]+$'
    for DIR in externals/katacoda-scenarios-dev/*; do
        dirName=${DIR#externals/katacoda-scenarios-dev/}
        id=${dirName%%_*}
        if [[ $id =~ $re ]] && [ "$id" -le "$oldestId" ]; then
            rm -r $DIR
        fi
    done

    #copy new
    prefix="${GITHUB_RUN_NUMBER}_${owner}_${branch}_"
    for DIR in build/output/katacoda/*; do
        dirName=${DIR#build/output/katacoda/}
        cp -R $DIR externals/katacoda-scenarios-dev/$prefix$dirName
    done
    cd externals/katacoda-scenarios-dev/
    git add -A
    git config user.email "devonfw"
    git config user.name "devonfw"
    git commit -m "Tutorials for ${GITHUB_RUN_NUMBER} ${owner} ${branch}"
    git push
fi