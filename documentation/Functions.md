## Functions 
The following functions are already implemented:
* installDevonIde
* installCobiGen
* createProject
* cobiGenJava

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
