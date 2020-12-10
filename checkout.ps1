if(Test-Path "playbooks") {
    Remove-Item -Recurse "playbooks"
}
Write-Output "${ env.GITHUB_EVENT_NAME }"
Write-Output "${ env.GITHUB_ACTOR }"
Write-Output "${ env.GITHUB_HEAD_REF }"
Write-Output "${ env.GITHUB_BASE_REF }"