
export interface ShowData {
    movieTitle: string, posterImage: string,
    description: string, genre: string[], language: string, rating: number, censor: string,
    screenId: string, format: string, startTime: string, runtime: number, standardTicketPrice: number, vipTicketPrice: number
}

export interface movieQuery {
    movieTitle?: string,
    page?: number,
    limit?: number
}