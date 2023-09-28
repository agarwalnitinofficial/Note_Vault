const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

//Get all the notes: get "/api/notes/fetchallnotes" -->login require
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error occured");
  }
});

//Add a new note using: post "/api/notes/addnote" -->login require
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "description must have at least 5 letter").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = await new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save();
      res.json(savedNote);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error occured");
    }
  }
);

//Update a note: put "/api/notes/updatenote/:id" -->login require
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    //Create a newNote obj
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }
    //check if the user is assesing his note only
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    //Find the note to be updated and update it
    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error occured");
  }
});

//Delete a note: put "/api/notes/deletenote/:id" -->login require
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  //check if the user is assesing his note only
  try {
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    //Find the note to be deleted and delete it
    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note has been deleted", note });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error occured");
  }
});

module.exports = router;