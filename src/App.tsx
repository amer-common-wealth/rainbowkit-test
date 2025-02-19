import '@rainbow-me/rainbowkit/styles.css'
import { http, useConnect, WagmiProvider } from 'wagmi'
import { useState, useLayoutEffect } from 'react'
import { mainnet, sepolia } from 'wagmi/chains';

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
import { coinbaseWallet, metaMaskWallet, rabbyWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets'

//export const appName = 'Common Wealth'
//export const appName = 'Commonwealth-test'
//export const appName = 'localhost-app'
export const appName = 'vercel-test'


//const network = import.meta.env.VITE_NETWORK || 'testnet'

//export const walletConnectProjectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID
//export const walletConnectProjectId = '5c1a0b855c2a469a99514f6cc758ccd1'
//export const walletConnectProjectId = 'a7554c74977a37a57d9232369ecb89b4' // localhost
export const walletConnectProjectId = 'b699d6a1ef7321c28f4d9d1b0355df4d' // localhost-home


const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useLayoutEffect(() => {
    const updateSize = (): void => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', updateSize);
    // updateSize();
    return (): void => window.removeEventListener('resize', updateSize);
  }, []);

  return isMobile;
};

const config = getDefaultConfig({
  appName: appName,
  projectId: walletConnectProjectId,
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  wallets: [{
      groupName: 'Popular',
      wallets: [
        metaMaskWallet,
        coinbaseWallet,
        walletConnectWallet,
        rabbyWallet
      ],
    }
  ],
  ssr: false
});

const queryClient = new QueryClient();

const Connectors = () => {
  return (
    <>
      {['metamask', 'coinbase', 'walletConnect', 'rabby'].map((connector) => {
        return <WalletButton.Custom key={connector} wallet={connector}>
          {
            ({ connect }) => (
              <button onClick={connect}>{connector}</button>
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
  const isMobile = useIsMobile()
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
            enabled={isMobile}
        >
          <RainbowKitProvider>

            <Connectors />
            <hr/>
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
