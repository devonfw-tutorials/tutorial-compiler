## Functions 
The following functions are already implemented:
* [installDevonfwIde](#installDevonfwIde)
* [restoreDevonfwIde](#restoreDevonfwIde)
* [restoreWorkspace](#restoreWorkspace)
* [changeWorkspace](#changeWorkspace)
* [executeCommand](#executeCommand)
* [installCobiGen](#installCobiGen)
* [cobiGenJava](#cobiGenJava)
* [createDevon4jProject](#createDevon4jProject)
* [buildJava](#buildJava)
* [createFile](#createFile)
* [changeFile](#changeFile)
* [createFolder](#createFolder)
* [cloneRepository](#cloneRepository)
* [runServerJava](#runServerJava)
* [buildNg](#buildNg)
* [npmInstall](#npmInstall)
* [dockerCompose](#dockerCompose)
* [downloadFile](#downloadFile)
* [displayContent](#displayContent)
* [adaptTemplatesCobiGen](#adaptTemplatesCobiGen)
* [createDevon4ngProject](#createDevon4ngProject)
* [addSetupScript](#addSetupScript)

***

### installDevonfwIde <a name="installDevonfwIde"></a>
#### parameter
1. The tools you want to install within the devonfw ide: string array
2. Optional: The version of the ide to install
#### example
installDevonfwIde(["java","mvn"], "2020.08.001")

***

### restoreDevonfwIde <a name="restoreDevonfwIde"></a>
#### parameter
1. The tools you want to install within the devonfw ide: string array
2. Optional: The version of the ide to install
#### example
restoreDevonfwIde(["java","mvn"], "2020.08.001")
#### details 
In the Katacoda environment the installation of the devonfw IDE is executed in a startup script.
***

### restoreWorkspace <a name="restoreWorkspace"></a>
#### parameter
1. (Optional) Name of the workspace repository {"workspace": string} (Default is the playbook-name)

#### arguments 
**User**(Optional)
    flag: --user 
    value: GitHub-username (Default is 'devonfw-tutorials')

You can use a forked workspace-repository, if you add the username as argument. If the runner cannot find the workspace repository in the your repositories, it will use devonfw-tutorials instead. 

**Branch**(Optional)
    flag: --branch
    value: the working branch (Default is its default-branch)

You can use a different branch, if you add the working branch as argument. If the runner cannot find the branch in the cloned repository, it will use the default branch instead. 

buildRun.sh --user [username] --branch [branch]

#### example

restoreWorkspace() 
will clone "https://github.com/devonfw-tutorials/[playbook-name]" into the workspace directory.

restoreWorkspace({"workspace": [name]})
will clone "https://github.com/devonfw-tutorials/[name]" into the workspace directory.

**buildRun.sh --user [GitHub-name] --branch [branch]**
restoreWorkspace()
will run "git clone https://github.com/[GitHub-name]/[playbook-name]" and checkout in branch [branch]

#### details  
**workspace** 
    The default name of the workspace repository is a concatenation of "workspace-" and the name of your playbook-folder. 
    If you want to use another repository as workspace, you can specify the ending with {"workspace": [name]}.
    **example**
    "workspace-devon4ng" -> {"workspace" : "devon4ng"}

**local repository**
    You can use a local repository as workspace in the console environment for your tutorial. 
    Clone the forked repository next to the tutorial-compiler folder. Before cloning the GitHub repository, the console runner will always check, if there is a 'workspace-[name]'-folder next to the tutorial compiler first, and will use it instead. 

    Keep in mind, that it is a feature only implemented in the console environment. Other runners will clone the environment from GitHub.  

    |--tutorial-compiler
    |--tutorials 
    |--workspace-devon4ng

**workspace directory**

    If you call 'restoreDevonfwIde' or 'installDevonfwIde' before the 'restoreWorkspace'-function the workspace directory remains: 

        `'/root/workspaces/main'`

    If you don't call them, the workspace is changed to:

        `'/root/workspaces'`

    
Learn more about the workspace directory and working directory on [Structure](https://github.com/devonfw-tutorials/tutorial-compiler/wiki/Structure)

        
### changeWorkspace <a name="changeWorkspace"></a>
#### parameter
1. path to a new workspace (relative to working directory)
#### example 
changeWorkspace("devonfw/workspaces/project")
will set the workspace directory to "[working directory]/devonfw/workspaces/project"

Learn more about the workspace directory and working directory on [Structure](https://github.com/devonfw-tutorials/tutorial-compiler/wiki/Structure)

### executeCommand <a name="executeCommand"></a>
#### parameter 
1. The command that will be executed on Windows
2. The command that will be executed on Linux
3. Json-object with optional fields
   * (Optional) Directory where the command will be executed, if not in current directory (relative to workspace){"dir": string}
   * (Optional) Synchronous or asynchronous process. Use asynchronous when starting a server. Default is synchronous. {"asynchronous": boolean}
   * (Optional) Array of arguments {"args": string[]}
4. Assert information needed if you start a server to check server availability. Only required when you start a asynchronous server. 

#### Commands
It is needed to pass a command for Windows and also for Linux-based systems because both systems will always be tested.

##### Assertion information
startupTime = Time in seconds to wait before checking if the server is running
port: Port on which the server is running
path: The URL path on which is checked if the server is running
interval: The availability of the server is checked in the given interval
* (Required) port: will throw error if no port is given.
* (Optional) path: subpath which should be pinged, i.e: if localhost:8081/jumpthequeue should be checked path should be "jumpthequeue". DEFAULT: ""
* (Optional) interval: interval in seconds in which the server should be pinged until it is available or timeouted. DEFAULT: 5 seconds
* (Optional) startupTime: seconds until a timeout will occur and an error will be thrown. DEFAULT: 10 minutes

#### example

executeCommand("node", "node" ,{"args": ["-v"]})
Will create a command for executing node -v .

executeCommand("somePollingScript.ps1","bash somePollingScript.sh", {"dir": "data/setup","asynchronous": true, "args": ["--params 5"]})
Will create a command to execute the script in the directory with the parameter --params 5 and in a new terminal.

executeCommand("someServerScript.ps1","bash someServerScript.sh", {"asynchronous": true, "args":["-port 8080"] },{"port":8080 , "startupTime": 20, "path": "some/path/", "interval": 2})
Starting a server in a new terminal. You have to specify the port for testing, the other parameters are optional. The startupTime can specify how long the runner will wait for a response from the server process and with interval you can set the frequenzy for the server testing. The path is the subpath from your server that should be reached.


### installCobiGen <a name="installGobiGen"></a>
#### parameter
* No parameters
#### example
installCobiGen()

***

### cobiGenJava <a name="cobiGenJava"></a>
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

### createDevon4jProject <a name="createDevon4jProject"></a>
This function is used to create a [devon4j](https://github.com/devonfw/devon4j) project.
#### parameter 
This function has only one parameter.
1st parameter: 
    - **Required**
    - **Type**- String
    - **Description**- The base package name and it is of type string.
#### example 
createDevon4jProject("com.mycustomer.myapplication")
Note: 
1. This function generates command the katacoda user has to execute manually.
2. To execute this function, devonfw-ide must be installed.

***

### buildJava <a name="buildJava"></a>
#### parameter 
1. The project directory, relative to workspace.
2. (Optional) Indicator whether tests should be run. Default is false.
#### example 
buildJava("cobigenexample", true)

***

### createFile <a name="createFile"></a>
#### parameter 
1. Path of the file to be created (relative path to the workspace directory).
2. (Optional) Path of the file to get the content from. Relative to the playbook directory
#### example 
createFile("cobigenexample/core/src/main/java/com/example/application/cobigenexample/customermanagement/dataaccess/api/CustomerEntity.java", "files/CustomerEntity.java")

***

### changeFile <a name="changeFile"></a>
#### parameter 
1. Path of the file to be changed (relative path to the workspace directory)
2. 
 *  Path of the file to get the content from or a string, that should be inserted.(relative path to the playbook directory)
 * (Optional) Name of a placeholder 
 * (Optional) Line number where u want to insert your code. (Possible lines are: 1...n+1 for N = number of existing lines. File cant be empty) 
#### example 
changeFile("cobigenexample/core/src/main/java/com/example/application/cobigenexample/customermanagement/dataaccess/api/CustomerEntity.java", { "file": "files/Placeholder.java", "placeholder": "private static final long serialVersionUID = 1L;" })
#### details
##### Path of the file to get the content from or a string, that should be inserted.
If you want to add content from a file: 
{"file": "[path]"}
If you want to add a string to a file: 
{"content": "[string]"}
If you want to add different contents for the katacoda and console runner, then use the properties "fileConsole" and "fileKatacoda" or "contentConsole" and "contentKatacoda":
{"fileConsole": "[pathToConsoleFile]", "fileKatacoda": "[pathToKatacodaFile]"}
If you want to insert some content at a specific line, then use "lineNumber" and dont use a placeholder: 
{"lineNumber": "[Line]"}

example:{...,"placeholder": "private int age;"}
| Before | Content or File | After |
| --- | --- | --- |
|<p>private int age;<br><br>public String getFirstname() {<br>return firstname;<br>}<br></p>|<p>private int age;<br><br>private String company;<br>public String getCompany() {<br>return firstname;<br>}<br>public void setCompany(String company) {<br>this.company = company;<br>}</p>|<p>private int age;<br><br>private String company;<br>public String getCompany() {<br>return firstname;<br>}<br>public void setCompany(String company) {<br>this.company = company;<br><br>public String getFirstname() {<br>return firstname;<br>}<br></p>|


##### Prerequisite
The usage of the line number function requires having VSCode installed on your System. Not having VSCode installed will not create any output for Katacoda.

##### Name of the placeholder
If you want to insert content into your code between two existing lines, take the previous line as your placeholder or use the option to insert at a line number. Add your placeholder into the new file or string, otherwise it will be replaced entirely.


A placeholder is optional. If you do not define a placeholder, the content in the existing file will be simply replaced by the new content.

Please try not to use custom placeholders. Keep in mind that you might want to build the project before changing them. Custom placeholders with a comment-syntax (e.g. "//PLACEHOLDER") will be removed by the console-environment and others might cause errors.

The option to insert at a linenumber uses a placeholder inserted by a script and just adds it at the step you also insert the content. 

***

### createFolder <a name="createFolder"></a>
#### parameter 
1. Path of the folder to be created, relative to the workspace directory. Subdirectories are also created.
#### example 
createFolder("directoryPath/subDirectory")

***

### cloneRepository <a name="cloneRepository"></a>
#### parameter 
1. Path into which the repository is to be cloned, relative to workspace.
2. Git repository URL
#### example 
cloneRepository("", "https://github.com/devonfw-tutorials/tutorial-compiler.git")
Repository will be cloned directly into the workspace directory.

cloneRepository(devonfw-tutorials", "https://github.com/devonfw-tutorials/tutorial-compiler.git")
Repository will be cloned into a newly created subdirectory devonfw-tutorials.

***


### runServerJava <a name="runServerJava"></a>
#### parameter 
1. Path to the server directory within the java project.
2. Assertion information. Only needed for the console runner to check if the server was started properly.
#### example 
runServerJava("devonfw/workspaces/main/jump-the-queue/java/jtqj/server", { "startupTime": 40, "port": 8081, "path": "jumpthequeue" })

##### Assertion information
startupTime = Time in seconds to wait before checking if the server is running
port: Port on which the server is running
path: The URL path on which is checked if the server is running

If the tutorial should be tested on the console environment, you have to specify a port.
***

### npmInstall <a name="npmInstall"></a>
#### parameter 
1. Path to the project where the dependencies from the package.json file are to be installed.
2. Json-object: Name of a package, global or local installation, or array of npm arguments
* (Optional) name of a package {"name": string }
* (Optional) global or local installation. Default is local, therefore false {"global" : boolean }
* (Optional) array of npm arguments {"args": string[]}
#### example
npmInstall("jump-the-queue/angular", {"name": "@angular/cli", "global": true, "args": ["--save-dev"]})
will run 'npm install -g --save-dev @angular/cli' in the directory 'jump-the-queue/angular'.

npmInstall("my-thai-star/angular")
will run 'npm install' in the directory 'my-thai-star/angular'

***

### dockerCompose <a name="dockerCompose"></a>
#### parameter 
1. Path to the directory where the docker-compose.yml file is located, relative to workspace.
2. Assertion information. Only needed for the console runner to check if the server was started properly.
#### example 
dockerCompose("my-thai-star", { "startupTime": 600, "port": 8081, "path": "" })

##### Assertion information
startupTime = Time in seconds to wait before checking if the server is running
port: Port on which the server is running
path: The URL path on which is checked if the server is running

If the tutorial should be tested on the console environment, you have to specify a port.
***

### downloadFile <a name="downloadFile"></a>
#### parameter 
1. URL of the file to be downloaded.
2. Name of file.
3. (Optional) Downloads file to a given directory relative to workspace. Directory is created, if its not existing.
#### example 
downloadFile("https://bit.ly/2BCkFa9", "file", "downloads")

***

### buildNg <a name="buildNg"></a>
#### parameter 
1. Path to the angular project, relative to workspace
2. (Optional) Custom output directory.
#### example 
buildNg("exampleAngularProject")
Will build the angular project to default output directory defined in angular.json outputPath key, normally set to dist/.

buildNg("exampleAngularProject", "testOutput")
Will build the angular project to output directory testOutput.

***

### runClientNg <a name="runClientNg"></a>
#### parameter 
1. Path to the angular project from which the frontend server is to be started.
2. Assertion information. Only needed for the console runner to check if the server was started properly.
#### example 
runClientNg("jump-the-queue/angular", { "startupTime": 200, "port": 4200, "path": "" })

##### Assertion information
startupTime = Time in seconds to wait before checking if the server is running
port: Port on which the server is running
path: The URL path on which is checked if the server is running

If the tutorial should be tested on the console environment, you have to specify a port.
***

### displayContent <a name="displayContent"></a>
#### parameter
1. The title of the step. 
2. An array of json objects with files, content, or images to be rendered within the Katacoda step. The use for this function is to display an image and some descriptive text. No Katacoda syntax is allowed in the files or the content!
3. (Optional) Path to the current directory where the user is located (relative to the workspace directory). Only needed if the directory is changed within this step.
#### example 
display("Step title", [{ "file": "files/description.asciidoc" }, { "content": "This is just plain content." }, { "image": "files/image.png" }])

#### Details
Available attributes in the json objects:

1. file: Path to a file whose content is to be displayed in the Katacoda step (e.g. .asciidoc or .txt file). The file should be following the formating of asciidoc files. 
2. content: Plain text to be displayed in the Katacoda step. This Text should be following the formating of asciidoc files.
3. image: Path to an image to be displayed in the Katacoda step.


#### Formatting rules for content and .asciidoc or .txt files.
* You can add headers to structure your text. The generated headers are shown in the examples below. The headers should fit into the overall structure of the generated wiki so level 1 header are not allowed, but the other header can be used at your judgement.
* A list always needs an empty newline between the last row and the list.
* Use asciidoc style of links

#### examples
``` 
Existing header structure
= Level 1: tutorial title
== Level 2: subtitle
=== Level 3: prerequisites and learning goals
== Level 2: steptitle
=== Level 3: titles from functions 
==== Level 4: subtitles from functions
== Level 2: conclusion

List:
This an unordered List (The empty line is necessary)

* First Item
* Second Item

Link:
The tutorials repository can be found https://github.com/devonfw-tutorials/tutorials/issues[here].
```

***

### adaptTemplatesCobiGen <a name="adaptTemplatesCobiGen"></a>
#### parameter
* No parameters
#### example
adaptTemplatesCobiGen()

***

### createDevon4ngProject <a name="createDevon4ngProject"></a>
#### parameter 
1. Name of the Project.
2. Path to where the Project should be created (relative to workspace). Folder should exist.
3. (Optional) String array of parameters, according to https://angular.io/cli/new.
#### example 
createDevon4ngProject("exampleAngularProject", "")
Will create the angular project to the current workspace with the name exampleAngularProject.

createDevon4ngProject("exampleAngularProject", "projects", ["--verbose"])
Will create the angular project to the directory projects within the current workspace and adds more details to output logging.

#### Details
This command also works if the devonfw IDE is not installed, but then you have to make sure that the Angular cli is installed.

***

### addSetupScript <a name="addSetupScript"></a>
#### parameter
1. Path of the script (Linux). Relative to the playbook directory
2. Path of the script (Windows). Relative to the playbook directory 

#### example
addSetupScript("assets/createProjectScript.sh", "assets/createProjectScript.ps1")

***

### openFile <a name="openFile"></a>
#### parameter 
1. Path of the file to be opened (relative path to the workspace directory)

#### example 
openFile("cobigenexample/core/src/main/java/com/example/application/cobigenexample/customermanagement/dataaccess/api/CustomerEntity.java")
