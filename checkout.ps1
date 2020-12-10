if(Test-Path "playbooks") {
    Remove-Item -Recurse "playbooks"
}
Write-Output "$GITHUB_EVENT_NAME"
Write-Output "$GITHUB_ACTOR"
Write-Output "$GITHUB_HEAD_REF"
Write-Output "$GITHUB_BASE_REF"