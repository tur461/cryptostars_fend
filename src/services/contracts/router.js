import { ethers } from "ethers"
import { ABI } from "../constants/abi"
import { ADDRESS } from "../constants/common"
import { METH } from "../constants/contracts";
import log from "../logging/logger";
import Wallet from "../wallet";

import CommonF from "./common";

const RouterContract = {
    get contract() {
        Wallet.init();
        return new ethers.Contract(
            ADDRESS.ROUTER_CONTRACT, 
            ABI.RouterContract,
            Wallet.provider
        );
    },
    get iface() {
        return new ethers.utils.Interface(ABI.RouterContract);
    },
    bytecode: function(meth, values) {
        return this.iface.encodeFunctionData(meth, values);
    },
    getAmountsIn: function(params) {
        return this.contract[METH.ROUTER_CONTRACT.AMOUNTS_IN](...params);
    },
    getAmountsOut: function(params) {
        return this.contract[METH.ROUTER_CONTRACT.AMOUNTS_OUT](...params);
    },
    swapTokensForExactTokens: async function(params) {
        let txObj = {
            from: CommonF.from, to: ADDRESS.ROUTER_CONTRACT,
            data: this.bytecode(METH.ROUTER_CONTRACT.SWAP_TKN_XACT_TKN, [...params])
        }
        return CommonF.sendTx(txObj);
    },
    swapExactTokensForTokens: function(params) {
        let txObj = {
            from: CommonF.from, to: ADDRESS.ROUTER_CONTRACT,
            data: this.bytecode(METH.ROUTER_CONTRACT.SWAP_XACT_TKN_TKN, [...params])
        }
        return CommonF.sendTx(txObj);
    },
    swap_TT: function(params, isTokenAExact) {
        log.i('swap_TT called with:', params, isTokenAExact);
        return isTokenAExact ? 
            this.swapExactTokensForTokens(params) :
            this.swapTokensForExactTokens(params);
    },
    addLiquidity: function(params) {
        let txObj = {
            from: CommonF.from, to: ADDRESS.ROUTER_CONTRACT,
            data: this.bytecode(METH.ROUTER_CONTRACT.ADD_LIQ, [...params])
        }
        return CommonF.sendTx(txObj);
    }
}

export default RouterContract;