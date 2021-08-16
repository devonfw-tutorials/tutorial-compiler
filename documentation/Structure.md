
# Structure
 
## Repositories

    |--tutorial-compiler
    |--tutorials

# File system of the "tutorials" - repository 

    |-- tutorials
        |-- [playbook-name]
            /--index.asciidoc
            |-- images
                /--image.png
            


Write your own tutorials in "./tutorials/[playbook-name]/index.asciidoc".
You will find all the details in the tutorials [Developement](https://github.com/devonfw-tutorials/tutorials/wiki/Development) page.
The images must be saved in a folder called `images`.


# File system of the "tutorial-compiler" - repository 

## Commands

### Runners

    |-- tutorial-compiler
        |--runners
            |--[runner]
                /--index.ts

**runner**
* console
* katacoda
* vscode
* wikiConsole 
* wikiEclipse
* wikiEditor

Create your own commands as shown in tutorial-compilers's [Developement](https://github.com/devonfw-tutorials/tutorials/wiki/Development) page inside the "./index.ts"-files.

### Assertions 

    |--tutorial-compiler
        |--assertions

Add assertions by adding a new class into the "./tutorial-compiler/assertions"-folder 
Learn more about it in [Development](https://github.com/devonfw-tutorials/tutorials/wiki/Development)


## Katacoda tutorials

    |-- tutorial-compiler
        |--build
            |--output
                |--katacoda
                    |--[playbook-name]

You can find the generated katacoda tutorial inside "./tutorial-compiler/build/output/katacoda/[playbook-name]"
You can copy the whole folder and add it to your katacoda repository.

# File system inside the runners

## Working directory

**Console**
    |-- tutorial-compiler
        |--build
            |--working

**Katacoda**
    |-- root

The working directory is the start directory of each runner.  

## Workspace directory

### Workspace without devonfw IDE  
Without the devonfw IDE the workspace directory equals the working directory.

    |--[working-directory]

In [Functions](https://github.com/devonfw-tutorials/tutorial-compiler/wiki/Functions) you will find the phrase "relative to workspace", which means relative to the working directory.
You can set a new workspace with the function [changeWorkspace](https://github.com/devonfw-tutorials/tutorial-compiler/wiki/Functions).

### Workspace with devonfw IDE 

    |--[working-directory]
        |--devonfw
            |--workspaces
                |--main

The functions 
* [restoreDevonfwIde](https://github.com/devonfw-tutorials/tutorial-compiler/wiki/Functions)
* [installDevonfwIde](https://github.com/devonfw-tutorials/tutorial-compiler/wiki/Functions)

will change the workspace to the "[working-directory]/devonfw/workspaces/main".
The phrase "relative to workspace" means in this case relative to "./main"
You can set a new workspace with the function [changeWorkspace](https://github.com/devonfw-tutorials/tutorial-compiler/wiki/Functions).

### Workspace with restoreWorkspace

The function [restoreWorkspace](https://github.com/devonfw-tutorials/tutorial-compiler/wiki/Functions) will change the workspace.

#### WIthout devonfw IDE

    |--[working-directory]
        |--workspaces

The phrase "relative to workspace" means in this case relative to "./workspaces"


#### With devonfw IDE

    |--[working-directory]
        |--devonfw
            |--workspaces
                |--main

The phrase "relative to workspace" means in this case relative to "./main"