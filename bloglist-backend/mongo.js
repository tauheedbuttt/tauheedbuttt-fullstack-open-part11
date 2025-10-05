const mongoose = require("mongoose");

const password = process.argv[2];

if (!password) {
  console.log("give password as argument");
  process.exit(1);
}

const url = `mongodb+srv://tauheedbutt:${password}@cluster0.scibvex.mongodb.net/phonebook`;

mongoose.set("strictQuery", false);

mongoose.connect(url).then(() => console.log("MongoDB connection established"));

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

// command line functionality
const [name, number] = [process.argv[3], process.argv[4]];
if (name && number) {
  const person = new Person({
    name,
    number,
  });
  person.save().then(() => {
    console.log("person saved!");
    mongoose.connection.close();
  });
} else {
  Person.find().then((result) => {
    console.log(result);
    mongoose.connection.close();
  });
}
