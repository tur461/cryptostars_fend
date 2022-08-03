import { ethers } from "ethers";
import { EVENT, MISC, VALID_CHAIN_ID } from "../constants/common";
import log from "../logging/logger";
import l_t from "../logging/l_t";
import { getAddress } from 'ethers/lib/utils';

const Wallet = {
    M: window.ethereum,
    _signer: null,
    _provider: null,
    init: async function() {
        log.s('Wallet init..');
        if(!!!this._provider) {
            this._provider = new ethers.providers.Web3Provider(this.M, 'any');
            this._signer = this.provider.getSigner();
            this._initEvents();
            log.s('init done');
        }
        return this;
    },
    get signer() {
        log.i('get signer');
        return this._signer;
    },
    get provider() {
        log.i('get provider');
        return this._provider;
    },
    checkChain: async function() {
        let nw = await this._provider.getNetwork()
        if(nw.chainId !== VALID_CHAIN_ID) {
            l_t.e('please select cronos testnet');
            return !1;
        }
        return !0;
    },
    getPriAccount: async function() {
        let accounts = await this._provider.send('eth_requestAccounts', []);
        accounts = accounts.map(a => getAddress(a));
        return accounts[0];
    },
    _initEvents: function() {
        window.ethereum.on('chainChanged', async _ => {
            l_t.i('chain change event');
            let isValidChain = await this.checkChain();
            window.dispatchEvent(new CustomEvent(EVENT.CHAIN_CHANGE, {detail: {isValidChain}}));
        });
        window.ethereum.on('accountsChanged', _ => {
            l_t.i('account change event');
            window.dispatchEvent(new Event(EVENT.ACC_CHANGE));
        });
    }
}

export default Wallet;