const categories = document.querySelector('.categories');
const products = document.querySelector('.products');
const showBtn = document.querySelector('.show_btn');
const cartModal = document.getElementById('cartModal');
const closeModal = document.getElementById('closeModal');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const showCartbtn = document.getElementById('showCartBtn')

// Mahsulotlarni render qilish funksiyasi
const product = (data) => {
    products.innerHTML = data.map((item) => {
        const originalPrice = parseFloat(item.price);
        const discountedPrice = (originalPrice * 0.76).toFixed(2); // 24% chegirma
        return `
            <div class="card">
                <img width="200" src="${item.image}">
                <h3 class='title_card'>${item.title}</h3>
                <p class="price_card">
                    <span class="original_price" style="text-decoration: line-through;">${originalPrice}$</span>
                    <span class="discounted_price" style="color: red; font-weight: bold;">${discountedPrice}$</span>
                </p>
                <div>
                    <button class="add_button" data-image="${item.image}" data-id="${item.id}" data-title="${item.title}" data-price="${discountedPrice}">Qo'shish</button>
                </div>
            </div>
        `;
    }).join('');

    // "Qo'shish" tugmalariga hodisa qo'shamiz
    document.querySelectorAll('.add_button').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const title = e.target.dataset.title;
            const price = e.target.dataset.price;
            const image = e.target.dataset.image;
            addToCart({ id, title, price, image });
        });
    });
};

// Kategoriya bo'yicha mahsulotlarni render qilish funksiyasi
const renderProduct = (key) => {
    fetch(`https://fakestoreapi.com/products/category/${key}`)
        .then((res) => res.json())
        .then((data) => {
            product(data);
        });
};

// Kategoriyalarni render qilish funksiyasi
const category = (data) => {
    categories.innerHTML = data.map((item, index) => `
        <button data-name="${item}" class="${index === 0 ? 'active' : ''}">${item}</button>
    `).join('');
};

// Kategoriyalarni olib kelish va render qilish funksiyasi
const getCategories = () => {
    fetch("https://fakestoreapi.com/products/categories")
        .then((res) => res.json())
        .then((data) => {
            category(data);
            renderProduct(data[0]);
        });
};

// Mahsulotlarni savatga (localStorage) qo'shish funksiyasi
const addToCart = (item) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(i => i.id === item.id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        item.quantity = 1;
        cart.push(item);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount(); // Add this line
};

// Savatdagi mahsulotlarni yangilash funksiyasi
const updateCart = (id, change) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemToUpdate = cart.find(item => item.id === id);

    if (itemToUpdate) {
        itemToUpdate.quantity += change;
        if (itemToUpdate.quantity <= 0) {
            // Remove item if quantity drops to zero or below
            cart = cart.filter(item => item.id !== id);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount(); // Add this line
        showCart();
    }
};

// Savatdagi mahsulotlarni modalda ko'rsatish funksiyasi
const showCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Savatda mahsulot yo\'q</p>';
    } else {
        const totalPrice = cart.reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);
        cartItems.innerHTML = `
            <h2>Savatdagi Mahsulotlar</h2>
            ${cart.map(item => `
                <div class="cart_item">
                    <img width="200" src="${item.image}">
                    <h3>${item.title}</h3>
                    <p>Narxi: ${item.price}$</p>
                    <div class="quantity">
                        <button class="quantity_btn minus" data-id="${item.id}">-</button>
                        <span class="quantity_text">${item.quantity}</span>
                        <button class="quantity_btn plus" data-id="${item.id}">+</button>
                    </div>
                </div>
            `).join('')}
            <hr>
            <p><strong>Umumiy Narx: ${totalPrice.toFixed(2)}$</strong></p>
        `;

        // Quantity buttons logic in cart items
        const minusButtons = document.querySelectorAll('.cart_item .quantity_btn.minus');
        const plusButtons = document.querySelectorAll('.cart_item .quantity_btn.plus');

        minusButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                updateCart(id, -1);
            });
        });

        plusButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                updateCart(id, 1);
            });
        });
    }
    cartModal.style.display = 'block';
};

// Kategoriya tugmalari uchun hodisa qo'shamiz
categories.addEventListener('click', (e) => {
    const key = e.target.dataset.name;
    if (key) {
        renderProduct(key);
        document.querySelectorAll('.categories button').forEach(button => {
            button.classList.remove('active');
        });
        e.target.classList.add('active');
    }
});

// "Savatchani Ko'rsatish" tugmasi uchun hodisa qo'shamiz
showBtn.addEventListener('click', showCart);

// Modalni yopish uchun hodisa qo'shamiz
closeModal.addEventListener('click', () => {
    cartModal.style.display = 'none';
});

// Modalni kontentdan tashqariga bosilganda yopish
window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.style.display = 'none';
    }
});

// Savatdagi mahsulotlar sonini yangilash funksiyasi
const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCount.textContent = itemCount;
};

showCartbtn.addEventListener('click', (e) => {
    showCart()
})

getCategories();
updateCartCount(); 
