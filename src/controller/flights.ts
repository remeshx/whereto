import axios from 'axios';
import moment from "moment";
import config from "../config.json";
import { Response, Request } from "express";
import { getDistanceBetweenAirports } from "../helper/util";
import { getFlightsSchema } from "../validations/flightsValidations";
import { flightDetails, queryParam } from "../schemas/flightsSchemas";

const getFlights = async (req: Request<{}, {}, {}, queryParam>, res: Response) => {
  try {
    const validationResult = getFlightsSchema.validate(req.query);

    if (validationResult.error) {
      return res.status(400).json(
        { "message": "bad request. please provide valid inputs. acceptable inputs are departureStart, departureEnd, duration, airline." }
      );
    }

    const filteredFlights = [];
    const flightResult = await axios.get(config.url);
    const flights: flightDetails[] = flightResult.data;
    const { departureStart, departureEnd, duration, airline } = validationResult.value;

    for (const flight of flights) {
      const arrivalTime = moment(flight.arrivalTime);
      const departureTime = moment(flight.departureTime);
      const userDepartureStartDate = moment(departureStart);
      const userDepartureEndDate = moment(departureEnd);

      if (departureTime.isBetween(userDepartureStartDate, userDepartureEndDate)) {
        const flightDuration = arrivalTime.diff(departureTime, 'hours');
        const carrierPreference = airline && airline === flight.carrier ? 0.9 : 1;
        const flightDistance = await getDistanceBetweenAirports(flight.origin, flight.destination);

        if (duration && flightDuration >= parseInt(duration)) {
          continue
        }

        const flightScore = flightDuration * carrierPreference + flightDistance;

        filteredFlights.push({ ...flight, score: flightScore });
      }
    }

    filteredFlights.sort((a, b) => (a.score || 0) - (b.score || 0));

    return res.status(200).json(filteredFlights);
  } catch (e) {
    console.log('Error Occured', JSON.stringify(e));
    return res.status(500);
  }
}

export {
  getFlights
}