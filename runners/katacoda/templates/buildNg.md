<%= text; %>

<%= cdCommand; %>

<% if(outputDir){ %>
Run ng build command to build the Angular Project to the given output directory.
`<% if(useDevonCommand){ %>devon<% } %> ng build --output-path <%= outputDir; %>`{{execute}}
<% } else { %>
Run ng build command to build the Angular Project to the output directory specified in the angular.json.
`<% if(useDevonCommand){ %>devon<% } %> ng build`{{execute}}
<% } %>  

<%= textAfter; %>