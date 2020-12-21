if(Test-Path "playbooks") {
    Get-ChildItem "playbooks" -Recurse | Remove-Item -Recurse -Force
    Get-Item "playbooks" | Remove-Item -Recurse -Force
}

if($env:GITHUB_EVENT_NAME -match "pull_request") {
    git clone https://github.com/$env:GITHUB_ACTOR/tutorials.git playbooks
    if ( $? -eq $False ) {
        git clone https://github.com/devonfw-forge/tutorials.git playbooks
    }
} else {
    git clone https://github.com/devonfw-forge/tutorials.git playbooks
}
Set-Location playbooks
(git checkout $env:GITHUB_HEAD_REF) -or (git checkout $env:GITHUB_BASE_REF)
git status
git config --list