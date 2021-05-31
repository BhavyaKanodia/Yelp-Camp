const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Campground = require('./models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true });

// .then(() => {
//     console.log("Mongo connection established.")
// })
// .catch((e) => {
//     console.log('An error occured in Mongoose connection');
//     console.log(e);
// })

const db = mongoose.connection;
db.on("error", console.error.bind("Mongodb connection error"));
db.once("open", () => {
    console.log("Mongodb connected")
});

const app = express();

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
    res.render('home')
});

app.get('/campgrounds', async (req, res) => {
    const camps = await Campground.find({});
    res.render('campgrounds/index', { camps })
});

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.post('/campgrounds/new', async (req, res) => {
    const { camp } = req.body;
    const newCamp = new Campground(camp);
    await newCamp.save();
    res.redirect(`/campgrounds/${newCamp.id}`);
})

app.get('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    res.render('campgrounds/show', { camp });
});

app.get('/campgrounds/:id/edit', async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    res.render('campgrounds/edit', { camp });
});

app.put('/campgrounds/:id/edit', async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, req.body.camp, { runValidators: true });
    res.redirect(`/campgrounds/${camp.id}`);
});

app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})




app.listen(3000, () => {
    console.log('At port 3000')
});

