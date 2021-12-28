import CountryRest from "../services/country-rest"
const URL = "https://covid-api.mmediagroup.fr/v1"
export const countryProvider = new CountryRest(URL)
