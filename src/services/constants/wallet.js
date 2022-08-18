const WALLET_TYPE = {
    NONE: 'none',
    METAMASK: 'Metamask',
    TRUST_WALLET: 'TrustWallet',
    WALLET_CONNECT: 'WalletConnect',
}

const PROVIDER_EVENT = {
    ACC_CHANGED: 'accountsChanged',
    CHAIN_CHANGE: 'chainChanged',
}

const WALLET_METH = {
    REQ_ACCOUNTS: 'eth_requestAccounts',
    REQ_ACCOUNTS_INFURA: 'eth_accounts',
    ADD_CHAIN: 'wallet_addEthereumChain',
    SWITCH_CHAIN: 'wallet_switchEthereumChain',
}


const CHAIN = {
    CRONOS_TEST: {
        INT: 338,
        HEX: '0x152',
        NAME: 'Cronos Testnet',
        URL: 'https://cronos-testnet-3.crypto.org:8545/'
    },
    CRONOS_MAIN: {
        INT: 338,
        HEX: '0x152',
        NAME: 'Cronos Mainnet',
    } 
}

const WALLET_PARAM = {
    ADD_CHAIN: {
        "chainId": CHAIN.CRONOS_TEST.HEX,
        "chainName": "Cronos Testnet",
        "rpcUrls": ['https://evm-t3.cronos.org'],
        "blockExplorerUrls": ['https://testnet.cronoscan.com/']
    }
}

const INFURA_ID = 'e9ef53e4b59f472b892524a49146d3b1';

export {
    CHAIN,
    INFURA_ID,
    WALLET_METH,
    WALLET_TYPE,
    WALLET_PARAM,
    PROVIDER_EVENT,
}
