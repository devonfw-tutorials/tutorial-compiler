if(Test-Path "playbooks") {
    Remove-Item -Recurse "playbooks"
}
Write-Output "$env:GITHUB_EVENT_NAME"
Write-Output "$env:GITHUB_ACTOR"
Write-Output "$env:GITHUB_HEAD_REF"
Write-Output "$env:GITHUB_BASE_REF"

if($env:GITHUB_EVENT_NAME -match "pull_request") {
    (git clone https://github.com/${GITHUB_ACTOR}/tutorials.git playbooks) -or (git clone https://github.com/devonfw-forge/tutorials.git playbooks)
} else {
    git clone https://github.com/devonfw-forge/tutorials.git playbooks
}
Set-Location playbooks
(git checkout ${GITHUB_HEAD_REF}) -or (git checkout ${GITHUB_BASE_REF})
git status
git config --list