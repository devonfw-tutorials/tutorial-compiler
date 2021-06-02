# Tutorials

In this section we will describe how you can implement your own tutorials.

### How to create a playbook
Every tutorial has three main parts
* title
* a description of the tutorial. Here you should tell the user what he is going to learn in this tutorial.
* at least one step
Additionally, there are optional parts
* a subtitle
* a conclusion of the tutorial. This will be shown at the last page and can be used to summarize the learned, to foreshadow the next steps on the learning path or to mention useful sources.

The tutorials are written in asciidoc files. 
To create a tutorial you have to create a new folder for your tutorial. In this new folder you have to create a file called index.asciidoc

The three main parts and the optional parts of the tutorial will be written in this file. Put the title of the tutorial in the first line:
```
= Title
```

Optionally, you can add a subtitle for the tutorial in the second line:
```
== Subtitle
```
This should be a short description of the tutorial, which is shown together with the title on the overview page.

In the next lines, you have to provide the description of the tutorial surrounded by ```====```.

```
====
Description of the tutorial

## Prerequisites
* First prerequisite
* Second prerequisite 

## Learning goals
Describe in few words what the user is going to learn in this tutorial.

Some additional text...
====
```
The description must contain a '## Prerequisites' and a '## Learning goals' part. Otherwise pull requests will be automatically rejected by the GitHub action.


The description is followed by the steps. Every step has
* an explanation
* a function to execute (see the function list in this wiki)
* and an optional explanation of the results of the step.

The easiest is a step without the optional explanation of the results of the step. This step is created by the following syntax block

```
The explanation for the step
[step]
--
functionName(parameters)
--
```

If you want to explain the results to the user use the following syntax block with the surrounding ```====```:

```
====
The explanation for the step
[step]
--
functionName(parameters)
--
The explanation of the results
====
```

You can also use mutliple functions in one step, so that they are show on one katacoda tutorial page.

```
The explanation for the step
[step]
--
functionName1(parameters)
functionName2(parameters)
--
```
For this it's helpful to set a custom title for the page, to sum up all included functions in the step. Otherwise the headline  of the first function is used. But this also works with only one function.

```
The explanation for the step
[step]
== Custom Title for the step
--
functionName1(parameters)
functionName2(parameters)
--
```

You can also add an optional conclusion text, which is shown on completion of the tutorial. Use this to summarize the important content of the tutorial, to point out what to learn next or to mention other useful informations.

To do that, you have to provide the conclusion at the end of the tutorial (after the last step) surrounded by ```====```.

```
====
Conclusion of the tutorial
====
```


These blocks are combined to a complete tutorial.

```
= Title
== Subtitle
====
Description of the tutorial
====

The explanation for the step 1
[step]
--
functionName1(parameters)
--

The explanation for the step 2
[step]
--
functionName2(parameters)
--

====
The explanation for the step 3
[step]
--
functionName3(parameters)
--
The explanation of the results
====

The explanation for the step 4
[step]
== Custom Title for step 4
--
functionName4a(parameters)
functionName4b(parameters)
--

====
The explanation for the step 5
[step]
== Custom Title for step 5
--
functionName5(parameters)
--
The explanation of the results
====

====
Conclusion of the tutorial
====
```

### Generate the tutorial
The easiest way to generate the tutorial is to create a pull request with your playbook in the tutorials repository. To do this, you need to fork this repository. The playbook in your pull request will be build automatically and published to https://katacoda.com/devonfw-dev.<br>
A tutorial which explains this process is available on the devonfw katacoda account (https://katacoda.com/devonfw/scenarios/tutorial-compiler).

In advanced cases and for troubleshooting you can run the build on your local maschine. The generation of the tutorial is done by the tutorial-compiler (https://github.com/devonfw-tutorials/tutorial-compiler). You can find a description how to set up the compiler on your local machine in the tutorial-compiler repository.<br>
https://github.com/devonfw-tutorials/tutorial-compiler/wiki/Setup<br>

### How to create a course 
A course is created by a ```[course-folder-name]-pathway.json``` file. 

```
{
    "title": "[Course-Name]",
    "description": "[Course-Description]",
    "icon": "fa-katacoda",
    "courses": 
    [
      {
        "course_id": "[playbook-folder-name-1]",
        "title": "[playbook title]",
        "description": "[playbook description]"
      },
      {
        "course_id": "[playbook-folder-name-2]",
        "title": "[playbook title 2]"
      }
    ]
  }

``` 

The course will be generated automatically in the katacoda-scenario repository.