import { isArray } from "lodash";

export function getRandomInteger(min, max){
    if(min>max){
        [min, max] = [max, min]
    }
    return Math.round(Math.random() * (max - min) + min);
}
export function getRandomElement(array){
    if(!isArray(array) || array.length===0){
        throw Error()
    }
    return array[getRandomInteger(0, array.length-1)]
}