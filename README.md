# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### using 5792 wallet_sendCalls atomic batching with metamak's EIP7702 support on certain networks.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## My Notes

Before
cast code 0x7306aC7A32eb690232De81a9FFB44Bb346026faB --rpc-url https://sepolia.drpc.org
0x

#### logs

Sending atomic batch with calls: 
[
    {
        "to": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        "value": "0x0",
        "data": "0x00"
    },
    {
        "to": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        "value": "0x0",
        "data": "0x00"
    }
]

Atomic batch result:
{
    "id": "0xe05070ce72ba4212ba7e20292a0be4cb"
}

Atomic batch using wallet_sendCalls
https://sepolia.etherscan.io/tx/0x601b3c6b8cb9407c86e5b2e424007acdd08eaafceea7976d97ae6c4605835472

Batch status: 
{
    "version": "2.0.0",
    "id": "0xe05070ce72ba4212ba7e20292a0be4cb",
    "chainId": "0xaa36a7",
    "atomic": true,
    "status": 200,
    "receipts": [
        {
            "blockHash": "0xe0e94f6ddd3b1a6972157032a379ba1a6ffb3bd498f43be7d16bd12f9263cd54",
            "blockNumber": "0x7e4a20",
            "gasUsed": "0xab66",
            "logs": [],
            "status": "0x1",
            "transactionHash": "0x601b3c6b8cb9407c86e5b2e424007acdd08eaafceea7976d97ae6c4605835472"
        }
    ]
}

After EOA has been upgraded to Smart Contract.

https://sepolia.etherscan.io/address/0x7306ac7a32eb690232de81a9ffb44bb346026fab#authlist7702


Now,
cast code 0x7306aC7A32eb690232De81a9FFB44Bb346026faB --rpc-url https://sepolia.drpc.org
0xef010063c0c19a282a1b52b07dd5a65b58948a07dae32b


### Metamask EIP7702 Delegator
https://sepolia.etherscan.io/address/0x63c0c19a282a1B52b07dD5a65b58948A07DAE32B#code
