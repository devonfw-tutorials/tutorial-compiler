# **General**
* I kept the name of my tutorial short. For a small explanation of my tutorial, I used sub-topics.
* I described what I wanted to train in a few words and clearly state the objective of my tutorial. This should give the reader an idea of what to expect from my tutorial and help them to determine if they really want to learn this topic.
* I addressed the user directly.
* I was clear and concise in my writing. 
* I provided links for further related topics.
* I did not just copy and paste the documentation into a tutorial. I broke down the information into smaller and more simple packages.
* I want to teach something. Therefore, I did not just write down the steps and results but explained why this step was necessary.
* I rather made many small steps than a few big steps.
* I used images and code examples in my tutorial which were provided in the devonfw documentation. Plain text gets boring after time.
* I used an organized structure in my tutorial.
* All the things that the user should do actively, I have always written with function calls and steps . I have not given any instructions for action in text form.
* I proofread my tutorial:
     1. Are the steps available and in the correct order? 
     1. Are there any spelling mistakes? 
     1. Does everything make sense?
* I ran through the latest update of my tutorial in Katacoda-Dev and checked if everything was working as intended BEFORE requesting a review.

# **Technical**
* The files that were used in `nextKatacodaStep `are available in `.asciidoc` files and do not contain Katacoda Syntax. `nextKatacodaStep` should not be used.
* Commands like `--- cd devonfw {{execute T1}} ---` should not be used, as it could break certain functions.

# Different types of tutorials
* “Learning”: The user gets a detailed explanation of certain code/feature/functionality.
* “Quick Start”: Implementing code/feature without comprehensive explanation
* “Try Out”: The user gets a working sample project (like MyThaiStar), suitable for showcasing functionalities and ease of use.

# **Additional things to consider**

### Only for Learning-tutorials:

* I provided a detailed explanation of the topic in a way, that everybody can understand it.
* I used more theory and less practice.

### Only for Quick Start-tutorials:

* I implemented a certain functionality straightforward without any comprehensive explanation.
* I emphasized practice, and used less theory.
* I only provided the information which is really needed to understand what I did in the tutorial. 
* For comprehensive explanation of the everything what I have done in the tutorial, I provide links to either the devonfw documentation or the specific Learning-tutorial of the topic (if there is any).

### Only for Try Out-tutorials:

* I wanted to showcase a certain sample project/feature and its capabilities in a fast and straightforward way to the reader. Example: Tutorial for launching MyThaiStar, so the reader can click through it, and see what is possible.
* I provided little explanation of the things done in the tutorial.
