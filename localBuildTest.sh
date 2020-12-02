tsc
cp engine/parser.def build/engine/parser.def
cp -r ../tutorials build/playbooks
cp -r environments build
cp -r runners build
npm test
