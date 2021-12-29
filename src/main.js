import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.bundle"

import { getRandomInteger, getRandomElement } from "./util/random"

import { countryProvider } from "./config/servicesConfig"
import CovidAnalizer from "./services/covid-analizer"
import TableHandler from "./ui/table.handler"
import FormHandler from "./ui/form-handler"
import data from './config/data.json'
import Timer from "./services/timer"


// creating required objects
const analizer = new CovidAnalizer(countryProvider)

const tableContinents = new TableHandler('continent-header', 'continent-body', ['continent', 'rateOfCases', 'rateOfDeath', 'rateOfVaccine'])
const formHistory = new FormHandler('history-form')
const tableHistory = new TableHandler('history-header', 'history-body', ['country', 'cases', 'deaths', 'vaccine', 'dateFrom', 'dateTo'])
const formList = new FormHandler('list-form')
const tableList = new TableHandler('list-header', 'list-body', ['country', 'cases', 'deaths', 'vaccine', 'dateFrom', 'dateTo'])
const timer = new Timer('timer')
// functions 

const fillContinents = async ()=>{
    tableContinents.clear()
    showSpinner('continents')
    const continents = await analizer.getContinents()
    hideSpinner('continents')
    continents.forEach(c=>tableContinents.addRow(c))
    
}

const showSpinner = parentElemId=>{
    const elem = document.getElementById(parentElemId)
    const spinner = document.createElement("div")
    spinner.setAttribute("id", parentElemId + '-spinner')
    spinner.setAttribute("class", "col-sm-8 text-center")
    spinner.innerHTML = `
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    `
    elem.appendChild(spinner)    
}

const hideSpinner = parentElemId=>{
    const spinner = document.getElementById(`${parentElemId}-spinner`)
    spinner.remove()
}

async function refreshContinents(){
    
    console.log('finish')
    await fillContinents()
    document.removeEventListener('finish', refreshContinents)
    timer.start(1)
    document.addEventListener('finish', refreshContinents)
}

// Actions

fillContinents()

timer.start(1)

document.addEventListener('finish', refreshContinents)

analizer.getAllCountries().then(response=>{
    FormHandler.fillOptions("country-name", response)
})

FormHandler.fillCheckboxes('countries-config', data.countries)

formHistory.addHandler(async data=>{
    tableHistory.clear()
    showSpinner('history')
    const best = data.type=="best"?true: false
    const dateFrom = data.dateFrom?new Date(data.dateFrom):new Date('2020-01-22')
    let dateTo
    if (!data.dateTo) {
        dateTo = new Date()
        dateTo.setDate(dateTo.getDate() - 1)
    } else {
        dateTo = new Date(data.dateTo)
    }
    const countOfCountry = parseInt(data.countOfCountries)
    const countries = await analizer.getWorstBestCountries(best, countOfCountry, dateFrom, dateTo)
    hideSpinner('history')
    countries.forEach(c=>tableHistory.addRow(c))
})

formList.addHandler(async data=>{
    tableList.clear()
    showSpinner('list')
    const dateFrom = data.dateFrom?new Date(data.dateFrom):new Date('2020-01-22')
    let dateTo
    if (!data.dateTo) {
        dateTo = new Date()
        dateTo.setDate(dateTo.getDate() - 1)
    } else {
        dateTo = new Date(data.dateTo)
    }
    console.log(data)
    const countries = data.countries
    if(data.countryName){
        countries.push(data.countryName)
    }
    const res = await analizer.getChosenCountries(countries, dateFrom, dateTo)
    hideSpinner('list')
    res.forEach(c=>tableList.addRow(c))
})
