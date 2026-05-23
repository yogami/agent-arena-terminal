const app = require('./app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Agent Arena Terminal backend listening on port ${PORT}`);
});
