import {Response, Request} from "express";
import Joi from "joi"
import axios from 'axios';
import config from "../config.json";
import moment from "moment";

const getFlightsSchema = Joi.object({
  departureStart: Joi.string().required,
  departureEnd: Joi.string().required,
  duration: Joi.number().optional,
  airline: Joi.string().optional
})

interface flightDetails {
  departureTime : string,
  arrivalTime : string,
  carrier: string,
  origin:    string,
  destination:  string,
  score?: number
}

interface queryParam {
  departureStart: string,
  departureEnd: string,
  duration: string,
  airline: string,
}

declare module "express-serve-static-core" {
  interface Request {query: Partial<queryParam>;}
}

const getDistanceBetweenAirports = async (code1: string, code2: string):Promise<number> => {
  return Promise.resolve(22)
}

const getFlights = async(req: Request<queryParam>, res:Response) => {
  const validationResult = getFlightsSchema.validate(req.query);
  
  if (validationResult.error) {
    //return res.status(400).json('bad request. please provide start and end dates.')
  }
 
  // @ts-ignore
  const userinput:queryParam = req.query;
  const {departureStart, departureEnd, duration, airline} = userinput;
  const flightResult = await axios.get(config.url);
  const flights: flightDetails[] = flightResult.data;
  const filteredFlights = [];

  for(const flight of flights) {
    flight.score = 999;

    const arrivalTime = moment(flight.arrivalTime);
    const departureTime = moment(flight.departureTime);
    const userDepartureStartDate = moment(departureStart);
    const userDepartureEndDate = moment(departureEnd);

    if (departureTime.isBetween(userDepartureStartDate,userDepartureEndDate)) {
      const preferredAirline = flight.carrier;

      let carrierPreference = 1;

      if (airline === preferredAirline) {
        carrierPreference = 0.9
      }

      const flightDuration = arrivalTime.diff(departureTime, 'hours')
      const flightDistance = await getDistanceBetweenAirports(flight.origin, flight.destination);

      if (duration && flightDuration >= parseInt(duration)) {
        continue
      }

      const flightScore = flightDuration * carrierPreference + flightDistance;

      flight.score = flightScore;

      filteredFlights.push(flight);
    }
  }
 // @ts-ignore
  filteredFlights.sort((a,b) => a.score - b.score);
  
  return res.status(200).json(filteredFlights)
  
}

export {
  getFlights
}