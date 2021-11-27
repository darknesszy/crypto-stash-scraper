import fetch from 'node-fetch'
import { getToken } from '../utils/auth'

const getParams = (task, provider) => paramsFnMap[task](provider)

export const getApiKeys = () =>
  Promise.resolve()
    .then(() =>
      fetch(`${process.env.API_SERVER}/exchangeaccounts/apikeys`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
    )
    .then(...handleResponse)

export const getCurrencyExchange = provider =>
  Promise.resolve()
    .then(() => fetch(`${process.env.API_SERVER}/currencyExchanges`))
    .then(...handleResponse)
    .then(currencyExchanges =>
      currencyExchanges.find(
        currencyExchange => currencyExchange.name === provider
      )
    )

export const getCurrencies = () =>
  Promise.resolve()
    .then(() =>
      fetch(`${process.env.API_SERVER}/currencies`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
    )
    .then(...handleResponse)

// // Get all accounts from stats server.
// export const getDefiAccounts = () =>
//   Promise.resolve()
//     .then(() =>
//       fetch(`${process.env.API_SERVER}/exchangeaccounts`, {
//         headers: { Authorization: `Bearer ${getToken()}` },
//       })
//     )
//     .then(...handleResponse)

// Parse JSON from http response. On error, exit the process.
const handleResponse = [
  res => {
    if (res.status === 200) {
      return res.json()
    }
    throw res.statusText || 'Request Failed'
  },
  err => {
    console.error(err)
  },
]

// REST API endpoints mapped to each option condition.
const paramsFnMap = {
  balance: () => Promise.all([getApiKeys(), getCurrencies()]),
  exchangerate: provider =>
    Promise.all([getCurrencyExchange(provider), getCurrencies()]),
}

export default getParams