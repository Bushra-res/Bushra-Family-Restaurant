const fs = require('fs');
const path = require('path');

const walkDir = (dir, callback) => {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
};

const appDir = path.join(__dirname, '..', 'app', 'api');

let count = 0;
walkDir(appDir, (filePath) => {
    if (filePath.endsWith('route.js')) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('export async function GET') && !content.includes('export const dynamic')) {
            content += '\nexport const dynamic = \'force-dynamic\';\n';
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Updated', filePath);
            count++;
        }
    }
});
console.log(`Updated ${count} API routes.`);
