import * as swaggerExpressMW from "swagger-express-mw";
import * as express from "express";

const app: express.Express = express();

swaggerExpressMW.create(
    {
        appRoot: __dirname
    },
    ((err, runner) => {
        if (err) {
            throw err;
        }
        runner.register(app);
        const port = process.env.PORT || 10010;
        app.listen(port);
    })
);

export default app;
