const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const camps = await Campground.find({});
    res.render('campgrounds/index', { camps })
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.camp.location,
        limit: 1
    }).send();
    const newCamp = new Campground(req.body.camp);
    newCamp.geometry = geoData.body.features[0].geometry;
    newCamp.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
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

module.exports.updateCampground = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.camp.location,
        limit: 1
    }).send();
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.camp });
    camp.geometry = geoData.body.features[0].geometry;
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    camp.images.push(...imgs);
    await camp.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            cloudinary.uploader.destroy(filename);
        }
        await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    };
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${camp.id}`);
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds');
};