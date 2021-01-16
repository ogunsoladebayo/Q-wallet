# Q-wallet
flexible wallet system with international coverage...

![Test](test/badge.svg)
## Technologies used
> The Q-wallet is the backend API for a wallet system and is built on NodeJS and Express.
>- The request processing flow in these terms: Signup request handling example:
```
/src → server.js → app.js → /routes/v1/index.js → /auth/apikey.js → schema.js → /helpers/validator.js → asyncHandler.js → /routes/v1/signup.js → schema.js → /helpers/validator.js → asyncHandler.js → /database/repository/UserRepo.js → /database/model/User.js → /core/ApiResponses.js
```
>1. The request is routed to its corresponsding handler via Router **/src/routes/v1/index.js**
>2. The RouteHandler is called for that particular endpoint **(Example: /src/routes/v1/access/signup.js)**
>3. Based on the validations and request it is either sent to the ErrorHandler [`app.use((err: Error, req: Request, res: Response, next: NextFunction) => {ApiError.handle(err);})`].
>4. Else it is handled by the ResponseHandler i.e. **ApiResponse → send(res)**
> Database used is MongoDB, a No SQL database. MongoDB was used as opposed to a relational database because the document data model is a powerful way to store and retrieve data that allows developers to move fast. MongoDB's horizontal, scale-out architecture can support huge volumes of both data and traffic. In truth, RDBMSs help a lot for projects with many interconnected tables but this project contains little relationships so this feature is not missed.

## Usage
Rename "config.env.example" to "config.env" and update the values/settings to your own.
## Running app in local environment
1. Install dependencies: `npm install`
2. Run app in dev mode: `npm run dev`
3. ...or run in prod mode: `npm start`
4. Admin account seeder: `node seeder -i`
## Docker compose
> docker-compose.yml file included in project's root folder.

## Demo
The API is live at [Q-wallet API](https://api.q-wallet.tk)

Extensive documentation with examples [here](https://documenter.getpostman.com/view/11616904/TVzSjwg5)

- Version: 1.0.0
- Lisence: MIT
- Author: Usman Ogunsola