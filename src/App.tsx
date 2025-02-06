import '@rainbow-me/rainbowkit/styles.css'
import { WagmiProvider } from 'wagmi'
import {
  base,
  mainnet,
  polygon,
  optimism,
  arbitrum,
} from 'wagmi/chains';
import { useState } from 'react'

import { AuthenticationStatus, ConnectButton, getDefaultConfig } from '@rainbow-me/rainbowkit'
import {
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
//import { signMessage } from '@wagmi/core'
//import { getNonceMessage } from '@utils'
import { createSiweMessage } from 'viem/siwe';
import './App.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WalletButton } from '@rainbow-me/rainbowkit';

//const appName = 'Common Wealth'
//const walletConnectProjectId = 'de1061f729237482ee148e50d70d2cee'

const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: 'YOUR_PROJECT_ID',
  chains: [mainnet, polygon, optimism, arbitrum, base],
});

const queryClient = new QueryClient();

function App() {
  const [authStatus, setAuthStatus] = useState<AuthenticationStatus>("unauthenticated");

  const authenticationAdapter = createAuthenticationAdapter({
    getNonce: async () => {
      return "testing123456";
    },
  
    createMessage: ({ nonce, address, chainId }) => {
      console.log('here', nonce, address, chainId)
      return createSiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in with Ethereum to the app.',
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce,
      });
    },
  
    verify: async () => {
      setAuthStatus("authenticated");
      return true;
    },
  
    signOut: async () => {
      console.log('login')
    },
  });

  return (
    <>
      <WagmiProvider config={config} reconnectOnMount>
        <QueryClientProvider client={queryClient}>
        <RainbowKitAuthenticationProvider
            adapter={authenticationAdapter}
            status={authStatus}
        >
          <RainbowKitProvider>
            <ConnectButton />
            <WalletButton wallet='metamask' />
          </RainbowKitProvider>
        </RainbowKitAuthenticationProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  )
}

export default App
