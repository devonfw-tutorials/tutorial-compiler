## Functions 
The following functions are already implemented:
* installDevonIde
* installCobiGen
* cobiGenJava
* createDevon4jProject
* buildJava
* createFile

***

### installDevonfwIde
#### parameter
1. The tools you want to install within the devonfw ide: string array
2. Optional: The version of the ide to install
#### example
installDevonfwIde(["java","mvn"], "2020.08.001")

***

### installCobiGen
#### parameter
* No parameters
#### example
installCobiGen()

***

### cobiGenJava
#### parameter
1. The path to the java file you want to generate code for: string
2. The numbers that represent the templates that CobiGen uses to generate code: int array
#### example
cobiGenJava("path/to/java/file/MyEntity.java",[1,3,5,6,8])
### details
| Number | Description |
| --- | -- |
| 1 | CRUD logic: Generates the logic layer and implementations for some use cases.|
| 3 | CRUD REST services: Generates the service layer with CRUD operations for using in REST services.|
| 5 | TO's: Generates the related Transfer Objects.|
| 6 | Entity infrastructure: Creates the entity main interface and edits (by a merge) the current entity to extend the newly generated classes.|
| 8 | CRUD SpringData Repository: Generates the entity repository (that contains the CRUD operations) in the data access layer.

***

### createDevon4jProject
#### parameter 
1. The project name
#### example 
createDevon4jProject("cobigenexample")

***

### buildJava
#### parameter 
1. The project directory
2. Indicator whether tests should be run
#### example 
buildJava("cobigenexample", true)

***

### createFile
#### parameter 
1. Path of the file to be created (relative path to the workspace directory)
2. (Optional) Path of the file to get the content from. Relative to the playbook directory
#### example 
createFile("cobigenexample/core/src/main/java/com/example/application/cobigenexample/customermanagement/dataaccess/api/CustomerEntity.java", "files/CustomerEntity.java")

***

### changeFile
#### parameter 
1. Path of the file to be changed (relative path to the workspace directory)
2. Name of the placeholder
3. Path of the file to get the content from or a string, that should be inserted.
#### example 
changeFile("cobigenexample/core/src/main/java/com/example/application/cobigenexample/customermanagement/dataaccess/api/CustomerEntity.java", "//PLACEHOLDER-GETTER-SETTER", {"file": "files/CustomerEntityFunction.java"})
#### details
##### Name of the placeholder
Naming Convention
[Comment-Syntax]PLACEHOLDER-[DESCRIPTION]
##### Path of the file to get the content from or a string, that should be inserted.
If you want to add content from a file: 
{"file": "[path]"}
If you want to add a string to a file: 
{"content": "[string]"}

***