/* =========================================================
   Prosperity's Clothing Boutique
   Shared JavaScript: products, search, cart and contact form.
   ========================================================= */

const products = [
    { id: 1, name: "Blush Satin Dress", category: "dresses", price: 799, image: "assets/images/dress-pink.svg", badge: "Bestseller" },
    { id: 2, name: "Midnight Evening Dress", category: "dresses", price: 899, image: "assets/images/dress-black.svg", badge: "Popular" },
    { id: 3, name: "Soft Rose Blouse", category: "tops", price: 449, image: "assets/images/top-rose.svg", badge: "New" },
    { id: 4, name: "Classic Black Top", category: "tops", price: 399, image: "assets/images/top-black.svg", badge: "" },
    { id: 5, name: "Gold Accent Heels", category: "shoes", price: 699, image: "assets/images/shoes-gold.svg", badge: "New" },
    { id: 6, name: "Pearl Mini Handbag", category: "bags", price: 549, image: "assets/images/bag-pearl.svg", badge: "New" },
    { id: 7, name: "Everyday Nude Heels", category: "shoes", price: 649, image: "assets/images/shoes-nude.svg", badge: "" },
    { id: 8, name: "Structured Blush Bag", category: "bags", price: 599, image: "assets/images/bag-blush.svg", badge: "" },
    { id: 9, name: "Pearl Hair Clip Set", category: "accessories", price: 199, image: "assets/images/accessory-pearl.svg", badge: "New" },
    { id: 10, name: "Satin Wrap Dress", category: "dresses", price: 749, image: "assets/images/dress-wrap.svg", badge: "New" }
];

const money = value => `R${Number(value).toLocaleString("en-ZA")}`;

function getCart() {
    try { return JSON.parse(localStorage.getItem("prosperitysCart")) || []; }
    catch { return []; }
}

function saveCart(cart) {
    localStorage.setItem("prosperitysCart", JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const count = getCart().reduce((total, item) => total + item.qty, 0);
    document.querySelectorAll(".cart-count").forEach(el => el.textContent = count);
}

function productCard(product) {
    return `
        <div class="col-6 col-md-4 col-lg-3">
            <article class="product-card">
                <div class="product-image">
                    ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3>${product.name}</h3>
                    <span class="price">${money(product.price)}</span>
                    <button class="btn btn-primary-custom add-to-cart" data-id="${product.id}" type="button">Add to cart</button>
                </div>
            </article>
        </div>`;
}

function renderProducts(list, targetId) {
    const target = document.getElementById(targetId);
    if (target) target.innerHTML = list.map(productCard).join("");
}

function addToCart(id) {
    const cart = getCart();
    const existing = cart.find(item => item.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ id, qty: 1 });
    saveCart(cart);
    showToast("Item added to your cart.");
}

function showToast(message) {
    let toast = document.getElementById("siteToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "siteToast";
        toast.style.cssText = "position:fixed;right:20px;bottom:20px;z-index:2000;background:#171417;color:#fff;padding:13px 18px;border-radius:999px;font:600 .8rem Poppins, sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.2);";
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => toast.remove(), 2200);
}

