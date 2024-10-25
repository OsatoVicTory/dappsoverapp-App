import axios from "axios";
import { ethers, Contract } from "ethers";  // Import Contract directly.
import abi from './contractABI.json';
import { contractAddress } from "./config";

export const fetchUrlPrieview = async (url, timeout = 60000) => {
    const serverUrl = 'https://backend-web-scraping.onrender.com/scrape/h/anything';
    return axios.post(serverUrl, { url, timeout });
}; 

export const parseBigInt = (uint8) => {
    return ethers.getBigInt(uint8, "myBigInt");
};

export const fetchUrlPrieviewLocal = async (url, timeout = 60000) => {
    const serverUrl = 'http://localhost:3030/scrape/h/anything';
    return axios.post(serverUrl, { url, timeout });
}; 

export const createContractInstance = async (signer) => {
    return await new Contract(contractAddress, abi, signer);
};

export const setMessageFn = (fn, text) => {
    fn(text);
    setTimeout(() => fn(''), 2000);
};

export const shortenAddress = (address) => {
    return address.slice(0, 4) + '...' + address.slice(-4);
};

export const formatDate = (date, not_eth_time = false) => {
    if(!not_eth_time) date = (date + '000') - 0;
    date = new Date(date);
    const curYr = (new Date()).getFullYear();
    if(date.getFullYear() !== curYr) return String(date).slice(4, 15) + ' at ' + String(date).slice(16, 21);
    else return String(date).slice(4, 10) + ' at ' + String(date).slice(16, 21);
};

export const parseStringData = (data, targ = false) => {
    const res = {};
    const spls = data.slice(1, -1).split('%x2');
    for(const spl of spls) {
        // because value could be link that could have = like 'https://goggle/search?s=good
        const splt = spl.split('=');
        const key = splt[0];
        const value = splt.slice(1)?.join('=')||'';
        if(!key) continue;
        if(targ && key === targ) {
            res[key] = value.slice(1, -1).split(',').map(x => x.replaceAll('%x3', '\n'));
        } else res[key] = (value||'').replaceAll('%x3', '\n');
    }
    return res;
};

export const parseJSONStringData = (data) => {
    data = data.replaceAll('\n', '\%x3');
    data = JSON.parse(data);
    const { meta_data } = data;
    const newMetaData = parseStringData(meta_data, 'tags');
    return { ...data, ...newMetaData };
};

const regextest = (word, len) => {
    const regex = /^[A-Za-z]+$/;
    const reg = /[\/?]/;
    return regex.test(word.slice(0, len)) && ( !word[len] || reg.test(word[len]) );
};

export const validLink = (link) => {
    // https://google.com/d/file/...
    if(!link.startsWith('https://')) return false;
    // now google.com/d/file/... take first on split
    const spl = link.slice(8).split('/')[0];
    // down to google.com
    if(!spl) return false;
    const dots = spl.split('.')[1];
    // com or second word has to be more than 1 character
    if(!dots || dots.length < 2) return false;
    // has to be all letter no other type of characters
    // if has 2 char, if they all alphabets and the 3rd is either ? or / or '' or undefined, then its good
    // if 3, if they all alphabets and the 4th is either ? or / or '' or undefined, then its good
    return regextest(dots, 2) || regextest(dots, 3);
};