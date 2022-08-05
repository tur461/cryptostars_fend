const WALLET_TYPE = {
    METAMASK: 'Metamask',
    TRUST_WALLET: 'TrustWallet',
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
