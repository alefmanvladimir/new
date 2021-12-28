import _ from 'lodash'

export default class CovidAnalizer {
    #api
    constructor(api) {
        this.#api = api
    }

    async getAllCountries() {
        const allCases = await this.#api.getAllCases()
        const res = []
        for (let country in allCases) {
            res.push(country)
        }
        return res
    }

    async getContinents() {
        let continents = {}
        const allVaccines = await this.#api.getAllVaccines()
        const allCases = await this.#api.getAllCases()
        const countries = _.merge(allVaccines, allCases)
        const res = []
        console.log(countries)
        for (let country in countries) {
            if (this.#validateCountry(countries[country])) {
                if (!continents[countries[country].All.continent]) {
                    continents[countries[country].All.continent] = {
                        "cases": countries[country].All.confirmed,
                        "deaths": countries[country].All.deaths,
                        "vaccines": allVaccines[country].All.people_vaccinated,
                        "population": countries[country].All.population
                    }
                } else {
                    continents[countries[country].All.continent].cases += countries[country].All.confirmed
                    continents[countries[country].All.continent].deaths += countries[country].All.deaths
                    continents[countries[country].All.continent].vaccines += countries[country].All.people_vaccinated
                    continents[countries[country].All.continent].population += countries[country].All.population
                }

            }
        }

        for (let continent in continents) {
            res.push({
                continent,
                rateOfCases: parseFloat((continents[continent].cases / continents[continent].population * 100).toFixed(2)),
                rateOfDeath: parseFloat((continents[continent].deaths / continents[continent].population * 100).toFixed(2)),
                rateOfVaccine: parseFloat((continents[continent].vaccines / continents[continent].population * 100).toFixed(2))
            })
        }
        return res
    }

    #validateCountry(country) {
        const checkVaccines = country.All.people_vaccinated ? true : false
        const checkDeaths = country.All.deaths ? true : false
        const checkCases = country.All.confirmed ? true : false
        const checkContinent = country.All.continent ? true : false

        return checkVaccines && checkDeaths && checkCases && checkContinent
    }

    async getWorstBestCountries(worstBest, number, dateFrom = new Date('2020-01-22'), dateTo) {
        if (!dateTo) {
            dateTo = new Date()
            dateTo.setDate(dateTo.getDate() - 1)
        }
        const allDeaths = await this.#api.getHistory('deaths')
        const allConfirmed = await this.#api.getHistory('confirmed')
        const allVaccines = await this.#api.getAllVaccines()
        let countries = []
        for (let country in allDeaths) {
            if (allVaccines[country] && allDeaths[country] && allConfirmed[country]) {
                this.#putCountry(
                    countries,
                    country,
                    allDeaths[country].All,
                    allConfirmed[country].All,
                    allVaccines[country].All,
                    dateFrom,
                    dateTo)
            }
        }
        return this.#sort(countries, worstBest, number)
    }

    async getChosenCountries(countries = ["Germany", "United Kingdom", "US", "Israel", "Russia", "Ukraine"], dateFrom = new Date('2020-01-22'), dateTo) {
        if (!dateTo) {
            dateTo = new Date()
            dateTo.setDate(dateTo.getDate() - 1)
        }
        let res = []
        for (let i = 0; i < countries.length; i++) {
            const deaths = await this.#api.getHistoryCountry(countries[i], 'deaths')
            const confirmed = await this.#api.getHistoryCountry(countries[i], 'confirmed')
            const vaccines = await this.#api.getCountryVaccines(countries[i])

            this.#putCountry(res, countries[i], deaths.All, confirmed.All, vaccines.All, dateFrom, dateTo)
        }
        return this.#sort(res, true)

    }

    async #sort(countries, best, number = countries.length) {
        if (best) {
            countries.sort((a, b) => {
                const midRateFirst = (a.rateDeathsBefore + a.rateDeathsAfter) / 2
                const midRateSecond = (b.rateDeathsBefore + b.rateDeathsAfter) / 2
                return a.deathRate - b.deathRate
            })
        } else {
            countries.sort((a, b) => {
                const midRateFirst = (a.rateDeathsBefore + a.rateDeathsAfter) / 2
                const midRateSecond = (b.rateDeathsBefore + b.rateDeathsAfter) / 2
                return b.deathRate - a.deathRate
            })
        }

        let res = []
        for (let i = 0; i < number; i++) {
            res.push(countries[i])
        }
        return res
    }

    #putCountry(countries, countryName, deathData, confirmData, vaccineData, dateFrom, dateTo) {
        dateFrom = dateFrom.toISOString().substring(0, 10)
        dateTo = dateTo.toISOString().substring(0, 10)
        const deathsBefore = deathData.dates[dateFrom]
        const deathsAfter = deathData.dates[dateTo]
        const deathRate = (deathsAfter - deathsBefore) / deathData.population

        const confirmedBefore = confirmData.dates[dateFrom]
        const confirmedAfter = confirmData.dates[dateTo]

        const vaccine = vaccineData.people_vaccinated
        countries.push({
            country: countryName,
            deaths: deathsAfter - deathsBefore,
            deathRate,
            cases: confirmedAfter - confirmedBefore,
            vaccine,
            dateFrom,
            dateTo
        })
    }
}