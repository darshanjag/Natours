const express = require('express');
const {signUp,login,forgotPassword,resetPassword,protect} = require('../controllers/authController');
const {getAllUsers,createUser,getUser,updateUser,deleteUser} = require('../controllers/userController');

const router = express.Router();
router.post('/signup',signUp);
router.post('/login',login);
router.post('/forgotPassowrd', forgotPassword);
router.patch('/resetPassword/:token',resetPassword);


router.route('/')
.get(getAllUsers)
.post(createUser)

router.route('/:id')
.get(getUser)
.patch(updateUser)
.delete(deleteUser);

module.exports = router;