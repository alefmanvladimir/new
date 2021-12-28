export default class CountryRest {
    #url
    constructor(url) {
        if (!url) {
            throw "URL is not provided"
        }
        this.#url = url
    }

    async getAllCases() {
        const res = await fetch(`${this.#url}/cases`)
        return res.json()
    }

    async getAllVaccines() {
        const res = await fetch(`${this.#url}/vaccines`)
        return await res.json()
    }

    async getHistory(status) {
        const res = await fetch(`${this.#url}/history?status=${status}`)
        return res.json()
    }

    async getHistoryCountry(country, status) {
        const res = await fetch(`${this.#url}/history?status=${status}&country=${country}`)
        return res.json()
    }

    async getCountryVaccines(country) {
        const res = await fetch(`${this.#url}/vaccines?country=${country}`)
        return await res.json()
    }
}