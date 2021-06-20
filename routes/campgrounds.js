const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn } = require('../middleware');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas');


const validateCamp = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};



router.get('/', catchAsync(async (req, res) => {
    const camps = await Campground.find({});
    res.render('campgrounds/index', { camps })
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

router.post('/new', isLoggedIn, validateCamp, catchAsync(async (req, res, next) => {
    // if (!req.body.camp) throw new ExpressError('Invalid Campground Data', 400);
    const newCamp = new Campground(req.body.camp);
    await newCamp.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${newCamp.id}`);
}));

router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id).populate('reviews');
    if (!camp) {
        req.flash('error', 'Could not find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { camp });
}));

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    if (!camp) {
        req.flash('error', 'Could not find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { camp });
}));

router.put('/:id/edit', isLoggedIn, validateCamp, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, req.body.camp, { runValidators: true, new: true });
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${camp.id}`);
}));

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds');
}));

module.exports = router;