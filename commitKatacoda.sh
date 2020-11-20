#!/bin/bash
branch=$GITHUB_HEAD_REF
echo $branch
owner=$GITHUB_ACTOR
echo $owner

if [ "$branch" = "main" ] && [ "${owner%-*}" = "devonfw" ];
then
    echo "Commiting to katacoda-scenarios"
    #TODO
else
    echo "Commiting to katacoda-scenarios-dev"

    #delete old builds
    oldestId="$(($GITHUB_RUN_NUMBER - 10))"
    echo "oldestId: $oldestId"
    re='^[0-9]+$'
    for DIR in externals/katacoda-scenarios-dev/*; do
        dirName=${DIR#externals/katacoda-scenarios-dev/}
        id=${dirName%%_*}
        if [[ $id =~ $re ]] && [ "$id" -le "$oldestId" ]; then
            echo "Removing $DIR"
            rm -r $DIR
        fi
    done

    #copy new
    prefix="${GITHUB_RUN_NUMBER}_${owner}_${branch//[^A-Za-z0-9_-]/-}_"
    for DIR in build/output/katacoda/*; do
        dirName=${DIR#build/output/katacoda/}
        echo "Copying $DIR to externals/katacoda-scenarios-dev/$prefix$dirName"
        cp -R $DIR externals/katacoda-scenarios-dev/$prefix$dirName
    done
    cd externals/katacoda-scenarios-dev/
    echo "git remote -v"
    git remote -v
    echo "git fetch --all"
    git fetch --all
    echo "git branch"
    git branch
    echo "git branch -r"
    git branch -r
    echo "git checkout origin/main"
    git checkout origin/main
    echo "git add -A"
    git add -A
    echo "git status"
    git status
    git config user.email "devonfw"
    git config user.name "devonfw"
    git commit -m "Tutorials for ${GITHUB_RUN_NUMBER} ${owner} ${branch}"
    git push origin main
fi