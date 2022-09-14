import { 
	setIsExactIn,
	saveTxHash, 
	setTokenInfo, 
	setTokenValue,
	addToTokenList, 
	changeTokenList, 
	addTokensToTokenList,
	addOnePlayer,
	setTokenInfoForUI,
	addPlayers,
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
	notZero,
	notNull,
	jString,
	notEqual,
	isNull,
	jObject,
	getTokenListDiff,
	doPageReload,
	toStr,
	contains,
	truncForUI, 
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
	ERR,
	LS_KEYS,
	URL, 
} from "../../../services/constants/common";

import l_t from "../../../services/logging/l_t";
import log from "../../../services/logging/logger";
import toast from "../../../services/logging/toast";
import { useDispatch, useSelector } from "react-redux";
import { retrieveProjectVersion, retrieveTokenList } from "../../../services/API";
import { Err, LocalStore } from "../../../services/xtras";
import { useRef, useState, useEffect, useCallback } from "react";
import GEN_ICON from "../../../Assets/Images/token_icons/Gen.svg";
import { getDeadline, getThresholdAmountFromTolerance } from "../../../services/contracts/utils";

var interval = null;
window.hasLoaded = !1;
window.isPageForcedToReload = !1;
var typedValueGlobal = '';

const useSwap = props => {
	const dispatch = useDispatch();
		
    const swap = useSelector(s => s.swap);
    const wallet = useSelector(s => s.wallet);  

	const [pair, setPair] = useState([]);
	const [isErr, setIsErr] = useState(!1);
	const [errText, setErrText] = useState('');
	const [reserves, setReserves] = useState([]);
	const [amountIn, setAmountIn] = useState('0');
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
	const [showPlayerInfo, setShowPlayerInfo] = useState(!1);
	const [showXchangeRate, setShowXchangeRate] = useState(!1);
	const [thresholdAmount, setThresholdAmount] = useState('0');
	const [isInvalidNetwork, setIsInvalidNetwork] = useState(!1);
	const [btnText, setBtnText] = useState(INIT_VAL.SWAP_BTN[0]);
	const [token1_bal, setToken1_bal] = useState(TOKEN_INIT.BAL());
	const [token2_bal, setToken2_bal] = useState(TOKEN_INIT.BAL());
	const [xchangeEquivalent, setXchangeEquivalent] = useState('0');
	const [priceImpactPercent, setPriceImpactPercent] = useState('0.0');

	const updateTokenList = list => {
		let tokenList = []
		const addTokenToList = i => {
			if(rEqual(i, list.length)) {
				tokenList.length && dispatch(addTokensToTokenList(tokenList));
				return;
			}
			
			searchOrImportToken(list[i])
			.then(token => {
				tokenList.push(token);
				addTokenToList(i+1);
			})
			.catch(e => {throw e})
		}
		list.length && addTokenToList(0);
	}

	const ensureProjectIsUptoDate = _ => {
		retrieveProjectVersion()
		.then(version => {
			const prevVer = LocalStore.get(LS_KEYS.PROJECT_VERSION);
			if(isNull(prevVer) || notEqual(toStr(prevVer), toStr(version))) {
			LocalStore.clear();
			LocalStore.add(LS_KEYS.PROJECT_VERSION, version);
			toast.w('page reloads in 3 sec to get updated..');
			window.isPageForcedToReload = !0
			doPageReload(3);
			}
		});
	}

	const lock = useRef(!0);
	useEffect(_ => {
		ensureProjectIsUptoDate();
		// onLoad
		if(lock.current && !window.isPageForcedToReload && wallet.isConnected) {
			log.i('setting retrieve token list interval..');
			if(isNull(interval)) {
				LocalStore.del(LS_KEYS.TOKEN_LIST);
				interval = setInterval(_ => {
					retrieveTokenList()
					.then(res => {
						const tListStr = LocalStore.get(LS_KEYS.TOKEN_LIST);
						try {
							if(isNull(tListStr)) updateTokenList(res)
							else updateTokenList(getTokenListDiff(res, jObject(tListStr)))
							LocalStore.add(LS_KEYS.TOKEN_LIST, jString(res));
						} catch(e) {
	
						}
					})
				}, MISC.RETRIEVE_TOKEN_LIST_REQ_DELAY);
			}
			lock.current = !1;
		}	
	}, [wallet.isConnected]);

	const debounced = (func, delay=1000) => {
		let timer;
		return (...args) => {
			timer && clearTimeout(timer);
			timer = setTimeout(_ => {
				timer = null;
				log.i('applying arguments to setOtherTokenValue:', args);
				func(...args);
			}, delay);
		}
	}

	function resetStates() {
		setTokenApproved(!0);
		setIsDisabled(!0);
		setShowXchangeRate(!1);
	}

	function token(addr) {
		return swap.tokenList.filter(t => t.addr === addr)[0];
	}
	
	function resetTList_chg() {
		dispatch(changeTokenList(swap.tokenList));
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

	function isNotOKToProceed() {
		log.i(swap.token1_sym, swap.token2_sym)
		let errMsg = !wallet.isConnected ? ERR.CONNECT_WALLET : 
		rEqual(swap.token1_sym, MISC.SEL_TOKEN) ? ERR.SELECT_TOKEN_1 : 
		rEqual(swap.token2_sym, MISC.SEL_TOKEN) ? ERR.SELECT_TOKEN_2 :
		'';
		const isNotOK = notEmpty(errMsg);
		isNotOK && l_t.e(errMsg);
		return isNotOK;
	}

	function handleInputErr(erTxt, toDispatch, v, ipNum, disable) {
		setIsErr(!0);
		setIsFetching(!1);
		setIsDisabled(disable);
		setShowXchangeRate(!1);
		setErrText(erTxt);
		toDispatch &&
		dispatch(
			setTokenValue({
				v: {
					actual: v,
					ui: rEqual(v, '') ? v : toFixed(v, MISC.OTHER_TOKEN_DEC_PLACES),
				}, 
				n: ipNum,
			})
		);
	}

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
		return !1;
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

	async function setSwapPrerequisites(pr, fetchedAmount, xactIn) {
		log.i(arguments, swap.slippage);
		const sellTokenAddr = swap.isExactIn ? swap.token1_addr : swap.token2_addr;
		const buyTokenAddr = swap.isExactIn ? swap.token2_addr : swap.token1_addr;
		TokenContract.init(sellTokenAddr);
		const sellTokenDec = await TokenContract.decimals();
		TokenContract.init(buyTokenAddr);
		const buyTokenDec = await TokenContract.decimals();
		
		let xactAmount = toStd(typedValueGlobal * 10**(xactIn ? sellTokenDec : buyTokenDec));
		let thAmount = getThresholdAmountFromTolerance(fetchedAmount, swap.slippage, xactIn, xactIn ? buyTokenDec : sellTokenDec)
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
			swap.isExactIn,
		).then(async tx => {
			setIsFetching(!1);
			resetTokenValues();
			log.i([swap.token1_addr, swap.token2_addr])
			await fetchBalanceOf(TOKEN.A, [swap.token1_addr]);
			await fetchBalanceOf(TOKEN.B, [swap.token2_addr]);
			dispatch(saveTxHash({
				pair: `${swap.token1_sym}/${swap.token2_sym}`, 
				txHash: tx.transactionHash, 
			}));
			l_t.s('Swap Success!');
		}).catch(e => {
			Err.handle(e);
			setIsFetching(!1);
		}) 
	}

	useEffect(_ => {
		if(window.hasLoaded) {
			(async _ => {
				setTokenIp(`${toFixed(swap.token2_value.actual, MISC.OTHER_TOKEN_DEC_PLACES)}`, TOKEN.A);
				await setOtherTokenValue(TOKEN.A, !0, [swap.token1_addr, swap.token2_addr]);
			})();
		}
	}, [swap.isUpDownToggle])

	async function upsideDown() {
		log.i('call to upside down');
		if(isNotOKToProceed()) return;

		let sym1 = swap.token1_sym, 
			sym2 = swap.token2_sym,
			addr1 = swap.token1_addr, 
			addr2 = swap.token2_addr,
			icon1 = swap.token1_icon, 
			icon2 = swap.token2_icon;
		
		await handleBalanceForSelectedToken(TOKEN.BOTH, [addr2, addr1]);
		
		// switch tokenInfo
		dispatch(
			setTokenInfo({
				sym: [sym2, sym1], 
				addr: [addr2, addr1], 
				n: TOKEN.BOTH, 
				icon: [icon2, icon1], 
				isUpDown: !0
			})
		);
		
		
		
		
	}

	const debouncedUpsideDown = useCallback(debounced(upsideDown, 1000), [
		swap.isExactIn,
		swap.token1_addr,
		swap.token2_addr,
		swap.token1_value.actual,
		swap.token2_value.actual,
	])

	const debouncedIP = useCallback(debounced(setOtherTokenValue), [
		wallet.priAccount,
		swap.token1_addr,
		swap.token2_addr,
		swap.token1_sym
	]);

	function setTokenIp(typedValue, ipNum) {
		log.i('actual typed:', typedValue);
		typedValueGlobal = typedValue;
		if(isNotOKToProceed()) {
			typedValueGlobal = '';
			return !1;
		}

		if(isInvalidNumeric(typedValue)) {
			log.i('ip num invalid');
			typedValueGlobal = '';
			return dispatch(
				setTokenValue({ 
					v: '',
					n: 0
				})
			);
		}
		if(!window.hasLoaded) window.hasLoaded = !0;
		dispatch(
			setTokenValue({
				v: {
					ui: typedValue,
					actual: typedValue,
				}, n: ipNum
			})
		);
	}

	// if n is 1, exact is input (exactIn) => we need to get amount for out i.e. getAmountsOut()
	// if n is 2, exact is output (exactOut) => we need to get amount for in i.e. getAmountsIn()
	async function setOtherTokenValue(ipNum, isUpsideDown, _pair) {
		log.i('typed value received: ', typedValueGlobal);
		const xactIn = !(ipNum - 1);
		const otherTokenNum = ipNum - 1 ? 1: 2;
		dispatch(setIsExactIn(xactIn));
		log.i('exactIn set to: ' + xactIn);
		setIsFetching(!0);
		// check if given value is non-zero
		if(notEmpty(typedValueGlobal) && notZero(typedValueGlobal)) {
			log.i('not empty', typedValueGlobal);
			try {
				const addrList = isUpsideDown ? 
					[swap.token2_addr, swap.token1_addr] : 
					[swap.token1_addr, swap.token2_addr];
					log.i('addrList:', addrList);
				const pair = await tryNormalizePair(addrList);
				_pair = _pair || pair;
				// code block to check if the pair is valid
				if(isEmpty(pair)) return handleInputErr(ERR.POOL_NOT_EXIST, !0, typedValueGlobal, ipNum, !1);
				// get contract instance
				TokenContract.init(
					isUpsideDown ? // if coming from upsideDown()
					addrList[ipNum - 1] : // select addr of second token 
					swap[`token${ipNum}_addr`] // otherwise addr of exact token
				);
				log.i('token contract:', TokenContract);
				let dec = await TokenContract.decimals();
				log.i('Dec:', dec);
				const param = [stdRaiseBy(typedValueGlobal, dec), pair];
				// code block to check if enough liquidity for the pair
				if(rEqual(ipNum, TOKEN.B)) {
					const isLiqLow = await isLiquidityLowForPair(pair, toBigNum(param[0]));
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
				log.i('isExact in', xactIn, swap.isExactIn);
				log.i(fetchedAmount, 'fetchedAmount frac:', fetchedAmountFraction, param);
				const xchangePrice = toFixed(
					toDec((await RouterContract.getAmountsIn([stdRaiseBy('1', dec), _pair]))[0], dec), 
					MISC.XCHANGE_PRICE_DEC_PLACES
				);
				
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
				if(balance.lt(sellAmount))
					return handleInputErr(
						`${ERR.LOW_BAL_FOR}${swap.token1_sym}`, 
						!0, 
						fetchedAmountFraction, 
						otherTokenNum,
						!0
					)
				
				// check allowance for token 1
				let allowance = await TokenContract.allowance(wallet.priAccount, ADDRESS.ROUTER_CONTRACT);
				let isApproved = allowance.gt(sellAmount);
				
				// code block to check if tokenA has approved router contract
				if(!isApproved) {
					setTokenApproved(!1);
					handleInputErr(
						`${ERR.APPROVE}${swap.token1_sym}`,
						!0,
						fetchedAmountFraction,
						otherTokenNum,
						!1,
					)
				} else setIsErr(!1);

				const buyAmount = xactIn ? fetchedAmount.toString() : param[0];
				
				await setSwapPrerequisites(pair, fetchedAmount, xactIn, ipNum)
				// log.i('xchange rate:', xchangeEquivalent);
				const priceImpactPercent = await getPriceImpactPercent(pair, sellAmount.toString(), buyAmount);
				// log.i('Price Impact:', priceImpactPercent);
				
				dispatch(
					setTokenValue({
						v: {
							actual: fetchedAmountFraction,
							ui: toFixed(fetchedAmountFraction, MISC.OTHER_TOKEN_DEC_PLACES)
						}, 
						n: otherTokenNum
					})
				);
				setIsErr(!1);
				setIsDisabled(!1);
				setIsFetching(!1);
				setShowXchangeRate(!0);
				setXchangeEquivalent(xchangePrice);
				setPriceImpactPercent(priceImpactPercent);
			} catch(e) {
				Err.handle(e);
			}
			return !0;
		} 
		else return handleInputErr(
			ERR.NO_INPUT,
			!0,
			'',
			otherTokenNum,
			!0,
		);
	}

	function importToken() {
		let token = swap.tokenList_chg[0];
		dispatch(addToTokenList({...token, imported: !0}));
		dispatch(changeTokenList([{...token, imported: !0}]));
	}
	
	// async function searchOrImportToken(v) {
	// 	v = v.trim();
	// 	if(!v.length) v = swap.tokenList;
	// 	else if(isAddr(v) && !swap.tokenList.filter(tkn => tkn.addr === v).length) {
	// 		TokenContract.init(v);
	// 		let name = await TokenContract.name();
	// 		let sym = await TokenContract.symbol();
	// 		let dec = await TokenContract.decimals();
	// 		// wallet must be connected for this!
	// 		let bal = await TokenContract.balanceOf(wallet.priAccount);
	// 		bal = bal.toBigInt().toString();
	// 		v = [{name, sym, dec, bal, addr: v, icon: GEN_ICON, imported: !1}]
	// 	} else {
	// 		v = swap.tokenList.filter(tkn => {
	// 			if(tkn.sym.toLowerCase().indexOf(v.toLowerCase()) >= 0) return !0;
	// 			if(tkn.addr === v) return !0;
	// 			return !1;
	// 		});
	// 	}
	// 	dispatch(changeTokenList(v));
	// }

	async function getAndShowPlayerInfo(player) {
		if(rEqual(swap.tokenInfoForUI.addr, player.addr)) return setShowPlayerInfo(!0);
		
		TokenContract.init(player.addr);

		const dec = await TokenContract.decimals();
		const totalSupply = await TokenContract.totalSupply();
		const initialSupply = await TokenContract.initSupply();
		const balance = await TokenContract.balanceOf(wallet.priAccount);
		
		const burntAmount = initialSupply.sub(totalSupply);
		dispatch(setTokenInfoForUI({
			icon: player.icon,
			addr: player.addr,
			name: player.name,
			symbol: player.symbol,
			balance: truncForUI(toDec(balance.toString(), dec)),
			totalSupply: truncForUI(toDec(totalSupply.toString(), dec)),
			burntAmount: truncForUI(toDec(burntAmount.toString(), dec)),
			initialSupply: truncForUI(toDec(initialSupply.toString(), dec)),
		}));

		setShowPlayerInfo(!0);
	}

	async function searchOrImportToken(token) {
			TokenContract.init(token.addr);
			let bal = await TokenContract.balanceOf(wallet.priAccount);
			bal = bal.toBigInt().toString();
			const name = await TokenContract.name();
			const symbol = await TokenContract.symbol();
			const icon = URL.API_BACKEND_URL + '/uploads/' + token.icon;
			const players = swap.players.filter(player => rEqual(player.addr, token.addr));
			log.i('Players:', players);
			rEqual(players.length, 0) && 
			dispatch(addOnePlayer({ name, symbol, icon, addr: token.addr }));
			return {
				bal, 
				imported: !0,
				sym: token.sym, 
				dec: token.dec, 
				icon: GEN_ICON, 
				addr: token.addr, 
				name: token.name, 
			}
	}

	async function checkIfCSTClaimed(account = wallet.priAccount) {
		setIsCSTClaimed(
			await FaucetContract.hasClaimed(account)
		)
	}

	async function claimCST(e) {
		e.preventDefault();
		try {
			setIsClaiming(!0);
			await FaucetContract.claimCST();
			setIsCSTClaimed(!0);
			setIsClaiming(!1);
			await fetchBalanceOf(TOKEN.A, [swap.token1_addr]);
			l_t.s('claim success!. please check your account.');
		} catch(e){ Err.handle(e); setIsClaiming(!1); }
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
		return toFixed(priceImpactPercent, 3);
	}

	async function  fetchBalanceOf(selectedToken, addrList) {
		let bal, dec;
		const b = TOKEN_INIT.BAL();
		if(rEqual(selectedToken, TOKEN.A)) {
			TokenContract.init(addrList[0]);
			dec = await TokenContract.decimals();
			bal = (await TokenContract.balanceOf(wallet.priAccount)).toString();
			b.actual = toDec(bal, dec);
			b.ui = toFixed(b.actual, 2);
			setToken1_bal(b);
		} else if(rEqual(selectedToken, TOKEN.B)) {
			TokenContract.init(addrList[0]);
			dec = await TokenContract.decimals();
			bal = (await TokenContract.balanceOf(wallet.priAccount)).toString();
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
			TokenContract.init(addrList[1]);
			dec = await TokenContract.decimals();
			bal = (await TokenContract.balanceOf(wallet.priAccount)).toString();
			b.actual = toDec(bal, dec);
			b.ui = toFixed(b.actual, 2);
			setToken2_bal({...b});
		}
		if(contains(`${b.ui}`, 'e')) {
			b.ui = truncForUI(toStd(b.ui));
		}
		if(contains(`${b.actual}`, 'e')) {
			b.actual = toStd(b.actual);
		}
		log.i('balance:', {...b});
	}

	async function handleBalanceForSelectedToken(selectedToken, addrList) {
		if(
			rEqual(selectedToken, TOKEN.A)
		) {
				await fetchBalanceOf(TOKEN.A, addrList);
				setShowMaxBtn1(!0);
				setShowBalance1(!0);
		} 
		else if(
			rEqual(selectedToken, TOKEN.B) 
		) {
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
		if(isNotOKToProceed()) return;
		if(rEqual(selectedToken, TOKEN.A)) {
			setTokenIp(`${token1_bal.actual - (token1_bal.actual * 0.00001)}`, TOKEN.A);
			const ok = await setOtherTokenValue(TOKEN.A, !1);
			setShowMaxBtn1(!1);
			setShowMaxBtn2(!0);
		}
		else {
			setTokenIp(`${token2_bal.actual - (token2_bal.actual * 0.00001)}`, TOKEN.B);
			const ok = await setOtherTokenValue(TOKEN.B, !1);
			setShowMaxBtn1(!0);
			setShowMaxBtn2(!1);
		}
	}

	function eventListeners() {
		const onInputChangeDisableScroll = e => {
			if(rEqual(document.activeElement.type, 'number'))
				document.activeElement.blur();
		}
		
		const onTokenSelected = e => {
			log.w('EVENT: ' + EVENT.TOKEN_SELECTION, e.detail);
			const addrList = e.detail.addrList;
			wallet.isConnected && isAddr(addrList[0]) &&
			handleBalanceForSelectedToken(e.detail.selectedToken, addrList);
		}

		const onAccountChanged = async e => {
			console.log('account changed event');
			await checkIfCSTClaimed(e.detail.newAccount);
		}

		const onChainChanged = async e => {
			console.log('chain changed event');
			setIsInvalidNetwork(e.detail.isInvalid)
		}

		// disable scrolling on input type number!
		document.addEventListener(EVENT.CHAIN_CHANGE, onChainChanged)
		document.addEventListener(EVENT.ACC_CHANGE, onAccountChanged)
		document.addEventListener(EVENT.TOKEN_SELECTION, onTokenSelected);
		document.addEventListener(EVENT.MOUSE_SCROLL, onInputChangeDisableScroll);
	}

	function initialSteps(n) {
		log.w('swap initial steps');
		dispatch(addPlayers([]));
		resetBalances();
		eventListeners();
		resetTokenInfos(n);
		resetTokenValues();
	}

    return {
		// hooked functions
		token,
		claimCST,
		upsideDown,
		setTokenIp,
		debouncedIP,
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
		debouncedUpsideDown,
		searchOrImportToken,
		approveWithMaxAmount,
		getAndShowPlayerInfo,
		handleBalanceForSelectedToken,
		// state variables
		state: {
			pair,
			isErr,
			errText,
			btnText,
			amountIn,
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
			showPlayerInfo,
			showXchangeRate,
			thresholdAmount,
			isInvalidNetwork,
			xchangeEquivalent,
			priceImpactPercent,
			isExactIn: swap.isExactIn,
		},
		// stateSetters
		setPair,
		setIsErr,
		setErrText,
		setBtnText,
		setAmountIn,
		setToken1_bal,
		setToken2_bal,
		setIsFetching,
		setIsDisabled,
		setShowMaxBtn1,
		setShowMaxBtn2,
		setShowBalance1,
		setShowBalance2,
		setTokenApproved,
		setShowPlayerInfo,
		setThresholdAmount,
		setIsInvalidNetwork,
		setXchangeEquivalent,
		setIsExactIn: setIsExactIn,
    }
}

export default useSwap;