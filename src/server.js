const app = require("./app");
const env = require("./config/env");

app.listen(env.PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${env.PORT}`);
});
