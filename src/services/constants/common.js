
import GEN_ICON from "../../Assets/Images/token_icons/Gen.svg";
import DIY_ICON from "../../Assets/Images/token_icons/diy.svg";
import TUR_ICON from "../../Assets/Images/token_icons/tur.svg";
import BUSD from "../../Assets/Images/token_icons/BUSD-Token.svg";
import WBNB from "../../Assets/Images/token_icons/WBNB-Token-Icon.svg";

export const ADDRESS = {
    ZERO: `0x${'0'.repeat(40)}`,
    ADMIN: '0x84fF670281055e51FE317c0A153AAc2D26619798',
    ADMINS: [ 
        '0x84fF670281055e51FE317c0A153AAc2D26619798',
        '0x18653A11aB0003922649dDa4A25b258831CDAe86',
    ],
    CST_TOKEN: '0xD6Fc68d2e678890cE9165781A4934c21902b34cD',
    BUSD_TOKEN: '0x83D685Ed8D7E2591c998bF2c87e01c5795Df55fd',
    WETH_TOKEN: '0x417F761CFD4031cE8897724690798778A5470E86',
    ROUTER_CONTRACT: '0x1f6FC677FD7ef2B23bbD5D0CC5280B1268323122',
    FACTORY_CONTRACT: '0x0EfAD05151EAd32ECc89BB049124c9efe18e55A5',
    CST_FAUCET_CONTRACT: '0xA189e169181b64fE5Cf152b88A455e93B5Aa5d87',
}

export const MISC = {
    MAX_256: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    BUSD_DEC: 18,
    disabled: !1,
    tokenNum1: !1,
    tokenNum2: !1,
    OTHER_TOKEN_DEC_PLACES: 4,
    MAX_RECENT_TXS: 4,
    DEF_SLIPPAGE: 7.5,
    DIV_DEC_PLACES: 10,
    CHAIN_ID: {
        BSC_TEST: 97,
        BSC_MAIN: 51,
        CRO_TEST: 338,
    },
    PVT_KEY: process.env.REACT_APP_PRIVATE_KEY,
    SWAP_DEAD_LINE: 20.0, // 20 min from now
    CONNECT_TTL: 'Connect Wallet',
    SEL_TOKEN: 'Select a token',
    APPROVAL_AMOUNT: '', 
}

export const URL = {
    CRONOS_EXPLORER_BASE: 'https://testnet.cronoscan.com',
    RPC: {
        LOCAL: 'http://localhost:8545',
        REMOTE: 'https://infura.....',
    }
}


export const VALID_CHAIN_ID = MISC.CHAIN_ID.CRO_TEST;

// export const NUM = {
//     BIG_0: BigInt(0),
//     BIG_1: BigInt(1),
//     BIG_100: BigInt(100),
//     BIG_256: BigInt('9'.repeat(256)),
// }

// all local-storage keys are kept here!
export const LS_KEYS = {
    JWT: 'jwtToken',
    WALLET_TYPE: 'wallet_type',
}

export const ERR = {
    INV_CHAIN: 'Invalid Chain!',
    NO_METAMASK: 'metamask not installed!',
    NOT_ADMIN: 'primary wallet account is not an admin!',
}

export const EVENT = {
    ACC_CHANGE: 'account_change_event',
    CHAIN_CHANGE: 'chain_change_event',
    CHECK_ALLOWANCE: 'allowance_check_event',
    SWAP_TOKEN_VAL_CHANGE: 'swap_token_value_changed',
}


export const TOKEN_LIST_STATIC = [
    {
        imported: !0,
        icon: TUR_ICON,
        sym: "TUR",
        name: 'TUR',
        bal: '0',
        dec: 18,
        disabled: !1,
        tokenNum1: !1,
        tokenNum2: !1,
        addr: '0x283260A3461A435faa5dc30cc8F3B16445eD5cc5',
    
    },
    {
        imported: !0,
        icon: DIY_ICON,
        sym: "DIY",
        name: 'DIY',
        bal: '0',
        dec: 18,
        disabled: !1,
        tokenNum1: !1,
        tokenNum2: !1,
        addr: '0x2969ff4c56D5f33A8Bf36F20150f82B2a2a1F52C',
    },
    // {
    //     imported: !0,
    //     icon: WBNB,
    //     sym: "CSTAR",
    //     name: 'crypto-star erc20 token',
    //     bal: '1934500456',
    //     dec: 18,
    // disabled: !1,
    // tokenNum1: !1,
    // tokenNum2: !1,
    //     addr: '0x83D685Ed8D7E2591c998bF2c87e01c5795Df55fd',
    // },
    // {
    //     imported: !0,
    //     icon: BUSD,
    //     sym: "BUSD",
    //     name: 'busd erc20 token',
    //     bal: '1234',
    //     dec: 18,
    // disabled: !1,
    // tokenNum1: !1,
    // tokenNum2: !1,
    //     addr: '0x627FE899085ff5F6e51A8ed50F76243C51674e01',
    // },
    // {
    //     imported: !0,
    //     icon: BUSD,
    //     sym: "CFLU",
    //     name: 'coinfluence erc20 token',
    //     bal: '5780001',
    //     dec: 18,
    // disabled: !1,
    // tokenNum1: !1,
    // tokenNum2: !1,
    //     addr: '0x018b32b3cfaA0D74953B50309f82e57B4bAEdaE2',
    // },
    // {
    //     imported: !1,     
    //     icon: WBNB,
    //     sym: "STEEP",
    //     name: 'steep labs erc20 token',
    //     bal: '740673',
    //     dec: 18,
    // disabled: !1,
    // tokenNum1: !1,
    // tokenNum2: !1,
    //     addr: '0xD24cb054d7d725cF74715671e4F4F8009BD9015f',
    // },
]

export const INIT_VAL = {
    SWAP_BTN: ['welcome', 'Swap']

}
