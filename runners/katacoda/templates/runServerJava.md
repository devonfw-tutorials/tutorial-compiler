Okay let's start!

First you need to clone the Jump The Queue repository. Run 

`git clone https://github.com/devonfw/jump-the-queue.git{{execute}}`

Now you need to switch to the folder you just created. 

`cd jump-the-queue`{{execute}}

After that, you have to install Maven.

Run 

`mvn install -Dmaven.test.skip=true`{{execute}}

This will take some time. Wait until you see the message "BUILD SUCCESS".

<%= cdCommand; %>

Start the server in terminal <%= terminalId; %> by running the maven command 'mvn spring-boot:run'.

`mvn spring-boot:run`{{execute T<%= terminalId; %> interrupt}}

<%= textAfter; %>