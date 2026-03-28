const fs = require('fs');
const path = require('path');

const walkDir = (dir, callback) => {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
};

const replaceLoaders = () => {
    const appDir = path.join(__dirname, '..', 'app');
    let replacedCount = 0;

    walkDir(appDir, (filePath) => {
        if (!filePath.endsWith('.js') && !filePath.endsWith('.jsx')) return;

        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Replace exact old loading div
        const oldLoader1 = '<div className="loading-center"><div className="spinner"></div></div>';
        const newLoader1 = '<LoadingAnimation />';

        // Replace full screen old loading div
        const oldLoader2 = "<div className=\"loading-center\" style={{ minHeight: '100vh' }}><div className=\"spinner\"></div></div>";
        const newLoader2 = '<LoadingAnimation fullScreen={true} />';

        if (content.includes(oldLoader1) || content.includes(oldLoader2)) {
            content = content.replaceAll(oldLoader1, newLoader1);
            content = content.replaceAll(oldLoader2, newLoader2);
            modified = true;
        }

        if (modified) {
            // Add import if not exists
            if (!content.includes("import LoadingAnimation")) {
                const importStmt = "import LoadingAnimation from '@/components/LoadingAnimation';\n";
                if (content.startsWith("'use client';")) {
                    content = content.replace("'use client';\n", "'use client';\n" + importStmt);
                } else if (content.startsWith('"use client";')) {
                    content = content.replace('"use client";\n', '"use client";\n' + importStmt);
                } else {
                    content = importStmt + content;
                }
            }

            fs.writeFileSync(filePath, content, 'utf8');
            replacedCount++;
            console.log(`Updated: ${filePath}`);
        }
    });

    console.log(`Done. Replaced loaders in ${replacedCount} files.`);
};

replaceLoaders();
