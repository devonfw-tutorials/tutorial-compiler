if(Test-Path "playbooks") {
    Remove-Item -Recurse "playbooks"
}
Write-Output $GITHUB_EVENT_NAME + "\n"
Write-Output $GITHUB_ACTOR + "\n"
Write-Output $GITHUB_HEAD_REF + "\n"
Write-Output $GITHUB_BASE_REF + "\n"