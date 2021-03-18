<%= text; %>

Create the directory <%= downloadDir %> if it doesn't exist.

`mkdir -p <%= downloadDir %>`{{execute T1}}

Download a file from '<%= downloadURL %>' and save it to the specified location '<%= downloadDir %>/<%= downloadFile %>'.

`wget -c '<%= downloadURL %>' -O <%= downloadDir %>/<%= downloadFile %>`{{execute T1}}

<%= textAfter; %>