import { ethers } from "ethers";
import l_t from "../logging/l_t";
import log from "../logging/logger";
import { getAddress } from 'ethers/lib/utils';
import { EVENT, URL } from "../constants/common";
import { CHAIN, WALLET_METH, WALLET_PARAM } from "../constants/wallet";

const Wallet = {
    M: window.ethereum,
    _signer: null,
    _provider: null,
    _accounts: [],
    init: async function() {
        log.s('Wallet init..');
        if(!!!this._provider) {
            this._provider = new ethers.providers.Web3Provider(this.M || URL.RPC.LOCAL, 'any');
            this._accounts = (await this.provider.send(WALLET_METH.REQ_ACCOUNTS, [])).map(a => getAddress(a));
            this._signer = await this.provider.getSigner();
            log.i('getting provider completed.', this.priAccount);
            this._initEvents();
            log.s('init done');
        }
        return this;
    },
    get signer() {
        return this._signer;
    },
    get provider() {
        return this._provider;
    },
    get priAccount() {
        return this._accounts[0];
    },
    ensureChain: async function() {
        // debugger;
        let chainId = (await this.provider.getNetwork()).chainId;
        log.i('selected chain:', chainId);
        if(chainId !== CHAIN.CRONOS_TEST.INT) {
            // l_t.e('please select cronos testnet');
            await this.provider.send(WALLET_METH.ADD_CHAIN, [WALLET_PARAM.ADD_CHAIN]);
        }
    },
    getPriAccount: async function() {
        return this.priAccount;
    },
    _initEvents: function() {
        this.provider.on(EVENT.CHAIN_CHANGE, async _ => {
            l_t.i('chain change event');
            let isValidChain = await this.checkChain();
            window.dispatchEvent(new CustomEvent(EVENT.CHAIN_CHANGE, {detail: {isValidChain}}));
        });
        this.provider.on(EVENT.ACC_CHANGE, _ => {
            l_t.i('account change event');
            window.dispatchEvent(new Event(EVENT.ACC_CHANGE));
        });
    }
}

export default Wallet;
