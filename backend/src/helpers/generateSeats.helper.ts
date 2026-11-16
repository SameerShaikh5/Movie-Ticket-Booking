

export const generateSeats = (rows:number, columns:number)=>{

if (rows < 1 || rows > 26) {
    throw new Error('Rows must be between 1 and 26.');
  }
    const ALPHABETS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

    const rowArr = ALPHABETS.slice(0,rows)
    
    let seats:string[] = []

    rowArr.forEach((alphabet)=>{
        for(let num = 1; num <= columns; num++){
            seats.push(`${alphabet}${num}`)
        }
    })

    return seats
}