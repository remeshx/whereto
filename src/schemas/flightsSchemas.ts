
export interface flightDetails {
  departureTime: string,
  arrivalTime: string,
  carrier: string,
  origin: string,
  destination: string,
  score?: number
}

export interface queryParam {
  departureStart: string,
  departureEnd: string,
  duration: string,
  airline: string,
}