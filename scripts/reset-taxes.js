const fs = require('fs');
const path = require('path');

const MENU_FILE = path.join(__dirname, '../data/menuitems.json');

try {
    const data = JSON.parse(fs.readFileSync(MENU_FILE, 'utf8'));
    const updated = data.map(item => ({ ...item, tax: 0 }));
    fs.writeFileSync(MENU_FILE, JSON.stringify(updated, null, 2));
    console.log(`Successfully updated ${updated.length} menu items with 0% tax.`);
} catch (error) {
    console.error('Error updating taxes:', error);
}
