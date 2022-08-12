import { ethers } from "ethers";
import l_t from "../logging/l_t";
import log from "../logging/logger";
import { getAddress } from 'ethers/lib/utils';
import { EVENT, URL } from "../constants/common";
import { CHAIN, WALLET_METH, WALLET_PARAM, WALLET_TYPE } from "../constants/wallet";
import { notDefined, notEqual, rEqual } from "../utils";
import WalletConnectProvider from "@walletconnect/web3-provider";

let Wallet = {
    _signer: null,
    _provider: null,
    _accounts: [],
    _walletType: WALLET_TYPE.NONE,
    // getters
    get signer() {
        return this._signer;
    },
    get provider() {
        return this._provider;
    },
    get priAccount() {
        return this._accounts[0];
    },
    get walletType() {
        return this._walletType;
    },
    // external functions
    init: async function(walletType) {
        log.s('Wallet init..');
        if(notDefined(this._provider) || notEqual(this.walletType, walletType)) {
            if(rEqual(walletType, WALLET_TYPE.METAMASK)) {

                this._provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
            }
            else if(rEqual(walletType, WALLET_TYPE.WALLET_CONNECT)) {
                const wcProvider = new WalletConnectProvider({
                    rpc: {
                        [CHAIN.CRONOS_TEST.INT] : CHAIN.CRONOS_TEST.URL
                    },
                });
                // show qr-code
                await wcProvider.enable();
                this._provider = new ethers.providers.Web3Provider(wcProvider, 'any');
            }
            this._accounts = (await this.provider.send(WALLET_METH.REQ_ACCOUNTS, [])).map(a => getAddress(a));
            this._signer = await this.provider.getSigner();
            this._initEvents();
            this._walletType = walletType;
            log.s('init done', this._accounts, this.priAccount);
        } else log.i('we already have a provider!', this.provider);
        return this;
    },
    ensureChain: async function() {
        let chainId = (await this.provider.getNetwork()).chainId;
        log.i('selected chain:', chainId);
        if(chainId !== CHAIN.CRONOS_TEST.INT) {
            log.i('switching to cronos chain');
            await this.provider.send(WALLET_METH.ADD_CHAIN, [WALLET_PARAM.ADD_CHAIN]);
        }
    },
    // internal functions
    _initEvents: function() {
        this.provider.on(EVENT.CHAIN_CHANGE, async _ => {
            l_t.i('chain change event');
            await this.ensureChain();
        });
        this.provider.on(EVENT.ACC_CHANGE, _ => {
            l_t.i('account change event');
            window.dispatchEvent(new Event(EVENT.ACC_CHANGE));
        });
    }
}

export default Wallet;
