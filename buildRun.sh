tsc
cp engine/parser.def build/engine/parser.def
cp -r playbooks build
cp -r environments build
cp -r runners build
npm test
node build/engine/run.js $*