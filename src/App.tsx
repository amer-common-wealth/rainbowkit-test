import '@rainbow-me/rainbowkit/styles.css'
import { http, useConnect, WagmiProvider } from 'wagmi'
import { useState, 
  //useLayoutEffect
 } from 'react'
import { mainnet, sepolia, base } from 'wagmi/chains';

import { AuthenticationStatus, ConnectButton, getDefaultConfig, useConnectModal } from '@rainbow-me/rainbowkit'
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
import { coinbaseWallet, metaMaskWallet, rabbyWallet, walletConnectWallet, phantomWallet } from '@rainbow-me/rainbowkit/wallets'

//export const appName = 'Common Wealth'
//export const appName = 'Commonwealth-test'
//export const appName = 'localhost-app'
export const appName = 'vercel-test'


//const network = import.meta.env.VITE_NETWORK || 'testnet'

//export const walletConnectProjectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID
//export const walletConnectProjectId = '5c1a0b855c2a469a99514f6cc758ccd1'
//export const walletConnectProjectId = 'a7554c74977a37a57d9232369ecb89b4' // localhost
export const walletConnectProjectId = 'b699d6a1ef7321c28f4d9d1b0355df4d' // localhost-home

export const getWalletEnvironment = () => {
  const userAgent = navigator.userAgent

  // Check if inside Phantom's in-app browser
  const isInPhantomApp =
    userAgent.includes('Phantom') || (window as any)?.phantom?.ethereum?.isPhantom

  // Check if on mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent)

  return {
    isInPhantomApp,
    isMobile,
    isDesktop: !isMobile,
  }
}

// const useIsMobile = (): boolean => {
//   const [isMobile, setIsMobile] = useState(false);

//   useLayoutEffect(() => {
//     const updateSize = (): void => {
//       setIsMobile(window.innerWidth < 768);
//     };
//     window.addEventListener('resize', updateSize);
//     // updateSize();
//     return (): void => window.removeEventListener('resize', updateSize);
//   }, []);

//   return isMobile;
// };

const config = getDefaultConfig({
  appName: appName,
  projectId: walletConnectProjectId,
  chains: [base, mainnet, sepolia],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  wallets: [{
      groupName: 'Popular',
      wallets: [
        metaMaskWallet,
        coinbaseWallet,
        walletConnectWallet,
        rabbyWallet,
        phantomWallet
      ],
    }
  ],
  ssr: false
});

const queryClient = new QueryClient();

const Connectors = () => {
  return (
    <>
      {['metamask', 'coinbase', 'walletConnect', 'rabby', 'phantom'].map((connector) => {
        return <WalletButton.Custom key={connector} wallet={connector}>
          {
            ({ connect, connector: connector2 }) => (
              <button onClick={() => {
                const { isInPhantomApp } = getWalletEnvironment()
                console.log('connector2', connector2)

                if (connector2.id === 'phantom' && !isInPhantomApp) { 
                  const phantomDeepLink = `https://phantom.app/ul/browse/${encodeURIComponent(document.location.href)}?ref=${encodeURIComponent(`${document.location.href}`)}`
                  window.location.href = phantomDeepLink
                  return
                 }
                 
                connect()
              }}>{connector2.name}</button>
            )
          }
        </WalletButton.Custom>;
      })}
    </>
  )
}

const ConnectorsWagmi = () => {
  const { openConnectModal } = useConnectModal()
  const { connect } = useConnect({
    mutation: {
      onSuccess(data) {
        console.log('SUCCESS', data);
        openConnectModal?.()
      },
      onError(error) {
        console.error('ERROR', error);
      },
    }
  })
  return (
    <>
      {['metamask', 'coinbase', 'walletConnect', 'rabby'].map((key) => {
        return <WalletButton.Custom key={key} wallet={key}>
          {
            ({ connector }) => (
              <button onClick={() => {
                connect({ connector } as any)
              }}>wagmi {key}</button>
            )
          }
        </WalletButton.Custom>;
      })}
    </>
  )
}

function App() {
  //const isMobile = useIsMobile()
  const [authStatus, setAuthStatus] = useState<AuthenticationStatus>("unauthenticated");

  const authenticationAdapter = createAuthenticationAdapter({
    getNonce: async () => {
      debugger
      return "testing123456";
    },
  
    createMessage: ({ nonce, address, chainId }) => {
      debugger
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
            enabled={true}
        >
          <RainbowKitProvider>

            <p>Ranbowkit Connectors</p>
            <Connectors />
            <hr/>
            <p>Wagmi Connectors</p>
            <ConnectorsWagmi />

            <ConnectButton />
            <WalletButton wallet='metamask' />
            <WalletButton wallet='walletConnect' />
            
            
          </RainbowKitProvider>
        </RainbowKitAuthenticationProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  )
}

export default App
