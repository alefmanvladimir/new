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



    async getWorstBestCountries(worstBest, number, dateFrom = new Date('2020-01-22'), dateTo) {
        
        if (!dateTo) {
            dateTo = new Date()
            dateTo.setDate(dateTo.getDate() - 1)
        }
        const allDeaths = await this.#api.getHistory('deaths')
        const allConfirmed = await this.#api.getHistory('confirmed')
        const allVaccines = await this.#api.getAllVaccines()
        const countries = this.#mergeCountries(allDeaths, allConfirmed, allVaccines, dateFrom, dateTo)
        return this.#sortAndTake(countries, worstBest, number)
    }

    async getChosenCountries(countries, dateFrom = new Date('2020-01-22'), dateTo) {
        
        if (!dateTo) {
            dateTo = new Date()
            dateTo.setDate(dateTo.getDate() - 1)
        }
        const allDeaths = []
        const allConfirmed = []
        const allVaccines = []
        for (let i = 0; i < countries.length; i++) {
            allDeaths.push(await this.#api.getHistoryCountry(countries[i], 'deaths'))
            allConfirmed.push(await this.#api.getHistoryCountry(countries[i], 'confirmed'))
            allVaccines.push(await this.#api.getCountryVaccines(countries[i]))
        }
        const res = this.#mergeCountries(allDeaths, allConfirmed, allVaccines, dateFrom, dateTo)
        return this.#sortAndTake(res, true)
    }

    #validateCountry(country) {
        
        const checkVaccines = country.All.people_vaccinated ? true : false
        const checkDeaths = country.All.deaths || country.All.datesDeath ? true : false
        const checkCases = country.All.confirmed || country.All.datesConfirm ? true : false
        const checkContinent = country.All.continent ? true : false

        return checkVaccines && checkDeaths && checkCases && checkContinent
    }
    
    #mergeCountries(allDeaths, allConfirmed, allVaccines, dateFrom, dateTo){
        
        const res = []
        const mergeDates = (firstValue, secondValue)=>{
            let res = firstValue
            res.All.datesConfirm = firstValue.All.dates
            res.All.datesDeath = secondValue.All.dates
            delete res.All.dates
            return res
        }
        const mergeRes = _.merge(_.mergeWith(allConfirmed, allDeaths, mergeDates), allVaccines)
        for (let country in mergeRes) {
            if (this.#validateCountry(mergeRes[country])) {
                this.#fillCountry(
                    res,
                    mergeRes[country].All.country,
                    mergeRes[country],
                    dateFrom,
                    dateTo)
            }
        }
        return res
    }

    #fillCountry(result, countryName, country, dateFrom, dateTo) {
        dateFrom = dateFrom.toISOString().substring(0, 10)
        dateTo = dateTo.toISOString().substring(0, 10)
        const deathsBefore = country.All.datesDeath[dateFrom]
        const deathsAfter = country.All.datesDeath[dateTo]
        const deathRate = (deathsAfter - deathsBefore) / country.All.population

        const confirmedBefore = country.All.datesConfirm[dateFrom]
        const confirmedAfter = country.All.datesConfirm[dateTo]

        const vaccine = country.All.people_vaccinated
        result.push({
            country: countryName,
            deaths: deathsAfter - deathsBefore,
            deathRate,
            cases: confirmedAfter - confirmedBefore,
            vaccine,
            dateFrom,
            dateTo
        })
    }

    async #sortAndTake(countries, best, number = countries.length) {
        if (best) {
            countries.sort((a, b) => {
                return a.deathRate - b.deathRate
            })
        } else {
            countries.sort((a, b) => {
                return b.deathRate - a.deathRate
            })
        }
        return _.take(countries, number)
    }

    
}