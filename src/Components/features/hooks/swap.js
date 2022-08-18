import { 
	saveTxHash, 
	setTokenInfo, 
	setTokenValue,
	addToTokenList, 
	changeTokenList, 
} from "../swap";

import { 
	toDec, 
	toStd, 
	isAddr, 
	rEqual, 
	toFixed, 
	isEmpty, 
	notEmpty, 
	toBigNum, 
	stdRaiseBy, 
	isInvalidNumeric, 
} from "../../../services/utils";

import { 
	PairContract, 
	TokenContract, 
	FaucetContract, 
	RouterContract, 
	FactoryContract, 
} from "../../../services/contracts";

import { 
	MISC, 
	EVENT, 
	TOKEN, 
	ADDRESS, 
	INIT_VAL, 
	TOKEN_INIT, 
} from "../../../services/constants/common";

import { useState } from "react";
import { Err } from "../../../services/xtras";
import l_t from "../../../services/logging/l_t";
import log from "../../../services/logging/logger";
import toast from "../../../services/logging/toast";
import { useDispatch, useSelector } from "react-redux";
import GEN_ICON from "../../../Assets/Images/token_icons/Gen.svg";
import { getDeadline, getThresholdAmountFromTolerance } from "../../../services/contracts/utils";

const useSwap = props => {
		const dispatch = useDispatch();
		
    const swap = useSelector(s => s.swap);
    const wallet = useSelector(s => s.wallet);  
		
		const [pair, setPair] = useState([]);
		const [isErr, setIsErr] = useState(!1);
		const [errText, setErrText] = useState('');
		const [reserves, setReserves] = useState([]);
		const [amountIn, setAmountIn] = useState('0');
		const [isExactIn, setIsExactIn] = useState('0');
		const [pairTokens, setPairTokens] = useState([]);
		const [isDisabled, setIsDisabled] = useState(!0);
		const [isClaiming, setIsClaiming] = useState(!1);
		const [isFetching, setIsFetching] = useState(!1);
		const [tokenB_addr, setTokenB_addr] = useState('');
		const [showMaxBtn1, setShowMaxBtn1] = useState(!1);
		const [showMaxBtn2, setShowMaxBtn2] = useState(!1);
		const [showBalance1, setShowBalance1] = useState(!1);
		const [showBalance2, setShowBalance2] = useState(!1);
		const [isCSTClaimed, setIsCSTClaimed] = useState(!1);
		const [tokenApproved, setTokenApproved] = useState(!0);
		const [showXchangeRate, setShowXchangeRate] = useState(!1);
		const [thresholdAmount, setThresholdAmount] = useState('0');
		const [btnText, setBtnText] = useState(INIT_VAL.SWAP_BTN[0]);
		const [token1_bal, setToken1_bal] = useState(TOKEN_INIT.BAL());
		const [token2_bal, setToken2_bal] = useState(TOKEN_INIT.BAL());
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
			setShowXchangeRate(!1);
			// setBtnText('Swap');
			// dispatch(setTokenValue({v: '', n: 0}));
		}
		// assumes Center Token is CST token
		async function tryNormalizePair(p) {
			let pAddr = await FactoryContract.getPair(p[0], p[1]);
			if(isAddr(pAddr)) return p;
			else
			// check if selected pair contains cst
			if(rEqual(p[0], ADDRESS.CST_TOKEN) || rEqual(p[1], ADDRESS.CST_TOKEN)){
				Err.handle('pair not exist!');
				return [];
			}
			// check if both the non-cst tokens has pair with cst token
			else {
				pAddr = await FactoryContract.getPair(p[0], ADDRESS.CST_TOKEN);
				let pAddr2 = await FactoryContract.getPair(p[1], ADDRESS.CST_TOKEN);
				if(isAddr(pAddr) && isAddr(pAddr2)) return [p[0], ADDRESS.CST_TOKEN, p[1]];
			}
			return [];
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
			).then(async tx => {
				setIsFetching(!1);
				resetTokenValues();
				log.i([swap.token1_addr, swap.token2_addr])
				await fetchBalanceOf(TOKEN.A, [swap.token1_addr]);
				await fetchBalanceOf(TOKEN.B, [swap.token2_addr]);
				dispatch(saveTxHash(tx.transactionHash));
				l_t.s('Swap Success!');
			}).catch(e => {
				Err.handle(e);
				setIsFetching(!1);
			}) 
		}
	
		async function upsideDown(e) {
			e.preventDefault();
			let t = [swap.token1_value.actual, swap.token2_value.actual],
					s = [swap.token1_sym, swap.token2_sym],
					a = [swap.token1_addr, swap.token2_addr],
					icn = [swap.token1_icon, swap.token2_icon];

			await handleBalanceForSelectedToken(TOKEN.BOTH, [a[1], a[0]]);
	
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

		async function isLiquidityLowForPair(pair, amount) {
			const pairAddr = await FactoryContract.getPair(...pair);
			PairContract.init(pairAddr);
			const reserves = await PairContract.getReserves();
			const t0 = await PairContract.getToken0();
			const t1 = await PairContract.getToken1();
			const [tokenB, reserveB] = rEqual(swap.token2_addr, t0) ? 
			[t0, reserves[0]] :
			[t1, reserves[1]];
			setReserves(reserves);
			setTokenB_addr(tokenB);
			setPairTokens([t0, t1]);
			if(amount.gt(reserveB)) return !0;
			// log.i('[isLiquidityLowForPair]');
			// log.i('amount of tokenB:', amount.toString()/10**18);
			// log.i('pair:', pair);
			// log.i('tokenB: ' + tokenB);
			// log.i('reserves:', reserveB.toString()/10**18);
			return !1;
		}
		
		// if n is 1, exact is input (exactIn) => we need to get amount for out i.e. getAmountsOut()
		// if n is 2, exact is output (exactOut) => we need to get amount for in i.e. getAmountsIn()
		async function setOtherTokenValue(typedValue, ipNum, isUpsideDown) {
			log.i('you typed:', typedValue);
			// resetStates();
			if(isNotOKToProceed()) return !1;

			const xactIn = !(ipNum - 1);
			const otherTokenNum = ipNum - 1 ? 1: 2;
			setIsExactIn(xactIn);
			// CHheck for invalid input
			if(isInvalidNumeric(typedValue)) {
				dispatch(setTokenValue({ V: '', n: ipNum }));
				return !1;
			}
			
			dispatch(setTokenValue({v: typedValue, n: ipNum}));
			setIsFetching(!0);
			// check if given value is non-zero
			if(notEmpty(typedValue)) {
				try {
					const addrList = isUpsideDown ? 
						[swap.token2_addr, swap.token1_addr] : 
						[swap.token1_addr, swap.token2_addr];
					const pair = await tryNormalizePair(addrList);
					// code block to check if the pair is valid
					if(isEmpty(pair)) {
						setIsErr(!0);
						setIsFetching(!1);
						setIsDisabled(!0);
						setShowXchangeRate(!1);
						dispatch(setTokenValue({v: '', n: otherTokenNum}));
						setErrText('pool not exist');
						return;
					}
					// get contract instance
					TokenContract.init(
						isUpsideDown ? // if coming from upsideDown()
						addrList[ipNum - 1] : // select addr of second token 
						swap[`token${ipNum}_addr`] // otherwise addr of exact token
					);
					let dec = await TokenContract.decimals();
					const param = [stdRaiseBy(typedValue, dec), pair];
					// code block to check if enough liquidity for the pair
					if(rEqual(ipNum, TOKEN.B)) {
						const isLiqLow = await isLiquidityLowForPair(pair, toBigNum(param[0]));
						log.i('liq low?:', isLiqLow);
						if(isLiqLow) {
							setIsErr(!0);
							setIsFetching(!1);
							setIsDisabled(!0);
							setShowXchangeRate(!1);
							dispatch(setTokenValue({v: '', n: otherTokenNum}));
							setErrText('Liquidity too low');
							return;
						}
					}
					// get amount in or out as per exact In is true or false
					let fetchedAmounts = await (
						xactIn ? 
						RouterContract.getAmountsOut(param) : 
						RouterContract.getAmountsIn(param)
					);
					const fetchedAmount = xactIn ? 
						fetchedAmounts[fetchedAmounts.length - 1] : 
						fetchedAmounts[0]; 
					
					let fetchedAmountFraction = toDec(fetchedAmount, dec);
					const xchangePrice = toFixed(
						xactIn ? 
						typedValue / fetchedAmountFraction : 
						fetchedAmountFraction / typedValue, 
						MISC.XCHANGE_PRICE_DEC_PLACES
					);
					
					// fetchedAmountFraction = toFixed(fetchedAmountFraction, MISC.OTHER_TOKEN_DEC_PLACES);
					
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

					// log.i('sell Amount frac:', sellAmount);
					// log.i('buy Amount frac:', buyAmountFraction);
					TokenContract.init(swap.token1_addr);
					// check balance for token 1
					let balance = await TokenContract.balanceOf(wallet.priAccount);
					log.i('SELL AMOUNT:', sellAmount.toString());
					
					// code block to check balance of tokenA is greater than sellAmount
					if(balance.lte(sellAmount)) {
						setIsErr(!0);
						setIsFetching(!1);
						setIsDisabled(!0);
						setShowXchangeRate(!1);
						setXchangeEquivalent(xchangePrice);
						dispatch(setTokenValue({v: fetchedAmountFraction, n: otherTokenNum}));
						setErrText('Insufficient balance for ' + swap.token1_sym);
						return !1;
					}
					
					// check allowance for token 1
					let allowance = await TokenContract.allowance(wallet.priAccount, ADDRESS.ROUTER_CONTRACT);
					let isApproved = allowance.gt(sellAmount);
					
					// code block to check if tokenA has approved router contract
					if(!isApproved) {
						setIsErr(!0);
						setTokenApproved(!1);
						setErrText('Approve ' + swap.token1_sym);
						dispatch(setTokenValue({v: '', n: otherTokenNum}));
					} else {
						setIsErr(!1);
					}

					const buyAmount = xactIn ? fetchedAmount.toString() : param[0];
					
					await setSwapPrerequisites(typedValue, pair, fetchedAmount, xactIn, ipNum)
					// set another token value
					log.i('xchange rate:', xchangeEquivalent);
					setXchangeEquivalent(xchangePrice);
					setIsFetching(!1);
					setShowXchangeRate(!0);
					
					const priceImpactPercent = await getPriceImpactPercent(pair, sellAmount.toString(), buyAmount);
					log.i('Price Impact:', priceImpactPercent);
					dispatch(setTokenValue({v: fetchedAmountFraction, n: otherTokenNum}));
				} catch(e) {
					log.e(e);
					return !1;
				}
				return !0;
			} else {
				dispatch(setTokenValue({v: '', n: 0}));
				setShowXchangeRate(!1);
			}
			setIsFetching(!1);
			setIsExactIn(!0);
			setShowXchangeRate(!1);
			dispatch(setTokenValue({v: '', n: otherTokenNum}));
			return !1;
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
				setIsClaiming(!0);
				await FaucetContract.claimCST();
				setIsCSTClaimed(!0);
				setIsClaiming(!1);
				l_t.s('claim success!. please check your account.');
			} catch(e){ Err.handle(e); setIsClaiming(!1); }
		}

		function resetBalances() {
			log.w('balances reset');
			setShowBalance1(!1);
			setShowBalance2(!1);
			setToken1_bal(TOKEN_INIT.BAL());
			setToken2_bal(TOKEN_INIT.BAL());
		}

		function resetTokenValues() {
			dispatch(setTokenValue({
        v: '', 
        n: 0
      }));
		}

		function resetTokenInfos(n) {
			dispatch(setTokenInfo({
        n,
				isUpDown: !1,
				reset: !0,
        sym: MISC.DEF_TOKEN.SYM,
        addr: MISC.DEF_TOKEN.ADDR,
        icon: MISC.DEF_TOKEN.ICON,
      }));
		}


		// this function is supposed to be called 
		// at the end of setOtherTokenValue function
		async function getPriceImpactPercent(addrList, sellAmount, buyAmount) {
			const pairAddr = await FactoryContract.getPair(...addrList);
			PairContract.init(pairAddr);
			let reserves = await PairContract.getReserves();
			reserves = reserves.map(r => Number(r.toString()));
			sellAmount = Number(sellAmount.toString())
			buyAmount = Number(buyAmount.toString())
			const t0 = await PairContract.getToken0();
			const t1 = await PairContract.getToken1();
			const [tokenB, reserveA, reserveB] = rEqual(swap.token2_addr, t0) ? 
					[t0, reserves[1], reserves[0]] :
					[t1, reserves[0], reserves[1]];
			const tokenB_price_old = reserveA / reserveB;
			const tokenB_price_new = sellAmount / buyAmount;
			// priceImpact or price diff -> non-zero means there is a price impact
			// which should not be > 15%, if its then show 'swap anyway' (or even disable)
			// if <15% and > 3% show red color swap
			// if < 3% show usual swap button
			const priceDiff = tokenB_price_old - tokenB_price_new;
			// in-terms of old pricing
			const priceImpactPercent = (priceDiff / tokenB_price_old) * 100;
			return Math.abs(priceImpactPercent);
		}

		async function  fetchBalanceOf(selectedToken, addrList) {
			log.i('selected token:', selectedToken);
			// log.t('selected token:', selectedToken);
			let bal, dec;
			const b = TOKEN_INIT.BAL();
			log.i('Balance for selected token # ' + selectedToken);
			if(rEqual(selectedToken, TOKEN.A)) {
				TokenContract.init(addrList[0]);
				dec = await TokenContract.decimals();
				bal = (await TokenContract.balanceOf(wallet.priAccount)).toString();
				log.i('Bal for token 1:', toFixed(toDec(bal, dec), 2));
				b.actual = toDec(bal, dec);
				b.ui = toFixed(b.actual, 2);
				setToken1_bal(b);
			} else if(rEqual(selectedToken, TOKEN.B)) {
				TokenContract.init(addrList[0]);
				dec = await TokenContract.decimals();
				bal = (await TokenContract.balanceOf(wallet.priAccount)).toString();
				log.i('Bal for token 2:', toDec(bal, dec));
				b.actual = toDec(bal, dec);
				b.ui = toFixed(b.actual, 2);
				setToken2_bal(b);
			} else if(rEqual(selectedToken, TOKEN.BOTH)) {
				TokenContract.init(addrList[0]);
				dec = await TokenContract.decimals();
				bal = (await TokenContract.balanceOf(wallet.priAccount)).toString();
				b.actual = toDec(bal, dec);
				b.ui = toFixed(b.actual, 2);
				setToken1_bal({...b});
				log.i('Bal for token 1:', toFixed(toDec(bal, dec), 2));
				TokenContract.init(addrList[1]);
				dec = await TokenContract.decimals();
				bal = (await TokenContract.balanceOf(wallet.priAccount)).toString();
				b.actual = toDec(bal, dec);
				b.ui = toFixed(b.actual, 2);
				setToken2_bal({...b});
				log.i('Bal for token 2:', toDec(bal, dec));
				log.i('addrList:', addrList);
			}
		}

		async function handleBalanceForSelectedToken(selectedToken, addrList) {
			log.w('handling bal for token # ' + selectedToken);
			if(
				rEqual(selectedToken, TOKEN.A)
			) {
					log.w('showing balance 1', swap.token1_sym);
					await fetchBalanceOf(TOKEN.A, addrList);
					setShowMaxBtn1(!0);
					setShowBalance1(!0);
			} 
			else if(
				rEqual(selectedToken, TOKEN.B) 
			) {
					log.w('showing balance 2', swap.token2_sym);
					await fetchBalanceOf(TOKEN.B, addrList);
					setShowMaxBtn2(!0);
					setShowBalance2(!0);
			} 
			else if(rEqual(selectedToken, TOKEN.BOTH)) {
				await fetchBalanceOf(TOKEN.BOTH, addrList);
				setShowMaxBtn1(!0);
				setShowMaxBtn2(!0);
				setShowBalance1(!0);
				setShowBalance2(!0);
			} else {
				log.w('bal 1:', showBalance1, 'bal 2:', showBalance2);
				if(rEqual(selectedToken, TOKEN.A)) {
					if(showBalance1) {
						setShowBalance1(!1);
					}
				} else if(showBalance2) {
					setShowBalance2(!1);
				} 
			}
		}

		async function setToMaxAmount(selectedToken) {
			if(rEqual(selectedToken, TOKEN.A)) {
				const ok = await setOtherTokenValue(token1_bal.actual, TOKEN.A, !1);
				setShowMaxBtn1(!ok);
			}
			else {
				const ok = await setOtherTokenValue(token2_bal.actual, TOKEN.B, !1);
				setShowMaxBtn2(!ok);
			}
		}

		function eventListeners() {
			const disableScroll = e => {
				if(rEqual(document.activeElement.type, 'number'))
					document.activeElement.blur();
			}
			
			const handleTokenSelected = e => {
				log.w('EVENT: ' + EVENT.TOKEN_SELECTION, e.detail);
				const addrList = e.detail.addrList;
				wallet.isConnected && isAddr(addrList[0]) &&
				handleBalanceForSelectedToken(e.detail.selectedToken, addrList);
			}

			// disable scrolling on input type number!
			document.addEventListener(EVENT.MOUSE_SCROLL, disableScroll);
			document.addEventListener(EVENT.TOKEN_SELECTION, handleTokenSelected);
			log.w('event listeners setup done.');
		}

		function initialSteps(n) {
			log.w('swap initial steps');
			resetBalances();
      eventListeners();
      resetTokenInfos(n);
      resetTokenValues();
		}

    return {
			token,
			claimCST,
			upsideDown,
			resetStates,
			performSwap,
			importToken,
			initialSteps,
			resetBalances,
			eventListeners,
			fetchBalanceOf,
			resetTList_chg,
			setToMaxAmount,
			resetTokenInfos,
			resetTokenValues,
			checkIfCSTClaimed,
			setOtherTokenValue,
			searchOrImportToken,
			approveWithMaxAmount,
			handleBalanceForSelectedToken,
			
			state: {
				pair,
				isErr,
				errText,
				btnText,
				amountIn,
				isExactIn,
				isClaiming,
				token1_bal,
				token2_bal,
				isFetching,
				isDisabled,
				showMaxBtn1,
				showMaxBtn2,
				showBalance1,
				showBalance2,
				isCSTClaimed,
				tokenApproved,
				showXchangeRate,
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
			setToken1_bal,
			setToken2_bal,
			setIsFetching,
			setIsDisabled,
			setShowMaxBtn1,
			setShowMaxBtn2,
			setShowBalance1,
			setShowBalance2,
			setTokenApproved,
			setThresholdAmount,
			setXchangeEquivalent,

    }
}

export default useSwap;