## How to run QA's automated tests

###### EVM RPC Tests:

- First install all dependencies with:

`npm install`

- Export the following env variable with the url under test (is currently overridden in the npm test task in the package.json file):

`export  EVM_RPC_URL=https://blast.io/jsonrpc`

- Run the tests specified at the path in the package.json test task

`npm run test`
