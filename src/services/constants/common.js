
import GEN_ICON from "../../Assets/Images/token_icons/Gen.svg";
import DIY_ICON from "../../Assets/Images/token_icons/diy.svg";
import TUR_ICON from "../../Assets/Images/token_icons/tur.svg";
import CST_ICON from "../../Assets/Images/token_icons/cst.png";
import BUSD_ICON from "../../Assets/Images/token_icons/BUSD-Token.svg";
import WBNB_ICON from "../../Assets/Images/token_icons/WBNB-Token-Icon.svg";

export const ADDRESS = {
    ZERO: `0x${'0'.repeat(40)}`,
    ADMIN: '0x84fF670281055e51FE317c0A153AAc2D26619798',
    ADMINS: [ 
        '0x84fF670281055e51FE317c0A153AAc2D26619798',
        '0x18653A11aB0003922649dDa4A25b258831CDAe86',
    ],
    CST_TOKEN: '0xD6Fc68d2e678890cE9165781A4934c21902b34cD',
    BUSD_TOKEN: '0x83D685Ed8D7E2591c998bF2c87e01c5795Df55fd',
    WETH_TOKEN: '0x38d54041a54ccfec71b0747f58cb6dacd88aee58',
    ROUTER_CONTRACT: '0x416E6daB641028ABa1B2730C2620ef933e586c2d',
    FACTORY_CONTRACT: '0x729a51708A550a22e89Ad64AfD26B5B1104504AC',
    CST_FAUCET_CONTRACT: '0xA189e169181b64fE5Cf152b88A455e93B5Aa5d87',
}

export const MISC = {
    CHAIN_ID: {
        BSC_TEST: 97,
        BSC_MAIN: 51,
        CRO_TEST: 338,
    },
    DEF_TOKEN: {
        DEC: 18,
        SYM: 'CST',
        ICON: CST_ICON,
        NAME: 'crypto-star erc20 token',
        ADDR: '0xD6Fc68d2e678890cE9165781A4934c21902b34cD',
    },
    BUSD_DEC: 18,
    disabled: !1,
    tokenNum1: !1,
    tokenNum2: !1,
    MAX_RECENT_TXS: 4,
    DEF_SLIPPAGE: 7.5,
    DIV_DEC_PLACES: 10,
    APPROVAL_AMOUNT: '', 
    DEBOUNCE_DELAY: 50, // ms
    SWAP_DEAD_LINE: 20.0, // 20 min from now
    PROJECT_ID: 'front_end',
    SEL_TOKEN: 'Select a token',
    OTHER_TOKEN_DEC_PLACES: 4,
    XCHANGE_PRICE_DEC_PLACES: 4,
    CONNECT_TTL: 'Connect Wallet',
    NET_STATUS_CHECK_DELAY: 2200, // ms
    RETRIEVE_TOKEN_LIST_REQ_DELAY: 5 * 1000, // ms
    PVT_KEY: process.env.REACT_APP_PRIVATE_KEY,
    MAX_256: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
}

export const URL = {
    API_BACKEND_URL: 'https://admin-staging.crypto-stars.net',
    RPC: {
        LOCAL: 'http://localhost:8545',
        REMOTE: 'https://infura.....',
    },
    NET_STATUS: 'https://776a-14-97-28-150.ngrok.io/internet_check.html', // for non-localhost use https://www.google.com
    CRONOS_EXPLORER_BASE: 'https://testnet.cronoscan.com',
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
    TOKEN_LIST: 'token_list',
    EXACT_IN: 'is_exact_in',
    WALLET_TYPE: 'wallet_type',
    SHOW_BAL_1: 'show_balance_1',
    SHOW_BAL_2: 'show_balance_2',
    PROJECT_VERSION: 'project_version',
}

export const ERR = {
    SELECT_TOKEN_1: 'Please select token 1',
    SELECT_TOKEN_2: 'Please select token 2',
    CONNECT_WALLET: 'Please connect wallet first',
    NO_INPUT: 'no input!',
    INTERNAL: 'internal error!',
    APPROVE: 'Approve ',
    POOL_NOT_EXIST: 'pool not exist',
    LOW_BAL_FOR: 'Insufficient balance for ',
    INV_CHAIN: 'Invalid Chain!',
    NO_METAMASK: 'metamask not installed!',
    NOT_ADMIN: 'primary wallet account is not an admin!',
}

export const EVENT = {
    MOUSE_SCROLL: 'wheel',
    TOKEN_SELECTION: 'token_selected',
    ACC_CHANGE: 'account_change_event',
    CHAIN_CHANGE: 'chain_change_event',
    NET_STATUS: 'internet_status_change',
    CHECK_ALLOWANCE: 'allowance_check_event',
    SWAP_TOKEN_VAL_CHANGE: 'swap_token_value_changed',
}

export const REGEX = {
    NUMERIC: /^[0-9]*(\.[0-9]*)?$/,
}

export const DEBOUNCE_ID = {
    IP_A: 'input_1',
    IP_B: 'input_2',
    UPSIDE_DOWN: 'upside-down',
}

export const TOKEN = {
    A: 1,
    B: 2,
    BOTH: 0,
}

const initVal = {
    ui: '0',
    actual: '0',
}

export const TOKEN_INIT = {
    VAL: _ => Object.assign({}, initVal),
    BAL: _ => Object.assign({}, initVal),
}


export const TOKEN_LIST_STATIC = [
    {
        imported: !0,
        icon: CST_ICON,
        sym: "CST",
        name: 'crypto-star erc20 token',
        bal: '1934500456',
        dec: 18,
        disabled: !1,
        tokenNum1: !1,
        tokenNum2: !1,
        addr: '0xD6Fc68d2e678890cE9165781A4934c21902b34cD',
    },
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
    // {
    //     imported: !0,
    //     icon: DIY_ICON,
    //     sym: "DIY",
    //     name: 'DIY',
    //     bal: '0',
    //     dec: 18,
    //     disabled: !1,
    //     tokenNum1: !1,
    //     tokenNum2: !1,
    //     addr: '0x2969ff4c56D5f33A8Bf36F20150f82B2a2a1F52C',
    // },
    // {
    //     imported: !0,
    //     icon: GEN_ICON,
    //     sym: "DT",
    //     name: 'DemoToken erc20 token',
    //     bal: '1234',
    //     dec: 18,
    //     disabled: !1,
    //     tokenNum1: !1,
    //     tokenNum2: !1,
    //     addr: '0xEFcA1aD4445cfBe4a3521e0a8e0572Fb5905DfA4',
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
