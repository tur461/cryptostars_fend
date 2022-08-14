import { useState } from "react";
import { Err } from "../../../services/xtras";
import l_t from "../../../services/logging/l_t";
import log from "../../../services/logging/logger";
import toast from "../../../services/logging/toast";
import { useDispatch, useSelector } from "react-redux";
import PairContract from "../../../services/contracts/pair";
import TokenContract from "../../../services/contracts/token";
import FaucetContract from "../../../services/contracts/faucet";
import RouterContract from "../../../services/contracts/router";
import FactoryContract from "../../../services/contracts/factory";
import GEN_ICON from "../../../Assets/Images/token_icons/Gen.svg";
import { ADDRESS, INIT_VAL, MISC } from "../../../services/constants/common";
import { getDeadline, getThresholdAmountFromTolerance } from "../../../services/contracts/utils";
import { addToTokenList, changeTokenList, saveTxHash, setTokenInfo, setTokenValue } from "../swap";
import { isAddr, isInvalidNumeric, notEmpty, rEqual, stdRaiseBy, toBigNum, toDec, toFixed, toStd } from "../../../services/utils";

const useSwap = props => {
		const dispatch = useDispatch();

    const swap = useSelector(s => s.swap);
    const wallet = useSelector(s => s.wallet);  
		
		const [pair, setPair] = useState([]);
		const [isErr, setIsErr] = useState(!1);
		const [errText, setErrText] = useState('');
		const [amountIn, setAmountIn] = useState('0');
		const [isExactIn, setIsExactIn] = useState('0');
		const [isDisabled, setIsDisabled] = useState(!0);
		const [isFetching, setIsFetching] = useState(!1);
		const [isCSTClaimed, setIsCSTClaimed] = useState(!1);
		const [tokenApproved, setTokenApproved] = useState(!0);
		const [thresholdAmount, setThresholdAmount] = useState('0');
		const [btnText, setBtnText] = useState(INIT_VAL.SWAP_BTN[0]);
		const [xchangeEquivalent, setXchangeEquivalent] = useState('0');


    async function approveWithMaxAmount(e) {
			log.i('approving..')
			e.preventDefault();
			TokenContract.init(swap.token1_addr);
			setIsFetching(!0);
			await TokenContract.approve(MISC.MAX_256, ADDRESS.ROUTER_CONTRACT);
			setIsErr(!1);
			setIsFetching(!1);
			setTokenApproved(!0);
		}
	
		function resetStates() {
			setTokenApproved(!0);
			setIsDisabled(!0);
			// setBtnText('Swap');
			// dispatch(setTokenValue({v: '', n: 0}));
		}
		// assumes Center Token is CST token
		async function tryNormalizePair(p) {
			let pAddr = await FactoryContract.getPair(p[0], p[1]);
			if(pAddr !== ADDRESS.ZERO) return p;
			else
			if(p[0] === ADDRESS.CST_TOKEN || p[1] === ADDRESS.CST_TOKEN){
				Err.handle(new Error('error: token pair doesn\'t exist!'));
				return [];
			}
			else {
				pAddr = await FactoryContract.getPair(p[0], ADDRESS.CST_TOKEN);
				let pAddr2 = await FactoryContract.getPair(p[1], ADDRESS.CST_TOKEN);
				if(pAddr !== ADDRESS.ZERO && pAddr2 !== ADDRESS.ZERO) return [p[0], ADDRESS.CST_TOKEN, p[1]];
			}
			setIsFetching(!1);
			throw new Error('"error: pair doesn\'t exist!"');
		}
	
		async function setSwapPrerequisites(amount, pr, fetchedAmount, xactIn) {
			log.i(arguments, swap.slippage);
			const sellTokenAddr = isExactIn ? swap.token1_addr : swap.token2_addr;
			const buyTokenAddr = isExactIn ? swap.token2_addr : swap.token1_addr;
			TokenContract.init(sellTokenAddr);
			const sellTokenDec = await TokenContract.decimals();
			TokenContract.init(buyTokenAddr);
			const buyTokenDec = await TokenContract.decimals();
			
			let xactAmount = toStd(amount * 10**(xactIn ? sellTokenDec : buyTokenDec));
			log.i('fetchedAmount:', fetchedAmount.to);
			let thAmount = getThresholdAmountFromTolerance(fetchedAmount, swap.slippage, xactIn, xactIn ? buyTokenDec : sellTokenDec)
			log.i('Final TH amount:', thAmount);
			log.s(btnText);
			setPair(pr);
			setAmountIn(xactAmount);
			setThresholdAmount(thAmount.toString());
			return !0;
		}
	
		async function performSwap(e) {
			e.preventDefault();
			if(isErr) return toast.e('please resolve error first!');
			if(!wallet.priAccount.length) {
				l_t.e('please connect wallet first!');
				return;
			}
			console.log('performing swap operation');
			
			log.i('TH Amount:', thresholdAmount);
			setIsFetching(!0);
			RouterContract.swap_TT(
				[
					amountIn,
					thresholdAmount,
					pair,
					wallet.priAccount,
					getDeadline(swap.deadLine),
				],
				isExactIn,
			).then(tx => {
				setIsFetching(!1);
				resetTokenValues();
				dispatch(saveTxHash(tx.transactionHash));
				l_t.s('Swap Success!');
			}).catch(e => {
				Err.handle(e);
				setIsFetching(!1);
			}) 
		}
	
		async function upsideDown(e) {
			e.preventDefault();
			let t = [swap.token1, swap.token2],
					s = [swap.token1_sym, swap.token2_sym],
					a = [swap.token1_addr, swap.token2_addr],
					icn = [swap.token1_icon, swap.token2_icon];
	
			isExactIn ? 
			await setOtherTokenValue(t[0], 2, !0) :
			await setOtherTokenValue(t[1], 1, !0);
			// switch tokenInfo
			dispatch(setTokenInfo({sym: [s[1], s[0]], addr: [a[1], a[0]], n: 0, icon: [icn[1], icn[0]], isUpDown: !0}));
		}

		function isNotOKToProceed() {
			let errMsg = !wallet.isConnected ? 'Please connect wallet first' : 
			rEqual(swap.token1_sym, MISC.SEL_TOKEN) ? 'Please select token 1' : 
			rEqual(swap.token2_sym, MISC.SEL_TOKEN) ? 'Please select token 2' :
			'';
			const isNotOK = notEmpty(errMsg);
			isNotOK && l_t.e(errMsg);
			return isNotOK;
		}
		
		// if n is 1, exact is input (exactIn) => we need to get amount for out i.e. getAmountsOut()
		// if n is 2, exact is output (exactOut) => we need to get amount for in i.e. getAmountsIn()
		async function setOtherTokenValue(typedValue, ipNum, isUpsideDown) {
			// resetStates();
			if(isNotOKToProceed()) return;

			const xactIn = !(ipNum - 1);
			const otherTokenNum = ipNum - 1 ? 1: 2;
			setIsExactIn(xactIn);
			// CHheck for invalid input
			if(isInvalidNumeric(typedValue)) return dispatch(setTokenValue({ V: '', n: ipNum }));
			
			dispatch(setTokenValue({v: typedValue, n: ipNum}));
			setIsFetching(!0);
			// check if given value is non-zero
			if(notEmpty(typedValue)) {
				try {
					const addrList = isUpsideDown ? 
						[swap.token2_addr, swap.token1_addr] : 
						[swap.token1_addr, swap.token2_addr];
					const pair = await tryNormalizePair(addrList);
					// get contract instance
					TokenContract.init(
						isUpsideDown ? // if coming from upsideDown()
						addrList[ipNum - 1] : // select addr of second token 
						swap[`token${ipNum}_addr`] // otherwise addr of exact token
					);
					let dec = await TokenContract.decimals();
					const param = [stdRaiseBy(typedValue, dec), pair];
					
					const pairAddr = await FactoryContract.getPair(...pair);
					PairContract.init(pairAddr);
					const reserves = await PairContract.getReserves();
					log.i('pairAddr:', pairAddr, 'reserves:', reserves.map(r => r.toString()));
					log.i('input amount:', param[0]);

					// here check if buyAmount is less than what we have in reserves!
					
					let fetchedAmounts = await (
						xactIn ? 
						RouterContract.getAmountsOut(param) : 
						RouterContract.getAmountsIn(param)
					);
					const fetchedAmount = xactIn ? 
						fetchedAmounts[fetchedAmounts.length - 1] : 
						fetchedAmounts[0]; 
					log.i('fetched amount:', fetchedAmount);
					let fetchedAmountFraction = toDec(fetchedAmount, dec);
					const xchangePrice = toFixed(
						xactIn ? 
						typedValue / fetchedAmountFraction : 
						fetchedAmountFraction / typedValue, 
						MISC.XCHANGE_PRICE_DEC_PLACES
					);
					log.i('fetched amount frac before:', fetchedAmountFraction);
					fetchedAmountFraction = toFixed(fetchedAmountFraction, MISC.OTHER_TOKEN_DEC_PLACES);
					log.i('fetched amount frac:', fetchedAmountFraction);
					const buyAmountFraction = xactIn ? typedValue : fetchedAmountFraction;
					
					TokenContract.init(
						isUpsideDown ? // if coming from upsideDown()! 
						addrList[xactIn ? 1 : 0] : 
						swap[`token${xactIn ? 2 : 1}_addr`]);
					
					dec = await TokenContract.decimals();
					
					let sellAmount = toBigNum(
						xactIn ? // if exact amount is in top input
						param[0] : // typed exact ip amount 
						fetchedAmount // fetched ip amount (in top input)
					);
					log.i('sell Amount frac:', sellAmount);
					log.i('buy Amount frac:', buyAmountFraction);
					TokenContract.init(swap.token1_addr);
					// check balance for token 1
					let balance = await TokenContract.balanceOf(wallet.priAccount);
					log.i('SELL AMOUNT:', sellAmount.toString());
					if(balance.lte(sellAmount)) {
						setIsErr(!0);
						setIsFetching(!1);
						setIsDisabled(!0);
						setXchangeEquivalent(xchangePrice);
						dispatch(setTokenValue({v: fetchedAmountFraction, n: otherTokenNum}));
						return setErrText('Insufficient balance for ' + swap.token1_sym);
					}
					
					// check allowance for token 1
					let allowance = await TokenContract.allowance(wallet.priAccount, ADDRESS.ROUTER_CONTRACT);
					let isApproved = allowance.gt(sellAmount);
					
					
					if(!isApproved) {
						setIsErr(!0);
						setTokenApproved(!1);
						setErrText('Approve ' + swap.token1_sym);
						dispatch(setTokenValue({v: '', n: otherTokenNum}));
					} else {
						setIsErr(!1);
					}
					
					await setSwapPrerequisites(typedValue, pair, fetchedAmount, xactIn, ipNum)
					// set another token value
					setXchangeEquivalent(xchangePrice);
					setIsFetching(!1);
					dispatch(setTokenValue({v: fetchedAmountFraction, n: otherTokenNum}));
				} catch(e) {
					log.e(e);
				}
				return;
			} else {
				dispatch(setTokenValue({v: typedValue, n: 0}));
			}
			setIsFetching(!1);
			setIsExactIn(!0);
			dispatch(setTokenValue({v: '', n: otherTokenNum}));
		}
	
		function token(addr) {
			return swap.tokenList.filter(t => t.addr === addr)[0];
		}
	
		async function searchOrImportToken(v) {
			v = v.trim();
			if(!v.length) v = swap.tokenList;
			else if(isAddr(v) && !swap.tokenList.filter(tkn => tkn.addr === v).length) {
				
				TokenContract.init(v);
				let name = await TokenContract.name();
				let sym = await TokenContract.symbol();
				let dec = await TokenContract.decimals();
				// wallet must be connected for this!
				let bal = await TokenContract.balanceOf(wallet.priAccount);
				bal = bal.toBigInt().toString();
				v = [{name, sym, dec, bal, addr: v, icon: GEN_ICON, imported: !1}]
			} else {
				v = swap.tokenList.filter(tkn => {
					if(tkn.sym.toLowerCase().indexOf(v.toLowerCase()) >= 0) return !0;
					if(tkn.addr === v) return !0;
					return !1;
				});
			}
			dispatch(changeTokenList(v));
		}
	
		function importToken() {
			let token = swap.tokenList_chg[0];
			dispatch(addToTokenList({...token, imported: !0}));
			dispatch(changeTokenList([{...token, imported: !0}]));
		}
	
		function resetTList_chg() {
			dispatch(changeTokenList(swap.tokenList));
		}

		async function checkIfCSTClaimed() {
			setIsCSTClaimed(await FaucetContract.hasClaimed(wallet.priAccount))
		}

		async function claimCST(e) {
			e.preventDefault();
			try {
				await FaucetContract.claimCST();
				l_t.s('claim success!. please check your account.');
			} catch(e){ Err.handle(e) }
		}

		function resetTokenValues() {
			dispatch(setTokenValue({
        v: '', 
        n: 0
      }));
		}

		function resetTokenInfos() {
			dispatch(setTokenInfo({
        n: 0,
        addr: '', 
        icon: GEN_ICON,
        sym: MISC.SEL_TOKEN, 
      }));
		}

    return {
			token,
			claimCST,
			upsideDown,
			resetStates,
			performSwap,
			importToken,
			resetTList_chg,
			resetTokenInfos,
			resetTokenValues,
			checkIfCSTClaimed,
			setOtherTokenValue,
			searchOrImportToken,
			approveWithMaxAmount,
			
			state: {
				pair,
				isErr,
				errText,
				btnText,
				amountIn,
				isExactIn,
				isFetching,
				isDisabled,
				isCSTClaimed,
				tokenApproved,
				thresholdAmount,
				xchangeEquivalent,
			},

			// stateSetters
			setPair,
			setIsErr,
			setErrText,
			setBtnText,
			setAmountIn,
			setIsExactIn,
			setIsFetching,
			setIsDisabled,
			setTokenApproved,
			setThresholdAmount,
			setXchangeEquivalent,

    }
}

export default useSwap;