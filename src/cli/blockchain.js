import _ from 'lodash'
import { readBalance as etherscanBalance } from '../plugins/blockchain/etherscan'

export const mapToTask = options => validateOptions(options)
    ? runTask(options)
    : exitWithMsg

// Task is known.
export const validateOptions = options => Object.keys(taskFnMap)
    .includes(task(options))

export const runTask = options => options.params
    ? taskFn(options, options.params, options.output)
    : hasParams(options)
        ? taskFn(options, createParams(options), options.output)
        : exitWithMsg()

export const runAll = (outputFn, wallets) => Promise.all([
    getBalances(outputFn, wallets)
])

export const getBalances = (outputFn, wallets) => wallets
    // Filter out blockchains that are not supported yet.
    .filter(({ ticker }) => Object.keys(balanceFnMap).includes(ticker))
    // Execute function for each wallet in the coin group synchronously.
    .reduce(
        (acc, { address, ticker }) => acc
            .then(() => balanceFnMap[ticker](address))
            .then(balance => outputFn(
                balance, 
                'wallets',
                { address: balance.address }
            )),
        Promise.resolve()
    )

const balanceFnMap = {
    'eth': etherscanBalance
}

const createParams = options => [{
    address: options.a || options.address,
    ticker: options.t || options.ticker
}]

const hasParams = options => (options.a || options.address)
    && (options.t || options.ticker)

const exitWithMsg = () => {
    console.log(help)
    process.exit(0)
}

const taskFn = (options, params, outputFn) => taskFnMap[task(options)](outputFn, params)
const task = options => options._[1]
const taskFnMap = {
    all: runAll,
    balance: getBalances
}

const help = `
-F or --file: A json file
-a or --address: Coin wallet address
-t or --ticker: The 3 letter ticker symbol of the coin
`