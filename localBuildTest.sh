tsc
npm test
if [ $? -eq 1 ]; then 
    echo 'tests failed' 
fi