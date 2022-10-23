import './index.styl'
import React, {useState, useRef} from 'react'
import {Helmet} from 'react-helmet'
import {BrowserBarcodeReader, DecodeHintType} from '@zxing/library'
import activeConfetti from '../lib/confetti.js'
// import { setWebAppManifest } from '../lib/dynamicMenifest';

const confettiColors = [
    '#E68F17',
    '#FAB005',
    '#FA5252',
    '#E64980',
    '#BE4BDB',
    '#0B7285',
    '#15AABF',
    '#EE1233',
    '#40C057'
]
const confettiConfig = {
    angle: 90,
    spread: 290,
    startVelocity: 50,
    elementCount: 120,
    decay: 0.8,
    delay: 4000,
    colors: confettiColors
}

const hints = new Map();
hints.set(DecodeHintType.TRY_HARDER, true)
hints.set(DecodeHintType.ASSUME_GS1, true)

const REPORT_TYPE = {
    'SPC임': 'SPC가 아닌데 SPC라고 떠요',
    'SPC아님': 'SPC인데 SPC가 아니라고 떠요'
}

class Index extends React.Component {

    reader = new BrowserBarcodeReader(
        300, hints
    )

    state = {
        entered: '',
        detected: '',
        isSPC: null,
        itemInfo: null,
        streamNotSupported: false
    }

    confettiBox = React.createRef()

    async _isSPC(code) {
        const response = await fetch(`https://isspc-back.saengwon-kim.workers.dev/?barcode=${code}`)
        const info = response.status === 200 ? await response.json() : {}
        const result = Object.keys(info).length > 0
        return {result, info}
    }

    handleChange(event) {
        this.setState({ entered: event.target.value })
    }

    handleSubmit = async event => {
        event.preventDefault()
        const code = this.state.entered

        await this.fetchResult(code);
    }

    async fetchResult(code) {
        const {result, info} = await this._isSPC(code)
        this.setState({
            detected: code,
            isSPC: result,
            itemInfo: info
        }, () => {
            activeConfetti(this.confettiBox.current, confettiConfig)
        })

        window.ga && window.ga('send', 'event', 'Barcode', 'search', code)
    }

    onDetect = async data => {
        const code = data.text
        await this.fetchResult(code);
    }

    async startDetect() {
        let selectedDeviceId;
        this.reader.listVideoInputDevices()
        .then((videoInputDevices) => {
            const sourceSelect = document.getElementById('sourceSelect')
            selectedDeviceId = videoInputDevices[0].deviceId
            if (videoInputDevices.length > 1) {
                videoInputDevices.forEach((element) => {
                    const sourceOption = document.createElement('option')
                    sourceOption.text = element.label
                    sourceOption.value = element.deviceId
                    sourceSelect.appendChild(sourceOption)
                })

                sourceSelect.onchange = () => {
                    selectedDeviceId = sourceSelect.value;
                }

                const sourceSelectPanel = document.getElementById('sourceSelectPanel')
                sourceSelectPanel.style.display = 'block'
            }
            this.reader.decodeOnceFromVideoDevice(selectedDeviceId, 'interactive').then((result) => {
                // document.getElementById('result').textContent = result.text
                this.onDetect(result)
            }).catch((err) => {
                console.error(err)
                // document.getElementById('result').textContent = err
                // this.onDetect(result)
            })
            console.log(`Started continous decode from camera with id ${selectedDeviceId}`)
            // document.getElementById('resetButton').addEventListener('click', () => {
            //     document.getElementById('result').textContent = '';
            //     this.reader.reset();
            //     console.log('Reset.')
            // })

        })
        .catch((err) => {
            console.error(err)
        })
        // const result = await this.reader.decodeOnceFromVideoDevice(undefined, 'interactive')
        // console.log(result)
        // this.onDetect(result)
    }

    reset = () => {
        this.setState({
            entered: '',
            detected: '',
            isSPC: null,
            itemInfo: null,
        }, async () => {
            await this.startDetect()
        })
    }

    async componentDidMount() {
        // setTimeout(() => {
        //     setWebAppManifest({
        //         userAgent: navigator.userAgent,
        //         selector: '#dynamic-manifest'
        //     })
        // }, 1)

        try {
            await this.startDetect()
        } catch (error) {
            console.log(error)
            this.setState({
                streamNotSupported: true
            })
        }
    }

