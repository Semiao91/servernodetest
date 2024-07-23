const express = require('express');
const path = require("path");
const fs = require('fs');
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001
const dbFilePath = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

app.get('/api/persons', (req, res) => {
  fs.readFile(dbFilePath, 'utf8', (err, data) => {
    if (err) {
      console.log(err.message)
      return res.status(500).json({error: 'Failed to read the database file'});
    }
    const persons = JSON.parse(data);
    res.json(persons);
  })
})

app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id;

  fs.readFile(dbFilePath, 'utf8', (err, data)  => {
    let db = JSON.parse(data);
    let persons = db.persons
    let personsId = persons.find(person => person.id === id);

    if (err  || personsId === undefined)  {
      return res.status(500).json({error: 'Failed to read the database file'});
    }

    persons = persons.filter(person => person.id !== id);
    db.persons = persons
    fs.writeFile(dbFilePath, JSON.stringify(db, null, 2), (err) => {
      if (err) {
        return res.status(500).json({error: 'Failed to write the database file'});
      }
      res.json({message: 'Successfully deleted the person'});
    })
  })

})

app.post('/api/persons', (req, res) => {
  const person = req.body;

  if (!person.name || !person.number) {
    return res.status(500).json({error: 'Failed to create the person'});
  }

  fs.readFile(dbFilePath, (err, data) => {
    let db = JSON.parse(data);
    let persons = db.persons;
    let newId = persons[persons.length - 1].id;
    persons.push({ ...person, id: String(++newId) });
    db.persons = persons;

    fs.writeFile(dbFilePath, JSON.stringify(db, null, 2), (err) => {
      if (err) {
        return res.status(500).json({error: 'Failed to write the database file'});
      }
      return  res.json({message: 'Successfully added a new person'});
    })
  })
})

app.listen(PORT, () => {
  console.log("Listening on port " + PORT);
})
