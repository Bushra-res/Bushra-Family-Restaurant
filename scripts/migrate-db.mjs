import { MongoClient } from 'mongodb';

const SOURCE_URI = 'mongodb+srv://syed:syed@cluster0.wfdfgbs.mongodb.net/restaurant_pos?retryWrites=true&w=majority';
const TARGET_URI = 'mongodb+srv://syed:syed@cluster0.ldvz5x7.mongodb.net/restaurant_pos?retryWrites=true&w=majority';

async function migrate() {
    console.log('🔗 Connecting to SOURCE database...');
    const sourceClient = new MongoClient(SOURCE_URI);
    await sourceClient.connect();
    const sourceDb = sourceClient.db('restaurant_pos');

    console.log('🔗 Connecting to TARGET database...');
    const targetClient = new MongoClient(TARGET_URI);
    await targetClient.connect();
    const targetDb = targetClient.db('restaurant_pos');

    // Get all collection names from the source
    const collections = await sourceDb.listCollections().toArray();
    console.log(`\n📦 Found ${collections.length} collections to migrate:\n`);

    let totalDocs = 0;

    for (const collInfo of collections) {
        const name = collInfo.name;
        const sourceColl = sourceDb.collection(name);
        const targetColl = targetDb.collection(name);

        const docs = await sourceColl.find({}).toArray();
        const count = docs.length;

        if (count === 0) {
            console.log(`   ⏭️  ${name}: 0 documents (skipped)`);
            continue;
        }

        // Drop the target collection first (if it exists) to avoid duplicates
        try {
            await targetColl.drop();
        } catch (e) {
            // Collection doesn't exist yet, that's fine
        }

        await targetColl.insertMany(docs);
        console.log(`   ✅ ${name}: ${count} documents migrated`);
        totalDocs += count;

        // Copy indexes (skip the default _id index)
        const indexes = await sourceColl.indexes();
        for (const idx of indexes) {
            if (idx.name === '_id_') continue;
            try {
                const { key, ...options } = idx;
                delete options.v;
                delete options.ns;
                await targetColl.createIndex(key, options);
            } catch (e) {
                console.log(`      ⚠️  Index ${idx.name} on ${name}: ${e.message}`);
            }
        }
    }

    console.log(`\n🎉 Migration complete! ${totalDocs} total documents migrated across ${collections.length} collections.\n`);

    await sourceClient.close();
    await targetClient.close();
}

migrate().catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