    render() {
        const {detected, streamNotSupported, isSPC} = this.state

        return (
            <div className="app">
                <Helmet>
                    <title>바스티유제빵소</title>
                    <meta charSet="utf-8" />
                    <meta httpEquiv="x-ua-compatible" content="ie=edge" />
                    <meta name="viewport" content="width=device-width, initial-scale=1"/>
                    <meta name="description" content="(베타)SPC 브랜드 로고가 보이지 않는 제품이 SPC의 손길이 닿은 제품인지 알아볼 수 있도록 도와줍니다. https://github.com/saengwon-kim/isspc/issues 에서 프로젝트에 기여할 수 있습니다." />
                    <meta property="og:url" content="https://isspc.pages.dev" />
                    <meta property="og:type" content="website" />
                    <meta property="og:title" content="바스티유제빵소" />
                    <meta property="og:description" content="바코드만 찍으면 SPC의 손길이 닿은 제품인지 알 수 있는 페이지입니다! " />
                    <meta property="og:image" content="https://isspc.page.dev/isspc-logo.png" />
                    <meta property="og:locale" content="ko_KR" />
                    <link rel="manifest" id="dynamic-manifest" />
                    <link rel="apple-touch-icon" sizes="72x72" href="/icons/icon-72x72-white.png" />
                    <link rel="apple-touch-icon" sizes="96x96" href="/icons/icon-96x96-white.png" />
                    <link rel="apple-touch-icon" sizes="128x128" href="/icons/icon-128x128-white.png" />
                    <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144-white.png" />
                    <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152-white.png" />
                    <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192-white.png" />
                    <link rel="apple-touch-icon" sizes="384x384" href="/icons/icon-384x384-white.png" />
                    <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512x512-white.png" />
                </Helmet>
                <header className="header">
                    <span className="logo">
                        {/* <img src="isspc-logo.svg" alt="바스티유제빵소"/> */}
                        {/* <div className="beta"><span>BETA</span></div> */}
                    </span>
                </header>
                <main className="main">
                    <div ref={this.confettiBox} className="confetti" />
                    {!detected ?
                    <section className="search">
                        <h1>SPC 제품인지 확인해보세요</h1>
                        {streamNotSupported ?
                          <p>카메라 없음</p> :
                          <div className="reader">
                                <div id="sourceSelectPanel">
                                    <label htmlFor="sourceSelect">카메라 변경:</label>
                                    <select id="sourceSelect"></select>
                                </div>
                              <p>아래 화면에 바코드가 나오도록 비춰주세요</p>
                              <video ref={this.interactive} id="interactive" className="viewport"/>
                          </div>
                        }
                    <form onSubmit={this.handleSubmit}>
                              <label htmlFor="barcode">바코드
                                  <input id="barcode" type="text" pattern="[0-9]*" maxLength="13" value={this.state.entered} onChange={this.handleChange.bind(this)} placeholder="8801068123456"/>
                              </label>
                              <button type="submit" className="submit-btn" disabled={this.state.entered.length < 13}>찾기</button>
                    </form>
                    </section> :
                    <section className="result">
                        {isSPC ?
                            <>
                                <div className="message">
                                    <p>SPC 제품이</p>
                                    <p className="truth">맞습니다!</p>
                                </div>
                                {/* <dl>
                                    <dt className="product-title">제품명:</dt>
                                    <dd className="product-name">{this.state.itemInfo.content.name}</dd>
                                </dl> */}
                                <dl>
                                    <dt className="barcode-title">바코드:</dt>
                                    <dd className="barcode-info">{detected}</dd>
                                </dl>
                            </> :
                            <>
                                <div className="message">
                                    <p>SPC 제품이</p>
                                    <p className="truth">아닙니다!</p>
                                </div>
                                <dl>
                                    <dt className="barcode-title">바코드:</dt>
                                    <dd className="barcode-info">{detected}</dd>
                                </dl>
                            </>
                        }
                        <div className="actions">
                            <button className="reset" type="button" onClick={this.reset}>다른 제품 찾기</button>
                            <a className="report" href={this.getReportUrl(isSPC, detected)} target="_blank">오류 신고</a>
                        </div>
                    </section>
                }
                </main>
                <footer className="footer">
                    <span>
                        <a href="https://github.com/saengwon-kim/isspc" target="_blank">
                            <img src="github-logo.png" alt="github" className="logo"/>
                        </a>
                    </span>
                    <span>
                        <a href="https://isnamyang.nullfull.kr" target="_blank">
                            <img src="isnamyang-logo.svg" alt="남양유없" className="logo"/>
                        </a>
                    </span>
                </footer>
            </div>
        )
    }

    getReportUrl(isSPC, barcode) {
        const reportType = isSPC ? REPORT_TYPE['SPC아님'] : REPORT_TYPE['SPC임']
        return `https://docs.google.com/forms/d/e/1FAIpQLSdr1TjcPBSri35YsGrqcraFvvcDMHfxQecyDqA7xbK8feNZ-g/viewform?usp=pp_url&entry.187227653=${reportType}&entry.1960789934=${barcode}`
    }
}


export default Index
