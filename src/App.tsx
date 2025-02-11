import '@rainbow-me/rainbowkit/styles.css'
import { createConfig, http, useConnect, WagmiProvider } from 'wagmi'
import {
  base,
  //mainnet,
  //polygon,
  //optimism,
  //arbitrum,
} from 'wagmi/chains';
import { useState, useLayoutEffect } from 'react'
import { baseSepolia, hardhat } from 'wagmi/chains'

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


import { AuthenticationStatus, ConnectButton, connectorsForWallets } from '@rainbow-me/rainbowkit'
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

//const appName = 'Common Wealth'
//const walletConnectProjectId = 'de1061f729237482ee148e50d70d2cee'

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet, rabbyWallet, walletConnectWallet, coinbaseWallet],
    },
  ],
  { appName: 'RainbowKit demo',
  projectId: 'YOUR_PROJECT_ID', },
);

const config = createConfig({
  connectors,
  chains: [baseSepolia, hardhat, base],
  transports: {
    [baseSepolia.id]: http(),
    [hardhat.id]: http(),
    [base.id]: http(),
  },
});

const queryClient = new QueryClient();

const Connectors = () => {
  const { connectors } = useConnect()

  return <>
    {
      connectors
        .filter(connector => {
          if ((connector as any).rkDetails.id === 'walletConnect') {
            return !!(connector?.rkDetails as { showQrModal?: boolean })?.showQrModal
          }
          return true;
        })
        .map((connector: any) => {
          return (
            <button key={connector.rkDetails.id} onClick={connector.connect}>
              { connector.name } { connector.rkDetails.id }
            </button>
          )
      })
    }
  </>       
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
