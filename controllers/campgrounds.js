const Campground = require('../models/campground');


module.exports.index = async (req, res) => {
    const camps = await Campground.find({});
    res.render('campgrounds/index', { camps })
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
    // if (!req.body.camp) throw new ExpressError('Invalid Campground Data', 400);
    const newCamp = new Campground(req.body.camp);
    newCamp.author = req.user._id;
    await newCamp.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${newCamp.id}`);
};

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!camp) {
        req.flash('error', 'Could not find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { camp });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    if (!camp) {
        req.flash('error', 'Could not find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { camp });
};

module.exports.editCampground = async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, req.body.camp, { runValidators: true, new: true });
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${camp.id}`);
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds');
};