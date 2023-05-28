const express = require('express');
const {getALLTours,postTour,getTour,patchTour,deleteTour,checkId,checkData,aliasTopTours,getTourStats} = require('../controllers/tourController')
const router = express.Router();
const {protect,restrictTo} = require('../controllers/authController');


router.route('/top-5-tours').get(aliasTopTours,getALLTours);

router.route('/stats').get(getTourStats);
router.route('/')
.get(protect,getALLTours)
.post(postTour);

router.route('/:id')
.get(getTour)
.patch(patchTour)
.delete(protect,
    restrictTo('admin','lead-guide'),
    deleteTour);

module.exports = router;