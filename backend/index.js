const express = require('express');
const bodyParser = require('body-parser');
const path = require('path')
const pool = require('./models/db');


const cors = require('cors');

const eventsRouter = require('./routes/events');
const participantsRouter = require("./routes/participants");
const schedulessRouter = require("./routes/schedules");

const app = express();
app.use(express.static(path.join(__dirname, '../public')));
app.use(cors()); 
app.use(bodyParser.json());

app.get('/', (req, res) => {
res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use('/api/events', eventsRouter);
app.use('/api/participants', participantsRouter);
app.use('/api/schedules', schedulessRouter);

// app.use((req, res) => {
//     res.status(404).send("Route not found");
// });

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
