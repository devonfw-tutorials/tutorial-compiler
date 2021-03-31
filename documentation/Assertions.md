## Assertions
The following assertions are already implemented:
* directoryExist
* directoryNotEmpty
* fileExist
* fileContains
* noErrorCode
* noException
* repositoryIsClean
* serverIsReachable

***

### directoryExist
#### description
Checks if a given path leads to an existing directory.
#### parameter
1. Path as a string, which should lead to an existing directory.

***

### directoryNotEmpty
#### description
Checks if a given directory contain at least one file or subdirectory.
#### parameter
1. Path as a string of a directory.

***

### fileExist
#### description
Checks if a given path leads to an existing file.
#### parameter
1. Path as a string

***

### fileContains
#### description
Checks if content is included in a file
#### parameter
1. Path of a file as a string.
2. Content as a string.

***

### noErrorCode
#### description
Checks if the given RunResult has an returnCode of 0 otherwise throwing Error.
#### parameter
1. RunResult

***

### noException
#### description
Checks if the given RunResult's exception Array is empty otherwise throwing Error.
#### parameter
1. RunResult

***

### repositoryIsClean
#### description
Checks if the given directory is a git repository and is clean, meaning there are no uncommited changes.
#### parameter
1. Path of a directory as a string.

***

### serverIsReachable
#### description
Checks if a server is available on localhost.
#### parameter
1. Object including custom parameters
* (Required) port: will throw error if no port is given.
* (Optional) path: subpath which should be pinged, i.e: if localhost:8081/jumpthequeue should be checked path should be "jumpthequeue". DEFAULT: ""
* (Optional) interval: interval in seconds in which the server should be pinged until it is available or timeouted. DEFAULT: 5 seconds
* (Optional) startupTime: seconds until a timeout will occur and an error will be thrown. DEFAULT: 10 minutes
* (Optional) requirePath: boolean to decide if a path is required or optional. DEFAULT: false
* (Optional) command: Name of the currently executed command to give custom error message.
#### example
serverIsReachable({startupTime: 180, port: 8081, requirePath: true, path: "jumpthequeue")

***