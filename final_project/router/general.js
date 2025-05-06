const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  // Check if the username already exists
  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({message: "Username already exists"});
  }

  // If username is new, add the user
  users.push({username: username, password: password});
  return res.status(201).json({message: "User registered successfully"});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const getBooks = () => {
      return new Promise((resolve, reject) => {
        if (books) {
          resolve(books);
        } else {
          reject("Books not found");
        }
      });
    };

    const allBooks = await getBooks();
    return res.status(200).json(allBooks);
  } catch (error) {
    return res.status(404).json({message: "Error fetching books: " + error});
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  const getBookDetails = (isbnToFind) => {
    return new Promise((resolve, reject) => {
      if (books && books[isbnToFind]) {
        resolve(books[isbnToFind]);
      } else if (books) {
        reject("Book not found");
      } else {
        reject("Books database not found");
      }
    });
  };
  try {
    const book = await getBookDetails(isbn);
    return res.status(200).json(book);
  } catch (error) {
    if (error === "Book not found") {
        return res.status(404).json({message: "Book not found"});
    } else {
        return res.status(500).json({message: "Error fetching book details: " + error});
    }
  }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const requestedAuthor = req.params.author;
  const getBooksByAuthor = (authorName) => {
    return new Promise((resolve, reject) => {
      if (!books) {
        reject("Book database could not be loaded.");
        return;
      }
      const booksByAuthorArray = [];
      for (const isbn in books) {
        if (books.hasOwnProperty(isbn)) {
          const book = books[isbn];
          if (book.author && book.author.toLowerCase() === authorName.toLowerCase()) {
            booksByAuthorArray.push(book);
          }
        }
      }
      if (booksByAuthorArray.length > 0) {
        resolve(booksByAuthorArray);
      } else {
        reject("No books found for author: " + authorName);
      }
    });
  };

  try {
    const booksByAuthor = await getBooksByAuthor(requestedAuthor);
    return res.status(200).json({ booksbyauthor: booksByAuthor });
  } catch (error) {
    if (error.startsWith("No books found for author:")) {
        return res.status(404).json({ message: error });
    } else {
        return res.status(500).json({ message: "Error fetching books by author: " + error });
    }
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const requestedTitle = req.params.title;
  const getBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
      if (!books) {
        reject("Book database could not be loaded.");
        return;
      }
      const booksWithMatchingTitleArray = [];
      for (const isbn in books) {
        if (books.hasOwnProperty(isbn)) {
          const book = books[isbn];
          if (book.title && book.title.toLowerCase() === title.toLowerCase()) {
            booksWithMatchingTitleArray.push(book);
          }
        }
      }
      if (booksWithMatchingTitleArray.length > 0) {
        resolve(booksWithMatchingTitleArray);
      } else {
        reject("No books found with title: " + title);
      }
    });
  };

  try {
    const booksWithMatchingTitle = await getBooksByTitle(requestedTitle);
    return res.status(200).json({ booksbytitle: booksWithMatchingTitle });
  } catch (error) {
    if (error.startsWith("No books found with title:")) {
        return res.status(404).json({ message: error });
    } else {
        return res.status(500).json({ message: "Error fetching books by title: " + error });
    }
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const books = require('./booksdb.js');

  if (!books) {
    return res.status(500).json({ message: "Book database could not be loaded." });
  }

  const book = books[isbn];

  if (book) {
    // Check if the book has a reviews property
    if (book.hasOwnProperty('reviews')) {
      return res.status(200).json(book.reviews);
    } else {
      // This case should ideally not happen if all books have a reviews object, even if empty
      return res.status(200).json({}); // Return empty reviews if property missing
    }
  } else {
    return res.status(404).json({ message: "No book found for ISBN: " + isbn });
  }
});

module.exports.general = public_users;
