const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '../data');

// Helper to write to JSON files
function writeData(collection, data) {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const filePath = path.join(DATA_DIR, `${collection}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

async function seed() {
    try {
        console.log('Seeding local storage...');

        // Users
        const hashedAdmin = await bcrypt.hash('admin123', 12);
        const hashedCashier = await bcrypt.hash('cashier123', 12);
        const hashedDelivery = await bcrypt.hash('delivery123', 12);
        const hashedCustomer = await bcrypt.hash('customer123', 12);

        const users = [
            { _id: 'u1', name: 'Admin User', email: 'admin@restaurant.com', password: hashedAdmin, phone: '9876543210', role: 'admin', createdAt: new Date().toISOString() },
            { _id: 'u2', name: 'Cashier User', email: 'cashier@restaurant.com', password: hashedCashier, phone: '9876543211', role: 'cashier', createdAt: new Date().toISOString() },
            { _id: 'u3', name: 'Delivery Partner', email: 'delivery@restaurant.com', password: hashedDelivery, phone: '9876543212', role: 'delivery', createdAt: new Date().toISOString() },
            { _id: 'u4', name: 'John Customer', email: 'john@customer.com', password: hashedCustomer, phone: '9876543213', role: 'customer', loyaltyPoints: 150, createdAt: new Date().toISOString() },
        ];
        writeData('users', users);
        console.log('Users seeded');

        // Categories
        const categories = [
            { _id: 'cat1', name: 'Starters', description: 'Appetizers and small bites', order: 1, createdAt: new Date().toISOString() },
            { _id: 'cat2', name: 'Main Course', description: 'Full meals and curries', order: 2, createdAt: new Date().toISOString() },
            { _id: 'cat3', name: 'Biryani', description: 'Fragrant rice dishes', order: 3, createdAt: new Date().toISOString() },
            { _id: 'cat4', name: 'Chinese', description: 'Indo-Chinese favorites', order: 4, createdAt: new Date().toISOString() },
            { _id: 'cat5', name: 'Drinks', description: 'Beverages and refreshments', order: 5, createdAt: new Date().toISOString() },
            { _id: 'cat6', name: 'Desserts', description: 'Sweet treats', order: 6, createdAt: new Date().toISOString() },
        ];
        writeData('categories', categories);
        console.log('Categories seeded');

        // Menu Items
        const menuItems = [
            // Starters
            { _id: 'm1', name: 'Paneer Tikka', category: 'cat1', price: 249, tax: 5, description: 'Marinated cottage cheese grilled in tandoor', isVeg: true, isBestseller: true, preparationTime: 15, createdAt: new Date().toISOString() },
            { _id: 'm2', name: 'Chicken 65', category: 'cat1', price: 279, tax: 5, description: 'Spicy deep-fried chicken', isVeg: false, isBestseller: true, preparationTime: 20, createdAt: new Date().toISOString() },
            // Main Course
            { _id: 'm3', name: 'Butter Chicken', category: 'cat2', price: 349, tax: 5, description: 'Tender chicken in rich butter and tomato gravy', isVeg: false, isBestseller: true, preparationTime: 25, createdAt: new Date().toISOString() },
            { _id: 'm4', name: 'Paneer Butter Masala', category: 'cat2', price: 299, tax: 5, description: 'Soft paneer cubes in creamy sauce', isVeg: true, isBestseller: true, preparationTime: 20, createdAt: new Date().toISOString() },
            // Biryani
            { _id: 'm5', name: 'Chicken Biryani', category: 'cat3', price: 299, tax: 5, description: 'Aromatic basmati rice with chicken', isVeg: false, isBestseller: true, preparationTime: 30, createdAt: new Date().toISOString() },
            // Chinese
            { _id: 'm6', name: 'Veg Fried Rice', category: 'cat4', price: 199, tax: 5, description: 'Wok-tossed rice with vegetables', isVeg: true, preparationTime: 15, createdAt: new Date().toISOString() },
            // Drinks
            { _id: 'm7', name: 'Mango Lassi', category: 'cat5', price: 99, tax: 5, description: 'Thick mango yogurt drink', isVeg: true, isBestseller: true, preparationTime: 5, createdAt: new Date().toISOString() },
            // Desserts
            { _id: 'm8', name: 'Gulab Jamun', category: 'cat6', price: 99, tax: 5, description: 'Soft milk dumplings in sugar syrup', isVeg: true, isBestseller: true, preparationTime: 5, createdAt: new Date().toISOString() },
        ];
        writeData('menuitems', menuItems);
        console.log('Menu items seeded');

        // Tables
        const tables = [
            { _id: 't1', number: 1, capacity: 2, status: 'available', createdAt: new Date().toISOString() },
            { _id: 't2', number: 2, capacity: 4, status: 'available', createdAt: new Date().toISOString() },
            { _id: 't3', number: 3, capacity: 4, status: 'available', createdAt: new Date().toISOString() },
            { _id: 't4', number: 4, capacity: 6, status: 'available', createdAt: new Date().toISOString() },
            { _id: 't5', number: 5, capacity: 8, status: 'available', createdAt: new Date().toISOString() },
        ];
        writeData('tables', tables);
        console.log('Tables seeded');

        // Coupons
        const coupons = [
            { _id: 'cp1', code: 'WELCOME20', type: 'percentage', value: 20, minOrderAmount: 300, maxDiscount: 100, usageLimit: 100, expiresAt: '2026-12-31', createdAt: new Date().toISOString() },
            { _id: 'cp2', code: 'FLAT50', type: 'fixed', value: 50, minOrderAmount: 500, usageLimit: 50, expiresAt: '2026-12-31', createdAt: new Date().toISOString() },
        ];
        writeData('coupons', coupons);
        console.log('Coupons seeded');

        // Suppliers
        const suppliers = [
            { _id: 's1', name: 'Fresh Farms', contact: 'Ravi Kumar', phone: '9800000001', email: 'fresh@farms.com', address: 'Market Road, City', createdAt: new Date().toISOString() },
            { _id: 's2', name: 'Spice World', contact: 'Anita', phone: '9800000002', email: 'spice@world.com', address: 'Spice Market, City', createdAt: new Date().toISOString() },
        ];
        writeData('suppliers', suppliers);
        console.log('Suppliers seeded');

        // Inventory
        const inventory = [
            { _id: 'i1', name: 'Rice (Basmati)', quantity: 50, unit: 'kg', minStockLevel: 10, costPerUnit: 80, supplier: 's1', lastRestocked: new Date().toISOString(), createdAt: new Date().toISOString() },
            { _id: 'i2', name: 'Chicken', quantity: 30, unit: 'kg', minStockLevel: 5, costPerUnit: 200, supplier: 's1', lastRestocked: new Date().toISOString(), createdAt: new Date().toISOString() },
        ];
        writeData('inventory', inventory);
        console.log('Inventory seeded');

        // Initialize empty files for other collections
        writeData('orders', []);
        writeData('reviews', []);

        console.log('\n✅ Local JSON Data initialized successfully!');
        console.log('\n📋 Login credentials:');
        console.log('  Admin:    admin@restaurant.com / admin123');
        console.log('  Cashier:  cashier@restaurant.com / cashier123');
        console.log('  Delivery: delivery@restaurant.com / delivery123');
        console.log('  Customer: john@customer.com / customer123');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seed();
