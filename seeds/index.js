const mongoose = require('mongoose');
const Campground = require('../models/campground');
const Review = require('../models/review');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true });

const db = mongoose.connection;
db.on("error", console.error.bind("Mongodb connection error"));
db.once("open", () => {
    console.log("Mongodb connected")
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    await Review.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '60cf66de88f45b41dc455816',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. In enim facilis rerum delectus assumenda eius reiciendis amet rem aut nesciunt fugit, voluptas, laborum unde quasi, velit quod nemo culpa iste.',
            price,
            geometry: {
                type: "Point",
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/jokepool/image/upload/v1626169045/YelpCamp/bnoezo3vypy8tnjl3rsl.jpg',
                    filename: 'YelpCamp/bnoezo3vypy8tnjl3rsl'
                },
                {
                    url: 'https://res.cloudinary.com/jokepool/image/upload/v1626169048/YelpCamp/h8vmavqistdb2b8hiv2i.jpg',
                    filename: 'YelpCamp/h8vmavqistdb2b8hiv2i'
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})