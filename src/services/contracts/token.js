import { ethers } from "ethers"
import { ABI } from "../constants/abi"
import { ADDRESS } from "../constants/common"
import { METH } from "../constants/contracts";
import log from "../logging/logger";
import Wallet from "../wallet";
import CommonF from "./common";

const TokenContract = {
    _address: null,
    get contract() {
        Wallet.init();
        return new ethers.Contract(
            this._address, 
            ABI.Token,
            Wallet.provider
        );
    },
    get iface() {
        return new ethers.utils.Interface(ABI.Token);
    },
    init: function(addr) {
        this._address = addr;
        return this;
    },
    bytecode: function(meth, values) {
        return this.iface.encodeFunctionData(meth, values);
    },
    approve: function(amount, spender) {
        let txObj = {
            from: CommonF.from, to: this._address,
            data: this.bytecode(METH.ERC20.APPROVE, [spender, amount])
        }
        return CommonF.sendTx(txObj);
    },
    name: function() {
        return this.contract.name();
    },
    symbol: function() {
        return this.contract.symbol();
    },
    decimals: function() {
        return this.contract.decimals();
    },
    balanceOf: function(addr) {
        return this.contract[METH.ERC20.BAL](addr);
    },
    allowance: function(owner, spender) {
        return this.contract[METH.ERC20.ALLOWANCE](owner, spender);
    }
    
}

export default TokenContract;