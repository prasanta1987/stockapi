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


app.get('/historicalData/:symbol', (req, res) => {

    let symb = (req.params.symbol).toLowerCase()
    symb = symb.replace('&', '%26')

    const symbolCountUrl = `https://www1.nseindia.com/marketinfo/sym_map/symbolCount.jsp?symbol=${symb}`


    axios.get(symbolCountUrl)
        .then(data => {

            let symbolCount = data.data
            const url = `https://www1.nseindia.com/products/dynaContent/common/productsSymbolMapping.jsp?symbol=${symb}&segmentLink=3&symbolCount=${symbolCount}&series=EQ&dateRange=+&fromDate=03-04-2020&toDate=03-04-2020&dataType=PRICEVOLUMEDELIVERABLE`

            axios.get(url)
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
                            deliverableQty: x[13],
                            dlyQtyToTradeQty: x[14]
                        }
                        arrayJsonData.push(data)

                    })

                    // console.log(arrayJsonData)
                    res.status(200).json(arrayJsonData)

                })
                .catch(err => res.status(500).json({ "error": "Server Not Responding" }))
        })
        .catch(err => res.status(500).json({ "error": "Someting Went Wrong While Getting Data" }))

})

app.get('/', (req, res) => {


    axios.get('https://www.nseindia.com/api/quote-equity?symbol=RELIANCE', {
        headers: {
            ":authority": "www.nseindia.com",
            ":method": "GET",
            ":path": "/api/quote-equity?symbol=RELIANCE",
            ":scheme": "https",
            "accept": "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,bn;q=0.8",
            "cookie": `_ga=GA1.2.235220095.1594996985; _gid=GA1.2.1249248081.1594996985; nseQuoteSymbols=[{"symbol":"AXISBANK","identifier":null,"type":"equity"}]; bm_mi=3BE28EB54A1DCA67548B0D5AF7927375~LsO4GS1A8y9aKIoyAbDP8oBGulgRLxg+x2dmpaYYwMRRPirJVCRKtn6KJ+IeSTBhFdN+yqzpx8FaocTs13iwTf5/Ui3WLDrGwGFCLKeWWpw6lSbp9rHddtuAPiDmNLoFtII0i3gu7PJVHzKTPP9WDRrOkaECqkR0HuSyzv7fQIij1KlO3UMfPECnrXWxNByjC23g/bP7O2+UvPFfnkUrpsNJevG8J7pwTUIN60JLDxElYzu0ey62Q3iskdaqXDpQVYcjcZExOdCbWXuxByy5Gw==; _gat_UA-143761337-1=1; ak_bmsc=2F4D321231E166AE344F71E78B63E8AD312C8ABF7D390000BDED135F95989F50~plN7KWECiw/I6OIEy8Nd0g8kV8dGT2msyhfzrjIGh9N4tNM/KfT90S0J2b1HpfgBdAD6QSC4mWG5fBV4TnC1IllJh8ily1E9KRkrCXaNdJnjI47dehxLyVMxBYG1F0XlFV/PfPQQjF6eUoNq2U89jd6/UUS8KfTJdNU/EuIa9ewE0o4jgEknp7jNNC/knd3Lhhxjdjk9/pvTG1mEe3JWqB04oAnGEprhJ4Lxl882T9BvfGvy62JMnbVl3hPtXuBJ3H; RT="z=1&dm=nseindia.com&si=bda0e8f3-ff4e-4df9-981e-ed10e174b8c7&ss=kcsqf8zp&sl=1&tt=0&obo=1"; bm_sv=001925CBFB5D0D00DA52CB5FA19FB1AB~rM+WyT3BaT0KwXbFXpx8ekcv8LySNFIKCTcCQ41vpTJ8G3+w/dX5oOqwX3vewtZR1TpyYwhtryp4zPk/SEokf9uz54KySdgbcG9p4j3cPP2Y0s93/LkHLGKAZ4vEfqm3vZno9YBp4yz8/uHZR5uzPn7UMsJ853F/ylusTJuxj3k=`,
            "referer": "https://www.nseindia.com/get-quotes/equity?symbol=RELIANCE",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "user-agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36`
        }
    })
        .then(data => res.status(200).json(data.data))
        .catch(err => res.status(500).json(err))

})

const port = process.env.PORT || 3000

app.listen(port, () => console.log(`Server Running at http://localhost:${port}`))