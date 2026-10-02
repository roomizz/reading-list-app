const API_URL = '/api/books';

// DOM Elements
const bookForm = document.getElementById('book-form');
const bookIdInput = document.getElementById('book-id');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const categoryInput = document.getElementById('category');
const statusInput = document.getElementById('status');
const formTitle = document.getElementById('form-title');
const btnSave = document.getElementById('btn-save');
const btnCancel = document.getElementById('btn-cancel');

const filterCategory = document.getElementById('filter-category');
const filterStatus = document.getElementById('filter-status');
const bookGrid = document.getElementById('book-grid');
const bookCount = document.getElementById('book-count');

// Fetch and Render Books
async function fetchBooks() {
  try {
    const categoryVal = filterCategory.value;
    const statusVal = filterStatus.value;

    const queryParams = new URLSearchParams();
    if (categoryVal) queryParams.append('category', categoryVal);
    if (statusVal) queryParams.append('status', statusVal);

    const url = queryParams.toString() ? `${API_URL}?${queryParams.toString()}` : API_URL;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('Failed to fetch books');

    const books = await response.json();
    renderBooks(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    bookGrid.innerHTML = `<p class="error">ไม่สามารถดึงข้อมูลได้: ${error.message}</p>`;
  }
}

// Render Book Cards
function renderBooks(books) {
  bookCount.textContent = books.length;
  bookGrid.innerHTML = '';

  if (books.length === 0) {
    bookGrid.innerHTML = '<p>ไม่พบรายการหนังสือที่ค้นหา</p>';
    return;
  }

  books.forEach((book) => {
    const card = document.createElement('div');
    card.className = 'book-card';

    const statusLabel = {
      unread: 'ยังไม่ได้อ่าน',
      reading: 'กำลังอ่าน',
      read: 'อ่านจบแล้ว'
    }[book.status] || book.status;

    card.innerHTML = `
      <div>
        <h3>${escapeHtml(book.title)}</h3>
        <p class="book-author">โดย ${escapeHtml(book.author)}</p>
        <div class="book-meta">
          <span class="badge badge-category">${escapeHtml(book.category)}</span>
          <span class="badge badge-${book.status}">${statusLabel}</span>
        </div>
      </div>
      <div class="card-buttons">
        <button class="btn btn-secondary btn-edit" onclick="editBook('${book.id}')">แก้ไข</button>
        <button class="btn btn-danger btn-delete" onclick="deleteBook('${book.id}')">ลบ</button>
      </div>
    `;

    bookGrid.appendChild(card);
  });
}

// Add or Update Book
bookForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = bookIdInput.value;
  const bookData = {
    title: titleInput.value.trim(),
    author: authorInput.value.trim(),
    category: categoryInput.value,
    status: statusInput.value
  };

  try {
    let response;
    if (id) {
      // PATCH /api/books/:id
      response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData)
      });
    } else {
      // POST /api/books
      response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData)
      });
    }

    if (response.status === 400) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (!response.ok) throw new Error('Failed to save book');

    resetForm();
    await fetchBooks();
  } catch (error) {
    console.error('Error saving book:', error);
    alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
  }
});

// Edit Book Mode
async function editBook(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
      alert('ไม่พบข้อมูลหนังสือ');
      return;
    }

    const book = await response.json();
    bookIdInput.value = book.id;
    titleInput.value = book.title;
    authorInput.value = book.author;
    categoryInput.value = book.category;
    statusInput.value = book.status;

    formTitle.textContent = '✏️ แก้ไขข้อมูลหนังสือ';
    btnSave.textContent = 'อัปเดตข้อมูล';
    btnCancel.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    console.error('Error fetching book details:', error);
  }
}

// Delete Book
async function deleteBook(id) {
  if (!confirm('คุณต้องการลบหนังสือเล่มนี้ใช่หรือไม่?')) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    if (response.status === 204) {
      await fetchBooks();
    } else {
      alert('ไม่สามารถลบรายการได้');
    }
  } catch (error) {
    console.error('Error deleting book:', error);
  }
}

// Reset Form
function resetForm() {
  bookIdInput.value = '';
  bookForm.reset();
  formTitle.textContent = '➕ เพิ่มหนังสือใหม่';
  btnSave.textContent = 'บันทึกหนังสือ';
  btnCancel.classList.add('hidden');
}

btnCancel.addEventListener('click', resetForm);
filterCategory.addEventListener('change', fetchBooks);
filterStatus.addEventListener('change', fetchBooks);

// Helper for XSS protection
function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Initial Load
document.addEventListener('DOMContentLoaded', fetchBooks);