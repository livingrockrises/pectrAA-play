import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [status, setStatus] = useState('');
  const [currentNetwork, setCurrentNetwork] = useState('');
  const [currentChainId, setCurrentChainId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [atomicCapabilities, setAtomicCapabilities] = useState({});
  
  const [singleTx, setSingleTx] = useState({
    to: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Default to vitalik.eth address for example
    value: '0x0', // Value in hex (0 ETH)
    data: '0x00', // Empty data with one byte to satisfy regex pattern
  });
  
  const [batch, setBatch] = useState([
    {
      to: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Default to vitalik.eth address for example
      value: '0x0', // Value in hex (0 ETH)
      data: '0x00', // Empty data with one byte to satisfy regex pattern
    },
    {
      to: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Default to vitalik.eth address for example
      value: '0x0', // Value in hex (0 ETH)
      data: '0x00', // Empty data with one byte to satisfy regex pattern
    }
  ]);

  // Supported networks for atomic batch transactions according to MetaMask docs
  const supportedAtomicNetworks = {
    '0x1': 'Ethereum Mainnet',
    '0xaa36a7': 'Ethereum Sepolia',
    '0x64': 'Gnosis Mainnet',
    '0x27d8': 'Gnosis Chiado',
    '0x38': 'BNB Smart Chain'
  };

  useEffect(() => {
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
      setStatus('MetaMask is not installed. Please install MetaMask to use this app.');
      return;
    }

    // Listen for account changes
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    
    // Listen for network changes
    window.ethereum.on('chainChanged', (chainId) => {
      setCurrentChainId(chainId);
      setCurrentNetwork(getNetworkName(chainId));
      // Check capabilities when network changes
      if (account) {
        checkAtomicCapabilities(account, chainId);
      }
    });

    // Check if already connected and get current network
    checkConnection();
    checkNetwork();

    return () => {
      // Clean up event listeners
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  useEffect(() => {
    // Check capabilities when account changes
    if (account && currentChainId) {
      checkAtomicCapabilities(account, currentChainId);
    }
  }, [account, currentChainId]);

  const getNetworkName = (chainId) => {
    const networks = {
      '0x1': 'Ethereum Mainnet',
      '0x3': 'Ropsten Testnet',
      '0x4': 'Rinkeby Testnet',
      '0x5': 'Goerli Testnet',
      '0xaa36a7': 'Ethereum Sepolia',
      '0x38': 'BNB Smart Chain',
      '0x89': 'Polygon',
      '0xa86a': 'Avalanche',
      '0x64': 'Gnosis Mainnet',
      '0x27d8': 'Gnosis Chiado'
    };
    return networks[chainId] || `Chain ID: ${chainId}`;
  };

  const isAtomicSupportedNetwork = (chainId) => {
    return supportedAtomicNetworks.hasOwnProperty(chainId);
  };

  const checkNetwork = async () => {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setCurrentChainId(chainId);
      setCurrentNetwork(getNetworkName(chainId));
    } catch (error) {
      console.error('Error checking network:', error);
    }
  };

  const checkConnection = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        setStatus('Connected to MetaMask');
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setStatus(`Error: ${error.message}`);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // MetaMask is disconnected
      setIsConnected(false);
      setAccount(null);
      setStatus('Disconnected from MetaMask');
    } else {
      // MetaMask is connected with a different account
      setAccount(accounts[0]);
      setIsConnected(true);
      setStatus(`Connected to ${accounts[0]}`);
    }
  };

  const connectWallet = async () => {
    try {
      setStatus('Connecting to MetaMask...');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      setIsConnected(true);
      setStatus(`Connected to ${accounts[0]}`);
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      setStatus(`Error: ${error.message}`);
    }
  };

  const checkAtomicCapabilities = async (userAccount = account, chainId = currentChainId) => {
    if (!userAccount) {
      setStatus('Please connect to MetaMask first');
      return;
    }

    try {
      setStatus('Checking atomic capabilities...');
      
      // Get the networks to check (either current chain or all supported atomic networks)
      const chainIdsToCheck = chainId ? [chainId] : Object.keys(supportedAtomicNetworks);
      
      const capabilities = await window.ethereum.request({
        method: 'wallet_getCapabilities',
        params: [
          userAccount,
          chainIdsToCheck
        ],
      });
      
      setAtomicCapabilities(capabilities);
      console.log('Atomic capabilities:', capabilities);
      
      // Format the capabilities for display
      let statusMessage = 'Atomic capabilities retrieved:\n';
      for (const [networkId, capability] of Object.entries(capabilities)) {
        statusMessage += `\n${getNetworkName(networkId)}: `;
        if (capability.atomic) {
          statusMessage += `atomic ${capability.atomic.status}`;
        } else {
          statusMessage += 'atomic not supported';
        }
      }
      
      setStatus(statusMessage);
      return capabilities;
    } catch (error) {
      console.error('Error checking atomic capabilities:', error);
      
      // Handle unsupported method error gracefully
      if (error.code === 4200 || (error.message && error.message.includes('Unsupported Method'))) {
        setStatus('Your MetaMask version does not support atomic capabilities (wallet_getCapabilities method).');
      } else {
        setStatus(`Error checking atomic capabilities: ${error.message}`);
      }
      return null;
    }
  };
  
  const rawCapabilitiesCall = async () => {
    if (!isConnected) {
      setStatus('Please connect to MetaMask first');
      return;
    }

    try {
      setStatus('Calling wallet_getCapabilities and logging full response...');
      
      // Call without any specific chain IDs to get all supported chains
      const capabilities = await window.ethereum.request({
        method: 'wallet_getCapabilities',
        params: [account],
      });
      
      console.log('Raw wallet_getCapabilities response:', capabilities);
      
      // Log to console and display as JSON
      const jsonStr = JSON.stringify(capabilities, null, 2);
      setStatus(`Raw wallet_getCapabilities response:\n\n${jsonStr}`);
      
      return capabilities;
    } catch (error) {
      console.error('Error calling wallet_getCapabilities:', error);
      setStatus(`Error calling wallet_getCapabilities: ${error.message}`);
      return null;
    }
  };

  const handleSingleTxChange = (field, value) => {
    setSingleTx({
      ...singleTx,
      [field]: value
    });
  };

  const isValidAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const validateTransaction = (tx) => {
    if (!isValidAddress(tx.to)) {
      setStatus('Error: Invalid recipient address. Must be a valid Ethereum address (0x followed by 40 hex characters)');
      return false;
    }
    return true;
  };

  const sendSingleTransaction = async () => {
    if (!isConnected) {
      setStatus('Please connect to MetaMask first');
      return;
    }

    if (!validateTransaction(singleTx)) {
      return;
    }

    try {
      setStatus('Sending transaction...');
      const tx = {
        from: account,
        ...singleTx
      };

      console.log('Sending transaction:', tx);

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [tx],
      });

      setStatus(`Transaction sent! Hash: ${txHash}. Waiting for confirmation...`);
    } catch (error) {
      console.error('Error sending transaction:', error);
      setStatus(`Error: ${error.message}`);
    }
  };

  const sendRegularBatch = async () => {
    if (!isConnected) {
      setStatus('Please connect to MetaMask first');
      return;
    }

    // Validate each transaction
    for (let i = 0; i < batch.length; i++) {
      if (!validateTransaction(batch[i])) {
        setStatus(`Error in transaction #${i+1}: Invalid recipient address`);
        return;
      }
    }

    try {
      setStatus('Sending regular batch transactions (one at a time)...');
      
      // Send transactions one at a time using the regular method
      const txHashes = [];
      
      for (const tx of batch) {
        const params = {
          from: account,
          ...tx
        };
        
        console.log('Sending transaction:', params);
        
        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [params],
        });
        
        txHashes.push(txHash);
      }

      setStatus(`Regular batch sent! Hashes: ${JSON.stringify(txHashes)}`);
    } catch (error) {
      console.error('Error sending regular batch transactions:', error);
      setStatus(`Error: ${error.message}`);
    }
  };

  const sendAtomicBatch = async () => {
    if (!isConnected) {
      setStatus('Please connect to MetaMask first');
      return;
    }

    // Check if current network supports atomic transactions
    if (!isAtomicSupportedNetwork(currentChainId)) {
      setStatus(`Current network ${currentNetwork} (${currentChainId}) does not support atomic transactions. Supported networks: ${Object.values(supportedAtomicNetworks).join(', ')}`);
      return;
    }

    // Validate each transaction
    for (let i = 0; i < batch.length; i++) {
      if (!validateTransaction(batch[i])) {
        setStatus(`Error in transaction #${i+1}: Invalid recipient address`);
        return;
      }
    }

    try {
      setStatus('Sending atomic batch transaction...');
      
      // Create the calls array with proper format
      const calls = batch.map(tx => ({
        to: tx.to,
        value: tx.value,
        data: tx.data
      }));

      console.log('Sending atomic batch with calls:', calls);

      // Use wallet_sendCalls method for atomic batch as per EIP-5792
      const result = await window.ethereum.request({
        method: 'wallet_sendCalls',
        params: [
          {
            version: "2.0.0",
            from: account,
            chainId: currentChainId,
            atomicRequired: true,
            calls: calls
          }
        ],
      });

      console.log('Atomic batch result:', result);
      
      if (result && result.id) {
        setBatchId(result.id);
        setStatus(`Atomic batch transaction sent! Batch ID: ${result.id}`);
      } else {
        setStatus('Atomic batch transaction sent but no batch ID was returned');
      }
    } catch (error) {
      console.error('Error sending atomic batch transaction:', error);
      
      // Handle unsupported method error gracefully
      if (error.code === 4200 || (error.message && error.message.includes('Unsupported Method'))) {
        setStatus('Your MetaMask version does not support atomic batch transactions (wallet_sendCalls method).');
      } else if (error.message && error.message.includes('Account upgrade required')) {
        setStatus('Your MetaMask account needs to be upgraded to a delegator account. Please follow the MetaMask prompts to continue.');
      } else {
        setStatus(`Error sending atomic batch: ${error.message}`);
      }
    }
  };

  const checkBatchStatus = async () => {
    if (!batchId) {
      setStatus('No batch ID available. Send an atomic batch transaction first.');
      return;
    }

    try {
      setStatus(`Checking status of batch ${batchId}...`);
      
      const status = await window.ethereum.request({
        method: 'wallet_getCallsStatus',
        params: [batchId],
      });

      console.log('Batch status:', status);
      
      // Format the status for display
      if (status) {
        const statusCode = status.status || 'unknown';
        const isAtomic = status.atomic || false;
        const receiptCount = status.receipts ? status.receipts.length : 0;
        
        let statusText = `Batch ID: ${status.id || batchId}\n`;
        statusText += `Status Code: ${statusCode}\n`;
        statusText += `Executed Atomically: ${isAtomic}\n`;
        statusText += `Receipts: ${receiptCount}\n`;
        
        if (statusCode === 200) {
          statusText += 'Transaction batch confirmed!';
        } else if (statusCode === 202) {
          statusText += 'Transaction batch pending...';
        } else {
          statusText += `Transaction batch status: ${statusCode}`;
        }
        
        setStatus(statusText);
      } else {
        setStatus('No status information returned for this batch ID');
      }
    } catch (error) {
      console.error('Error checking batch status:', error);
      
      // Handle unsupported method error gracefully
      if (error.code === 4200 || (error.message && error.message.includes('Unsupported Method'))) {
        setStatus('Your MetaMask version does not support batch status checking (wallet_getCallsStatus method).');
      } else {
        setStatus(`Error checking batch status: ${error.message}`);
      }
    }
  };

  const handleBatchChange = (index, field, value) => {
    const newBatch = [...batch];
    newBatch[index][field] = value;
    setBatch(newBatch);
  };

  const addBatchItem = () => {
    setBatch([...batch, {
      to: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Default to vitalik.eth address for example
      value: '0x0', // Value in hex (0 ETH)
      data: '0x00', // Empty data with one byte to satisfy regex pattern
    }]);
  };

  const removeBatchItem = (index) => {
    const newBatch = [...batch];
    newBatch.splice(index, 1);
    setBatch(newBatch);
  };

  const showBatchHelp = () => {
    setStatus(`
Atomic Batch Transactions Help:

1. MetaMask supports atomic batch transactions on:
   - Ethereum Mainnet
   - Ethereum Sepolia
   - Gnosis Mainnet
   - Gnosis Chiado
   - BNB Smart Chain

2. Workflow:
   - First check if your account supports atomic batching with "Check Atomic Capabilities"
   - If status is "supported", your account is ready for atomic batching
   - If status is "ready", MetaMask will prompt you to upgrade to a delegator account when sending
   - If no status is returned, atomic batching is not supported for your account/network

3. The three EIP-5792 methods used are:
   - wallet_getCapabilities: Check if atomic batching is supported
   - wallet_sendCalls: Submit multiple transactions to be processed atomically
   - wallet_getCallsStatus: Track the status of your transaction batch

4. Account upgrade to delegator:
   - When requesting atomic batching, MetaMask may prompt you to upgrade your EOA to a delegator account
   - Delegator accounts are ERC-4337 smart contract accounts that support advanced features
   - This will require a transaction to deploy your delegator account
    `);
  };

  // Determine if the current network supports atomic transactions
  const isCurrentNetworkSupported = isAtomicSupportedNetwork(currentChainId);

  return (
    <div className="App">
      <header className="App-header">
        <h1>MetaMask 7702 Delegator Playground</h1>
        
        <div className="connection-container">
          <button 
            onClick={connectWallet} 
            disabled={isConnected}
            className={isConnected ? 'button-disabled' : 'button-connect'}
          >
            {isConnected ? 'Connected' : 'Connect to MetaMask'}
          </button>
          
          {isConnected && (
            <div className="account-info">
              <div><span>Connected Account: </span>
              <span className="account-address">{account}</span></div>
              <div><span>Current Network: </span>
              <span className={isCurrentNetworkSupported ? 'network-supported' : 'network-name'}>
                {currentNetwork}
                {isCurrentNetworkSupported ? ' (Supports Atomic Batching)' : ''}
              </span></div>
            </div>
          )}
        </div>

        {/* EIP-5792 Atomic Batch Testing Section */}
        <div className="eip5792-container">
          <div className="title-with-help">
            <h2>Test EIP-5792 Atomic Batch Transactions</h2>
            <button 
              onClick={showBatchHelp} 
              className="button-help"
            >
              ?
            </button>
          </div>
          
          <div className="button-group">
            <button 
              onClick={() => checkAtomicCapabilities()}
              disabled={!isConnected}
              className={!isConnected ? 'button-disabled' : 'button-check'}
            >
              Check Atomic Capabilities
            </button>
            
            <button 
              onClick={rawCapabilitiesCall}
              disabled={!isConnected}
              className={!isConnected ? 'button-disabled' : 'button-log'}
            >
              Log Raw Capabilities
            </button>
          </div>
          
          <div className="button-group">
            <button 
              onClick={sendAtomicBatch} 
              disabled={!isConnected || batch.length === 0 || !isCurrentNetworkSupported}
              className={!isConnected || batch.length === 0 || !isCurrentNetworkSupported ? 'button-disabled' : 'button-send'}
              title={!isCurrentNetworkSupported ? 'Current network does not support atomic batching' : ''}
            >
              Send Atomic Batch (wallet_sendCalls)
            </button>
          </div>
          
          <div className="button-group">
            <button 
              onClick={checkBatchStatus} 
              disabled={!batchId}
              className={!batchId ? 'button-disabled' : 'button-check'}
            >
              Check Batch Status (wallet_getCallsStatus)
            </button>
          </div>
          
          {!isCurrentNetworkSupported && isConnected && (
            <div className="network-warning">
              Current network ({currentNetwork}) does not support atomic batch transactions. 
              Please switch to one of: {Object.values(supportedAtomicNetworks).join(', ')}.
            </div>
          )}
        </div>

        <div className="transaction-container">
          <h2>Send Single Transaction</h2>
          
          <div className="form-group">
            <label>To Address:</label>
            <input
              type="text"
              value={singleTx.to}
              onChange={(e) => handleSingleTxChange('to', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Value (hex):</label>
            <input
              type="text"
              value={singleTx.value}
              onChange={(e) => handleSingleTxChange('value', e.target.value)}
            />
            <small className="tip">Use 0x0 for 0 ETH. For 0.1 ETH use 0x16345785D8A0000 (in wei)</small>
          </div>
          <div className="form-group">
            <label>Data (hex):</label>
            <input
              type="text"
              value={singleTx.data}
              onChange={(e) => handleSingleTxChange('data', e.target.value)}
            />
          </div>
          
          <button 
            onClick={sendSingleTransaction} 
            disabled={!isConnected}
            className={!isConnected ? 'button-disabled' : 'button-send'}
          >
            Send Transaction
          </button>
        </div>

        <div className="batch-container">
          <h2>Configure Batch Transactions</h2>
          
          {batch.map((tx, index) => (
            <div key={index} className="batch-item">
              <div className="form-group">
                <label>To Address:</label>
                <input
                  type="text"
                  value={tx.to}
                  onChange={(e) => handleBatchChange(index, 'to', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Value (hex):</label>
                <input
                  type="text"
                  value={tx.value}
                  onChange={(e) => handleBatchChange(index, 'value', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Data (hex):</label>
                <input
                  type="text"
                  value={tx.data}
                  onChange={(e) => handleBatchChange(index, 'data', e.target.value)}
                />
              </div>
              <button 
                onClick={() => removeBatchItem(index)} 
                className="button-remove"
              >
                Remove
              </button>
            </div>
          ))}
          
          <div className="batch-buttons">
            <button 
              onClick={addBatchItem} 
              className="button-add"
            >
              Add Transaction
            </button>
            
            <button 
              onClick={sendRegularBatch} 
              disabled={!isConnected || batch.length === 0}
              className={!isConnected || batch.length === 0 ? 'button-disabled' : 'button-send'}
            >
              Send Non-Atomic Batch
            </button>
          </div>
        </div>

        <div className="status-container">
          <h3>Status:</h3>
          <div className="status-text">{status}</div>
        </div>
      </header>
    </div>
  );
}

export default App;