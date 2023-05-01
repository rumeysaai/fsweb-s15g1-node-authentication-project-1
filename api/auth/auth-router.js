// `checkUsernameFree`, `checkUsernameExists` ve `checkPasswordLength` gereklidir (require)
// `auth-middleware.js` deki middleware fonksiyonları. Bunlara burda ihtiyacınız var!
const router = require('express').Router();
const { sinirli,
  usernameBostami,
  usernameVarmi,
  sifreGecerlimi } = require('./auth-middleware');
const bcrypt = require('bcryptjs');
const UserModel = require('../users/users-model');
/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status: 201
  {
    "user_id": 2,
    "username": "sue"
  }

  response username alınmış:
  status: 422
  {
    "message": "Username kullaniliyor"
  }

  response şifre 3 ya da daha az karakterli:
  status: 422
  {
    "message": "Şifre 3 karakterden fazla olmalı"
  }
 */
router.post('/register', usernameBostami, sifreGecerlimi, async (req, res, next) => {
  try {

    let model = {
      username: req.body.username,
      password: bcrypt.hashSync(req.body.password)
    }
    const inserted = await UserModel.ekle(model);
    res.status(201).json(inserted);

  } catch (error) {
    next(error);
  }
})


/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status: 200
  {
    "message": "Hoşgeldin sue!"
  }

  response geçersiz kriter:
  status: 401
  {
    "message": "Geçersiz kriter!"
  }
 */
router.post('/login', usernameVarmi, (req, res, next) => {
  try {
    if(req.session)
      req.session.user_id = req.user.user_id;

    res.status(200).json({message: `Hoşgeldin ${req.user.username}`})

  } catch (error) {
    next(error)
  }
})

/**
  3 [GET] /api/auth/logout

  response giriş yapmış kullanıcılar için:
  status: 200
  {
    "message": "Çıkış yapildi"
  }

  response giriş yapmamış kullanıcılar için:
  status: 200
  {
    "message": "Oturum bulunamadı!"
  }
 */
router.get('/logout', (req,res,next)=>{
  try {

    if(req.session.user_id>0){
      req.session.destroy(err=>{
        if(err){
          res.status(500).json({message:'Session destroy edilirken hata oluştu'})
        }
        else{
          res.json({message: "Çıkış yapildi"})
        }
      })
    }
    else{
      res.status(400).json({message: "Oturum bulunamadı!"})
    }
    
  } catch (error) {
    next(error);
  }
})

// Diğer modüllerde kullanılabilmesi için routerı "exports" nesnesine eklemeyi unutmayın.
module.exports = router;