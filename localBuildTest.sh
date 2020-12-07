tsc
npm test
if [ $? -eq 1 ]; then 
    echo 'tests failed' 
    exit 1
fi