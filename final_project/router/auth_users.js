const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'fingerprint_customer', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const reviewText = req.query.review;
  const username = req.session.authorization.username; // Retrieve username from session

  if (!isbn || !reviewText || !username) {
    return res.status(400).json({message: "ISBN, review, and user authentication are required."});
  }

  if (books[isbn]) {
    let book = books[isbn];
    if (!book.reviews) {
      book.reviews = {}; // Initialize reviews if it doesn't exist
    }

    const oldReview = book.reviews[username];
    book.reviews[username] = reviewText; // Add or update the review

    if (oldReview) {
        return res.status(200).json({message: `Review for ISBN ${isbn} by user ${username} updated successfully.`, reviews: book.reviews});
    } else {
        return res.status(200).json({message: `Review for ISBN ${isbn} by user ${username} added successfully.`, reviews: book.reviews});
    }
  } else {
    return res.status(404).json({message: "Book not found with the provided ISBN."});
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!isbn || !username) {
    return res.status(400).json({message: "ISBN and user authentication are required."});
  }

  if (books[isbn]) {
    let book = books[isbn];
    if (book.reviews && book.reviews[username]) {
      delete book.reviews[username];
      return res.status(200).json({message: `Review for ISBN ${isbn} by user ${username} deleted successfully.`, reviews: book.reviews});
    } else {
      return res.status(404).json({message: `No review found for ISBN ${isbn} by user ${username}.`});
    }
  } else {
    return res.status(404).json({message: "Book not found with the provided ISBN."});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
