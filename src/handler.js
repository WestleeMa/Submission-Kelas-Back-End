const { nanoid } = require('nanoid');
const books = require('./books');

const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  let valid = false;
  let response;

  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished: pageCount === readPage,
    reading,
    insertedAt,
    updatedAt,
  };

  if (!name) {
    valid = false;
    response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
  } else if (readPage > pageCount) {
    valid = false;
    response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
  } else {
    valid = true;
    books.push(newBook);
  }

  const isSuccess = books.filter((book) => book.id === id).length > 0;

  if (isSuccess && valid) {
    response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
  }
  return response;
};

const getAllBooksHandler = (request) => {
  let queryBooks = [...books];

  if (request.query.name) {
    const status = request.query.name.toLowerCase();
    queryBooks = queryBooks.filter((book) => book.name.toLowerCase().includes(status));
  }

  if (request.query.reading) {
    const status = request.query.reading === '1';
    queryBooks = queryBooks.filter((book) => book.reading === status);
  }

  if (request.query.finished) {
    const status = request.query.finished === '1';
    queryBooks = queryBooks.filter((book) => book.finished === status);
  }

  const IdNamePublisher = queryBooks.map(({ id, name, publisher }) => ({
    id,
    name,
    publisher,
  }));

  return {
    status: 'success',
    data: {
      books: IdNamePublisher,
    },
  };
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const book = books.filter((b) => b.id === bookId)[0];

  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

const editBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;
  const updatedAt = new Date().toISOString();

  const index = books.findIndex((book) => book.id === bookId);
  let valid = false;
  let response;

  if (!name) {
    valid = false;
    response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
  } else if (readPage > pageCount) {
    valid = false;
    response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
  } else if (index === -1) {
    valid = false;
    response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Id tidak ditemukan',
    });
    response.code(404);
  } else {
    valid = true;
  }

  if (index !== -1 && valid) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };

    response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
  }

  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
