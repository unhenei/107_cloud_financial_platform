const express = require("express");
const bodyParser = require('body-parser');
const server = express();
const db = require("./database.json")
const fs = require('fs');


const adminRouter = require("./routes/admin")
const userRouter = require("./routes/users")


const saveToDatabase = (db) => {
	fs.writeFileSync('./database.json', JSON.stringify(db, null, 2), {
		encoding: 'utf-8'
	});
};

server.set("view engine", "ejs");
server.use('/public', express.static(__dirname + '/public' ));
server.use(bodyParser.json());

server.use("/admin", adminRouter);
server.use("/users", userRouter);

server.get("/", (req, res) => {
	res.render("index")
})


server.listen(3000, () => {
	console.log("Server is running on port 3000")
})