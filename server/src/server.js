const app = require('./app');
const config = require('./config');
const connectDB = require('./config/database');

const startServer = async () => {
  await connectDB();

  app.listen(config.port, () => {
    console.log(
      `Server running in ${config.env} mode on port ${config.port}`
    );
  });
};

startServer();
