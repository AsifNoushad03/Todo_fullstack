var express = require('express');
var router = express.Router();
var noteModel = require('../Models/notes')
const verifyLogin = (req, res, next) => {
  if (req.session.user) {
    next()
  } else {
    res.redirect('/users/login')
  }
}
/* GET home page. */
router.get('/', verifyLogin, function (req, res, next) {
  let user = req.session.user
  console.log(user._id);
  noteModel.find({ userId: req.session.user._id }).lean()
    .exec(function (err, docs) {
      if (!err) {
        res.render('notes/index', { title: 'Home', notes: docs, user });
      } else {
        console.log('Error' + err);
      }
    })
});

router.get('/add', verifyLogin, function (req, res, next) {
  res.render('notes/add', { title: 'Add Notes', viewTitle: 'Add', });
});

router.post('/add', function (req, res, next) {
  if (req.body._id == '')
    insertNote(req, res)
  else
    updateNotes(req, res)
});

function insertNote(req, res) {
  const saveNote = new noteModel();
  saveNote.title = req.body.title;
  saveNote.desc = req.body.desc;
  saveNote.userId = req.session.user._id
  saveNote.save((err, doc) => {
    if (!err) {
      res.redirect('/')
    }
    else {
      console.log('Error' + err);
    }
  })
}

function updateNotes(req, res) {
  noteModel.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true }, (err, doc) => {
    if (!err)
      res.redirect('/')
    else {
      console.log('error ' + err);
    }
  })
}

router.get('/edit-notes/:id', (req, res) => {
  noteModel.findById(req.params.id).lean()
    .exec(function (err, doc) {
      if (!err) {
        res.render('notes/add', {
          viewTitle: 'Update',
          title: 'Update Notes',
          notes: doc
        })
      }
    })
})

router.get('/delete-notes/:id', (req, res) => {
  noteModel.findByIdAndRemove(req.params.id, (err, doc) => {
    if (!err)
      res.redirect('/')
    else {
      console.log('error ' + err);
    }
  })
})

module.exports = router;
