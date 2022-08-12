const WALLET_TYPE = {
    NONE: 'none',
    METAMASK: 'Metamask',
    TRUST_WALLET: 'TrustWallet',
    WALLET_CONNECT: 'WalletConnect',
}

const EVENT = {
    ACC_CHANGED: 'chainChanged',
    CHAIN_CHANGE: 'chainChanged',
}

const WALLET_METH = {
    REQ_ACCOUNTS: 'eth_requestAccounts',
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

export {
    CHAIN,
    EVENT,
    WALLET_METH,
    WALLET_TYPE,
    WALLET_PARAM,
}
