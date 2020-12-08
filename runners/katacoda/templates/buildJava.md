<%= text; %>

## Build the java project

<%= cdCommand; %>
 
Use the following devon command to build the java project.

`devon mvn clean install -Dmaven.test.skip=<%= skipTest; %>`{{execute}}

The maven command 'clean' will clear the target directory beforehand. 

We do not need to execute the test cases, so we can skip them by using the option '-Dmaven.test.skip=<%= skipTest; %>'.

<%= textAfter; %>