import { ethers } from "ethers";
import l_t from "../logging/l_t";
import log from "../logging/logger";
import { getAddress } from 'ethers/lib/utils';
import { EVENT, URL } from "../constants/common";
import { CHAIN, INFURA_ID, PROVIDER_EVENT, WALLET_METH, WALLET_PARAM, WALLET_TYPE } from "../constants/wallet";
import { evDispatch, notDefined, notEqual, rEqual } from "../utils";
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
    get accounts() {
        return this._accounts;
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
                this._accounts = (await this.provider.send(WALLET_METH.REQ_ACCOUNTS, [])).map(a => getAddress(a));
                this._signer = await this.provider.getSigner();
                this._initEvents(window.ethereum);
            }
            else if(rEqual(walletType, WALLET_TYPE.WALLET_CONNECT)) {
                log.i('infura id:', INFURA_ID);
                const wcProvider = new WalletConnectProvider({
                    rpc: {
                        [CHAIN.CRONOS_TEST.INT] : CHAIN.CRONOS_TEST.URL
                    },
                    infuraId: INFURA_ID,
                });
                // show qr-code
                await wcProvider.enable();
                this._provider = this._provider = new ethers.providers.Web3Provider(wcProvider, 'any');;
                this._accounts = (await this.provider.send(WALLET_METH.REQ_ACCOUNTS_INFURA, [])).map(a => getAddress(a));
                log.i('accounts:', this.accounts);
                this._initEvents(wcProvider);
            }
            log.i('ACCOUNTS:', this._accounts);
            
            this._walletType = walletType;
            log.s('init done', this._accounts, this.priAccount);
        } else log.i('we already have a provider!', this.provider);
        return this;
    },
    ensureChain: async function() {
        // debugger;
        let chainId = -1;
        if(rEqual(this.walletType, WALLET_TYPE.WALLET_CONNECT)) {
            chainId = (await this.provider.getNetwork()).chainId;
        } else {
            chainId = (await this.provider.getNetwork()).chainId;
        }
        log.i('selected chain:', chainId);
        if(chainId !== CHAIN.CRONOS_TEST.INT) {
            log.i('switching to cronos chain');
            evDispatch(EVENT.CHAIN_CHANGE, {isInvalid: !0});
            await this.provider.send(WALLET_METH.ADD_CHAIN, [WALLET_PARAM.ADD_CHAIN]);
        } else evDispatch(EVENT.CHAIN_CHANGE, {isInvalid: !1});
    },
    // internal functions
    _initEvents: function(Provider) {
        Provider.on(PROVIDER_EVENT.CHAIN_CHANGE, async _ => {
            log.i('chain change event');
            
            await this.ensureChain();
        });
        Provider.on(PROVIDER_EVENT.ACC_CHANGED, accounts => {
            log.i('account change event:', accounts);
            this._accounts = accounts;
            evDispatch(EVENT.ACC_CHANGE, {newAccount: accounts[0]});
        });
    }
}

export default Wallet;
