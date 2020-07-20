const express = require('express')
const axios = require("axios").default;
var HTMLParser = require('node-html-parser');
const requests = require('request')

const symbol = require('./indexSymbols');
const { request } = require('express');


const app = express()

app.get('/findNseSymbol/:name', (req, res) => {

    const name = req.params.name.toLocaleUpperCase()
    let companySymbols = symbol.symbols.symbol
    let foundSymbols = []
    for (let i = 0; i < companySymbols.length; i++) {
        companySymbols[i].companyName.toLocaleUpperCase().includes(name) && foundSymbols.push(companySymbols[i])
    }

    res.status(200).json({ "message": foundSymbols })

})

app.get('/nifty50', (req, res) => {

    axios.get('https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050')
        .then(data => res.status(200).json(data.data))
        .catch(err => res.status(500).json(err))

})

app.get('/stock/:symbol', (req, res) => {
    let symb = (req.params.symbol).toUpperCase()

    symb = symb.replace('&', '%26')
    const url = `https://www.nseindia.com/api/quote-equity?symbol=${symb}`

    console.log(url)

    axios.get(url)
        .then(data => res.status(200).json(data.data))
        .catch(err => res.status(500).json(err))

})

app.get('/candleData/:symbol', (req, res) => {

    let symb = (req.params.symbol).toUpperCase()
    symb = symb.replace('&', '%26')

    const url = `https://www.nseindia.com/api/chart-databyindex?index=${symb}`
    // const url = `https://www.nse-india.com/api/chart-databyindex?index=${symb}&preopen=true`

    axios.get(url)
        .then(data => res.status(200).json(data.data))
        .catch(err => res.status(500).json(err))

})


app.post('/historicalData/:symbol/:fromDate/:toDate', (req, res) => {

    let symb = (req.params.symbol).toLowerCase()
    symb = symb.replace('&', '%26')
    let fromDate = req.params.fromDate
    let toDate = req.params.toDate

    const symbolCountUrl = `https://www1.nseindia.com/marketinfo/sym_map/symbolCount.jsp?symbol=${symb}`


    axios.get(symbolCountUrl)
        .then(data => {

            let symbolCount = data.data
            // Det format DD-MM-YYYY
            const url = `https://www1.nseindia.com/products/dynaContent/common/productsSymbolMapping.jsp?symbol=${symb}&segmentLink=3&symbolCount=${symbolCount}&series=EQ&dateRange=+&fromDate=${fromDate}&toDate=${toDate}&dataType=PRICEVOLUMEDELIVERABLE`

            axios.get(url, {
                headers: {
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Dest": "empty",
                    "Referer": "https://www1.nseindia.com/products/content/equities/equities/eq_security.htm",
                    "Host": "www1.nseindia.com",
                    "Connection": "keep-alive",
                    "Accept-Language": "en-US,en;q=0.9,bn;q=0.8",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Accept": "*/*",
                    "Sec-Fetch-Site": "same-origin",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36",
                    "X-Requested-With": "XMLHttpRequest"

                }
            })
                .then(data => {

                    let htmlData = HTMLParser.parse(data.data).querySelector('#csvContentDiv').rawText
                    let arrayData = htmlData.split(':')

                    let headerData = arrayData.shift()

                    let newData = []

                    arrayData.map(values => newData.push(values.split(',')))


                    filteredData = []

                    newData.map(x => {
                        x = x.map(y => y.replace(/"/gi, ''))
                        x = x.map(y => y.trim())
                        filteredData.push(x)
                    })

                    filteredData.pop()


                    arrayJsonData = []

                    filteredData.map(x => {

                        let data = {
                            symbol: x[0],
                            series: x[1],
                            date: x[2],
                            preClose: x[3],
                            openPrice: x[4],
                            highPrice: x[5],
                            lowPrice: x[6],
                            lastPrice: x[7],
                            closePrice: x[8],
                            vwap: x[9],
                            ttq: x[10],
                            turnOver: x[11],
                            noOfTrade: x[12],
                            deliQty: x[13],
                            dliPercen: x[14]
                        }
                        arrayJsonData.push(data)

                    })

                    res.status(200).json(arrayJsonData)

                })
                .catch(err => {
                    res.status(500).json({ "error": "Query Must Be Within a Year" })
                })
        })
        .catch(err => console.log(err))



})

const port = process.env.PORT || 3000

app.listen(port, () => console.log(`Server Running at http://localhost:${port}`))