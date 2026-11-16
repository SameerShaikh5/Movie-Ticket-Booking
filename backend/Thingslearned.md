
### Database
when have database level validation like required, min, max, etc.
when we add a document it will check if data is valid or not.
But when we update that document using updateOne, findByIdANdUpdate, etc. then it won't run validators. For that we need to pass {runValidators:true} in those update functions to check for data validations.

### Date Object

The ```new Date() `` gives time utc time and can be stored in db as it is.
It can be easily converted to indian or any time zone using .toLocaleString() method by passing args in it.
By storing time using new Date method allows server to maintain a proper time irrespective of the region (server hosted region) thereby making server side time logic easier to calculate.

### Jwt NotBeforeError

Agar token creation time 2pm hai lekin current time 1pm ho rha hai.
Token active hi nhi hai.

Occurs when:
Think of a JWT as a movie ticket. The ticket has a specific start time printed on it.
The error occurs the exact moment your application tries to scan and accept that ticket, but the clock on the wall says it is still 10 minutes before showtime. The system looks at the token, looks at the current time, realizes the token isn't active yet, and throws an error.

1. Computers rely on internal clocks to tell time. Sometimes, the server that creates the token and the server that verifies the token are out of sync by just a few seconds or minutes

2. If one server is calculating time in Coordinated Universal Time (UTC) and another is mistakenly using a local time zone without translating it properly, the timestamps won't match up, causing the token to look like it belongs in the future.

#### Solution:
Refresh Token:
Create 2 tokens access token(exp: 15min) and refresh token(exp: 7d).
When access token expires refresh token triggers /refresh to get access token back again.

