const fs = require('fs')
const packageJson = require('../package.json')

console.log('Applying dependency specification')

packageJson['dependencies'] = packageJson.publishDeps.dep
packageJson['peerDependencies'] = packageJson.publishDeps.peer

delete packageJson['publishDeps']

console.log(`Applying version '${process.argv[2]}' to package.json`)

packageJson.version = process.argv[2]

fs.writeFileSync('publish/package.json', JSON.stringify(packageJson, null, 2))

console.log('Written publish package.json')

fs.copyFileSync('index.d.ts', 'publish/index.d.ts')
