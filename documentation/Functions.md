## Functions 
The following functions are already implemented:
* installDevonIde
* installCobiGen
* createProject
* cobiGenJava

***

### installDevonIde
#### parameter
1. The tools you want to install within the devonfw ide: string array
#### example
installDevonfwIde(["java","mvn"])

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


***

### createDevon4jProject
#### parameter 
1. the project name
#### example 
createDevon4jProject("cobigenexample")

***
