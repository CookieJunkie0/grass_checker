const axios = require('axios-https-proxy-fix');
const { SocksProxyAgent } = require('socks-proxy-agent');
const fs = require('fs');
require('dotenv').config();
const wallets = fs.readFileSync('wallets.txt', 'utf8').split(/\r?\n/);

const PROXY = process.env.PROXY;

async function checkWallet(wallet) {
    try {
        const response = await axios.get(`https://api.getgrass.io/airdropAllocations`, {
            params: {input: {"walletAddress":wallet}},
            httpsAgent: PROXY ? new SocksProxyAgent("socks5://178.132.4.33:12915") : null,
        });

        let totalOnWallet = 0;

        for (const epoch of Object.values(response.data.result.data)) {
            totalOnWallet += epoch;
        }

        return {success: true, data: response.data, amount: totalOnWallet};
    } catch(e) {return {success: false, err: e}}
}

async function main() {
    let total = 0;
    for (const wallet of wallets) {
        const response = await checkWallet(wallet);
        if (response.success) {
            console.log(`Wallet ${wallet} has ${response.amount} GRASS!`);
            total += response.amount;
        } else {
            console.log(`Error checking wallet ${wallet}: ${response.err}`);
        }
    }

    console.log(`Checked ${wallets.length} wallets. Total: ${total} GRASS!`);
}

main()