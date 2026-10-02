const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// In-memory Database Mock
let books = [
  {
    id: "1",
    title: "Clean Code",
    author: "Robert C. Martin",
    category: "Technology",
    status: "reading"
  },
  {
    id: "2",
    title: "Atomic Habits",
    author: "James Clear",
    category: "Self-Help",
    status: "read"
  },
  {
    id: "3",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    category: "Finance",
    status: "unread"
  }
];

// --- REST API ENDPOINTS ---

// 1. GET /api/books - ดึงรายการทั้งหมด พร้อมรองรับ Query Filtering
app.get('/api/books', (req, res) => {
  const { category, status } = req.query;
  let filteredBooks = [...books];

  if (category) {
    filteredBooks = filteredBooks.filter(
      (b) => b.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (status) {
    filteredBooks = filteredBooks.filter(
      (b) => b.status.toLowerCase() === status.toLowerCase()
    );
  }

  res.status(200).json(filteredBooks);
});

// 2. GET /api/books/:id - ดึงรายการเดียวตาม Route Parameter
app.get('/api/books/:id', (req, res) => {
  const { id } = req.params;
  const book = books.find((b) => b.id === id);

  if (!book) {
    return res.status(404).json({ message: `Book with ID ${id} not found.` });
  }

  res.status(200).json(book);
});

// 3. POST /api/books - เพิ่มรายการใหม่ พร้อม Validation
app.post('/api/books', (req, res) => {
  const { title, author, category, status } = req.body;

  // Validation: ตรวจสอบความครบถ้วนของข้อมูล
  if (!title || !author || !category || !status) {
    return res.status(400).json({
      message: 'Validation failed: title, author, category, and status are required fields.'
    });
  }

  const newBook = {
    id: Date.now().toString(),
    title: title.trim(),
    author: author.trim(),
    category: category.trim(),
    status: status.trim()
  };

  books.push(newBook);
  res.status(201).json(newBook);
});

// 4. PATCH /api/books/:id - แก้ไขรายการที่มีอยู่
app.patch('/api/books/:id', (req, res) => {
  const { id } = req.params;
  const { title, author, category, status } = req.body;

  const bookIndex = books.findIndex((b) => b.id === id);

  if (bookIndex === -1) {
    return res.status(404).json({ message: `Book with ID ${id} not found.` });
  }

  // อัปเดตเฉพาะฟิลด์ที่มีการส่งค่ามา
  const existingBook = books[bookIndex];
  const updatedBook = {
    ...existingBook,
    title: title !== undefined ? title.trim() : existingBook.title,
    author: author !== undefined ? author.trim() : existingBook.author,
    category: category !== undefined ? category.trim() : existingBook.category,
    status: status !== undefined ? status.trim() : existingBook.status
  };

  books[bookIndex] = updatedBook;
  res.status(200).json(updatedBook);
});

// 5. DELETE /api/books/:id - ลบรายการ
app.delete('/api/books/:id', (req, res) => {
  const { id } = req.params;
  const bookIndex = books.findIndex((b) => b.id === id);

  if (bookIndex === -1) {
    return res.status(404).json({ message: `Book with ID ${id} not found.` });
  }

  books.splice(bookIndex, 1);
  res.status(204).send();
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});