function renderCart() {
    const target = document.getElementById("cartContent");
    if (!target) return;
    const cart = getCart();

    if (!cart.length) {
        target.innerHTML = `<div class="empty-cart"><p class="eyebrow">YOUR CART IS EMPTY</p><h2>Nothing here yet.</h2><p class="text-muted">Explore the collection and add something you love.</p><a href="shop.html" class="btn btn-primary-custom">Start Shopping</a></div>`;
        return;
    }

    const items = cart.map(item => {
        const p = products.find(product => product.id === item.id);
        return { ...p, qty: item.qty };
    }).filter(Boolean);

    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const delivery = subtotal >= 1000 ? 0 : 80;
    const total = subtotal + delivery;

    target.innerHTML = `
        <div class="cart-layout">
            <div>
                <div class="section-heading"><div><p class="eyebrow">SELECTED ITEMS</p><h2>Your bag</h2></div></div>
                ${items.map(item => `
                    <article class="cart-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div>
                            <h3>${item.name}</h3>
                            <p>${item.category} • ${money(item.price)} each</p>
                            <div class="qty-controls">
                                <button type="button" data-action="decrease" data-id="${item.id}" aria-label="Decrease quantity">−</button>
                                <strong>${item.qty}</strong>
                                <button type="button" data-action="increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
                            </div>
                        </div>
                        <strong>${money(item.price * item.qty)}</strong>
                        <button class="remove-btn" type="button" data-action="remove" data-id="${item.id}">Remove</button>
                    </article>`).join("")}
                <a href="shop.html" class="text-link">← Continue shopping</a>
            </div>
            <aside class="cart-summary">
                <p class="eyebrow">ORDER SUMMARY</p>
                <div class="summary-row"><span>Subtotal</span><strong>${money(subtotal)}</strong></div>
                <div class="summary-row"><span>Delivery</span><strong>${delivery ? money(delivery) : "FREE"}</strong></div>
                <div class="summary-row summary-total"><span>Total</span><strong>${money(total)}</strong></div>
                <button type="button" class="btn btn-light-custom w-100 mt-3" id="checkoutBtn">Proceed to checkout</button>
                <small class="d-block mt-3 text-center" style="color:#bcb3b9;">Demo checkout for coursework.</small>
            </aside>
        </div>`;
}

function changeQuantity(id, direction) {
    const cart = getCart();
    const item = cart.find(entry => entry.id === id);
    if (!item) return;
    item.qty += direction;
    const updated = cart.filter(entry => entry.qty > 0);
    saveCart(updated);
    renderCart();
}

document.addEventListener("click", event => {
    const addButton = event.target.closest(".add-to-cart");
    if (addButton) addToCart(Number(addButton.dataset.id));

    const actionButton = event.target.closest("[data-action]");
    if (actionButton) {
        const id = Number(actionButton.dataset.id);
        const action = actionButton.dataset.action;
        if (action === "increase") changeQuantity(id, 1);
        if (action === "decrease") changeQuantity(id, -1);
        if (action === "remove") {
            saveCart(getCart().filter(item => item.id !== id));
            renderCart();
        }
    }

    if (event.target.id === "checkoutBtn") {
        showToast("Checkout is ready for integration with a payment service.");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();

    renderProducts(products.slice(0, 4), "featuredProducts");
    renderProducts(products.filter(p => p.category === "dresses"), "womenDresses");
    renderProducts(products.filter(p => p.category === "tops"), "womenTops");
    renderProducts(products.filter(p => p.badge === "New"), "arrivalGrid");

    const grid = document.getElementById("productGrid");
    const search = document.getElementById("productSearch");
    const filter = document.getElementById("categoryFilter");
    const noResults = document.getElementById("noResults");

    function filterProducts() {
        if (!grid) return;
        const query = (search?.value || "").toLowerCase().trim();
        const category = filter?.value || "all";
        const filtered = products.filter(p => {
            const matchesText = `${p.name} ${p.category}`.toLowerCase().includes(query);
            const matchesCategory = category === "all" || p.category === category;
            return matchesText && matchesCategory;
        });
        renderProducts(filtered, "productGrid");
        noResults.classList.toggle("d-none", filtered.length !== 0);
    }

    search?.addEventListener("input", filterProducts);
    filter?.addEventListener("change", filterProducts);
    filterProducts();

    renderCart();

    const form = document.getElementById("contactForm");
    const formMessage = document.getElementById("formMessage");
    form?.addEventListener("submit", event => {
        event.preventDefault();
        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            return;
        }
        formMessage.textContent = "Thank you! Your message has been received. We will get back to you soon.";
        formMessage.classList.add("show");
        form.reset();
        form.classList.remove("was-validated");
    });
});
