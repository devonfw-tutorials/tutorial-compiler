<%= text; %>

If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p <%= filePath; %>`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'<%= fileName; %>' will be created automatically inside the newly created folder.

<pre class="file" data-filename="<%= fileDir; %>">
<%= content; %>
</pre>

<%= textAfter; %>