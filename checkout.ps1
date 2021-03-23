if(Test-Path "playbooks") {
    Get-ChildItem "playbooks" -Recurse | Remove-Item -Recurse -Force
    Get-Item "playbooks" | Remove-Item -Recurse -Force
    echo "Halllo"
}

$TUTORIAL_REPO_URL=(Get-Content .\config.properties | Select-String "tutorials_repo_url").ToString().Split("=")[1]
if($env:GITHUB_EVENT_NAME -match "pull_request") {
    git clone https://github.com/$env:GITHUB_ACTOR/tutorials.git playbooks
    if ( $? -eq $False ) {
        git clone $TUTORIAL_REPO_URL playbooks
    }
} else {
    git clone $TUTORIAL_REPO_URL playbooks
}
Set-Location playbooks
(git checkout $env:GITHUB_HEAD_REF) -or (git checkout $env:GITHUB_BASE_REF)
git status
git config --list