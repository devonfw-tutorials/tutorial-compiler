# Development

In this section we will describe how you can implement your own tutorials.

### How to create a playbook
The playbooks for the tutorial-compiler are contained in the tutorials repository. There you will find a description of how to create your own playbook.
https://github.com/devonfw-forge/tutorials/wiki/Development

### How to create your own command
To create a new command you can use in your playbooks, you have to implement a new function for this command in all runner class you want to support this command. If you want to use the command only in katacoda tutorials for example, you have to implement the function only in the katacoda runner class.

The new method must match the following syntax: 'run' + name of the command. The first letter after 'run' has to be in upper case letters.
```
runYourCommand(step: Step, command: Command): RunResult {
    ...your code...
    let result = new RunResult();
    result.returnCode = 1;
    return result;
}
```
With the RunResult object you can return a value after the function has executed. You can check this result in an assertion function and verify if the method has executed properly.

The assert method has to match the same naming conventions as the run method (except the 'assert' at the beginning) and is located in the same runner class. The RunResult object of the run method is passed to this method as a parameter. 
```
async assertYourCommand(step: Step, command: Command, result: RunResult) {
    new Assertions()
        .yourFirstAssertion(result)
        .yourSecondAssertion(result);
}
```
You can use multiple assertions to check the result. How you create such a assertion is described in the section below.

### How to create an assertion

Assertions are implemented in the 'assertions' folder of the tutorial-compiler directory. To implement a new assertion create a new typescript file with the name of your assertion in this directory.

Inside the new typescript file create a new class. The class has to to implement a static 'run' method as shown below. In this method you can check whatever you want.
```
export class YourAssertionCode {
    public static run(): void {
        ...your code goes here...
        if(somethingIsWrong){
            throw new Error("Your error message");
        }
    }
}
```

After this you have to add the newly created assertion to the Assertion class of the index.ts file. This file is located in the same directory.
```
public yourAssertionCode(): Assertions {
        YourAssertion.run();
        return this;
    }
```
If you want to pass arguments to this method, you have to do this in the header of the 'run' method and in the call of the method.

## Choose the tutorial and the environment

### Environment 
flag: '-e'
value: 'katacoda', 'console'
    
If you don't pass arguments to the file, it will run all environments.

#### example 
'bash localBuildRun.sh -e katacoda -e console'

### Playbook 
flag: '-p'
value: foldername of the tutorial 

'bash localBuildRun.sh -p cobigen-cli'


