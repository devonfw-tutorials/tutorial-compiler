<%= text; %>

Switch to the editor and open the file '<%= fileDir; %>'.

`<%= fileDir; %>`{{open}}

<% if(lineInsert ){ %>
A script created a placeholder in the background to insert data at a specific line number.
<% } %>

<% if(dataTarget == "replace") { %>
Replace the content of the file with the following code.
<% } else if(dataTarget == "insert") { %>
Replace the content in the file as it is shown in the following segment of code.
<% } %>

Click on 'Copy to Editor' to change it automatically.

<pre class="file" data-filename="<%= fileDir; %>" data-target="<%= dataTarget; %>" data-marker="<%= placeholder; %>">
<%= content; %></pre>

<%= textAfter; %>